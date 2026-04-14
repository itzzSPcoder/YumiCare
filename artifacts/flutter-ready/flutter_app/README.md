# Flutter App (Expo to Flutter Conversion)

This app now includes:

- Converted route scaffold for Expo screens (`34` mapped routes)
- Ported login flow with role-based demo credentials
- Ported tabs shell (Home, Timeline, Records, Profile)
- YOLO ultrasound detector flow still available from Flutter route

## Demo Credentials

- Admin: `admin@yumicare.com` / `YumiAdmin@2024`
- Hospital: `citywmc@yumicare.com` / `CityWMC@123`
- Doctor: `dr.priya@yumicare.com` / `DrPriya@123`
- Patient: `aisha@yumicare.com` / `Aisha@123`

You can also tap **Use Demo Credentials** on the login screen after selecting role.

## Run

1. Open this folder as Flutter project.
2. Run `flutter pub get`.
3. Run `flutter run`.
4. Login and test tabs flow.

## Key Files

- `lib/main.dart`
- `lib/ported/login_ported_screen.dart`
- `lib/ported/tabs_shell_screen.dart`
- `lib/ported/app_session.dart`
- `lib/screens/converted_routes.dart`
- `lib/screens/generated/`
- `lib/ml/ultrasound_detector_screen.dart`
- `assets/ml/model.onnx`
