import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class WritePrescriptionScreen extends StatelessWidget {
  const WritePrescriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'write prescription',
      sourcePath: 'app/write-prescription.tsx',
    );
  }
}
