import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class TabTimelineScreen extends StatelessWidget {
  const TabTimelineScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'tabs timeline',
      sourcePath: 'app/(tabs)/timeline.tsx',
    );
  }
}
