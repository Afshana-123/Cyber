import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class InspectionDetailPage extends StatefulWidget {
  final String id;
  const InspectionDetailPage({super.key, required this.id});
  @override
  State<InspectionDetailPage> createState() => _InspectionDetailPageState();
}

class _InspectionDetailPageState extends State<InspectionDetailPage> {
  Inspection? _inspection;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final all = await ApiService.I.getInspections();
      final match = all.where((x) => x.id == widget.id);
      _inspection = match.isNotEmpty ? match.first : (all.isNotEmpty ? all.first : null);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    if (_loading) {
      return Scaffold(appBar: AppBar(title: const Text('Inspection')), body: const Center(child: CircularProgressIndicator()));
    }
    if (_inspection == null) {
      return Scaffold(appBar: AppBar(title: const Text('Inspection')), body: Center(child: Text('Not found', style: t.headlineSmall)));
    }
    final i = _inspection!;
    return Scaffold(
      appBar: AppBar(title: Text(i.id ?? 'Inspection'),
        actions: [IconButton(onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('PDF export — roadmap')));
        }, icon: const Icon(Icons.picture_as_pdf_outlined))],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text('Verdict', style: t.bodySmall)),
              StatusPill(label: i.verdict, color: statusColor(i.verdict, context)),
            ]),
            const SizedBox(height: 10),
            Text('Project: ${i.projectName ?? i.projectId}', style: t.titleMedium),
            const SizedBox(height: 4),
            Text('Submitted ${DateFormat('d MMM yyyy, HH:mm').format(i.createdAt)}', style: t.bodySmall),
            const SizedBox(height: 4),
            Text('Failed checklist items: ${i.failedItems}', style: t.bodyMedium),
            if (i.txHash != null) ...[
              const SizedBox(height: 8),
              Text('TX Hash: ${i.txHash}', style: t.bodySmall.copyWith(fontFamily: 'monospace')),
            ],
          ])),
          SectionCard(title: 'Photos', child: GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 6, crossAxisSpacing: 6,
            children: List.generate(6, (_) => Container(
              decoration: BoxDecoration(color: t.primaryBackground, borderRadius: BorderRadius.circular(8)),
              child: Icon(Icons.image_outlined, color: t.secondaryText),
            )),
          )),
        ],
      ),
    );
  }
}
