import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AddDoctorScreen extends StatelessWidget {
  const AddDoctorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'add doctor',
      sourcePath: 'app/add-doctor.tsx',
    );
  }
}
