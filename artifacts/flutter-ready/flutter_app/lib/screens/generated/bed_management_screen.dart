import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class BedManagementScreen extends StatelessWidget {
  const BedManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'bed management',
      sourcePath: 'app/bed-management.tsx',
    );
  }
}
