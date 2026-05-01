import 'package:flutter/foundation.dart';

enum UserRole { none, citizen, auditor, contractor }

String _roleToApiString(UserRole r) {
  switch (r) {
    case UserRole.citizen:    return 'public';
    case UserRole.auditor:    return 'auditor';
    case UserRole.contractor: return 'contractor';
    default:                  return 'public';
  }
}

class AppState extends ChangeNotifier {
  static final AppState _i = AppState._();
  factory AppState() => _i;
  AppState._();

  UserRole role = UserRole.none;
  String phone = '';
  String name = '';
  String district = 'Jhansi';
  String districtId = 'a1000000-0000-0000-0000-000000000001'; // Jhansi UUID
  String aadhaarLast4 = '';
  String token = '';
  bool loggedIn = false;

  /// API role string for backend calls
  String get apiRole => _roleToApiString(role);

  void setRole(UserRole r) { role = r; notifyListeners(); }

  void setProfile({required String n, required String d, String a = ''}) {
    name = n; district = d; aadhaarLast4 = a; loggedIn = true; notifyListeners();
  }

  void setLoginData({required String tok, required String nm, required String dist}) {
    token = tok; name = nm; district = dist; loggedIn = true; notifyListeners();
  }

  void logout() {
    role = UserRole.none; token = ''; loggedIn = false; notifyListeners();
  }
}
