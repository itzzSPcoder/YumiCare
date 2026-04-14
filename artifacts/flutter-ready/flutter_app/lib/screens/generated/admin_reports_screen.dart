import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AdminReportsScreen extends StatelessWidget {
  const AdminReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'admin reports',
      sourcePath: 'app/admin-reports.tsx',
    );
  }
}
