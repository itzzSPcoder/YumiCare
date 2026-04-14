import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class UltrasoundAnalysisScreen extends StatelessWidget {
  const UltrasoundAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'ultrasound analysis',
      sourcePath: 'app/ultrasound-analysis.tsx',
    );
  }
}
