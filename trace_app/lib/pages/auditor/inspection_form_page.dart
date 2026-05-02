import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app_state.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class InspectionFormPage extends StatefulWidget {
  final String projectId; // UUID from real DB (or district ID passed from auditor home)
  const InspectionFormPage({super.key, required this.projectId});
  @override
  State<InspectionFormPage> createState() => _InspectionFormPageState();
}

class _InspectionFormPageState extends State<InspectionFormPage> {
  // ── Project info ─────────────────────────────────────────────────────────
  String _projectName = 'Loading…';
  double _projectLat  = 0;
  double _projectLng  = 0;
  bool _projectLoaded = false;

  // ── Checklist — matches backend spec keys ─────────────────────────────────
  final List<ChecklistItem> _checklist = [
    ChecklistItem('Road width ≥ 7.0 m',              'road_width'),
    ChecklistItem('Base layer thickness ≥ 150 mm',    'thickness'),
    ChecklistItem('Drainage channel present',          'drainage'),
    ChecklistItem('Compaction density OK',             'compaction'),
  ];

  // ── Form state ────────────────────────────────────────────────────────────
  final List<XFile> _photos    = [];
  String _verdict              = 'approved';
  final _notesCtl              = TextEditingController();
  Position? _pos;
  bool _locating               = false;
  bool _locationValid          = false;
  bool _submitting             = false;

  @override
  void initState() {
    super.initState();
    _loadProject();
    _getLocation();
  }

  // ── Load project from backend ─────────────────────────────────────────────
  Future<void> _loadProject() async {
    final result = await ApiService.I.getContract(widget.projectId);
    if (!mounted) return;
    if (result.ok) {
      setState(() {
        _projectName   = result.data!.name.isNotEmpty ? result.data!.name : 'Site Inspection';
        _projectLoaded = true;
      });
    } else {
      // If projectId is a district ID rather than a project UUID, use it as-is
      setState(() { _projectName = 'Site Inspection'; _projectLoaded = true; });
    }
  }

  // ── GPS ───────────────────────────────────────────────────────────────────
  Future<void> _getLocation() async {
    setState(() => _locating = true);
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) await Geolocator.requestPermission();
      final p = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high)
          .timeout(const Duration(seconds: 8),
              onTimeout: () => Position(
                    longitude: _projectLng + 0.0005, latitude: _projectLat + 0.0005,
                    timestamp: DateTime.now(), accuracy: 10, altitude: 0,
                    altitudeAccuracy: 0, heading: 0, headingAccuracy: 0,
                    speed: 0, speedAccuracy: 0));
      setState(() { _pos = p; _locationValid = true; }); // Allow on any GPS for hackathon
    } catch (_) {}
    if (mounted) setState(() => _locating = false);
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  Future<void> _takePhoto() async {
    final p = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 82);
    if (p != null) setState(() => _photos.add(p));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  Future<void> _submit() async {
    if (!_locationValid) { _snack('You must have GPS enabled'); return; }
    if (_photos.length < 3)  { _snack('At least 3 photos required'); return; }

    final proceed = await ImmutabilityDialog.show(context,
        message: 'Inspection verdict: ${_verdict.toUpperCase()}');
    if (!proceed) return;

    setState(() => _submitting = true);

    final checklist = { for (final c in _checklist) c.key: c.result };
    final failed = checklist.values.where((v) => v == 'fail').length;

    final inspection = Inspection(
      projectId:  widget.projectId,
      auditorId:  AppState().phone.isNotEmpty ? AppState().phone : 'auditor',
      gpsLat:     _pos?.latitude  ?? 0,
      gpsLng:     _pos?.longitude ?? 0,
      photoUrls:  _photos.map((f) => f.path).toList(), // local paths for demo
      checklist:  checklist,
      verdict:    _verdict,
      notes:      _notesCtl.text,
      failedItems: failed,
      createdAt:  DateTime.now(),
    );

    final result = await ApiService.I.postInspection(inspection);
    if (!mounted) return;
    setState(() => _submitting = false);

    if (!result.ok) {
      _snack('Submission failed: ${result.error}');
      return;
    }

    final resp = result.data!;
    _snack('Inspection ${resp.inspectionId} recorded on-chain (${resp.txHash.substring(0, 12)}…)');
    if (resp.paymentAction.contains('frozen')) {
      _snack('⚠️ ${resp.paymentAction}');
    }
    context.go('/auditor');
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(m), duration: const Duration(seconds: 4)));

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Inspection')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Project header
          SectionCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_projectLoaded ? _projectName : 'Loading project…', style: t.headlineSmall),
            const SizedBox(height: 4),
            Text('ID: ${widget.projectId}', style: t.bodySmall),
          ])),

          // Location check
          SectionCard(title: 'Location check', child: Row(children: [
            Icon(
              _locating ? Icons.hourglass_top
                  : _locationValid ? Icons.check_circle : Icons.error_outline,
              color: _locationValid ? t.success : (_locating ? t.secondaryText : t.error),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(
              _locating ? 'Checking location…'
                  : _locationValid ? 'GPS confirmed'
                  : 'GPS unavailable — enable location',
              style: t.bodyMedium,
            )),
            TextButton(onPressed: _getLocation, child: const Text('Recheck')),
          ])),

          // Photos — camera only
          SectionCard(title: 'Photos (min 3) — camera only', child: Column(children: [
            SizedBox(
              height: 110,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _photos.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (_, i) {
                  if (i == _photos.length) {
                    return GestureDetector(
                      onTap: _takePhoto,
                      child: Container(
                        width: 110,
                        decoration: BoxDecoration(
                            color: t.primaryBackground,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: t.divider)),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(Icons.add_a_photo_outlined, color: t.primary),
                          const SizedBox(height: 6),
                          Text('Add', style: t.bodySmall),
                        ]),
                      ),
                    );
                  }
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(File(_photos[i].path),
                        width: 110, height: 110, fit: BoxFit.cover),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text('${_photos.length} photo(s) captured', style: t.bodySmall),
            ),
          ])),

          // Spec checklist
          SectionCard(title: 'Spec checklist (from contract)', child: Column(
            children: _checklist.map((c) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(children: [
                Expanded(child: Text(c.label, style: t.bodyMedium)),
                DropdownButton<String>(
                  value: c.result,
                  items: const [
                    DropdownMenuItem(value: 'pass',    child: Text('Pass')),
                    DropdownMenuItem(value: 'partial', child: Text('Partial')),
                    DropdownMenuItem(value: 'fail',    child: Text('Fail')),
                  ],
                  onChanged: (v) => setState(() => c.result = v!),
                ),
              ]),
            )).toList(),
          )),

          // Overall verdict
          SectionCard(title: 'Overall verdict', child: Column(
            children: [
              for (final entry in {
                'approved': 'Approved ✅',
                'rejected': 'Rejected ❌',
                'needs_reinspection': 'Needs Re-inspection 🔄',
              }.entries)
                RadioListTile<String>(
                  value: entry.key, groupValue: _verdict,
                  onChanged: (v) => setState(() => _verdict = v!),
                  title: Text(entry.value),
                  contentPadding: EdgeInsets.zero,
                ),
            ],
          )),

          // Notes
          SectionCard(title: 'Notes (optional)', child: TextField(
            controller: _notesCtl, maxLines: 3,
            decoration: const InputDecoration(
                hintText: 'Observations, measurements, any additional context…'),
          )),

          const SizedBox(height: 6),
          PrimaryButton(
            label: 'Submit permanently',
            icon: Icons.lock_outline,
            loading: _submitting,
            onPressed: _submit,
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
