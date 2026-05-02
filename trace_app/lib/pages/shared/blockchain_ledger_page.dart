import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

/// Shows the immutable blockchain ledger — all transactions recorded on-chain.
/// Accessible from any role's home page as a floating "Ledger" button.
class BlockchainLedgerPage extends StatefulWidget {
  const BlockchainLedgerPage({super.key});
  @override
  State<BlockchainLedgerPage> createState() => _BlockchainLedgerPageState();
}

class _BlockchainLedgerPageState extends State<BlockchainLedgerPage> {
  BlockchainLedger? _ledger;
  bool _loading = true;
  String? _error;
  String? _filterType; // null = all, 'freeze', 'allocate', 'flag', 'report'

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    final result = await ApiService.I.getBlockchain(limit: 100, eventType: _filterType);
    if (!mounted) return;
    if (result.ok) {
      setState(() { _ledger = result.data!; _loading = false; });
    } else {
      setState(() { _error = result.error; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Blockchain Ledger', style: t.headlineSmall),
          if (_ledger != null)
            Text('${_ledger!.total} immutable records', style: t.bodySmall),
        ]),
        actions: [IconButton(onPressed: _load, icon: const Icon(Icons.refresh))],
      ),
      body: Column(children: [
        // ── Filter chips ───────────────────────────────────────────────────
        _FilterRow(
          selected: _filterType,
          onChanged: (t) { setState(() => _filterType = t); _load(); },
        ),

        // ── Ledger list ────────────────────────────────────────────────────
        Expanded(
          child: _loading
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
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _ledger!.ledger.length,
                        itemBuilder: (_, i) => _TxCard(tx: _ledger!.ledger[i]),
                      ),
                    ),
        ),
      ]),
    );
  }
}

// ─── Filter row ───────────────────────────────────────────────────────────────

class _FilterRow extends StatelessWidget {
  final String? selected;
  final ValueChanged<String?> onChanged;
  const _FilterRow({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    const filters = <String?, String>{
      null:        'All',
      'freeze':    '🔴 Freeze',
      'allocate':  '🟢 Allocate',
      'flag':      '🟡 Flag',
      'report':    '📋 Report',
    };
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: filters.entries.map((e) => Padding(
          padding: const EdgeInsets.only(right: 8),
          child: FilterChip(
            label: Text(e.value),
            selected: selected == e.key,
            onSelected: (_) => onChanged(e.key),
            selectedColor: t.primary,
            labelStyle: TextStyle(
                color: selected == e.key ? Colors.white : t.primaryText,
                fontWeight: FontWeight.w600),
            checkmarkColor: Colors.white,
          ),
        )).toList(),
      ),
    );
  }
}

// ─── Single transaction card ──────────────────────────────────────────────────

class _TxCard extends StatelessWidget {
  final TxRecord tx;
  const _TxCard({required this.tx});

  static const _eventColors = {
    'freeze':   Color(0xFFD32F2F),
    'allocate': Color(0xFF2E7D32),
    'flag':     Color(0xFFF57F17),
    'report':   Color(0xFF1565C0),
  };

  static const _eventIcons = {
    'freeze':   Icons.lock,
    'allocate': Icons.check_circle_outline,
    'flag':     Icons.flag,
    'report':   Icons.description_outlined,
  };

  @override
  Widget build(BuildContext context) {
    final t     = FlutterFlowTheme.of(context);
    final color = _eventColors[tx.eventType] ?? t.secondaryText;
    final icon  = _eventIcons[tx.eventType]  ?? Icons.link;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: t.secondaryBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // ── Header ─────────────────────────────────────────────────────────
        Row(children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(tx.eventType.toUpperCase(),
                style: t.titleMedium.copyWith(color: color, letterSpacing: 0.5)),
            Text(
              tx.district != null ? '${tx.district}, ${tx.state ?? ''}' : tx.entityType,
              style: t.bodySmall,
            ),
          ])),
          StatusPill(label: '✓ VERIFIED', color: t.success),
        ]),

        const SizedBox(height: 10),

        // ── Tx hash (copyable) ────────────────────────────────────────────
        GestureDetector(
          onTap: () {
            Clipboard.setData(ClipboardData(text: tx.txHash));
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Transaction hash copied')),
            );
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: t.primaryBackground,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(children: [
              Icon(Icons.link, size: 14, color: t.secondaryText),
              const SizedBox(width: 6),
              Expanded(child: Text(
                tx.txHash,
                style: t.bodySmall.copyWith(fontFamily: 'monospace', color: t.secondaryText),
                overflow: TextOverflow.ellipsis,
              )),
              Icon(Icons.copy, size: 14, color: t.secondaryText),
            ]),
          ),
        ),

        const SizedBox(height: 8),

        // ── Details row ───────────────────────────────────────────────────
        Row(children: [
          if (tx.amountCr > 0) ...[
            Icon(Icons.currency_rupee, size: 14, color: t.secondaryText),
            Text('${tx.amountCr.toStringAsFixed(2)} Cr', style: t.bodySmall),
            const SizedBox(width: 12),
          ],
          Icon(Icons.access_time, size: 14, color: t.secondaryText),
          const SizedBox(width: 4),
          Text(
            DateFormat('d MMM yyyy, HH:mm').format(tx.timestamp.toLocal()),
            style: t.bodySmall,
          ),
        ]),
      ]),
    );
  }
}
