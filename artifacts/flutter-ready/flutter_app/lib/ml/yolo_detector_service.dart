import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/services.dart' show rootBundle;
import 'package:image/image.dart' as img;
import 'package:onnxruntime/onnxruntime.dart';

import 'yolo_models.dart';

class YoloDetectorService {
  YoloDetectorService({
    this.inputSize = 640,
    this.confThreshold = 0.25,
    this.iouThreshold = 0.45,
  });

  final int inputSize;
  final double confThreshold;
  final double iouThreshold;

  late final OrtSession _session;
  late final List<String> _labels;
  String? _inputName;
  bool _initialized = false;

  Future<void> init({
    required String modelPath,
    required String labelsPath,
  }) async {
    final modelBytes = await File(modelPath).readAsBytes();
    final labels = await File(labelsPath).readAsLines().then((lines) =>
        lines.map((l) => l.trim()).where((l) => l.isNotEmpty).toList());
    _initWithBytes(modelBytes, labels);
  }

  Future<void> initFromAssets({
    required String modelAssetPath,
    required String labelsAssetPath,
  }) async {
    final modelData = await rootBundle.load(modelAssetPath);
    final labelsData = await rootBundle.loadString(labelsAssetPath);

    final labels = labelsData
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.isNotEmpty)
        .toList();

    _initWithBytes(modelData.buffer.asUint8List(), labels);
  }

  void _initWithBytes(Uint8List modelBytes, List<String> labels) {
    if (labels.isEmpty) {
      throw StateError('Labels list is empty');
    }
    _labels = labels;

    final sessionOptions = OrtSessionOptions();
    _session = OrtSession.fromBuffer(modelBytes, sessionOptions);

    // Many exports use single input; keeping override option simple.
    final names = _session.inputNames;
    if (names.isEmpty) {
      throw StateError('ONNX model has no input names');
    }
    _inputName = names.first;
    _initialized = true;
  }

  Future<List<Detection>> detectFromFile(String imagePath) async {
    final bytes = await File(imagePath).readAsBytes();
    return detectFromBytes(bytes);
  }

  Future<List<Detection>> detectFromBytes(Uint8List bytes) async {
    if (!_initialized) {
      throw StateError('YoloDetectorService is not initialized');
    }

    final original = img.decodeImage(bytes);
    if (original == null) {
      throw StateError('Unable to decode input image bytes');
    }

    final prep = _preprocess(original);
    final inputTensor = OrtValueTensor.createTensorWithDataList(
      prep.tensor,
      [1, 3, inputSize, inputSize],
    );

    final outputs = _session.run(OrtRunOptions(), {
      _inputName!: inputTensor,
    });

    // Ultralytics ONNX export here is post-NMS with shape [1, 300, 6].
    final raw = outputs.first?.value;
    final detections = _parsePostNmsOutput(
      raw,
      scale: prep.scale,
      padX: prep.padX,
      padY: prep.padY,
      originalWidth: original.width,
      originalHeight: original.height,
    );

    inputTensor.release();
    for (final out in outputs) {
      out?.release();
    }

    return nms(detections, iouThreshold: iouThreshold);
  }

  _PrepResult _preprocess(img.Image original) {
    final srcW = original.width.toDouble();
    final srcH = original.height.toDouble();
    final scale = (inputSize / srcW).compareTo(inputSize / srcH) < 0
        ? inputSize / srcW
        : inputSize / srcH;

    final resizedW = (srcW * scale).round();
    final resizedH = (srcH * scale).round();

    final resized = img.copyResize(
      original,
      width: resizedW,
      height: resizedH,
      interpolation: img.Interpolation.linear,
    );

    final canvas = img.Image(width: inputSize, height: inputSize);
    img.fill(canvas, color: img.ColorRgb8(114, 114, 114));

    final padX = ((inputSize - resizedW) / 2).floor();
    final padY = ((inputSize - resizedH) / 2).floor();
    img.compositeImage(canvas, resized, dstX: padX, dstY: padY);

    final tensor = Float32List(1 * 3 * inputSize * inputSize);

    var p = 0;
    for (var c = 0; c < 3; c++) {
      for (var y = 0; y < inputSize; y++) {
        for (var x = 0; x < inputSize; x++) {
          final pix = canvas.getPixel(x, y);
          final v = switch (c) {
            0 => pix.r / 255.0,
            1 => pix.g / 255.0,
            _ => pix.b / 255.0,
          };
          tensor[p++] = v;
        }
      }
    }

    return _PrepResult(
      tensor: tensor,
      scale: scale,
      padX: padX.toDouble(),
      padY: padY.toDouble(),
    );
  }

  List<Detection> _parsePostNmsOutput(
    dynamic raw, {
    required double scale,
    required double padX,
    required double padY,
    required int originalWidth,
    required int originalHeight,
  }) {
    final result = <Detection>[];

    // Support common shapes from onnxruntime-dart wrappers.
    final rows = _flattenToRows(raw);

    for (final row in rows) {
      if (row.length < 6) continue;

      final x1 = row[0];
      final y1 = row[1];
      final x2 = row[2];
      final y2 = row[3];
      final score = row[4];
      final classId = row[5].round();

      if (score < confThreshold) continue;
      if (classId < 0 || classId >= _labels.length) continue;

      final unpaddedX1 = (x1 - padX) / scale;
      final unpaddedY1 = (y1 - padY) / scale;
      final unpaddedX2 = (x2 - padX) / scale;
      final unpaddedY2 = (y2 - padY) / scale;

      final det = Detection(
        x1: unpaddedX1,
        y1: unpaddedY1,
        x2: unpaddedX2,
        y2: unpaddedY2,
        score: score,
        classId: classId,
        className: _labels[classId],
      ).clampToImage(originalWidth, originalHeight);

      if (det.width > 1 && det.height > 1) {
        result.add(det);
      }
    }

    return result;
  }

  List<List<double>> _flattenToRows(dynamic raw) {
    // Expected from ultralytics export: [1, 300, 6]
    // Some wrappers may unwrap the batch dimension.
    if (raw is List && raw.isNotEmpty) {
      if (raw.first is List &&
          (raw.first as List).isNotEmpty &&
          (raw.first as List).first is List) {
        final batch0 = (raw.first as List);
        return batch0
            .map((e) => (e as List).map((v) => (v as num).toDouble()).toList())
            .toList();
      }
      if (raw.first is List) {
        return raw
            .map((e) => (e as List).map((v) => (v as num).toDouble()).toList())
            .toList();
      }
    }

    throw StateError('Unsupported ONNX output shape: ${jsonEncode(raw)}');
  }

  void dispose() {
    if (_initialized) {
      _session.release();
      _initialized = false;
    }
  }
}

class _PrepResult {
  const _PrepResult({
    required this.tensor,
    required this.scale,
    required this.padX,
    required this.padY,
  });

  final Float32List tensor;
  final double scale;
  final double padX;
  final double padY;
}
