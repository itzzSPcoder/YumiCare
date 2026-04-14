import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class MedicationsScreen extends StatelessWidget {
  const MedicationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'medications',
      sourcePath: 'app/medications.tsx',
    );
  }
}
