import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import '../app_state.dart';

/// Typed wrapper for API responses.
class ApiResponse<T> {
  final T? data;
  final String? error;
  final int statusCode;
  bool get ok => statusCode >= 200 && statusCode < 300;

  ApiResponse({this.data, this.error, required this.statusCode});
}

/// Low-level HTTP client for the TRACE backend.
/// Handles JSON encoding/decoding, auth headers, timeouts, and errors.
class ApiClient {
  static final ApiClient I = ApiClient._();
  ApiClient._();

  final _http = http.Client();

  Map<String, String> get _headers {
    final h = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    final token = AppState().token;
    if (token.isNotEmpty) {
      h['Authorization'] = 'Bearer $token';
    }
    return h;
  }

  /// GET request → parsed JSON
  Future<ApiResponse<dynamic>> get(String url) async {
    try {
      final resp = await _http
          .get(Uri.parse(url), headers: _headers)
          .timeout(ApiConfig.timeout);
      return _parse(resp);
    } catch (e) {
      return ApiResponse(error: e.toString(), statusCode: 0);
    }
  }

  /// POST request with JSON body → parsed JSON
  Future<ApiResponse<dynamic>> post(String url, Map<String, dynamic> body) async {
    try {
      final resp = await _http
          .post(Uri.parse(url), headers: _headers, body: jsonEncode(body))
          .timeout(ApiConfig.timeout);
      return _parse(resp);
    } catch (e) {
      return ApiResponse(error: e.toString(), statusCode: 0);
    }
  }

  ApiResponse<dynamic> _parse(http.Response resp) {
    try {
      final body = jsonDecode(resp.body);
      if (resp.statusCode >= 200 && resp.statusCode < 300) {
        return ApiResponse(data: body, statusCode: resp.statusCode);
      }
      final errMsg = body is Map ? (body['error'] ?? 'Unknown error') : 'Unknown error';
      return ApiResponse(error: errMsg.toString(), statusCode: resp.statusCode);
    } catch (_) {
      return ApiResponse(error: resp.body, statusCode: resp.statusCode);
    }
  }
}
