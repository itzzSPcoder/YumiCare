import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class ScanScreen extends StatelessWidget {
  const ScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'scan',
      sourcePath: 'app/scan.tsx',
    );
  }
}
