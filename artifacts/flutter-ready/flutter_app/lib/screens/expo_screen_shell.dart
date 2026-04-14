import 'package:flutter/material.dart';

class ExpoScreenShell extends StatelessWidget {
  const ExpoScreenShell({
    super.key,
    required this.title,
    required this.sourcePath,
  });

  final String title;
  final String sourcePath;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Converted Flutter Screen',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text('Source: $sourcePath'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Use this page to verify route flow and navigation on device. '
              'Business logic from Expo can be migrated next screen-by-screen.',
            ),
            const SizedBox(height: 20),
            if (sourcePath.contains('ultrasound-analysis') ||
                sourcePath.contains('ultrasound-upload'))
              ElevatedButton.icon(
                onPressed: () =>
                    Navigator.of(context).pushNamed('/ultrasound-detector'),
                icon: const Icon(Icons.camera_alt_outlined),
                label: const Text('Open YOLO Detector'),
              ),
          ],
        ),
      ),
    );
  }
}
