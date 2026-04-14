import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AddHospitalScreen extends StatelessWidget {
  const AddHospitalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'add hospital',
      sourcePath: 'app/add-hospital.tsx',
    );
  }
}
