import 'package:flutter/material.dart';

import 'ml/ultrasound_detector_screen.dart';
import 'ported/feature_mock_screen.dart';
import 'ported/login_ported_screen.dart';
import 'ported/tabs_shell_screen.dart';
import 'screens/converted_routes.dart';

void main() {
  runApp(const YumiCareYoloApp());
}

class YumiCareYoloApp extends StatelessWidget {
  const YumiCareYoloApp({super.key});

  @override
  Widget build(BuildContext context) {
    final converted = Map<String, WidgetBuilder>.from(convertedRouteBuilders)
      ..remove('/login')
      ..remove('/tab-index')
      ..remove('/tab-timeline')
      ..remove('/tab-records')
      ..remove('/tab-profile')
      ..remove('/ultrasound-analysis')
      ..remove('/appointments')
      ..remove('/messages')
      ..remove('/medications')
      ..remove('/allergies')
      ..remove('/notifications')
      ..remove('/ultrasound-upload');

    return MaterialApp(
      title: 'YumiCare Ported V4',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0EA5E9)),
        useMaterial3: true,
      ),
      routes: {
        ...converted,
        '/login': (context) => const LoginPortedScreen(),
        '/tab-index': (context) => const TabsShellScreen(initialIndex: 0),
        '/tab-timeline': (context) => const TabsShellScreen(initialIndex: 1),
        '/tab-records': (context) => const TabsShellScreen(initialIndex: 2),
        '/tab-profile': (context) => const TabsShellScreen(initialIndex: 3),
        '/tabs': (context) => const TabsShellScreen(initialIndex: 0),
        '/notifications': (context) => const FeatureMockScreen(
              title: 'Notifications',
              subtitle: 'Recent care updates and reminders',
              items: [
                'Medication reminder: Folic Acid 5mg at 8:00 PM',
                'Upcoming appointment tomorrow at 10:00 AM',
                'Ultrasound report uploaded for review',
              ],
              highlight: Color(0xFF7B5EA7),
            ),
        '/appointments': (context) => const FeatureMockScreen(
              title: 'Appointments',
              subtitle: 'Track upcoming and completed visits',
              items: [
                'Dr. Priya Sharma - Apr 05, 10:00 AM',
                'Routine follow-up - Apr 12, 11:30 AM',
                'Lab checkup - Apr 19, 09:30 AM',
              ],
            ),
        '/messages': (context) => const FeatureMockScreen(
              title: 'Messages',
              subtitle: 'Doctor and patient conversations',
              items: [
                'Dr. Priya: Continue iron supplements',
                'Patient: Mild swelling update',
                'Hospital desk: Appointment confirmed',
              ],
              highlight: Color(0xFF5B8FF9),
            ),
        '/medications': (context) => const FeatureMockScreen(
              title: 'Medications',
              subtitle: 'Current prescription plan',
              items: [
                'Folic Acid 5mg - Once daily',
                'Iron Supplement - Twice daily',
                'Vitamin D3 - Once daily',
              ],
              highlight: Color(0xFF27AE60),
            ),
        '/allergies': (context) => const FeatureMockScreen(
              title: 'Allergies',
              subtitle: 'Known allergy records',
              items: [
                'Penicillin',
                'Sulfa drugs',
                'Latex (monitor in procedures)',
              ],
              highlight: Color(0xFFE67E22),
            ),
        '/ultrasound-upload': (context) => const FeatureMockScreen(
              title: 'Ultrasound Upload',
              subtitle: 'Upload and attach scan files securely',
              items: [
                'Capture scan image',
                'Attach patient and date metadata',
                'Submit for analysis',
              ],
              highlight: Color(0xFF2EC4B6),
            ),
        '/ultrasound-analysis': (_) => const UltrasoundDetectorScreen(),
        '/ultrasound-detector': (_) => const UltrasoundDetectorScreen(),
      },
      home: const LoginPortedScreen(),
    );
  }
}
