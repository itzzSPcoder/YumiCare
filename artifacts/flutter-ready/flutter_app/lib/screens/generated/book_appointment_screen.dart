import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class BookAppointmentScreen extends StatelessWidget {
  const BookAppointmentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'book appointment',
      sourcePath: 'app/book-appointment.tsx',
    );
  }
}
