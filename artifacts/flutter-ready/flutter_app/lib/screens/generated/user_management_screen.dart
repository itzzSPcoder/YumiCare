import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class UserManagementScreen extends StatelessWidget {
  const UserManagementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'user management',
      sourcePath: 'app/user-management.tsx',
    );
  }
}
