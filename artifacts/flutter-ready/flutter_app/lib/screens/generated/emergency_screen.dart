import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class EmergencyScreen extends StatelessWidget {
  const EmergencyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'emergency',
      sourcePath: 'app/emergency.tsx',
    );
  }
}
