import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'login',
      sourcePath: 'app/login.tsx',
    );
  }
}
