import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'not found',
      sourcePath: 'app/+not-found.tsx',
    );
  }
}
