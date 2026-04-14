import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class TabProfileScreen extends StatelessWidget {
  const TabProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'tabs profile',
      sourcePath: 'app/(tabs)/profile.tsx',
    );
  }
}
