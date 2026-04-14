import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class KickCounterScreen extends StatelessWidget {
  const KickCounterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'kick counter',
      sourcePath: 'app/kick-counter.tsx',
    );
  }
}
