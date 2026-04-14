import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'help',
      sourcePath: 'app/help.tsx',
    );
  }
}
