import 'package:flutter/widgets.dart';

import 'generated/add_doctor_screen.dart';
import 'generated/add_hospital_screen.dart';
import 'generated/add_patient_screen.dart';
import 'generated/admin_reports_screen.dart';
import 'generated/allergies_screen.dart';
import 'generated/appointments_screen.dart';
import 'generated/audit_trail_screen.dart';
import 'generated/bed_management_screen.dart';
import 'generated/book_appointment_screen.dart';
import 'generated/doctor_chat_screen.dart';
import 'generated/doctor_detail_screen.dart';
import 'generated/emergency_screen.dart';
import 'generated/help_screen.dart';
import 'generated/hospital_detail_screen.dart';
import 'generated/kick_counter_screen.dart';
import 'generated/login_screen.dart';
import 'generated/medications_screen.dart';
import 'generated/messages_screen.dart';
import 'generated/not_found_screen.dart';
import 'generated/notifications_screen.dart';
import 'generated/onboarding_screen.dart';
import 'generated/patient_detail_screen.dart';
import 'generated/privacy_screen.dart';
import 'generated/qr_screen.dart';
import 'generated/scan_screen.dart';
import 'generated/tab_index_screen.dart';
import 'generated/tab_profile_screen.dart';
import 'generated/tab_records_screen.dart';
import 'generated/tab_timeline_screen.dart';
import 'generated/ultrasound_analysis_screen.dart';
import 'generated/ultrasound_upload_screen.dart';
import 'generated/user_management_screen.dart';
import 'generated/vitals_screen.dart';
import 'generated/write_prescription_screen.dart';

class ExpoRouteMeta {
  const ExpoRouteMeta({
    required this.route,
    required this.title,
    required this.sourcePath,
  });

  final String route;
  final String title;
  final String sourcePath;
}

const List<ExpoRouteMeta> expoConvertedRoutes = [
  ExpoRouteMeta(
      route: '/add-doctor',
      title: 'add-doctor',
      sourcePath: 'app/add-doctor.tsx'),
  ExpoRouteMeta(
      route: '/add-hospital',
      title: 'add-hospital',
      sourcePath: 'app/add-hospital.tsx'),
  ExpoRouteMeta(
      route: '/add-patient',
      title: 'add-patient',
      sourcePath: 'app/add-patient.tsx'),
  ExpoRouteMeta(
      route: '/admin-reports',
      title: 'admin-reports',
      sourcePath: 'app/admin-reports.tsx'),
  ExpoRouteMeta(
      route: '/allergies', title: 'allergies', sourcePath: 'app/allergies.tsx'),
  ExpoRouteMeta(
      route: '/appointments',
      title: 'appointments',
      sourcePath: 'app/appointments.tsx'),
  ExpoRouteMeta(
      route: '/audit-trail',
      title: 'audit-trail',
      sourcePath: 'app/audit-trail.tsx'),
  ExpoRouteMeta(
      route: '/bed-management',
      title: 'bed-management',
      sourcePath: 'app/bed-management.tsx'),
  ExpoRouteMeta(
      route: '/book-appointment',
      title: 'book-appointment',
      sourcePath: 'app/book-appointment.tsx'),
  ExpoRouteMeta(
      route: '/doctor-chat',
      title: 'doctor-chat',
      sourcePath: 'app/doctor-chat.tsx'),
  ExpoRouteMeta(
      route: '/doctor-detail',
      title: 'doctor-detail',
      sourcePath: 'app/doctor-detail.tsx'),
  ExpoRouteMeta(
      route: '/emergency', title: 'emergency', sourcePath: 'app/emergency.tsx'),
  ExpoRouteMeta(route: '/help', title: 'help', sourcePath: 'app/help.tsx'),
  ExpoRouteMeta(
      route: '/hospital-detail',
      title: 'hospital-detail',
      sourcePath: 'app/hospital-detail.tsx'),
  ExpoRouteMeta(
      route: '/kick-counter',
      title: 'kick-counter',
      sourcePath: 'app/kick-counter.tsx'),
  ExpoRouteMeta(route: '/login', title: 'login', sourcePath: 'app/login.tsx'),
  ExpoRouteMeta(
      route: '/medications',
      title: 'medications',
      sourcePath: 'app/medications.tsx'),
  ExpoRouteMeta(
      route: '/messages', title: 'messages', sourcePath: 'app/messages.tsx'),
  ExpoRouteMeta(
      route: '/not-found',
      title: 'not-found',
      sourcePath: 'app/+not-found.tsx'),
  ExpoRouteMeta(
      route: '/notifications',
      title: 'notifications',
      sourcePath: 'app/notifications.tsx'),
  ExpoRouteMeta(
      route: '/onboarding',
      title: 'onboarding',
      sourcePath: 'app/onboarding.tsx'),
  ExpoRouteMeta(
      route: '/patient-detail',
      title: 'patient-detail',
      sourcePath: 'app/patient-detail.tsx'),
  ExpoRouteMeta(
      route: '/privacy', title: 'privacy', sourcePath: 'app/privacy.tsx'),
  ExpoRouteMeta(route: '/qr', title: 'qr', sourcePath: 'app/qr.tsx'),
  ExpoRouteMeta(route: '/scan', title: 'scan', sourcePath: 'app/scan.tsx'),
  ExpoRouteMeta(
      route: '/tab-index',
      title: 'tab-index',
      sourcePath: 'app/(tabs)/index.tsx'),
  ExpoRouteMeta(
      route: '/tab-profile',
      title: 'tab-profile',
      sourcePath: 'app/(tabs)/profile.tsx'),
  ExpoRouteMeta(
      route: '/tab-records',
      title: 'tab-records',
      sourcePath: 'app/(tabs)/records.tsx'),
  ExpoRouteMeta(
      route: '/tab-timeline',
      title: 'tab-timeline',
      sourcePath: 'app/(tabs)/timeline.tsx'),
  ExpoRouteMeta(
      route: '/ultrasound-analysis',
      title: 'ultrasound-analysis',
      sourcePath: 'app/ultrasound-analysis.tsx'),
  ExpoRouteMeta(
      route: '/ultrasound-upload',
      title: 'ultrasound-upload',
      sourcePath: 'app/ultrasound-upload.tsx'),
  ExpoRouteMeta(
      route: '/user-management',
      title: 'user-management',
      sourcePath: 'app/user-management.tsx'),
  ExpoRouteMeta(
      route: '/vitals', title: 'vitals', sourcePath: 'app/vitals.tsx'),
  ExpoRouteMeta(
      route: '/write-prescription',
      title: 'write-prescription',
      sourcePath: 'app/write-prescription.tsx'),
];

final Map<String, WidgetBuilder> convertedRouteBuilders = {
  '/add-doctor': (context) => const AddDoctorScreen(),
  '/add-hospital': (context) => const AddHospitalScreen(),
  '/add-patient': (context) => const AddPatientScreen(),
  '/admin-reports': (context) => const AdminReportsScreen(),
  '/allergies': (context) => const AllergiesScreen(),
  '/appointments': (context) => const AppointmentsScreen(),
  '/audit-trail': (context) => const AuditTrailScreen(),
  '/bed-management': (context) => const BedManagementScreen(),
  '/book-appointment': (context) => const BookAppointmentScreen(),
  '/doctor-chat': (context) => const DoctorChatScreen(),
  '/doctor-detail': (context) => const DoctorDetailScreen(),
  '/emergency': (context) => const EmergencyScreen(),
  '/help': (context) => const HelpScreen(),
  '/hospital-detail': (context) => const HospitalDetailScreen(),
  '/kick-counter': (context) => const KickCounterScreen(),
  '/login': (context) => const LoginScreen(),
  '/medications': (context) => const MedicationsScreen(),
  '/messages': (context) => const MessagesScreen(),
  '/not-found': (context) => const NotFoundScreen(),
  '/notifications': (context) => const NotificationsScreen(),
  '/onboarding': (context) => const OnboardingScreen(),
  '/patient-detail': (context) => const PatientDetailScreen(),
  '/privacy': (context) => const PrivacyScreen(),
  '/qr': (context) => const QrScreen(),
  '/scan': (context) => const ScanScreen(),
  '/tab-index': (context) => const TabIndexScreen(),
  '/tab-profile': (context) => const TabProfileScreen(),
  '/tab-records': (context) => const TabRecordsScreen(),
  '/tab-timeline': (context) => const TabTimelineScreen(),
  '/ultrasound-analysis': (context) => const UltrasoundAnalysisScreen(),
  '/ultrasound-upload': (context) => const UltrasoundUploadScreen(),
  '/user-management': (context) => const UserManagementScreen(),
  '/vitals': (context) => const VitalsScreen(),
  '/write-prescription': (context) => const WritePrescriptionScreen(),
};
