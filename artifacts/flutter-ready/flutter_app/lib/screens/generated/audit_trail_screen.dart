import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AuditTrailScreen extends StatelessWidget {
  const AuditTrailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'audit trail',
      sourcePath: 'app/audit-trail.tsx',
    );
  }
}
