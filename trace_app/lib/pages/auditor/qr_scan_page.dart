import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class QrScanPage extends StatefulWidget {
  const QrScanPage({super.key});
  @override
  State<QrScanPage> createState() => _QrScanPageState();
}

class _QrScanPageState extends State<QrScanPage> {
  bool _loading = false;
  List<Project> _projects = [];

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    try {
      _projects = await ApiService.I.getProjects();
    } catch (_) {}
    if (mounted) setState(() {});
  }

  void _onScan(String code) {
    final match = _projects.any((p) => p.id == code);
    final pid = match ? code : (_projects.isNotEmpty ? _projects.first.id : '');
    context.pushReplacement('/auditor/inspect?pid=$pid');
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 260, height: 260,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: t.primary, width: 2),
              color: t.primaryBackground,
            ),
            child: Icon(Icons.qr_code_2, size: 120, color: t.primary.withOpacity(0.3)),
          ),
          const SizedBox(height: 24),
          Text('Point camera at project QR code', style: t.bodyMedium),
          const SizedBox(height: 24),
          PrimaryButton(
            label: 'Simulate scan (demo)',
            icon: Icons.qr_code_scanner,
            loading: _loading,
            onPressed: () {
              final pid = _projects.isNotEmpty ? _projects.first.id : '';
              if (pid.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No projects loaded')));
                return;
              }
              context.pushReplacement('/auditor/inspect?pid=$pid');
            },
          ),
        ]),
      ),
    );
  }
}
