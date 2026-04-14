import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class VitalsScreen extends StatelessWidget {
  const VitalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'vitals',
      sourcePath: 'app/vitals.tsx',
    );
  }
}
