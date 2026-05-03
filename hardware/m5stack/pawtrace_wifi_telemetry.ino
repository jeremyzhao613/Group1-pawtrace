#include <M5StickCPlus.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>
#include <math.h>

// Defaults. You can override and persist these over USB serial without reflashing:
// WIFI MyHotspot|MyPassword
// HOST 192.168.31.199
// URL http://192.168.31.199:3000/api/device/telemetry
// TOKEN pawtrace-m5-dev-token
const char* DEFAULT_WIFI_SSID = "YOUR_WIFI_SSID";
const char* DEFAULT_WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Use the Mac LAN IP on the same phone hotspot, not localhost. Current detected LAN IP: 192.168.31.199.
const char* DEFAULT_PAWTRACE_TELEMETRY_URL = "http://192.168.31.199:3000/api/device/telemetry";
const char* DEFAULT_DEVICE_TOKEN = "pawtrace-m5-dev-token";
const char* DEVICE_ID = "m5stickc-plus-1-1";
const char* USER_ID = "demo";
const char* FIRMWARE_VERSION = "9.4.0-wifi-lan";

unsigned long lastUploadMs = 0;
const unsigned long UPLOAD_INTERVAL_MS = 5000;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 12000;
const unsigned long WIFI_RECONNECT_BASE_MS = 2500;
const unsigned long WIFI_RECONNECT_MAX_MS = 30000;
const unsigned long HTTP_TIMEOUT_MS = 4500;
const unsigned long HTTP_MIN_GAP_MS = 650;
const unsigned long UI_REFRESH_MS = 800;
const uint16_t LAN_SERVER_PORT = 8080;
const uint8_t TELEMETRY_QUEUE_CAPACITY = 24;
const size_t TELEMETRY_PAYLOAD_MAX = 960;
const size_t LAN_MESSAGE_MAX = 512;
Preferences pawPrefs;
WebServer lanServer(LAN_SERVER_PORT);
String wifiSsid = DEFAULT_WIFI_SSID;
String wifiPassword = DEFAULT_WIFI_PASSWORD;
String telemetryUrl = DEFAULT_PAWTRACE_TELEMETRY_URL;
String deviceToken = DEFAULT_DEVICE_TOKEN;
String usbLine = "";
String lastUsbMessage = "";
String lastLanMessage = "";
String lastServerResponse = "";
String lastWifiStatus = "boot";
uint32_t uploadSeq = 0;
uint32_t uploadAttemptSeq = 0;
uint32_t lanMessageSeq = 0;
int uiBatteryPct = 100;
int uiBatteryMv = 0;
int uiBpm = 0;
int uiSpo2 = 0;
bool uiSpo2Valid = false;
float uiTempC = 32.5;
float uiLat = 31.48303;
float uiLon = 121.15569;
int uiGpsFix = 1;
bool uiLocationValid = true;
float uiActivityScore = 0;
String uiActivity = "REST";
bool uiUploadOk = false;
int uiUploadCode = 0;
bool wifiConnecting = false;
unsigned long wifiConnectStartedMs = 0;
unsigned long nextWifiAttemptMs = 0;
unsigned long nextUploadAttemptMs = 0;
unsigned long lastHttpAttemptMs = 0;
unsigned long lastUiRefreshMs = 0;
uint8_t wifiRetryCount = 0;
uint8_t httpFailCount = 0;
uint8_t telemetryQueueHead = 0;
uint8_t telemetryQueueCount = 0;
uint16_t telemetryQueueDropped = 0;
char telemetryQueue[TELEMETRY_QUEUE_CAPACITY][TELEMETRY_PAYLOAD_MAX];
bool lanServerStarted = false;

String buildTelemetryJson();
void uploadTelemetry();
void enqueueTelemetrySample();
void processWifiState();
void processUploadQueue();
void startWifiConnect(bool force = false);
void configureLanServer();
void processLanServer();
void printWifiScanResults();
void handleLanRoot();
void handleLanStatus();
void handleLanUpload();
void handleLanMessage();
void handleLanOptions();
void handleLanNotFound();

uint16_t uiColor(uint8_t r, uint8_t g, uint8_t b) {
  return M5.Lcd.color565(r, g, b);
}

String jsonString(const String& value) {
  String output = "\"";
  for (size_t i = 0; i < value.length(); i += 1) {
    char c = value.charAt(i);
    if (c == '"') {
      output += "\\\"";
    } else if (c == '\\') {
      output += "\\\\";
    } else if (c == '\n') {
      output += "\\n";
    } else if (c == '\r') {
      output += "\\r";
    } else if (c == '\t') {
      output += "\\t";
    } else if (c >= 32) {
      output += c;
    }
  }
  output += "\"";
  return output;
}

uint16_t blendColor(uint8_t r1, uint8_t g1, uint8_t b1, uint8_t r2, uint8_t g2, uint8_t b2, int step, int total) {
  if (total <= 1) return uiColor(r2, g2, b2);
  uint8_t r = r1 + ((int)(r2 - r1) * step) / (total - 1);
  uint8_t g = g1 + ((int)(g2 - g1) * step) / (total - 1);
  uint8_t b = b1 + ((int)(b2 - b1) * step) / (total - 1);
  return uiColor(r, g, b);
}

void drawAppBackground() {
  int height = M5.Lcd.height();
  int width = M5.Lcd.width();
  for (int y = 0; y < height; y += 1) {
    M5.Lcd.drawFastHLine(0, y, width, blendColor(255, 254, 248, 255, 238, 246, y, height));
  }
  M5.Lcd.fillCircle(28, 22, 30, uiColor(255, 215, 234));
  M5.Lcd.fillCircle(198, 7, 24, uiColor(232, 248, 251));
}

void drawPawMark(int x, int y, uint16_t color) {
  M5.Lcd.fillCircle(x + 8, y + 11, 7, color);
  M5.Lcd.fillCircle(x + 2, y + 5, 3, color);
  M5.Lcd.fillCircle(x + 8, y + 2, 3, color);
  M5.Lcd.fillCircle(x + 14, y + 5, 3, color);
}

void drawText(int x, int y, const String& text, uint16_t color, int maxChars) {
  String clipped = text;
  if (maxChars > 0 && clipped.length() > maxChars) {
    clipped = clipped.substring(0, maxChars - 1) + ".";
  }
  M5.Lcd.setTextSize(1);
  M5.Lcd.setTextColor(color);
  M5.Lcd.setCursor(x, y);
  M5.Lcd.print(clipped);
}

void drawPill(int x, int y, int w, const String& label, bool active) {
  uint16_t fill = active ? uiColor(205, 236, 242) : uiColor(245, 239, 242);
  uint16_t text = active ? uiColor(31, 84, 96) : uiColor(100, 119, 130);
  M5.Lcd.fillRoundRect(x, y, w, 15, 7, fill);
  drawText(x + 6, y + 4, label, text, 9);
}

void drawMetricCard(int x, int y, int w, const String& label, const String& value, uint16_t accent) {
  M5.Lcd.fillRoundRect(x, y, w, 33, 7, uiColor(255, 252, 248));
  M5.Lcd.drawRoundRect(x, y, w, 33, 7, uiColor(248, 231, 238));
  M5.Lcd.fillCircle(x + 7, y + 8, 3, accent);
  drawText(x + 13, y + 5, label, uiColor(100, 119, 130), 7);
  drawText(x + 5, y + 19, value, uiColor(31, 59, 66), 8);
}

void drawBottomNav() {
  const char* items[] = {"Map", "Pets", "Health", "Link"};
  M5.Lcd.fillRoundRect(14, 112, 212, 17, 8, uiColor(255, 246, 249));
  for (int i = 0; i < 4; i += 1) {
    int x = 18 + i * 52;
    bool active = i == 2;
    if (active) {
      M5.Lcd.fillRoundRect(x - 4, 114, 50, 13, 7, uiColor(211, 239, 244));
    }
    drawText(x + (active ? 2 : 8), 118, String(items[i]), active ? uiColor(31, 59, 66) : uiColor(123, 144, 152), 8);
  }
}

String gpsLabel() {
  if (!uiLocationValid || uiGpsFix <= 0) return "gps waiting";
  return String(uiLat, 2) + "," + String(uiLon, 2);
}

void drawStatusDashboard(const String& subtitle) {
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  String uploadLabel = uiUploadCode != 0 ? String(uiUploadCode) : (telemetryQueueCount ? "Q" + String(telemetryQueueCount) : "idle");
  drawAppBackground();
  M5.Lcd.fillRoundRect(5, 5, 230, 124, 14, uiColor(255, 252, 248));
  M5.Lcd.drawRoundRect(5, 5, 230, 124, 14, uiColor(255, 255, 255));

  drawPawMark(15, 13, uiColor(153, 205, 216));
  drawText(38, 13, "PawTrace", uiColor(31, 59, 66), 18);
  drawText(38, 25, "Health Monitor", uiColor(100, 119, 130), 20);
  drawPill(168, 13, 56, wifiOk ? "WiFi OK" : "OFFLINE", wifiOk);

  M5.Lcd.fillRoundRect(14, 39, 212, 27, 9, uiColor(245, 251, 252));
  M5.Lcd.fillCircle(27, 52, 8, uiColor(225, 241, 245));
  M5.Lcd.fillCircle(27, 52, 4, uiUploadOk ? uiColor(31, 84, 96) : uiColor(145, 161, 170));
  drawText(42, 43, uiUploadOk ? "Uploaded" : (telemetryQueueCount ? "Queued" : (wifiOk ? "Ready" : "Waiting")), uiColor(31, 59, 66), 18);
  drawText(42, 55, subtitle, uiColor(100, 119, 130), 28);
  drawText(184, 52, "H " + uploadLabel, uiColor(123, 144, 152), 9);

  drawMetricCard(14, 73, 50, "BPM", uiBpm > 0 ? String(uiBpm) : "--", uiColor(153, 205, 216));
  drawMetricCard(68, 73, 50, "GPS", uiGpsFix > 0 ? "FIX " + String(uiGpsFix) : "NO", uiColor(111, 181, 194));
  drawMetricCard(122, 73, 50, "ACT", uiActivity, uiColor(153, 205, 216));
  drawMetricCard(176, 73, 50, "BAT", String(uiBatteryPct) + "%", uiColor(111, 181, 194));
  drawBottomNav();
}

int batteryPercentFromMv(int mv) {
  if (mv <= 0) return 100;
  if (mv <= 3300) return 0;
  if (mv >= 4200) return 100;
  return (mv - 3300) * 100 / 900;
}

int readBatteryMv() {
  float voltage = M5.Axp.GetBatVoltage();
  if (!isfinite(voltage) || voltage <= 0) return 0;
  return voltage > 10 ? (int)voltage : (int)(voltage * 1000.0f);
}

float readTemperatureC() {
  float temp = 0;
  M5.IMU.getTempData(&temp);
  return isfinite(temp) ? temp : 32.5;
}

void drawStatusMaybe(const String& subtitle, bool force = false) {
  unsigned long now = millis();
  if (!force && now - lastUiRefreshMs < UI_REFRESH_MS) return;
  lastUiRefreshMs = now;
  drawStatusDashboard(subtitle);
}

String boolText(bool value) {
  return value ? "true" : "false";
}

bool startsWithIgnoreCase(String value, const String& prefix) {
  value.toLowerCase();
  String normalizedPrefix = prefix;
  normalizedPrefix.toLowerCase();
  return value.startsWith(normalizedPrefix);
}

void loadDeviceConfig() {
  pawPrefs.begin("pawtrace", false);
  wifiSsid = pawPrefs.getString("ssid", DEFAULT_WIFI_SSID);
  wifiPassword = pawPrefs.getString("pass", DEFAULT_WIFI_PASSWORD);
  telemetryUrl = pawPrefs.getString("url", DEFAULT_PAWTRACE_TELEMETRY_URL);
  deviceToken = pawPrefs.getString("token", DEFAULT_DEVICE_TOKEN);
}

String normalizeTelemetryUrl(String input) {
  input.trim();
  if (!input.length()) return telemetryUrl;
  if (!startsWithIgnoreCase(input, "http://") && !startsWithIgnoreCase(input, "https://")) {
    input = "http://" + input;
  }
  int schemeIndex = input.indexOf("://");
  int hostStart = schemeIndex >= 0 ? schemeIndex + 3 : 0;
  int pathStart = input.indexOf('/', hostStart);
  if (pathStart < 0) {
    String hostPort = input.substring(hostStart);
    input += hostPort.indexOf(':') >= 0 ? "/api/device/telemetry" : ":3000/api/device/telemetry";
  } else if (pathStart == (int)input.length() - 1) {
    input += "api/device/telemetry";
  }
  return input;
}

void saveTelemetryUrl(String input) {
  telemetryUrl = normalizeTelemetryUrl(input);
  pawPrefs.putString("url", telemetryUrl);
  nextUploadAttemptMs = 0;
  Serial.println("{\"ok\":true,\"upload_url\":" + jsonString(telemetryUrl) + "}");
}

void saveWifiCredentials(String input) {
  input.trim();
  int sep = input.indexOf('|');
  if (sep < 0) sep = input.indexOf(',');
  if (sep < 0) {
    Serial.println("{\"ok\":false,\"error\":\"Use WIFI ssid|password\"}");
    return;
  }
  String ssid = input.substring(0, sep);
  String password = input.substring(sep + 1);
  ssid.trim();
  password.trim();
  if (!ssid.length()) {
    Serial.println("{\"ok\":false,\"error\":\"WiFi SSID is required\"}");
    return;
  }
  wifiSsid = ssid;
  wifiPassword = password;
  pawPrefs.putString("ssid", wifiSsid);
  pawPrefs.putString("pass", wifiPassword);
  wifiRetryCount = 0;
  nextWifiAttemptMs = 0;
  startWifiConnect(true);
  Serial.println("{\"ok\":true,\"wifi_ssid\":" + jsonString(wifiSsid) + ",\"wifi\":\"saved\"}");
}

void saveDeviceToken(String input) {
  input.trim();
  if (!input.length()) {
    Serial.println("{\"ok\":false,\"error\":\"Token is required\"}");
    return;
  }
  deviceToken = input;
  pawPrefs.putString("token", deviceToken);
  Serial.println("{\"ok\":true,\"token\":\"saved\"}");
}

bool isWifiConfigured() {
  String ssid = wifiSsid;
  ssid.trim();
  return ssid.length() > 0 && ssid != DEFAULT_WIFI_SSID;
}

String lanBaseUrl() {
  if (WiFi.status() != WL_CONNECTED) return "";
  return "http://" + WiFi.localIP().toString() + ":" + String(LAN_SERVER_PORT);
}

void printDeviceConfig() {
  Serial.println("{\"ok\":true,\"device_id\":" + jsonString(String(DEVICE_ID)) +
    ",\"firmwareVersion\":" + jsonString(String(FIRMWARE_VERSION)) +
    ",\"wifi_ssid\":" + jsonString(wifiSsid) +
    ",\"wifi_configured\":" + String(isWifiConfigured() ? "true" : "false") +
    ",\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") +
    ",\"wifi_ip\":" + jsonString(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "") +
    ",\"wifi_rssi\":" + String(WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0) +
    ",\"upload_url\":" + jsonString(telemetryUrl) +
    ",\"token_set\":" + String(deviceToken.length() ? "true" : "false") +
    ",\"lan_server_port\":" + String(LAN_SERVER_PORT) +
    ",\"lan_base_url\":" + jsonString(lanBaseUrl()) +
    ",\"queue_depth\":" + String(telemetryQueueCount) +
    ",\"queue_capacity\":" + String(TELEMETRY_QUEUE_CAPACITY) +
    ",\"queue_dropped\":" + String(telemetryQueueDropped) + "}");
}

void sendLanCorsHeaders() {
  lanServer.sendHeader("Access-Control-Allow-Origin", "*");
  lanServer.sendHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  lanServer.sendHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,x-device-token");
  lanServer.sendHeader("Access-Control-Max-Age", "86400");
}

void sendLanJson(int code, const String& payload) {
  sendLanCorsHeaders();
  lanServer.send(code, "application/json", payload);
}

String readLanRequestBody() {
  if (lanServer.hasArg("plain")) return lanServer.arg("plain");
  if (lanServer.hasArg("message")) return lanServer.arg("message");
  if (lanServer.hasArg("body")) return lanServer.arg("body");
  return "";
}

String sanitizeLanText(String value, int maxChars) {
  value.trim();
  String output = "";
  for (size_t i = 0; i < value.length() && output.length() < (size_t)maxChars; i += 1) {
    char c = value.charAt(i);
    if (c == '\r' || c == '\n' || c == '\t') {
      if (!output.endsWith(" ")) output += " ";
    } else if (c >= 32 && c != '<' && c != '>') {
      output += c;
    }
  }
  output.trim();
  return output;
}

void handleLanOptions() {
  sendLanCorsHeaders();
  lanServer.send(204, "text/plain", "");
}

void handleLanRoot() {
  String json = "{";
  json += "\"ok\":true,";
  json += "\"device_id\":" + jsonString(String(DEVICE_ID)) + ",";
  json += "\"transport\":\"wifi-lan\",";
  json += "\"base_url\":" + jsonString(lanBaseUrl()) + ",";
  json += "\"endpoints\":[\"GET /status\",\"GET /telemetry\",\"POST /message\",\"POST /upload\"]";
  json += "}";
  sendLanJson(200, json);
}

void handleLanStatus() {
  sendLanJson(200, buildTelemetryJson());
}

void handleLanUpload() {
  uploadTelemetry();
  String json = "{";
  json += "\"ok\":true,";
  json += "\"queued\":true,";
  json += "\"queue_depth\":" + String(telemetryQueueCount) + ",";
  json += "\"upload_code\":" + String(uiUploadCode) + ",";
  json += "\"upload_ok\":" + String(uiUploadOk ? "true" : "false");
  json += "}";
  sendLanJson(200, json);
}

void handleLanMessage() {
  String message = readLanRequestBody();
  if (!message.length()) {
    sendLanJson(400, "{\"ok\":false,\"error\":\"message body is required\"}");
    return;
  }
  if (message.length() > LAN_MESSAGE_MAX) {
    message = message.substring(0, LAN_MESSAGE_MAX);
  }
  lastLanMessage = sanitizeLanText(message, 180);
  lastUsbMessage = lastLanMessage;
  lanMessageSeq += 1;
  drawStatusMaybe("LAN msg " + String(lanMessageSeq), true);
  String json = "{";
  json += "\"ok\":true,";
  json += "\"transport\":\"wifi-lan\",";
  json += "\"message_seq\":" + String(lanMessageSeq) + ",";
  json += "\"message\":" + jsonString(lastLanMessage);
  json += "}";
  sendLanJson(200, json);
}

void handleLanNotFound() {
  if (lanServer.method() == HTTP_OPTIONS) {
    handleLanOptions();
    return;
  }
  sendLanJson(404, "{\"ok\":false,\"error\":\"not found\"}");
}

void configureLanServer() {
  if (lanServerStarted) return;
  lanServer.on("/", HTTP_GET, handleLanRoot);
  lanServer.on("/status", HTTP_GET, handleLanStatus);
  lanServer.on("/telemetry", HTTP_GET, handleLanStatus);
  lanServer.on("/message", HTTP_POST, handleLanMessage);
  lanServer.on("/message", HTTP_OPTIONS, handleLanOptions);
  lanServer.on("/upload", HTTP_POST, handleLanUpload);
  lanServer.on("/upload", HTTP_OPTIONS, handleLanOptions);
  lanServer.onNotFound(handleLanNotFound);
  lanServer.begin();
  lanServerStarted = true;
}

void processLanServer() {
  if (!lanServerStarted) configureLanServer();
  if (WiFi.status() == WL_CONNECTED) {
    lanServer.handleClient();
  }
}

void printWifiScanResults() {
  configureWifiRadio();
  int count = WiFi.scanNetworks(false, true);
  String json = "{\"ok\":true,\"networks\":[";
  for (int i = 0; i < count; i += 1) {
    if (i > 0) json += ",";
    json += "{";
    json += "\"ssid\":" + jsonString(WiFi.SSID(i)) + ",";
    json += "\"rssi\":" + String(WiFi.RSSI(i)) + ",";
    json += "\"open\":" + String(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "true" : "false");
    json += "}";
  }
  json += "]}";
  WiFi.scanDelete();
  Serial.println(json);
}

unsigned long retryDelayMs(uint8_t failures, unsigned long baseDelay, unsigned long maxDelay) {
  unsigned long delayMs = baseDelay;
  for (uint8_t i = 0; i < failures && delayMs < maxDelay; i += 1) {
    delayMs *= 2;
    if (delayMs > maxDelay) delayMs = maxDelay;
  }
  return delayMs + (millis() % 700);
}

bool hasQueuedTelemetry() {
  return telemetryQueueCount > 0;
}

uint8_t telemetryQueueTail() {
  return (telemetryQueueHead + telemetryQueueCount) % TELEMETRY_QUEUE_CAPACITY;
}

void dropQueuedTelemetry() {
  if (!telemetryQueueCount) return;
  telemetryQueue[telemetryQueueHead][0] = '\0';
  telemetryQueueHead = (telemetryQueueHead + 1) % TELEMETRY_QUEUE_CAPACITY;
  telemetryQueueCount -= 1;
}

String frontQueuedTelemetry() {
  if (!telemetryQueueCount) return "";
  return String(telemetryQueue[telemetryQueueHead]);
}

void enqueueTelemetryPayload(const String& payload) {
  if (telemetryQueueCount >= TELEMETRY_QUEUE_CAPACITY) {
    dropQueuedTelemetry();
    telemetryQueueDropped += 1;
  }
  uint8_t tail = telemetryQueueTail();
  payload.toCharArray(telemetryQueue[tail], TELEMETRY_PAYLOAD_MAX);
  telemetryQueue[tail][TELEMETRY_PAYLOAD_MAX - 1] = '\0';
  telemetryQueueCount += 1;
}

void configureWifiRadio() {
  static bool configured = false;
  if (configured) return;
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setHostname(DEVICE_ID);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  configured = true;
}

void startWifiConnect(bool force) {
  unsigned long now = millis();
  if (!force && (wifiConnecting || now < nextWifiAttemptMs)) return;
  if (!isWifiConfigured()) {
    wifiConnecting = false;
    nextWifiAttemptMs = now + WIFI_RECONNECT_MAX_MS;
    lastWifiStatus = "WiFi not set";
    drawStatusMaybe("USB: WIFI ssid|pass", true);
    return;
  }
  configureWifiRadio();
  if (force) {
    WiFi.disconnect(false, false);
    delay(30);
  }
  wifiConnecting = true;
  wifiConnectStartedMs = now;
  lastWifiStatus = "WiFi connecting";
  if (wifiPassword.length()) {
    WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());
  } else {
    WiFi.begin(wifiSsid.c_str());
  }
  drawStatusMaybe("WiFi connecting", true);
}

void scheduleWifiRetry(const String& reason) {
  wifiConnecting = false;
  if (wifiRetryCount < 6) wifiRetryCount += 1;
  nextWifiAttemptMs = millis() + retryDelayMs(wifiRetryCount, WIFI_RECONNECT_BASE_MS, WIFI_RECONNECT_MAX_MS);
  lastWifiStatus = reason;
  drawStatusMaybe(reason, true);
}

void processWifiState() {
  wl_status_t status = WiFi.status();
  if (status == WL_CONNECTED) {
    if (wifiConnecting || lastWifiStatus != "WiFi connected") {
      wifiConnecting = false;
      wifiRetryCount = 0;
      nextWifiAttemptMs = 0;
      lastWifiStatus = "WiFi connected";
      drawStatusMaybe(WiFi.localIP().toString(), true);
    }
    return;
  }

  if (wifiConnecting) {
    if (millis() - wifiConnectStartedMs >= WIFI_CONNECT_TIMEOUT_MS) {
      WiFi.disconnect(false, false);
      scheduleWifiRetry("WiFi retry " + String(wifiRetryCount + 1));
    } else {
      drawStatusMaybe("WiFi connecting");
    }
    return;
  }

  if (millis() >= nextWifiAttemptMs) {
    startWifiConnect(false);
  }
}

void handleUsbCommand(String command) {
  command.trim();
  if (!command.length()) return;
  String upperCommand = command;
  upperCommand.toUpperCase();
  if (command.equalsIgnoreCase("PING")) {
    Serial.println("{\"ok\":true,\"reply\":\"PONG\",\"device_id\":\"" + String(DEVICE_ID) + "\",\"transport\":\"usb-serial\"}");
    return;
  }
  if (command.equalsIgnoreCase("STATUS")) {
    Serial.println(buildTelemetryJson());
    return;
  }
  if (command.equalsIgnoreCase("CONFIG")) {
    printDeviceConfig();
    return;
  }
  if (command.equalsIgnoreCase("SCAN")) {
    printWifiScanResults();
    return;
  }
  if (upperCommand.startsWith("URL ")) {
    saveTelemetryUrl(command.substring(4));
    return;
  }
  if (upperCommand.startsWith("HOST ")) {
    saveTelemetryUrl(command.substring(5));
    return;
  }
  if (upperCommand.startsWith("TOKEN ")) {
    saveDeviceToken(command.substring(6));
    return;
  }
  if (upperCommand.startsWith("WIFI ")) {
    saveWifiCredentials(command.substring(5));
    return;
  }
  if (command.equalsIgnoreCase("UPLOAD")) {
    uploadTelemetry();
    return;
  }
  if (command.equalsIgnoreCase("WIFI") || command.equalsIgnoreCase("RECONNECT")) {
    startWifiConnect(true);
    Serial.println("{\"ok\":true,\"wifi\":\"reconnect_requested\"}");
    return;
  }
  if (command.equalsIgnoreCase("QUEUE")) {
    Serial.println("{\"ok\":true,\"queue_depth\":" + String(telemetryQueueCount) +
      ",\"queue_capacity\":" + String(TELEMETRY_QUEUE_CAPACITY) +
      ",\"queue_dropped\":" + String(telemetryQueueDropped) + "}");
    return;
  }
  if (command.equalsIgnoreCase("LAN")) {
    Serial.println("{\"ok\":true,\"lan_server_port\":" + String(LAN_SERVER_PORT) +
      ",\"lan_base_url\":" + jsonString(lanBaseUrl()) + "}");
    return;
  }

  if (command.length() > 160) {
    command = command.substring(0, 160);
  }
  lastUsbMessage = command;
  Serial.println("{\"ok\":true,\"transport\":\"usb-serial\",\"message\":" + jsonString(command) + "}");
}

void handleUsbSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\r' || c == '\n') {
      String command = usbLine;
      usbLine = "";
      handleUsbCommand(command);
    } else if (usbLine.length() < 180) {
      usbLine += c;
    }
  }
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  startWifiConnect(true);
  while (WiFi.status() != WL_CONNECTED && wifiConnecting && millis() - wifiConnectStartedMs < WIFI_CONNECT_TIMEOUT_MS) {
    delay(100);
    M5.update();
    processWifiState();
  }
}

void enqueueTelemetrySample() {
  uploadSeq += 1;
  String payload = buildTelemetryJson();
  enqueueTelemetryPayload(payload);
  Serial.println("{\"queued\":true,\"packet_seq\":" + String(uploadSeq) +
    ",\"queue_depth\":" + String(telemetryQueueCount) +
    ",\"queue_dropped\":" + String(telemetryQueueDropped) + "}");
  drawStatusMaybe("queued " + String(telemetryQueueCount), true);
}

String buildTelemetryJson() {
  float accX = 0;
  float accY = 0;
  float accZ = 0;
  M5.IMU.getAccelData(&accX, &accY, &accZ);

  float accelPeak = fmaxf(fabsf(accX), fmaxf(fabsf(accY), fabsf(accZ)));
  const char* activity = accelPeak > 1.8 ? "RUN" : (accelPeak > 1.15 ? "WALK" : "REST");

  // Replace these GPS values with GPS v1.1 parsed latitude/longitude when wired.
  uiLat = 31.48303;
  uiLon = 121.15569;
  uiGpsFix = 1;
  uiLocationValid = true;
  uiBatteryMv = readBatteryMv();
  uiBatteryPct = batteryPercentFromMv(uiBatteryMv);
  uiTempC = readTemperatureC();
  uiActivityScore = accelPeak;
  uiActivity = String(activity);

  int wifiRssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"userId\":\"" + String(USER_ID) + "\",";
  json += "\"source\":\"m5stickc-plus-wifi\",";
  json += "\"transport\":\"wifi\",";
  json += "\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\",";
  json += "\"board\":\"m5stickc-plus-1.1\",";
  json += "\"packet_seq\":" + String(uploadSeq) + ",";
  json += "\"battery_pct\":" + String(uiBatteryPct) + ",";
  json += "\"battery_mv\":" + String(uiBatteryMv) + ",";
  json += "\"gps_fix\":" + String(uiGpsFix) + ",";
  json += "\"gps_sats_used\":8,";
  json += "\"gps_visible\":12,";
  json += "\"gps_hdop\":1.2,";
  json += "\"lat\":" + String(uiLat, 6) + ",";
  json += "\"lon\":" + String(uiLon, 6) + ",";
  json += "\"location_valid\":" + String(uiLocationValid ? "true" : "false") + ",";
  json += "\"last_location_valid\":" + String(uiLocationValid ? "true" : "false") + ",";
  json += "\"track_samples\":" + String(uploadSeq) + ",";
  json += "\"geofence_enabled\":true,";
  json += "\"distance_m\":0.0,";
  json += "\"lost_alert\":" + String(M5.BtnA.isPressed() ? "true" : "false") + ",";
  json += "\"heart_found\":false,";
  json += "\"finger\":false,";
  json += "\"pet_bpm\":" + String(uiBpm) + ",";
  json += "\"spo2\":" + String(uiSpo2) + ",";
  json += "\"spo2_valid\":" + String(uiSpo2Valid ? "true" : "false") + ",";
  json += "\"temp_c\":" + String(uiTempC, 1) + ",";
  json += "\"activity\":\"" + String(activity) + "\",";
  json += "\"activity_score\":" + String(accelPeak, 2) + ",";
  json += "\"accelPeak\":" + String(accelPeak, 2) + ",";
  json += "\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
  json += "\"wifi_ssid\":" + jsonString(wifiSsid) + ",";
  json += "\"wifi_rssi\":" + String(wifiRssi) + ",";
  json += "\"wifi_retry_count\":" + String(wifiRetryCount) + ",";
  json += "\"wifi_ip\":" + jsonString(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "") + ",";
  json += "\"lan_server_enabled\":" + String(lanServerStarted ? "true" : "false") + ",";
  json += "\"lan_server_port\":" + String(LAN_SERVER_PORT) + ",";
  json += "\"lan_base_url\":" + jsonString(lanBaseUrl()) + ",";
  json += "\"lan_message_seq\":" + String(lanMessageSeq) + ",";
  json += "\"lan_last_message\":" + jsonString(lastLanMessage) + ",";
  json += "\"queue_depth\":" + String(telemetryQueueCount) + ",";
  json += "\"queue_capacity\":" + String(TELEMETRY_QUEUE_CAPACITY) + ",";
  json += "\"queue_dropped\":" + String(telemetryQueueDropped) + ",";
  json += "\"upload_attempt_seq\":" + String(uploadAttemptSeq) + ",";
  json += "\"http_fail_count\":" + String(httpFailCount) + ",";
  json += "\"upload_enabled\":true,";
  json += "\"upload_url\":" + jsonString(telemetryUrl) + ",";
  json += "\"token_set\":" + String(deviceToken.length() ? "true" : "false") + ",";
  json += "\"upload_ok\":" + String(uiUploadOk ? "true" : "false") + ",";
  json += "\"upload_code\":" + String(uiUploadCode) + ",";
  json += "\"usb_serial\":true,";
  json += "\"usb_last_message\":" + jsonString(lastUsbMessage);
  json += "}";
  return json;
}

bool isHttpSuccess(int code) {
  return code >= 200 && code < 300;
}

bool isPermanentHttpError(int code) {
  return code == 400 || code == 401 || code == 403 || code == 404 || code == 413 || code == 422;
}

bool postTelemetryPayload(const String& payload) {
  WiFiClient client;
  HTTPClient http;
  uploadAttemptSeq += 1;
  lastHttpAttemptMs = millis();

  bool started = http.begin(client, telemetryUrl);
  if (!started) {
    uiUploadCode = -998;
    uiUploadOk = false;
    lastServerResponse = "http begin failed";
    return false;
  }

  http.setConnectTimeout(HTTP_TIMEOUT_MS);
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.setReuse(false);
  http.addHeader("Content-Type", "application/json");
  if (deviceToken.length()) {
    http.addHeader("x-device-token", deviceToken);
  }
  http.addHeader("Connection", "close");

  int code = http.POST(payload);
  String response = http.getString();
  http.end();

  uiUploadCode = code;
  uiUploadOk = isHttpSuccess(code);
  lastServerResponse = response.substring(0, 80);
  Serial.println(payload);
  Serial.println("{\"upload_attempt\":" + String(uploadAttemptSeq) +
    ",\"upload_code\":" + String(code) +
    ",\"upload_ok\":" + String(uiUploadOk ? "true" : "false") +
    ",\"queue_depth\":" + String(telemetryQueueCount) + "}");
  return uiUploadOk;
}

void processUploadQueue() {
  if (!hasQueuedTelemetry()) return;
  if (WiFi.status() != WL_CONNECTED) {
    processWifiState();
    return;
  }

  unsigned long now = millis();
  if (now < nextUploadAttemptMs || now - lastHttpAttemptMs < HTTP_MIN_GAP_MS) return;

  String payload = frontQueuedTelemetry();
  if (!payload.length()) {
    dropQueuedTelemetry();
    return;
  }

  bool ok = postTelemetryPayload(payload);
  if (ok) {
    dropQueuedTelemetry();
    httpFailCount = 0;
    nextUploadAttemptMs = millis() + HTTP_MIN_GAP_MS;
    drawStatusMaybe(hasQueuedTelemetry() ? "sending queue " + String(telemetryQueueCount) : gpsLabel(), true);
    return;
  }

  if (isPermanentHttpError(uiUploadCode)) {
    dropQueuedTelemetry();
    nextUploadAttemptMs = millis() + 3000;
    drawStatusMaybe("HTTP " + String(uiUploadCode), true);
    return;
  }

  if (httpFailCount < 6) httpFailCount += 1;
  nextUploadAttemptMs = millis() + retryDelayMs(httpFailCount, 2000, 30000);
  if (WiFi.status() != WL_CONNECTED || uiUploadCode < 0) {
    startWifiConnect(true);
  }
  drawStatusMaybe(uiUploadCode < 0 ? "net retry" : "HTTP retry", true);
}

void uploadTelemetry() {
  enqueueTelemetrySample();
  processWifiState();
  processUploadQueue();
}

void setup() {
  M5.begin();
  M5.IMU.Init();
  Serial.begin(115200);
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  loadDeviceConfig();
  drawStatusDashboard("booting WiFi");
  Serial.println("{\"ready\":true,\"device_id\":\"" + String(DEVICE_ID) +
    "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) +
    "\",\"transport\":\"usb-serial\",\"wifi_ssid\":" + jsonString(wifiSsid) +
    ",\"upload_url\":" + jsonString(telemetryUrl) +
    ",\"lan_server_port\":" + String(LAN_SERVER_PORT) + "}");
  configureWifiRadio();
  configureLanServer();
  startWifiConnect(true);
  lastUploadMs = millis();
  enqueueTelemetrySample();
}

void loop() {
  M5.update();
  handleUsbSerial();
  processWifiState();
  processLanServer();
  if (millis() - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = millis();
    enqueueTelemetrySample();
  } else {
    drawStatusMaybe(WiFi.status() == WL_CONNECTED ? gpsLabel() : lastWifiStatus);
  }
  processUploadQueue();
  delay(50);
}
