# Flutter-ready YOLO package

This folder contains model artifacts and integration guidance for Flutter.

## Generate model bundle

Run from workspace root:

```bash
d:/Coding/Projects/YumiCare/Yumi-Care-Credibility/.venv/Scripts/python.exe scripts/export_flutter_models.py --weights runs/detect/yumicare_fetal_v3_3class_lowmem/weights/best.pt --outdir artifacts/flutter-ready/model_bundle --imgsz 640
```

Optional TFLite attempt:

```bash
d:/Coding/Projects/YumiCare/Yumi-Care-Credibility/.venv/Scripts/python.exe scripts/export_flutter_models.py --weights runs/detect/yumicare_fetal_v3_3class_lowmem/weights/best.pt --outdir artifacts/flutter-ready/model_bundle --imgsz 640 --tflite
```

## Output files

- `model.pt`: source checkpoint copy
- `model.onnx`: ONNX model (recommended path for Flutter using onnxruntime)
- `model.tflite`: TensorFlow Lite model (only if `--tflite` succeeds)
- `labels.txt`: class names in index order
- `flutter_model_config.json`: input shape and class metadata

## Flutter integration (recommended)

Use `onnxruntime` in Flutter:

1. Add package:

```yaml
dependencies:
  onnxruntime: ^1.4.0
  image: ^4.1.7
```

2. Put model files in Flutter assets (example):

- `assets/ml/model.onnx`
- `assets/ml/labels.txt`
- `assets/ml/flutter_model_config.json`

3. Register assets in `pubspec.yaml`.

4. Implement preprocess + postprocess:

- Letterbox resize image to `640x640`
- Normalize to float tensor shape `[1, 3, 640, 640]`
- Run inference
- Decode YOLO boxes
- Apply confidence threshold + NMS

## Ready-to-copy Dart kit

Use files from:

- `artifacts/flutter-ready/flutter_integration/lib/yolo_models.dart`
- `artifacts/flutter-ready/flutter_integration/lib/yolo_detector_service.dart`
- `artifacts/flutter-ready/flutter_integration/lib/yolo_overlay_painter.dart`
- `artifacts/flutter-ready/flutter_integration/lib/ultrasound_detector_screen.dart`
- `artifacts/flutter-ready/flutter_integration/lib/example_usage.dart`
- `artifacts/flutter-ready/flutter_integration/pubspec_fragment.yaml`

Quick setup:

1. Copy `flutter_integration/lib/*.dart` into your Flutter app `lib/ml/` folder.
2. Copy `model_bundle/model.onnx`, `labels.txt`, `flutter_model_config.json` into Flutter app assets path, for example `assets/ml/`.
3. Merge dependencies/assets from `pubspec_fragment.yaml` into your app `pubspec.yaml`.
4. Initialize `YoloDetectorService` with `initFromAssets` and call `detectFromFile`.
5. If you want a ready UI, use `UltrasoundDetectorScreen` directly.

## Important note

This export makes your model Flutter-ready from artifact side, but app inference code is still needed in your Flutter project.
