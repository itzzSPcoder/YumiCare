import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class DoctorDetailScreen extends StatelessWidget {
  const DoctorDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'doctor detail',
      sourcePath: 'app/doctor-detail.tsx',
    );
  }
}
