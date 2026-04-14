import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ExpoParityScreen extends StatefulWidget {
  const ExpoParityScreen({super.key});

  @override
  State<ExpoParityScreen> createState() => _ExpoParityScreenState();
}

class _ExpoParityScreenState extends State<ExpoParityScreen> {
  static const _defaultApiBase = 'http://127.0.0.1:1325/api/v1';

  final _apiController = TextEditingController(text: _defaultApiBase);
  final _doctorEmailController =
      TextEditingController(text: 'primary@yumicare.dev');
  final _doctorPasswordController = TextEditingController(text: 'primary123');
  final _patientIdController = TextEditingController();

  String _role = 'doctor';
  bool _loading = false;
  String _token = '';
  String _error = '';

  Map<String, dynamic>? _summary;
  List<Map<String, dynamic>> _timeline = const [];
  List<Map<String, dynamic>> _auditLogs = const [];
  Map<String, dynamic>? _emergencySession;

  @override
  void dispose() {
    _apiController.dispose();
    _doctorEmailController.dispose();
    _doctorPasswordController.dispose();
    _patientIdController.dispose();
    super.dispose();
  }

  Map<String, String> _headers({bool withAuth = true}) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (withAuth && _token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<dynamic> _api(
    String path, {
    String method = 'GET',
    Map<String, dynamic>? body,
    bool withAuth = true,
  }) async {
    final uri = Uri.parse('${_apiController.text.trim()}$path');
    late final http.Response response;

    if (method == 'POST') {
      response = await http.post(
        uri,
        headers: _headers(withAuth: withAuth),
        body: jsonEncode(body ?? <String, dynamic>{}),
      );
    } else {
      response = await http.get(uri, headers: _headers(withAuth: withAuth));
    }

    dynamic data;
    if (response.body.isNotEmpty) {
      data = jsonDecode(response.body);
    }

    if (response.statusCode < 200 || response.statusCode > 299) {
      final detail = data is Map<String, dynamic> ? data['detail'] : null;
      throw Exception(detail?.toString() ?? 'Request failed');
    }

    return data;
  }

  void _setLoading(bool value) {
    setState(() {
      _loading = value;
    });
  }

  void _setError(String value) {
    setState(() {
      _error = value;
    });
  }

  Future<void> _loginDoctor() async {
    _setLoading(true);
    _setError('');
    try {
      final data = await _api(
        '/auth/doctor/login',
        method: 'POST',
        body: {
          'email': _doctorEmailController.text.trim(),
          'password': _doctorPasswordController.text,
        },
      );
      if (!mounted) return;
      setState(() {
        _token = (data as Map<String, dynamic>)['access_token']?.toString() ??
            '';
      });
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loadSeed() async {
    _setLoading(true);
    _setError('');
    try {
      final data = await _api('/dev/seed-info', withAuth: false);
      if (!mounted) return;
      _patientIdController.text =
          (data as Map<String, dynamic>)['patient_id']?.toString() ?? '';
      setState(() {});
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loadDoctorWorkspace() async {
    if (_patientIdController.text.trim().isEmpty) {
      _setError('Patient id required');
      return;
    }

    _setLoading(true);
    _setError('');
    try {
      final patientId = _patientIdController.text.trim();

      await _api(
        '/access/qr/scan',
        method: 'POST',
        body: {'qr_token': patientId},
      );

      final results = await Future.wait<dynamic>([
        _api('/patients/$patientId/summary'),
        _api('/patients/$patientId/timeline'),
        _api('/patients/$patientId/audit-logs'),
      ]);

      if (!mounted) return;
      setState(() {
        _summary = (results[0] as Map).cast<String, dynamic>();

        final timelineEvents =
            ((results[1] as Map<String, dynamic>)['events'] as List?) ??
                const [];
        _timeline = timelineEvents
            .whereType<Map>()
            .map((event) => event.cast<String, dynamic>())
            .toList();

        final logs = ((results[2] as Map<String, dynamic>)['logs'] as List?) ??
            const [];
        _auditLogs = logs
            .whereType<Map>()
            .map((log) => log.cast<String, dynamic>())
            .toList();
      });
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _startEmergency() async {
    if (_patientIdController.text.trim().isEmpty) {
      _setError('Patient id required');
      return;
    }

    _setLoading(true);
    _setError('');
    try {
      final data = await _api(
        '/access/emergency/start',
        method: 'POST',
        body: {
          'patient_token': _patientIdController.text.trim(),
          'reason': 'Mobile emergency access',
        },
      );
      if (!mounted) return;
      setState(() {
        _emergencySession = (data as Map).cast<String, dynamic>();
      });
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loadPatientPreview() async {
    _setLoading(true);
    _setError('');
    try {
      var patientId = _patientIdController.text.trim();

      if (patientId.isEmpty) {
        final seed = await _api('/dev/seed-info', withAuth: false)
            as Map<String, dynamic>;
        patientId = seed['patient_id']?.toString() ?? '';
        _patientIdController.text = patientId;
      }

      final preview = await _api('/dev/patient-preview/$patientId', withAuth: false)
          as Map<String, dynamic>;

      if (!mounted) return;
      setState(() {
        _summary = preview;
        final timeline = (preview['timeline'] as List?) ?? const [];
        _timeline = timeline
            .whereType<Map>()
            .map((event) => event.cast<String, dynamic>())
            .toList();
      });
    } catch (e) {
      _setError(e.toString().replaceFirst('Exception: ', ''));
    } finally {
      _setLoading(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2FAF9),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF2FAF9),
        elevation: 0,
        title: const Text(
          'YumiCare mobile',
          style: TextStyle(
            color: Color(0xFF173846),
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _HeaderCard(),
            const SizedBox(height: 12),
            _Panel(
              title: 'Backend Connection',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Input(
                    controller: _apiController,
                    hint: 'API base URL',
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Use your machine LAN IP here when testing on physical phone.',
                    style: TextStyle(color: Color(0xFF607A86), fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _RoleSwitch(
              value: _role,
              onChanged: (value) => setState(() => _role = value),
            ),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFE9EE),
                  border: Border.all(color: const Color(0xFFF4BFCA)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _error,
                  style: const TextStyle(color: Color(0xFFB33C54)),
                ),
              ),
            ],
            const SizedBox(height: 12),
            if (_role == 'doctor') ...[
              _buildDoctorSection(context),
            ] else ...[
              _buildPatientSection(context),
            ],
            const SizedBox(height: 12),
            _Panel(
              title: 'Ultrasound Scanning (YOLO)',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Only this flow uses current YOLO detector.',
                    style: TextStyle(color: Color(0xFF607A86), fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  _PrimaryButton(
                    label: 'Open YOLO Ultrasound Scanner',
                    onTap: () => Navigator.of(context)
                        .pushNamed('/ultrasound-analysis'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorSection(BuildContext context) {
    return Column(
      children: [
        _Panel(
          title: 'Doctor Authentication',
          child: Column(
            children: [
              _Input(
                controller: _doctorEmailController,
                hint: 'Doctor email',
              ),
              const SizedBox(height: 8),
              _Input(
                controller: _doctorPasswordController,
                hint: 'Doctor password',
                obscureText: true,
              ),
              const SizedBox(height: 8),
              _PrimaryButton(
                label: _loading ? 'Please wait...' : 'Sign In',
                onTap: _loading ? null : _loginDoctor,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _Panel(
          title: 'Access Workflow',
          child: Column(
            children: [
              _SecondaryButton(
                label: 'Load Seed Patient ID',
                onTap: (_loading || _token.isEmpty) ? null : _loadSeed,
              ),
              const SizedBox(height: 8),
              _Input(
                controller: _patientIdController,
                hint: 'Patient ID',
              ),
              const SizedBox(height: 8),
              _PrimaryButton(
                label: 'Scan QR + Load Workspace',
                onTap:
                    (_loading || _token.isEmpty) ? null : _loadDoctorWorkspace,
              ),
              const SizedBox(height: 8),
              _SecondaryButton(
                label: 'Start Emergency Session',
                onTap: (_loading || _token.isEmpty) ? null : _startEmergency,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _StatCard(
                label: 'Week',
                value: (_summary?['pregnancy_week']?.toString()) ?? '--',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _StatCard(
                label: 'Events',
                value: _timeline.length.toString(),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _StatCard(
                label: 'Audit',
                value: _auditLogs.length.toString(),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        _Panel(
          title: 'Clinical Snapshot',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _lineItem('Name', _summary?['full_name']),
              _lineItem('Blood Group', _summary?['blood_group']),
              _lineItem('Allergies', _joinList(_summary?['allergies'])),
              _lineItem('Medications', _joinList(_summary?['medications'])),
              _lineItem('Emergency Session',
                  _emergencySession == null ? 'Not started' : 'Active'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPatientSection(BuildContext context) {
    return Column(
      children: [
        _Panel(
          title: 'Patient Emergency Card',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _PrimaryButton(
                label: 'Load My Emergency Card',
                onTap: _loading ? null : _loadPatientPreview,
              ),
              const SizedBox(height: 8),
              _lineItem('Patient ID', _patientIdController.text),
              _lineItem('Name', _summary?['full_name']),
              _lineItem(
                'Pregnancy Week',
                _summary?['pregnancy_week']?.toString(),
              ),
              _lineItem('Blood Group', _summary?['blood_group']),
              _lineItem('Allergies', _joinList(_summary?['allergies'])),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _Panel(
          title: 'Care Timeline Preview',
          child: (_timeline.isEmpty)
              ? const Text(
                  'No timeline yet. Load emergency card first.',
                  style: TextStyle(color: Color(0xFF607A86), fontSize: 12),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: _timeline
                      .take(5)
                      .map(
                        (event) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            '${event['event_type'] ?? '--'} - ${_formatDate(event['observed_at'])}',
                            style: const TextStyle(color: Color(0xFF244A56)),
                          ),
                        ),
                      )
                      .toList(),
                ),
        ),
      ],
    );
  }

  String _joinList(dynamic listValue) {
    if (listValue is! List) {
      return '--';
    }
    final text = listValue
        .map((value) => value.toString().trim())
        .where((value) => value.isNotEmpty)
        .join(', ');
    return text.isEmpty ? '--' : text;
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '--';
    final dt = DateTime.tryParse(raw.toString());
    if (dt == null) return raw.toString();
    final local = dt.toLocal();
    final mm = local.month.toString().padLeft(2, '0');
    final dd = local.day.toString().padLeft(2, '0');
    final hh = local.hour.toString().padLeft(2, '0');
    final min = local.minute.toString().padLeft(2, '0');
    return '${local.year}-$mm-$dd $hh:$min';
  }

  Widget _lineItem(String label, dynamic value) {
    final text = (value == null || value.toString().trim().isEmpty)
        ? '--'
        : value.toString();
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        '$label: $text',
        style: const TextStyle(color: Color(0xFF244A56)),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD6ECEA)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'YumiCare mobile',
            style: TextStyle(
              color: Color(0xFF11877D),
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'Maternal Care Companion',
            style: TextStyle(
              fontSize: 24,
              color: Color(0xFF173846),
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Built for emergency-safe access, continuity, and trust.',
            style: TextStyle(color: Color(0xFF5F7580)),
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFDCECED)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF1F4350),
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _Input extends StatelessWidget {
  const _Input({
    required this.controller,
    required this.hint,
    this.obscureText = false,
  });

  final TextEditingController controller;
  final String hint;
  final bool obscureText;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: const Color(0xFFF9FDFD),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFFCDE1E3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: Color(0xFF7FCBC5)),
        ),
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2EC4B6),
          foregroundColor: const Color(0xFF083F3A),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(vertical: 11),
          elevation: 0,
        ),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
      ),
    );
  }
}

class _SecondaryButton extends StatelessWidget {
  const _SecondaryButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          backgroundColor: const Color(0xFFF4FDFD),
          foregroundColor: const Color(0xFF18545E),
          side: const BorderSide(color: Color(0xFFB8DEDD)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(vertical: 10),
        ),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFDCECED)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Color(0xFF5F7A83), fontSize: 12),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: Color(0xFF173E47),
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleSwitch extends StatelessWidget {
  const _RoleSwitch({required this.value, required this.onChanged});

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5F5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(
            child: _RoleItem(
              active: value == 'doctor',
              label: 'Doctor',
              onTap: () => onChanged('doctor'),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: _RoleItem(
              active: value == 'patient',
              label: 'Patient',
              onTap: () => onChanged('patient'),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleItem extends StatelessWidget {
  const _RoleItem({
    required this.active,
    required this.label,
    required this.onTap,
  });

  final bool active;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF2EC4B6) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? const Color(0xFF073F3A) : const Color(0xFF2F5A64),
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}