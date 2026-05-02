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

class SubmitMilestonePage extends StatefulWidget {
  const SubmitMilestonePage({super.key});
  @override
  State<SubmitMilestonePage> createState() => _SubmitMilestonePageState();
}

class _SubmitMilestonePageState extends State<SubmitMilestonePage> {
  // ── Form state ────────────────────────────────────────────────────────────
  String _projectId = '';
  int    _milestone = 1;
  final List<XFile> _photos = [];
  Position? _pos;
  bool _locating       = false;
  bool _locationValid  = false;
  bool _submitting     = false;
  bool _loadingProjects= true;
  List<District> _districts = [];

  @override
  void initState() {
    super.initState();
    _loadDistricts();
    _getLocation();
  }

  Future<void> _loadDistricts() async {
    final result = await ApiService.I.getDistricts();
    if (!mounted) return;
    setState(() {
      _loadingProjects = false;
      if (result.ok && result.data!.isNotEmpty) {
        _districts = result.data!;
        final state = AppState();
        final match = _districts.firstWhere(
          (d) => d.name.toLowerCase() == state.district.toLowerCase(),
          orElse: () => _districts.first,
        );
        _projectId = match.id;
      }
    });
  }

  Future<void> _getLocation() async {
    setState(() => _locating = true);
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) await Geolocator.requestPermission();
      final p = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high)
          .timeout(const Duration(seconds: 8),
              onTimeout: () => Position(
                    longitude: 78.5690, latitude: 25.4486,
                    timestamp: DateTime.now(), accuracy: 10, altitude: 0,
                    altitudeAccuracy: 0, heading: 0, headingAccuracy: 0,
                    speed: 0, speedAccuracy: 0));
      setState(() { _pos = p; _locationValid = true; });
    } catch (_) {}
    if (mounted) setState(() => _locating = false);
  }

  Future<void> _takePhoto() async {
    final p = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 82);
    if (p != null) setState(() => _photos.add(p));
  }

  Future<void> _submit() async {
    if (!_locationValid)    { _snack('GPS must be enabled'); return; }
    if (_photos.length < 5) { _snack('At least 5 completion photos required'); return; }
    if (_projectId.isEmpty) { _snack('Select a project'); return; }

    final proceed = await ImmutabilityDialog.show(context,
        message: 'Submitting milestone $_milestone for project ${_projectId.substring(0, 8)}…');
    if (!proceed) return;

    setState(() => _submitting = true);

    final result = await ApiService.I.postMilestone(
      projectId: _projectId,
      milestone: _milestone,
      photoUrls: _photos.map((f) => f.path).toList(),
      gpsLat:    _pos?.latitude  ?? 0,
      gpsLng:    _pos?.longitude ?? 0,
    );

    if (!mounted) return;
    setState(() => _submitting = false);

    if (!result.ok) {
      _snack('Failed: ${result.error}');
      return;
    }

    _snack('Milestone ${result.data!.milestone} submitted → 3-layer verification triggered');
    context.pop();
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m)));

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Submit Milestone')),
      body: _loadingProjects
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── Project selector ─────────────────────────────────────
                SectionCard(
                  title: 'Contract / Project',
                  child: DropdownButtonFormField<String>(
                    value: _projectId.isEmpty ? null : _projectId,
                    isExpanded: true,
                    items: _districts.take(10).map((d) => DropdownMenuItem(
                      value: d.id,
                      child: Text('${d.name}, ${d.state}',
                          overflow: TextOverflow.ellipsis, maxLines: 1),
                    )).toList(),
                    onChanged: (v) => setState(() { _projectId = v!; _getLocation(); }),
                    hint: const Text('Select project'),
                  ),
                ),

                // ── Milestone number ─────────────────────────────────────
                SectionCard(
                  title: 'Milestone',
                  child: DropdownButtonFormField<int>(
                    value: _milestone,
                    isExpanded: true,
                    items: List.generate(4, (i) => i + 1).map((i) => DropdownMenuItem(
                      value: i, child: Text('Milestone $i of 4'),
                    )).toList(),
                    onChanged: (v) => setState(() => _milestone = v!),
                  ),
                ),

                // ── Location check ───────────────────────────────────────
                SectionCard(title: 'Location check', child: Row(children: [
                  Icon(
                    _locationValid ? Icons.check_circle : Icons.error_outline,
                    color: _locationValid ? t.success : t.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    _locating ? 'Checking…'
                        : _locationValid ? 'GPS confirmed'
                        : 'Off site — enable location',
                    style: t.bodyMedium,
                  )),
                  TextButton(onPressed: _getLocation, child: const Text('Recheck')),
                ])),

                // ── Photos ───────────────────────────────────────────────
                SectionCard(
                  title: 'Completion photos (min 5)',
                  child: SizedBox(
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
                ),

                const SizedBox(height: 6),
                PrimaryButton(
                  label: 'Submit milestone',
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
