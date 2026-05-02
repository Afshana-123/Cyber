import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class MyReportsPage extends StatefulWidget {
  const MyReportsPage({super.key});
  @override
  State<MyReportsPage> createState() => _MyReportsPageState();
}

class _MyReportsPageState extends State<MyReportsPage> {
  late Future<List<Inspection>> _reportsFut;

  @override
  void initState() {
    super.initState();
    // Fetch citizen-submitted reports from the inspections/reports endpoint
    _reportsFut = ApiService.I.getInspections();
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('My Reports')),
      body: FutureBuilder<List<Inspection>>(
        future: _reportsFut,
        builder: (ctx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final reports = snap.data ?? [];
          if (reports.isEmpty) {
            return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.inbox_outlined, size: 72, color: t.secondaryText),
              const SizedBox(height: 12),
              Text('No reports yet', style: t.headlineSmall),
              const SizedBox(height: 4),
              Text('Your submitted reports will appear here.', style: t.bodyMedium.copyWith(color: t.secondaryText)),
            ]));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: reports.map((r) => SectionCard(
              child: Row(children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(color: t.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Icon(Icons.description_outlined, color: t.primary),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(r.projectName ?? r.projectId, style: t.titleMedium),
                  Text('${r.verdict} • ${DateFormat('d MMM, HH:mm').format(r.createdAt)}', style: t.bodySmall),
                ])),
                StatusPill(label: r.verdict, color: statusColor(r.verdict, context)),
              ]),
            )).toList(),
          );
        },
      ),
    );
  }
}
