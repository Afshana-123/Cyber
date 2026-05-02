import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class PaymentTrackerPage extends StatefulWidget {
  final String contractId; // district UUID from real DB
  const PaymentTrackerPage({super.key, required this.contractId});
  @override
  State<PaymentTrackerPage> createState() => _PaymentTrackerPageState();
}

class _PaymentTrackerPageState extends State<PaymentTrackerPage> {
  Contract? _contract;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    final result = await ApiService.I.getPayments(widget.contractId);
    if (!mounted) return;
    if (result.ok) {
      setState(() { _contract = result.data!; _loading = false; });
    } else {
      setState(() { _error = result.error; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.contractId.length > 12
            ? widget.contractId.substring(0, 12) + '…'
            : widget.contractId),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.error_outline, size: 56, color: t.error),
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
                      // ── Summary card ──────────────────────────────────────
                      SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Contract — ${_contract!.contractorName}', style: t.headlineSmall),
                        const SizedBox(height: 10),
                        Row(children: [
                          _Stat(
                            label: 'Released',
                            value: '₹${_released.toStringAsFixed(2)} Cr',
                            color: t.success,
                          ),
                          const SizedBox(width: 10),
                          _Stat(
                            label: 'Total',
                            value: '₹${_contract!.totalValueCr.toStringAsFixed(2)} Cr',
                          ),
                          const SizedBox(width: 10),
                          _Stat(
                            label: 'Frozen',
                            value: _contract!.phase2Frozen ? 'Yes' : 'No',
                            color: _contract!.phase2Frozen ? t.error : t.success,
                          ),
                        ]),
                      ])),

                      // ── Blockchain integrity note ──────────────────────────
                      Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: t.primary.withOpacity(0.07),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: t.primary.withOpacity(0.2)),
                        ),
                        child: Row(children: [
                          Icon(Icons.link, color: t.primary, size: 20),
                          const SizedBox(width: 10),
                          Expanded(child: Text(
                            'All milestone releases are permanently recorded on the TRACE blockchain ledger.',
                            style: t.bodySmall.copyWith(color: t.primary),
                          )),
                        ]),
                      ),

                      // ── Milestones ────────────────────────────────────────
                      SectionCard(
                        title: 'Milestone breakdown',
                        child: Column(
                          children: _contract!.milestones.map((m) => Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: t.primaryBackground,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: t.divider),
                            ),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Row(children: [
                                Expanded(child: Text('Milestone ${m.index}', style: t.titleMedium)),
                                StatusPill(label: m.status, color: statusColor(m.status, context)),
                              ]),
                              const SizedBox(height: 6),
                              Text('Amount: ₹${m.amount.toStringAsFixed(2)} Cr', style: t.bodyMedium),
                              if (m.releasedAt != null)
                                Text('Released ${DateFormat('d MMM yyyy').format(m.releasedAt!)}',
                                    style: t.bodySmall),
                              if (m.expectedDate != null && m.status == 'Pending')
                                Text('Expected ${DateFormat('d MMM yyyy').format(m.expectedDate!)}',
                                    style: t.bodySmall),
                              if (m.blockReason != null)
                                Container(
                                  margin: const EdgeInsets.only(top: 8),
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                      color: t.error.withOpacity(0.08),
                                      borderRadius: BorderRadius.circular(8)),
                                  child: Row(children: [
                                    Icon(Icons.block, color: t.error, size: 18),
                                    const SizedBox(width: 8),
                                    Expanded(child: Text(m.blockReason!,
                                        style: TextStyle(color: t.error))),
                                  ]),
                                ),
                            ]),
                          )).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  double get _released => _contract?.milestones
      .where((m) => m.status.toLowerCase() == 'released')
      .fold<double>(0, (a, m) => a + m.amount) ?? 0;
}

class _Stat extends StatelessWidget {
  final String label, value;
  final Color? color;
  const _Stat({required this.label, required this.value, this.color});
  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
          color: t.primaryBackground, borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: t.bodySmall),
        const SizedBox(height: 4),
        Text(value, style: t.headlineSmall.copyWith(color: color ?? t.primaryText),
            maxLines: 1, overflow: TextOverflow.ellipsis),
      ]),
    ));
  }
}
