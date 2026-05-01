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
  late Future<List<Project>> _projectsFut;
  late Future<List<Inspection>> _inspectionsFut;

  @override
  void initState() {
    super.initState();
    _projectsFut = ApiService.I.getProjects(districtId: AppState().districtId);
    _inspectionsFut = ApiService.I.getInspections();
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Field Auditor', style: t.bodySmall),
          Text(AppState().name.isEmpty ? 'Inspector' : AppState().name, style: t.headlineSmall),
        ]),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GestureDetector(
            onTap: () => context.push('/auditor/scan'),
            child: Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(colors: [t.primary, const Color(0xFF173A5E)])),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Text('Scan Project QR', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                  SizedBox(height: 6),
                  Text('Pull up the on-chain contract & start inspection.',
                    style: TextStyle(color: Colors.white70)),
                ])),
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(16)),
                  child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 32),
                ),
              ]),
            ),
          ),
          const SizedBox(height: 16),
          FutureBuilder<List<Project>>(
            future: _projectsFut,
            builder: (ctx, snap) {
              if (snap.connectionState == ConnectionState.waiting) {
                return const SectionCard(child: Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())));
              }
              final projects = snap.data ?? [];
              return SectionCard(
                title: 'Assigned inspections',
                child: projects.isEmpty
                    ? Padding(padding: const EdgeInsets.all(16), child: Text('No projects assigned', style: t.bodyMedium))
                    : Column(children: projects.map((p) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(backgroundColor: t.primary.withOpacity(0.1), child: Icon(Icons.place_outlined, color: t.primary)),
                        title: Text(p.name, style: t.titleMedium),
                        subtitle: Text('Due ${DateFormat('d MMM').format(DateTime.now().add(const Duration(days: 4)))}'),
                        trailing: Icon(Icons.chevron_right, color: t.secondaryText),
                        onTap: () => context.push('/auditor/inspect?pid=${p.id}'),
                      )).toList()),
              );
            },
          ),
          FutureBuilder<List<Inspection>>(
            future: _inspectionsFut,
            builder: (ctx, snap) {
              if (snap.connectionState == ConnectionState.waiting) {
                return const SectionCard(child: Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())));
              }
              final inspections = snap.data ?? [];
              if (inspections.isEmpty) return const SizedBox.shrink();
              return SectionCard(
                title: 'Recent inspections',
                child: Column(children: inspections.take(5).map((i) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(backgroundColor: statusColor(i.verdict, context).withOpacity(0.1), child: Icon(Icons.assignment_turned_in_outlined, color: statusColor(i.verdict, context))),
                  title: Text(i.projectName ?? i.projectId, style: t.titleMedium),
                  subtitle: Text('${DateFormat('d MMM').format(i.createdAt)}'),
                  trailing: StatusPill(label: i.verdict, color: statusColor(i.verdict, context)),
                  onTap: () => context.push('/auditor/detail?id=${i.id}'),
                )).toList()),
              );
            },
          ),
        ],
      ),
    );
  }
}
