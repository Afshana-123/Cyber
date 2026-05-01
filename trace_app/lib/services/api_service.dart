import '../models/models.dart';
import 'api_client.dart';
import 'api_config.dart';

/// Production API service — replaces MockApi.
/// Same singleton pattern so page migration is straightforward.
class ApiService {
  static final ApiService I = ApiService._();
  ApiService._();

  final _client = ApiClient.I;

  // ─── Auth ──────────────────────────────────────────────────

  /// Returns {token, role, name, district} or throws
  Future<Map<String, dynamic>> login(String phone, String role) async {
    final resp = await _client.post(ApiConfig.loginUrl, {'phone': phone, 'role': role});
    if (!resp.ok) throw Exception(resp.error ?? 'Login failed');
    return resp.data as Map<String, dynamic>;
  }

  // ─── Projects ──────────────────────────────────────────────

  Future<List<Project>> getProjects({String? districtId}) async {
    final url = districtId != null
        ? '${ApiConfig.projectsUrl}?district_id=$districtId'
        : ApiConfig.projectsUrl;
    final resp = await _client.get(url);
    if (!resp.ok) return [];
    return (resp.data as List).map((j) => Project.fromJson(j)).toList();
  }

  Future<Contract> getContract(String id) async {
    final resp = await _client.get(ApiConfig.contractUrl(id));
    if (!resp.ok) throw Exception(resp.error ?? 'Contract not found');
    return Contract.fromJson(resp.data);
  }

  // ─── Schemes ───────────────────────────────────────────────

  Future<List<Scheme>> getSchemes(String districtId) async {
    final resp = await _client.get(ApiConfig.schemesUrl(districtId));
    if (!resp.ok) return [];
    return (resp.data as List).map((j) => Scheme.fromJson(j)).toList();
  }

  // ─── Risk Score ────────────────────────────────────────────

  Future<int> getRiskScore(String id, {String type = 'project'}) async {
    final resp = await _client.get(ApiConfig.riskScoreUrl(id, type: type));
    if (!resp.ok) return 0;
    return (resp.data['total_score'] ?? resp.data['risk_score'] ?? 0) as int;
  }

  // ─── Payments ──────────────────────────────────────────────

  Future<Contract> getPayments(String contractId) async {
    final resp = await _client.get(ApiConfig.paymentsUrl(contractId));
    if (!resp.ok) throw Exception(resp.error ?? 'Payments not found');
    return Contract.fromJson(resp.data);
  }

  // ─── Reports ───────────────────────────────────────────────

  Future<String> postReport(Report report, String districtId) async {
    final resp = await _client.post(ApiConfig.reportUrl, report.toJson(districtId));
    if (!resp.ok) throw Exception(resp.error ?? 'Report submission failed');
    return resp.data['report_id'] ?? '';
  }

  // ─── Inspections ───────────────────────────────────────────

  Future<Map<String, dynamic>> postInspection({
    required String projectId,
    required String verdict,
    required double gpsLat,
    required double gpsLng,
    required Map<String, String> checklist,
    String? auditorId,
    List<String> photos = const [],
    String notes = '',
  }) async {
    final resp = await _client.post(ApiConfig.inspectionUrl, {
      'project_id': projectId,
      'auditor_id': auditorId ?? 'auditor',
      'gps_lat': gpsLat,
      'gps_lng': gpsLng,
      'verdict': verdict.toLowerCase(),
      'checklist': checklist,
      'photos': photos,
      'notes': notes,
    });
    if (!resp.ok) throw Exception(resp.error ?? 'Inspection submission failed');
    return resp.data as Map<String, dynamic>;
  }

  Future<List<Inspection>> getInspections({String? projectId}) async {
    final url = projectId != null
        ? '${ApiConfig.inspectionsUrl}?project_id=$projectId'
        : ApiConfig.inspectionsUrl;
    final resp = await _client.get(url);
    if (!resp.ok) return [];
    return (resp.data as List).map((j) => Inspection.fromJson(j)).toList();
  }

  // ─── Invoices ──────────────────────────────────────────────

  Future<String> postInvoice({
    required String projectId,
    required String material,
    required double amountCr,
    String? contractorId,
  }) async {
    final resp = await _client.post(ApiConfig.invoiceUrl, {
      'project_id': projectId,
      'contractor_id': contractorId ?? '',
      'material': material,
      'amount_cr': amountCr,
    });
    if (!resp.ok) throw Exception(resp.error ?? 'Invoice submission failed');
    return resp.data['invoice_id'] ?? resp.data['tx_hash'] ?? '';
  }

  // ─── Milestones ────────────────────────────────────────────

  Future<String> postMilestone({
    required String projectId,
    required int milestone,
    required double gpsLat,
    required double gpsLng,
    List<String> photos = const [],
  }) async {
    final resp = await _client.post(ApiConfig.milestoneUrl, {
      'project_id': projectId,
      'milestone': milestone,
      'gps_lat': gpsLat,
      'gps_lng': gpsLng,
      'photos': photos,
    });
    if (!resp.ok) throw Exception(resp.error ?? 'Milestone submission failed');
    return resp.data['submission_id'] ?? '';
  }
}
