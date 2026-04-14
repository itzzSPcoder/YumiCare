import 'package:flutter/material.dart';

import 'ml/ultrasound_detector_screen.dart';

void main() {
  runApp(const YumiCareYoloApp());
}

class YumiCareYoloApp extends StatelessWidget {
  const YumiCareYoloApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YumiCare YOLO Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0EA5E9)),
        useMaterial3: true,
      ),
      routes: {
        '/ultrasound-detector': (_) => const UltrasoundDetectorScreen(),
      },
      home: const _HomePage(),
    );
  }
}

class _HomePage extends StatelessWidget {
  const _HomePage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('YumiCare Flutter YOLO')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.of(context).pushNamed('/ultrasound-detector'),
          child: const Text('Open Ultrasound Detector'),
        ),
      ),
    );
  }
}
