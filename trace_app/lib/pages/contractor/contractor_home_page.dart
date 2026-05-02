import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app_state.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class ContractorHomePage extends StatefulWidget {
  const ContractorHomePage({super.key});
  @override
  State<ContractorHomePage> createState() => _ContractorHomePageState();
}

class _ContractorHomePageState extends State<ContractorHomePage> {
  List<District> _districts = [];
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
      setState(() { _districts = result.data!; _loading = false; });
    } else {
      setState(() { _error = result.error; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t     = FlutterFlowTheme.of(context);
    final state = AppState();

    // Find contractor's district data (or use first as fallback)
    final myDistrict = _districts.firstWhere(
      (d) => d.name.toLowerCase() == state.district.toLowerCase(),
      orElse: () => _districts.isNotEmpty ? _districts.first : _emptyDistrict,
    );
    final risk      = myDistrict.riskScore;
    final riskColor = risk >= 70 ? t.error : risk >= 40 ? t.warning : t.success;

    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Contractor', style: t.bodySmall),
          Text(state.name.isEmpty ? 'Company' : state.name, style: t.headlineSmall),
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
                      if (myDistrict.status == 'flagged')
                        AlertBanner(text:
                            '${myDistrict.name} is flagged 🔴 — milestone payments may be frozen. '
                            'Tap a contract below to view.'),

                      // ── District risk score card ──────────────────────────
                      SectionCard(
                        title: 'District risk score',
                        child: Row(children: [
                          Stack(alignment: Alignment.center, children: [
                            SizedBox(
                              width: 76, height: 76,
                              child: CircularProgressIndicator(
                                value: risk / 100, strokeWidth: 8,
                                backgroundColor: t.divider,
                                valueColor: AlwaysStoppedAnimation(riskColor),
                              ),
                            ),
                            Text('$risk', style: t.headlineSmall.copyWith(color: riskColor)),
                          ]),
                          const SizedBox(width: 16),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            StatusPill(
                                label: risk >= 70 ? 'HIGH RISK' : risk >= 40 ? 'MEDIUM' : 'LOW',
                                color: riskColor),
                            const SizedBox(height: 6),
                            Text(
                              '${myDistrict.name}, ${myDistrict.state}\n'
                              '₹${myDistrict.missingCrore.toStringAsFixed(1)} Cr unaccounted',
                              style: t.bodyMedium,
                            ),
                          ])),
                        ]),
                      ),

                      // ── Active contracts (real districts from DB) ─────────
                      SectionCard(
                        title: 'Active contracts',
                        child: _districts.isEmpty
                            ? Text('No contracts found.', style: t.bodyMedium)
                            : Column(
                                children: _districts.take(5).map((d) => ListTile(
                                  contentPadding: EdgeInsets.zero,
                                  leading: CircleAvatar(
                                      backgroundColor: t.primary.withOpacity(0.1),
                                      child: Icon(Icons.handshake_outlined, color: t.primary)),
                                  title: Text('${d.name} Infrastructure', style: t.titleMedium),
                                  subtitle: Text('${d.state} • Risk ${d.riskScore}'),
                                  trailing: Icon(Icons.chevron_right, color: t.secondaryText),
                                  onTap: () => context.push('/contractor/payments?cid=${d.id}'),
                                )).toList(),
                              ),
                      ),

                      // ── Quick actions ─────────────────────────────────────
                      Row(children: [
                        Expanded(child: _QuickAction(
                          icon: Icons.receipt_outlined,
                          label: 'Submit invoice',
                          onTap: () => context.push('/contractor/invoice'),
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _QuickAction(
                          icon: Icons.flag_outlined,
                          label: 'Submit milestone',
                          onTap: () => context.push('/contractor/milestone'),
                        )),
                      ]),
                    ],
                  ),
                ),
    );
  }

  static final _emptyDistrict = District(
    id: '', name: 'N/A', state: '', riskScore: 0,
    status: 'clean', lat: 0, lng: 0, missingCrore: 0,
  );
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickAction({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Material(
      color: t.secondaryBackground,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: t.divider)),
          child: Column(children: [
            Icon(icon, color: t.primary, size: 28),
            const SizedBox(height: 8),
            Text(label, style: t.titleMedium, textAlign: TextAlign.center),
          ]),
        ),
      ),
    );
  }
}
