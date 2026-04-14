import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class PatientDetailScreen extends StatelessWidget {
  const PatientDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'patient detail',
      sourcePath: 'app/patient-detail.tsx',
    );
  }
}
