import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AddPatientScreen extends StatelessWidget {
  const AddPatientScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'add patient',
      sourcePath: 'app/add-patient.tsx',
    );
  }
}
