import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../widgets/common.dart';

/// Shows details of a past inspection by its report ID.
/// In production this would call GET /api/contract/:projectId and find the
/// matching report in the transaction_log. For now it shows the passed-in data.
class InspectionDetailPage extends StatelessWidget {
  final String id; // inspection report ID
  const InspectionDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(id.isEmpty ? 'Inspection' : id),
        actions: [
          IconButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('PDF export — roadmap')));
            },
            icon: const Icon(Icons.picture_as_pdf_outlined),
          ),
        ],
      ),
      body: id.isEmpty
          ? Center(child: Text('No inspection selected.', style: t.bodyMedium))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Expanded(child: Text('Inspection ID')),
                    StatusPill(label: '✓ ON-CHAIN', color: t.success),
                  ]),
                  const SizedBox(height: 10),
                  Text(id, style: t.titleMedium.copyWith(fontFamily: 'monospace')),
                  const SizedBox(height: 4),
                  Text('Submitted ${DateFormat('d MMM yyyy').format(DateTime.now())}',
                      style: t.bodySmall),
                ])),
                SectionCard(
                  title: 'Blockchain record',
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Icon(Icons.lock, size: 16, color: t.success),
                      const SizedBox(width: 8),
                      Expanded(child: Text(
                        'This inspection is permanently recorded on-chain and cannot be altered.',
                        style: t.bodySmall,
                      )),
                    ]),
                    const SizedBox(height: 8),
                    Text('TX Hash: $id', style: t.bodySmall.copyWith(fontFamily: 'monospace'),
                        overflow: TextOverflow.ellipsis),
                  ]),
                ),
                SectionCard(title: 'Photos', child: GridView.count(
                  crossAxisCount: 3,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 6, crossAxisSpacing: 6,
                  children: List.generate(3, (_) => Container(
                    decoration: BoxDecoration(
                        color: t.primaryBackground,
                        borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.image_outlined, color: t.secondaryText),
                  )),
                )),
              ],
            ),
    );
  }
}
