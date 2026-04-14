import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_session.dart';

class TabsShellScreen extends StatefulWidget {
  const TabsShellScreen({super.key, required this.initialIndex});

  final int initialIndex;

  @override
  State<TabsShellScreen> createState() => _TabsShellScreenState();
}

class _TabsShellScreenState extends State<TabsShellScreen> {
  late int _index;

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    final session = AppSession.instance;
    final role = session.role;

    const pages = [
      _HomeTabPage(),
      _TimelineTabPage(),
      _RecordsTabPage(),
      _ProfileTabPage(),
    ];

    return AnimatedBuilder(
      animation: session,
      builder: (context, _) {
        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: Text(_titleForIndex(_index, role)),
            actions: [
              IconButton(
                onPressed: () =>
                    Navigator.of(context).pushNamed('/notifications'),
                icon: const Icon(Icons.notifications_none),
              ),
            ],
          ),
          body: pages[_index],
          bottomNavigationBar: NavigationBar(
            selectedIndex: _index,
            onDestinationSelected: (value) => setState(() => _index = value),
            destinations: [
              const NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'Home',
              ),
              NavigationDestination(
                icon: const Icon(Icons.timeline),
                label: session.tab2Title(role),
              ),
              NavigationDestination(
                icon: const Icon(Icons.folder_open_outlined),
                label: session.tab3Title(role),
              ),
              const NavigationDestination(
                icon: Icon(Icons.person_outline),
                selectedIcon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }

  String _titleForIndex(int idx, UserRole role) {
    final session = AppSession.instance;
    switch (idx) {
      case 0:
        return 'Dashboard';
      case 1:
        return session.tab2Title(role);
      case 2:
        return session.tab3Title(role);
      case 3:
        return 'Profile';
      default:
        return 'YumiCare';
    }
  }
}

class _HomeTabPage extends StatelessWidget {
  const _HomeTabPage();

  @override
  Widget build(BuildContext context) {
    final session = AppSession.instance;
    final user = session.currentUser;
    final role = session.role;

    final quickActions = <Map<String, String>>[
      {'title': 'Appointments', 'route': '/appointments'},
      {'title': 'Messages', 'route': '/messages'},
      {'title': 'Medications', 'route': '/medications'},
      {'title': 'Allergies', 'route': '/allergies'},
      {'title': 'Ultrasound Upload', 'route': '/ultrasound-upload'},
      {'title': 'Ultrasound Analysis', 'route': '/ultrasound-analysis'},
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: role == UserRole.hospital
                  ? [AppColors.purple, const Color(0xFF9C7BC1)]
                  : [AppColors.teal, AppColors.tealDark],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Welcome', style: TextStyle(color: Colors.white70)),
              const SizedBox(height: 4),
              Text(
                user?.name ?? 'YumiCare User',
                style: const TextStyle(
                  color: AppColors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 22,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  role.name.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: quickActions
              .map(
                (action) => SizedBox(
                  width: MediaQuery.of(context).size.width * 0.42,
                  child: Card(
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () =>
                          Navigator.of(context).pushNamed(action['route']!),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(
                          action['title']!,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _TimelineTabPage extends StatelessWidget {
  const _TimelineTabPage();

  @override
  Widget build(BuildContext context) {
    final role = AppSession.instance.role;

    final items = switch (role) {
      UserRole.patient => const [
          'Anomaly scan completed (Mar 25)',
          'Blood panel normal (Mar 18)',
          'Routine checkup done (Mar 10)',
        ],
      UserRole.doctor => const [
          '4 patient follow-ups due today',
          '2 critical risk alerts pending',
          '1 ultrasound review pending',
        ],
      UserRole.hospital => const [
          'Bed occupancy: 62%',
          '5 doctors currently on duty',
          '3 emergency admissions today',
        ],
      UserRole.admin => const [
          '2 hospitals synced in last 24h',
          '1 audit flag requires review',
          'System uptime: 99.9%',
        ],
    };

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            leading: const Icon(Icons.event_note_outlined),
            title: Text(items[index]),
          ),
        );
      },
    );
  }
}

class _RecordsTabPage extends StatelessWidget {
  const _RecordsTabPage();

  @override
  Widget build(BuildContext context) {
    final role = AppSession.instance.role;

    final records = switch (role) {
      UserRole.patient => const [
          'Ultrasound Reports',
          'Lab Reports',
          'Prescriptions',
          'Doctor Notes',
        ],
      UserRole.doctor => const [
          'Patient Messages',
          'Prescriptions Issued',
          'Critical Alerts',
        ],
      UserRole.hospital => const [
          'Hospital Patients',
          'Doctor Performance',
          'Admission Logs',
        ],
      UserRole.admin => const [
          'Cross-Hospital Reports',
          'Audit Trail',
          'User Management',
        ],
    };

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: records.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        return Card(
          child: ListTile(
            title: Text(records[index]),
            trailing: const Icon(Icons.chevron_right),
          ),
        );
      },
    );
  }
}

class _ProfileTabPage extends StatelessWidget {
  const _ProfileTabPage();

  @override
  Widget build(BuildContext context) {
    final session = AppSession.instance;
    final user = session.currentUser;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.name ?? 'Unknown User',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? '-',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                Text('Role: ${session.role.name.toUpperCase()}'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        ElevatedButton.icon(
          onPressed: () {
            session.logout();
            Navigator.of(context)
                .pushNamedAndRemoveUntil('/login', (route) => false);
          },
          icon: const Icon(Icons.logout),
          label: const Text('Logout'),
        ),
      ],
    );
  }
}
