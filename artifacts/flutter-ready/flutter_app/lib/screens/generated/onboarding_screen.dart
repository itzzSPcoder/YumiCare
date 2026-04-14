import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'onboarding',
      sourcePath: 'app/onboarding.tsx',
    );
  }
}
