import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class HospitalDetailScreen extends StatelessWidget {
  const HospitalDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'hospital detail',
      sourcePath: 'app/hospital-detail.tsx',
    );
  }
}
