enum SchemeStatus { green, yellow, red }

SchemeStatus _parseSchemeStatus(String? s) {
  switch (s) {
    case 'flagged': return SchemeStatus.red;
    case 'watch':   return SchemeStatus.yellow;
    default:        return SchemeStatus.green;
  }
}

class Project {
  final String id, name, contractor, milestone;
  final double lat, lng;
  final bool flagged;
  final String? districtId;
  final int riskScore;
  final String status;
  final double contractValueCr;

  Project({
    required this.id,
    required this.name,
    required this.contractor,
    required this.milestone,
    required this.lat,
    required this.lng,
    this.flagged = false,
    this.districtId,
    this.riskScore = 0,
    this.status = 'clean',
    this.contractValueCr = 0,
  });

  factory Project.fromJson(Map<String, dynamic> j) => Project(
    id: j['id'] ?? '',
    name: j['name'] ?? '',
    contractor: j['contractor_name'] ?? '',
    milestone: 'Phase ${j['phase'] ?? 1}',
    lat: (j['lat'] as num?)?.toDouble() ?? 0,
    lng: (j['lng'] as num?)?.toDouble() ?? 0,
    flagged: j['status'] == 'flagged' || j['phase2_frozen'] == true,
    districtId: j['district_id'],
    riskScore: j['risk_score'] ?? 0,
    status: j['status'] ?? 'clean',
    contractValueCr: (j['contract_value_cr'] as num?)?.toDouble() ?? 0,
  );
}

class Scheme {
  final String id;
  final String name;
  final double allocated, returned;
  final SchemeStatus status;
  final int beneficiaries;
  final int riskScore;

  Scheme({
    this.id = '',
    required this.name,
    required this.allocated,
    required this.returned,
    required this.status,
    required this.beneficiaries,
    this.riskScore = 0,
  });

  factory Scheme.fromJson(Map<String, dynamic> j) => Scheme(
    id: j['id'] ?? '',
    name: j['name'] ?? '',
    allocated: (j['allocated_crore'] as num?)?.toDouble() ?? 0,
    returned: (j['returned_crore'] as num?)?.toDouble() ?? 0,
    status: _parseSchemeStatus(j['status']),
    beneficiaries: j['beneficiary_count'] ?? 0,
    riskScore: j['risk_score'] ?? 0,
  );
}

class Report {
  final String? id;
  final String category, description, photoPath;
  final double lat, lng;
  final String? projectId;
  final String status;
  final DateTime createdAt;

  Report({
    this.id,
    required this.category,
    required this.description,
    required this.photoPath,
    required this.lat,
    required this.lng,
    this.projectId,
    this.status = 'Received',
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Report copyWith({String? id, String? status}) => Report(
    id: id ?? this.id,
    category: category,
    description: description,
    photoPath: photoPath,
    lat: lat,
    lng: lng,
    projectId: projectId,
    status: status ?? this.status,
    createdAt: createdAt,
  );

  Map<String, dynamic> toJson(String districtId) => {
    'type': 'citizen',
    'category': category,
    'description': description,
    'photo_url': photoPath,
    'gps_lat': lat,
    'gps_lng': lng,
    'project_id': projectId,
    'district_id': districtId,
    'submitted_by': 'citizen',
  };

  factory Report.fromJson(Map<String, dynamic> j) => Report(
    id: j['id'] ?? j['report_id'],
    category: j['category'] ?? '',
    description: j['description'] ?? '',
    photoPath: j['photo_url'] ?? '',
    lat: (j['gps_lat'] as num?)?.toDouble() ?? 0,
    lng: (j['gps_lng'] as num?)?.toDouble() ?? 0,
    projectId: j['project_id'],
    status: j['verdict'] ?? j['status'] ?? 'Received',
    createdAt: j['created_at'] != null
        ? DateTime.tryParse(j['created_at']) ?? DateTime.now()
        : DateTime.now(),
  );
}

class ChecklistItem {
  final String label;
  String result; // Pass/Fail/Partial
  ChecklistItem(this.label, [this.result = 'Pass']);
}

class Inspection {
  final String? id;
  final String projectId, verdict;
  final int failedItems;
  final DateTime createdAt;
  final String? projectName;
  final String? txHash;

  Inspection({
    this.id,
    required this.projectId,
    required this.verdict,
    required this.failedItems,
    required this.createdAt,
    this.projectName,
    this.txHash,
  });

  Inspection copyWith({String? id}) => Inspection(
    id: id ?? this.id,
    projectId: projectId,
    verdict: verdict,
    failedItems: failedItems,
    createdAt: createdAt,
    projectName: projectName,
    txHash: txHash,
  );

  factory Inspection.fromJson(Map<String, dynamic> j) {
    final checklist = j['checklist'];
    int failed = 0;
    if (checklist is Map) {
      failed = checklist.values.where((v) => v == 'fail').length;
    }
    return Inspection(
      id: j['id'] ?? j['inspection_id'],
      projectId: j['project_id'] ?? '',
      verdict: j['verdict'] ?? 'pending',
      failedItems: failed,
      createdAt: j['created_at'] != null
          ? DateTime.tryParse(j['created_at']) ?? DateTime.now()
          : DateTime.now(),
      projectName: j['project_name'],
      txHash: j['tx_hash'],
    );
  }
}

class Milestone {
  final int index;
  final double amount; // ₹ crore
  final String status; // Released / Pending / Blocked
  final String? blockReason;
  final DateTime? releasedAt;

  Milestone({
    required this.index,
    required this.amount,
    required this.status,
    this.blockReason,
    this.releasedAt,
  });

  factory Milestone.fromJson(Map<String, dynamic> j) => Milestone(
    index: j['milestone'] ?? 0,
    amount: (j['amount_cr'] as num?)?.toDouble() ?? 0,
    status: _capitalize(j['status'] ?? 'pending'),
    blockReason: j['block_reason'],
    releasedAt: j['released_at'] != null
        ? DateTime.tryParse(j['released_at'])
        : null,
  );
}

class Contract {
  final String id, name;
  final int riskScore;
  final List<Milestone> milestones;
  final String contractor;
  final double contractValueCr;

  Contract({
    required this.id,
    required this.name,
    required this.riskScore,
    required this.milestones,
    this.contractor = '',
    this.contractValueCr = 0,
  });

  factory Contract.fromJson(Map<String, dynamic> j) => Contract(
    id: j['id'] ?? j['contract_id'] ?? '',
    name: j['name'] ?? '',
    riskScore: j['risk_score'] ?? 0,
    contractor: j['contractor_name'] ?? j['contractor'] ?? '',
    contractValueCr: (j['contract_value_cr'] ?? j['total_value_cr'] as num?)?.toDouble() ?? 0,
    milestones: j['milestones'] != null
        ? (j['milestones'] as List).map((m) => Milestone.fromJson(m)).toList()
        : j['payments'] != null
            ? (j['payments'] as List).map((m) => Milestone.fromJson(m)).toList()
            : [],
  );
}

String _capitalize(String s) =>
    s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
