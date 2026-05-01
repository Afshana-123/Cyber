/// Central config — change the base URL here when ngrok restarts or moving to prod.
/// Do NOT scatter this string across the codebase.
class AppConfig {
  AppConfig._();

  /// Local dev backend. Replace with your ngrok URL for device testing.
  /// Example: 'https://abc123.ngrok-free.app'
  static const String baseUrl = 'http://10.0.2.2:3001';
  // 10.0.2.2 is Android emulator's alias for localhost.
  // For a real device on the same Wi-Fi, use your machine's LAN IP e.g. 192.168.1.x:3001
  // For ngrok: 'https://xxxx.ngrok-free.app'
}
