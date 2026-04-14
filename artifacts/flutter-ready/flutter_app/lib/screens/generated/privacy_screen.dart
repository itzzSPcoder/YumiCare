import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'privacy',
      sourcePath: 'app/privacy.tsx',
    );
  }
}
