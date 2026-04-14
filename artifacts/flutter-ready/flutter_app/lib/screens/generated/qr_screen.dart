import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class QrScreen extends StatelessWidget {
  const QrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'qr',
      sourcePath: 'app/qr.tsx',
    );
  }
}
