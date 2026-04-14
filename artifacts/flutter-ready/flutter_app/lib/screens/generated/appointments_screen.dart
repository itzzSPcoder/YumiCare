import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'appointments',
      sourcePath: 'app/appointments.tsx',
    );
  }
}
