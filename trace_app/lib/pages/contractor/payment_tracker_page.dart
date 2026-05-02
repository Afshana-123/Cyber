import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class PaymentTrackerPage extends StatefulWidget {
  final String contractId;
  const PaymentTrackerPage({super.key, required this.contractId});
  @override
  State<PaymentTrackerPage> createState() => _PaymentTrackerPageState();
}

class _PaymentTrackerPageState extends State<PaymentTrackerPage> {
  Contract? _contract;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      _contract = await ApiService.I.getPayments(widget.contractId);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    if (_loading) {
      return Scaffold(appBar: AppBar(title: Text(widget.contractId)), body: const Center(child: CircularProgressIndicator()));
    }
    if (_contract == null) {
      return Scaffold(appBar: AppBar(title: Text(widget.contractId)), body: Center(child: Text('Contract not found', style: t.headlineSmall)));
    }
    final c = _contract!;
    final total = c.milestones.fold<double>(0, (a, m) => a + m.amount);
    final released = c.milestones.where((m) => m.status == 'Released').fold<double>(0, (a, m) => a + m.amount);

    return Scaffold(
      appBar: AppBar(title: Text(c.name, overflow: TextOverflow.ellipsis)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(c.name, style: t.headlineSmall),
            if (c.contractor.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(c.contractor, style: t.bodySmall),
            ],
            const SizedBox(height: 10),
            Row(children: [
              _Stat(label: 'Released', value: '₹${released.toStringAsFixed(1)} Cr', color: t.success),
              const SizedBox(width: 10),
              _Stat(label: 'Total', value: '₹${total.toStringAsFixed(1)} Cr'),
            ]),
          ])),
          SectionCard(title: 'Milestone breakdown', child: Column(
            children: c.milestones.map((m) => Container(
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
                Text('Amount: ₹${m.amount} Cr', style: t.bodyMedium),
                if (m.releasedAt != null) Text('Released on ${DateFormat('d MMM yyyy').format(m.releasedAt!)}', style: t.bodySmall),
                if (m.blockReason != null) Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: t.error.withOpacity(0.08), borderRadius: BorderRadius.circular(8)),
                    child: Row(children: [
                      Icon(Icons.block, color: t.error, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Text(m.blockReason!, style: TextStyle(color: t.error))),
                    ]),
                  ),
                ),
              ]),
            )).toList(),
          )),
        ],
      ),
    );
  }
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
      decoration: BoxDecoration(color: t.primaryBackground, borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: t.bodySmall),
        const SizedBox(height: 4),
        Text(value, style: t.headlineSmall.copyWith(color: color ?? t.primaryText)),
      ]),
    ));
  }
}
