import 'yolo_detector_service.dart';

Future<void> runExample() async {
  final service = YoloDetectorService(
    inputSize: 640,
    confThreshold: 0.25,
    iouThreshold: 0.45,
  );

  await service.initFromAssets(
    modelAssetPath: 'assets/ml/model.onnx',
    labelsAssetPath: 'assets/ml/labels.txt',
  );

  final detections = await service.detectFromFile('path/to/input_image.jpg');

  for (final d in detections) {
    // ignore: avoid_print
    print('${d.className} score=${d.score.toStringAsFixed(3)} box=[${d.x1.toStringAsFixed(1)}, ${d.y1.toStringAsFixed(1)}, ${d.x2.toStringAsFixed(1)}, ${d.y2.toStringAsFixed(1)}]');
  }

  service.dispose();
}
