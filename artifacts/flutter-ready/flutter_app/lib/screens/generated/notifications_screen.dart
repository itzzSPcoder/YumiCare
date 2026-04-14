import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'notifications',
      sourcePath: 'app/notifications.tsx',
    );
  }
}
