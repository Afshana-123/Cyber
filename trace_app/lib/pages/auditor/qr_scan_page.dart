import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../flutter_flow/flutter_flow_theme.dart';

/// QR scan page — reads any QR code and passes its value as project_id.
/// The value can be a project UUID, district UUID, or any string.
class QrScanPage extends StatefulWidget {
  const QrScanPage({super.key});
  @override
  State<QrScanPage> createState() => _QrScanPageState();
}

class _QrScanPageState extends State<QrScanPage> {
  final _ctrl = MobileScannerController();
  bool _handled = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _onDetect(BarcodeCapture cap) {
    if (_handled) return;
    final code = cap.barcodes.firstOrNull?.rawValue;
    if (code == null || code.isEmpty) return;
    _handled = true;
    // Pass the QR value as the project ID — InspectionFormPage will call
    // /api/contract/:id to resolve it against the real DB.
    context.pushReplacement('/auditor/inspect?pid=$code');
  }

  @override
  Widget build(BuildContext context) {
    final t = FlutterFlowTheme.of(context);
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Scan project QR'),
      ),
      body: Stack(children: [
        MobileScanner(controller: _ctrl, onDetect: _onDetect),
        Center(child: Container(
          width: 260, height: 260,
          decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 3),
              borderRadius: BorderRadius.circular(20)),
        )),
        Positioned(
          left: 0, right: 0, bottom: 40,
          child: Column(children: [
            const Text('Align the QR code within the box',
                style: TextStyle(color: Colors.white)),
            const SizedBox(height: 12),
            TextButton(
              // Demo: navigates directly to inspection without a real QR
              onPressed: () {
                if (_handled) return;
                _handled = true;
                // Use a placeholder ID — will show "Site Inspection" as project name
                context.pushReplacement('/auditor/inspect?pid=demo');
              },
              child: Text('Simulate scan (demo)',
                  style: TextStyle(color: t.tertiary)),
            ),
          ]),
        ),
      ]),
    );
  }
}
