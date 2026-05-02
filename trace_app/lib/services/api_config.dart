import 'dart:io';

/// Centralized API configuration for the TRACE backend.
class ApiConfig {
  ApiConfig._();

  /// Backend port (matches trace-backend/.env PORT)
  static const int port = 3001;

  /// Timeout for all HTTP requests
  static const Duration timeout = Duration(seconds: 12);

  /// Base URL — auto-detects platform.
  /// Android emulator → 10.0.2.2, iOS simulator → localhost, physical device → LAN IP.
  static String get baseUrl {
    // We are using adb reverse tcp:3001 tcp:3001 to forward the port
    // over the USB connection, circumventing firewall issues.
    return 'http://127.0.0.1:$port';
  }

  // API Endpoints
  static String get loginUrl        => '$baseUrl/api/auth/login';
  static String get projectsUrl     => '$baseUrl/api/projects';
  static String get districtsUrl    => '$baseUrl/api/districts';
  static String get alertsUrl       => '$baseUrl/api/alerts';
  static String get inspectionsUrl  => '$baseUrl/api/inspections';
  static String contractUrl(String id)    => '$baseUrl/api/contract/$id';
  static String schemesUrl(String districtId) => '$baseUrl/api/schemes/$districtId';
  static String riskScoreUrl(String id, {String type = 'project'}) =>
      '$baseUrl/api/risk-score/$id?type=$type';
  static String paymentsUrl(String contractId) => '$baseUrl/api/payments/$contractId';
  static String get reportUrl       => '$baseUrl/api/report';
  static String get inspectionUrl   => '$baseUrl/api/inspection';
  static String get invoiceUrl      => '$baseUrl/api/invoice';
  static String get milestoneUrl    => '$baseUrl/api/milestone';
}
