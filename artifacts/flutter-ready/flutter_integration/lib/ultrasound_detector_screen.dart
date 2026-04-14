import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';

import 'yolo_detector_service.dart';
import 'yolo_models.dart';
import 'yolo_overlay_painter.dart';

class UltrasoundDetectorScreen extends StatefulWidget {
  const UltrasoundDetectorScreen({
    super.key,
    this.modelAssetPath = 'assets/ml/model.onnx',
    this.labelsAssetPath = 'assets/ml/labels.txt',
  });

  final String modelAssetPath;
  final String labelsAssetPath;

  @override
  State<UltrasoundDetectorScreen> createState() => _UltrasoundDetectorScreenState();
}

class _UltrasoundDetectorScreenState extends State<UltrasoundDetectorScreen> {
  final _picker = ImagePicker();
  late final YoloDetectorService _service;

  bool _modelLoading = true;
  bool _detecting = false;
  String? _modelError;

  String? _imagePath;
  int? _imageWidth;
  int? _imageHeight;
  List<Detection> _detections = const [];

  @override
  void initState() {
    super.initState();
    _service = YoloDetectorService(inputSize: 640, confThreshold: 0.25, iouThreshold: 0.45);
    _initModel();
  }

  Future<void> _initModel() async {
    try {
      await _service.initFromAssets(
        modelAssetPath: widget.modelAssetPath,
        labelsAssetPath: widget.labelsAssetPath,
      );
      if (!mounted) return;
      setState(() {
        _modelLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _modelLoading = false;
        _modelError = e.toString();
      });
    }
  }

  Future<void> _pickAndDetect(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 95);
    if (picked == null) return;

    final bytes = await File(picked.path).readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to decode selected image')),
      );
      return;
    }

    if (!mounted) return;
    setState(() {
      _imagePath = picked.path;
      _imageWidth = decoded.width;
      _imageHeight = decoded.height;
      _detections = const [];
      _detecting = true;
    });

    try {
      final detections = await _service.detectFromFile(picked.path);
      if (!mounted) return;
      setState(() {
        _detections = detections;
        _detecting = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _detecting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Detection failed: $e')),
      );
    }
  }

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ultrasound YOLO Detector')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _buildTopState(),
              const SizedBox(height: 12),
              _buildActions(),
              const SizedBox(height: 12),
              Expanded(child: _buildPreview()),
              const SizedBox(height: 12),
              _buildSummary(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopState() {
    if (_modelLoading) {
      return const ListTile(
        dense: true,
        leading: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
        title: Text('Loading model...'),
      );
    }

    if (_modelError != null) {
      return ListTile(
        dense: true,
        leading: const Icon(Icons.error_outline, color: Colors.red),
        title: const Text('Model load failed'),
        subtitle: Text(_modelError!),
      );
    }

    return const ListTile(
      dense: true,
      leading: Icon(Icons.check_circle_outline, color: Colors.green),
      title: Text('Model ready'),
      subtitle: Text('Classes: Brain, CSP, LV'),
    );
  }

  Widget _buildActions() {
    final disabled = _modelLoading || _modelError != null || _detecting;
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: disabled ? null : () => _pickAndDetect(ImageSource.gallery),
            icon: const Icon(Icons.photo_library_outlined),
            label: const Text('Gallery'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: disabled ? null : () => _pickAndDetect(ImageSource.camera),
            icon: const Icon(Icons.photo_camera_outlined),
            label: const Text('Camera'),
          ),
        ),
      ],
    );
  }

  Widget _buildPreview() {
    if (_imagePath == null || _imageWidth == null || _imageHeight == null) {
      return Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black12),
        ),
        child: const Text('Select an ultrasound image to run detection'),
      );
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          Center(
            child: AspectRatio(
              aspectRatio: _imageWidth! / _imageHeight!,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(File(_imagePath!), fit: BoxFit.fill),
                  CustomPaint(
                    painter: YoloOverlayPainter(
                      detections: _detections,
                      imageWidth: _imageWidth!,
                      imageHeight: _imageHeight!,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_detecting)
            Positioned.fill(
              child: ColoredBox(
                color: Colors.black.withOpacity(0.25),
                child: const Center(
                  child: CircularProgressIndicator(),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSummary() {
    if (_imagePath == null) {
      return const SizedBox.shrink();
    }

    if (_detecting) {
      return const Text('Detecting...');
    }

    if (_detections.isEmpty) {
      return const Text('No detections above confidence threshold.');
    }

    return SizedBox(
      height: 84,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _detections.length,
        itemBuilder: (context, index) {
          final d = _detections[index];
          return Card(
            margin: const EdgeInsets.only(right: 8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(d.className, style: const TextStyle(fontWeight: FontWeight.w700)),
                  Text('score: ${(d.score * 100).toStringAsFixed(1)}%'),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
