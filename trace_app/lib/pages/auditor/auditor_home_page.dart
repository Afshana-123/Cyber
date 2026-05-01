import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../app_state.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class AuditorHomePage extends StatefulWidget {
  const AuditorHomePage({super.key});
  @override
  State<AuditorHomePage> createState() => _AuditorHomePageState();
}

class _AuditorHomePageState extends State<AuditorHomePage> {
  List<District> _flaggedDistricts = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    final result = await ApiService.I.getDistricts();
    if (!mounted) return;
    if (result.ok) {
      // Show flagged/watch districts as "assigned inspections"
      setState(() {
        _flaggedDistricts = result.data!.where((d) => d.riskScore > 35).take(5).toList();
        _loading = false;
      });
    } else {
      setState(() { _error = result.error; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t    = FlutterFlowTheme.of(context);
    final name = AppState().name;

    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Field Auditor', style: t.bodySmall),
          Text(name.isEmpty ? 'Inspector' : name, style: t.headlineSmall),
        ]),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.cloud_off, size: 56, color: t.error),
                  const SizedBox(height: 12),
                  Text(_error!, style: t.bodyMedium, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  PrimaryButton(label: 'Retry', onPressed: _load),
                ]))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      // ── QR Scan CTA ───────────────────────────────────────
                      GestureDetector(
                        onTap: () => context.push('/auditor/scan'),
                        child: Container(
                          padding: const EdgeInsets.all(22),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            gradient: LinearGradient(
                                colors: [t.primary, const Color(0xFF173A5E)]),
                          ),
                          child: Row(children: [
                            Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                                Text('Scan Project QR',
                                    style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                                SizedBox(height: 6),
                                Text('Pull up the on-chain contract & start inspection.',
                                    style: TextStyle(color: Colors.white70)),
                              ]),
                            ),
                            Container(
                              width: 60, height: 60,
                              decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(16)),
                              child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 32),
                            ),
                          ]),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ── Assigned inspections (flagged districts from real DB) ──
                      SectionCard(
                        title: 'Assigned inspections',
                        child: _flaggedDistricts.isEmpty
                            ? Text('No flagged districts.', style: t.bodyMedium)
                            : Column(
                                children: _flaggedDistricts.map((d) => ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  leading: CircleAvatar(
                                      backgroundColor: t.error.withOpacity(0.1),
                                      child: Icon(Icons.place_outlined, color: t.error)),
                                  title: Text('${d.name} — ${d.state}', style: t.titleMedium),
                                  subtitle: Text(
                                      'Risk ${d.riskScore} • ${d.status.toUpperCase()} • '
                                      'Due ${DateFormat('d MMM').format(DateTime.now().add(const Duration(days: 4)))}'),
                                  trailing: Icon(Icons.chevron_right, color: t.secondaryText),
                                  onTap: () => context.push('/auditor/inspect?pid=${d.id}'),
                                )).toList(),
                              ),
                      ),

                      // ── Recent inspections (session-only for now) ──────────
                      SectionCard(
                        title: 'Recent inspections',
                        child: Text('Inspections submitted this session appear here.\n'
                            'Tap "Scan Project QR" to start a new one.',
                            style: t.bodyMedium.copyWith(color: t.secondaryText)),
                      ),
                    ],
                  ),
                ),
    );
  }
}
