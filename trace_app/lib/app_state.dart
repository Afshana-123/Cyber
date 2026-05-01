import 'package:flutter/foundation.dart';
import 'models/models.dart';

enum UserRole { none, citizen, auditor, contractor }

class AppState extends ChangeNotifier {
  static final AppState _i = AppState._();
  factory AppState() => _i;
  AppState._();

  // ── Session ──────────────────────────────────────────────────────────────────
  UserRole role = UserRole.none;
  String phone = '';
  String name = '';
  String district = 'Jhansi';       // human-readable
  String districtId = '';           // UUID from backend — used in API calls
  String aadhaarLast4 = '';
  bool loggedIn = false;
  String? token;

  // ── In-session state (reports submitted this session) ────────────────────────
  final List<Report> myReports = [];

  // ── Helpers ──────────────────────────────────────────────────────────────────
  String get apiRole {
    switch (role) {
      case UserRole.citizen:    return 'public';
      case UserRole.auditor:    return 'auditor';
      case UserRole.contractor: return 'contractor';
      case UserRole.none:       return 'public';
    }
  }

  void setRole(UserRole r) {
    role = r;
    notifyListeners();
  }

  /// Called after successful /api/auth/login + district lookup
  void login({
    required String tkn,
    required String n,
    required String dist,
    required String distId,
  }) {
    token = tkn;
    name = n;
    district = dist;
    districtId = distId;
    loggedIn = true;
    notifyListeners();
  }

  /// Called from ProfileSetupPage after user enters their name + district choice
  void setProfile({required String n, required String d, required String dId, String a = ''}) {
    name = n;
    district = d;
    districtId = dId;
    aadhaarLast4 = a;
    loggedIn = true;
    notifyListeners();
  }

  void addReport(Report r) {
    myReports.insert(0, r);
    notifyListeners();
  }

  void logout() {
    role = UserRole.none;
    loggedIn = false;
    token = null;
    myReports.clear();
    notifyListeners();
  }
}
