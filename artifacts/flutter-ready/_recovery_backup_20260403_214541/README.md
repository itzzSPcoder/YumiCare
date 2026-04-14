# Flutter App (Wired)

This folder is a ready target app with requested tasks applied:

- Dart files copied to `lib/ml/`
- Model files copied to `assets/ml/`
- `pubspec.yaml` contains merged dependencies and assets
- Route wired in `lib/main.dart` to `UltrasoundDetectorScreen`

## Run

1. Open this folder as Flutter project.
2. Run `flutter pub get`.
3. Run `flutter run`.
4. Tap **Open Ultrasound Detector**.

## Files

- `lib/ml/ultrasound_detector_screen.dart`
- `lib/ml/yolo_detector_service.dart`
- `lib/ml/yolo_models.dart`
- `lib/ml/yolo_overlay_painter.dart`
- `assets/ml/model.onnx`
- `assets/ml/labels.txt`
- `assets/ml/flutter_model_config.json`
