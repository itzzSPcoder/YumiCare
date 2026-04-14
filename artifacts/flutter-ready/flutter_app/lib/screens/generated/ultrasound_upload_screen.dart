import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class UltrasoundUploadScreen extends StatelessWidget {
  const UltrasoundUploadScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'ultrasound upload',
      sourcePath: 'app/ultrasound-upload.tsx',
    );
  }
}
