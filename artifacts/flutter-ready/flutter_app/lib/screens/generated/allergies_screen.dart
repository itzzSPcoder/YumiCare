import 'package:flutter/material.dart';

import '../expo_screen_shell.dart';

class AllergiesScreen extends StatelessWidget {
  const AllergiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpoScreenShell(
      title: 'allergies',
      sourcePath: 'app/allergies.tsx',
    );
  }
}
