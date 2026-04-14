import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_session.dart';

class LoginPortedScreen extends StatefulWidget {
  const LoginPortedScreen({super.key});

  @override
  State<LoginPortedScreen> createState() => _LoginPortedScreenState();
}

class _LoginPortedScreenState extends State<LoginPortedScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  UserRole _selectedRole = UserRole.patient;
  bool _showPassword = false;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _applyDemoCredentials() {
    final user = AppSession.demoUsers.firstWhere((u) => u.role == _selectedRole);
    _emailController.text = user.email;
    _passwordController.text = user.password;
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.trim().isEmpty || _passwordController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email and password.')),
      );
      return;
    }

    setState(() {
      _loading = true;
    });

    await Future<void>.delayed(const Duration(milliseconds: 350));

    final result = AppSession.instance.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (!mounted) return;

    setState(() {
      _loading = false;
    });

    if (!result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.error ?? 'Login failed.')),
      );
      return;
    }

    Navigator.of(context).pushReplacementNamed('/tab-index');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            Row(
              children: const [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AppColors.teal,
                  child: Icon(Icons.favorite, color: AppColors.white),
                ),
                SizedBox(width: 10),
                Text(
                  'YumiCare',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.text),
                ),
              ],
            ),
            const SizedBox(height: 18),
            const Text(
              'Welcome back',
              style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: AppColors.text),
            ),
            const SizedBox(height: 6),
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.warningLight,
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text(
                'BUILD V4 APR-04',
                style: TextStyle(
                  color: AppColors.warning,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            const Text(
              'Sign in to your account',
              style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            const Text(
              'SELECT YOUR ROLE',
              style: TextStyle(fontSize: 12, letterSpacing: 1, color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _roleTile(UserRole.patient, 'Patient', Icons.favorite_outline, AppColors.teal, AppColors.tealLight),
                _roleTile(UserRole.doctor, 'Doctor', Icons.medical_services_outlined, const Color(0xFF5B8FF9), const Color(0xFFEEF3FF)),
                _roleTile(UserRole.hospital, 'Hospital', Icons.local_hospital_outlined, AppColors.purple, AppColors.purpleLight),
                _roleTile(UserRole.admin, 'Admin', Icons.shield_outlined, const Color(0xFFE67E22), const Color(0xFFFEF5E7)),
              ],
            ),
            const SizedBox(height: 16),
            Card(
              color: AppColors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: AppColors.border),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: Icon(Icons.mail_outline),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passwordController,
                      obscureText: !_showPassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _showPassword = !_showPassword),
                          icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        TextButton.icon(
                          onPressed: _applyDemoCredentials,
                          icon: const Icon(Icons.bolt_outlined),
                          label: const Text('Use Demo Credentials'),
                        ),
                        const Spacer(),
                        ElevatedButton.icon(
                          onPressed: _loading ? null : _handleLogin,
                          icon: const Icon(Icons.login),
                          label: Text(_loading ? 'Signing in...' : 'Sign In'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _roleTile(UserRole role, String label, IconData icon, Color color, Color bg) {
    final selected = role == _selectedRole;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedRole = role;
          _emailController.clear();
          _passwordController.clear();
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: MediaQuery.of(context).size.width * 0.42,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? bg : AppColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? color : AppColors.border, width: selected ? 2 : 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 17,
              backgroundColor: selected ? color : AppColors.border,
              child: Icon(icon, color: selected ? AppColors.white : AppColors.textMuted, size: 18),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: selected ? color : AppColors.text,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
