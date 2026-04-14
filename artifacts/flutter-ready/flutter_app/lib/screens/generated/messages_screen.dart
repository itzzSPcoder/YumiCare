import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'messages',
      sourcePath: 'app/messages.tsx',
    );
  }
}
