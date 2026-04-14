import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class TabIndexScreen extends StatelessWidget {
  const TabIndexScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'tabs index',
      sourcePath: 'app/(tabs)/index.tsx',
    );
  }
}
