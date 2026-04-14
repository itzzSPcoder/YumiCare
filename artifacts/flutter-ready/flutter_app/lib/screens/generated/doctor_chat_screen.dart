import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class DoctorChatScreen extends StatelessWidget {
  const DoctorChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'doctor chat',
      sourcePath: 'app/doctor-chat.tsx',
    );
  }
}
