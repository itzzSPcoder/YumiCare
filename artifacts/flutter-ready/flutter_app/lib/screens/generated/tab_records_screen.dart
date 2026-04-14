import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class TabRecordsScreen extends StatelessWidget {
  const TabRecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'tabs records',
      sourcePath: 'app/(tabs)/records.tsx',
    );
  }
}
