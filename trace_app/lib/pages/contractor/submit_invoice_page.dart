import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../app_state.dart';
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';
import '../../widgets/common.dart';

class SubmitInvoicePage extends StatefulWidget {
  const SubmitInvoicePage({super.key});
  @override
  State<SubmitInvoicePage> createState() => _SubmitInvoicePageState();
}

class _SubmitInvoicePageState extends State<SubmitInvoicePage> {
  // Contractor's project = their district ID
  String  _projectId  = '';
  String  _material   = 'Cement (OPC 53)';
  XFile?  _photo;
  bool    _submitting = false;
  bool    _loading    = true;

  List<District> _districts = [];

  @override
  void initState() {
    super.initState();
    _loadDistricts();
  }

  Future<void> _loadDistricts() async {
    final result = await ApiService.I.getDistricts();
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (result.ok && result.data!.isNotEmpty) {
        _districts = result.data!;
        // Default to contractor's own district
        final state = AppState();
        final match = _districts.firstWhere(
          (d) => d.name.toLowerCase() == state.district.toLowerCase(),
          orElse: () => _districts.first,
        );
        _projectId = match.id;
      }
    });
  }

  final _amount = TextEditingController();

  Future<void> _submit() async {
    if (_photo == null)      { _snack('Upload the invoice photo'); return; }
    if (_amount.text.isEmpty){ _snack('Enter amount'); return; }
    if (_projectId.isEmpty)  { _snack('Select a project'); return; }

    setState(() => _submitting = true);

    final amountCr = (double.tryParse(_amount.text) ?? 0) / 100; // ₹ → crore
    final result   = await ApiService.I.postInvoice(
      projectId:    _projectId,
      contractorId: AppState().phone.isNotEmpty ? AppState().phone : 'contractor',
      material:     _material,
      amountCr:     amountCr,
      invoiceUrl:   _photo!.path,
    );

    if (!mounted) return;
    setState(() => _submitting = false);

    if (!result.ok) {
      _snack('Failed: ${result.error}');
      return;
    }

    _snack('Invoice ${result.data!.invoiceId} linked — blockchain hash recorded');
    context.pop();
  }

  void _snack(String m) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m)));

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Submit Invoice')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── Project / Contract selector ──────────────────────────
                SectionCard(
                  title: 'Project (contract)',
                  child: DropdownButtonFormField<String>(
                    value: _projectId.isEmpty ? null : _projectId,
                    isExpanded: true,
                    items: _districts.take(10).map((d) => DropdownMenuItem(
                      value: d.id,
                      child: Text('${d.name} — ${d.state}',
                          overflow: TextOverflow.ellipsis, maxLines: 1),
                    )).toList(),
                    onChanged: (v) => setState(() => _projectId = v!),
                    hint: const Text('Select project'),
                  ),
                ),

                // ── Material ─────────────────────────────────────────────
                SectionCard(
                  title: 'Material',
                  child: DropdownButtonFormField<String>(
                    value: _material,
                    isExpanded: true,
                    items: const [
                      'Cement (OPC 53)', 'Steel rebar', 'Bitumen', 'Aggregate', 'Concrete blocks'
                    ].map((m) => DropdownMenuItem(
                      value: m,
                      child: Text(m, overflow: TextOverflow.ellipsis, maxLines: 1),
                    )).toList(),
                    onChanged: (v) => setState(() => _material = v!),
                  ),
                ),

                // ── GST invoice photo ────────────────────────────────────
                SectionCard(
                  title: 'GST invoice photo',
                  child: GestureDetector(
                    onTap: () async {
                      final p = await ImagePicker()
                          .pickImage(source: ImageSource.camera, imageQuality: 82);
                      if (p != null) setState(() => _photo = p);
                    },
                    child: Container(
                      height: 160,
                      decoration: BoxDecoration(
                        color: t.primaryBackground,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: _photo == null ? t.divider : t.primary),
                      ),
                      child: _photo == null
                          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.upload_file, size: 36, color: t.secondaryText),
                              const SizedBox(height: 6),
                              Text('Tap to capture invoice',
                                  style: t.bodyMedium.copyWith(color: t.secondaryText)),
                            ]))
                          : ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.file(File(_photo!.path),
                                  fit: BoxFit.cover, width: double.infinity)),
                    ),
                  ),
                ),

                // ── Amount ──────────────────────────────────────────────
                SectionCard(
                  title: 'Amount (₹)',
                  child: TextField(
                    controller: _amount,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                        prefixText: '₹  ', hintText: '0'),
                  ),
                ),

                const SizedBox(height: 6),
                PrimaryButton(
                  label: 'Submit invoice',
                  icon: Icons.send_rounded,
                  loading: _submitting,
                  onPressed: _submit,
                ),
              ],
            ),
    );
  }
}
