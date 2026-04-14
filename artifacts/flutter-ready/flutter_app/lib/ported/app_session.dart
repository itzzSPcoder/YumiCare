import 'package:flutter/foundation.dart';

enum UserRole { patient, doctor, hospital, admin }

class UserAccount {
  const UserAccount({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.role,
  });

  final String id;
  final String name;
  final String email;
  final String password;
  final UserRole role;
}

class LoginResult {
  const LoginResult({required this.success, this.error});

  final bool success;
  final String? error;
}

class AppSession extends ChangeNotifier {
  AppSession._();

  static final AppSession instance = AppSession._();

  static const List<UserAccount> demoUsers = [
    UserAccount(
      id: 'admin-001',
      name: 'Super Admin',
      email: 'admin@yumicare.com',
      password: 'YumiAdmin@2024',
      role: UserRole.admin,
    ),
    UserAccount(
      id: 'hosp-001',
      name: 'City Women\'s Medical Center',
      email: 'citywmc@yumicare.com',
      password: 'CityWMC@123',
      role: UserRole.hospital,
    ),
    UserAccount(
      id: 'doc-001',
      name: 'Dr. Priya Sharma',
      email: 'dr.priya@yumicare.com',
      password: 'DrPriya@123',
      role: UserRole.doctor,
    ),
    UserAccount(
      id: 'pat-001',
      name: 'Aisha Rahman',
      email: 'aisha@yumicare.com',
      password: 'Aisha@123',
      role: UserRole.patient,
    ),
  ];

  UserAccount? _currentUser;

  UserAccount? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;
  UserRole get role => _currentUser?.role ?? UserRole.patient;

  LoginResult login(String email, String password) {
    final user = demoUsers
        .where((u) => u.email.toLowerCase() == email.toLowerCase())
        .firstOrNull;
    if (user == null) {
      return const LoginResult(
          success: false, error: 'No account found with this email.');
    }
    if (user.password != password) {
      return const LoginResult(success: false, error: 'Invalid password.');
    }

    _currentUser = user;
    notifyListeners();
    return const LoginResult(success: true);
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  String tab2Title(UserRole role) {
    switch (role) {
      case UserRole.patient:
        return 'Timeline';
      case UserRole.doctor:
        return 'Patients';
      case UserRole.hospital:
        return 'Doctors';
      case UserRole.admin:
        return 'Hospitals';
    }
  }

  String tab3Title(UserRole role) {
    switch (role) {
      case UserRole.patient:
        return 'Records';
      case UserRole.doctor:
        return 'Messages';
      case UserRole.hospital:
        return 'Patients';
      case UserRole.admin:
        return 'Reports';
    }
  }
}
