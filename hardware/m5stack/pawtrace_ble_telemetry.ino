#include <M5StickCPlus.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <WiFi.h>
#include <Preferences.h>

// PawTrace BLE provisioning contract.
// BLE is only used to send WiFi credentials and backend settings to the M5.
// Health/GPS telemetry must be uploaded by WiFi to /api/device/telemetry.
#define DEVICE_NAME "PawTrace-001"
#define DEVICE_ID "pawtrace_001"
#define FIRMWARE_VERSION "10.0.0-ble-wifi-provision"
#define SERVICE_UUID "7b9f0001-6f3a-4f8a-9f4d-111111111111"
#define STATUS_UUID "7b9f0002-6f3a-4f8a-9f4d-222222222222"
#define WIFI_CONFIG_UUID "7b9f0003-6f3a-4f8a-9f4d-333333333333"

BLECharacteristic* statusChar = nullptr;
BLECharacteristic* wifiConfigChar = nullptr;
Preferences pawPrefs;

bool bleConnected = false;
bool wifiConnecting = false;
unsigned long wifiConnectStartedMs = 0;
unsigned long lastStatusNotifyMs = 0;
uint32_t messageSeq = 0;

const unsigned long WIFI_CONNECT_TIMEOUT_MS = 12000;
const unsigned long STATUS_NOTIFY_MS = 2000;
const char* DEFAULT_DEVICE_TOKEN = "pawtrace-m5-dev-token";
const char* DEFAULT_UPLOAD_URL = "http://192.168.31.199:3000/api/device/telemetry";

String wifiSsid = "";
String wifiPassword = "";
String uploadUrl = DEFAULT_UPLOAD_URL;
String deviceToken = DEFAULT_DEVICE_TOKEN;
String lastProvisionMessage = "waiting";
String usbLine = "";

String jsonBool(bool value) {
  return value ? "true" : "false";
}

String jsonString(const String& value) {
  String output = "\"";
  for (size_t i = 0; i < value.length(); i += 1) {
    char c = value.charAt(i);
    if (c == '"') output += "\\\"";
    else if (c == '\\') output += "\\\\";
    else if (c == '\n') output += "\\n";
    else if (c == '\r') output += "\\r";
    else if (c == '\t') output += "\\t";
    else if (c >= 32) output += c;
  }
  output += "\"";
  return output;
}

uint16_t uiColor(uint8_t r, uint8_t g, uint8_t b) {
  return M5.Lcd.color565(r, g, b);
}

String extractJsonStringField(const String& json, const String& key) {
  String marker = "\"" + key + "\"";
  int keyIndex = json.indexOf(marker);
  if (keyIndex < 0) return "";
  int colonIndex = json.indexOf(':', keyIndex + marker.length());
  if (colonIndex < 0) return "";

  int valueStart = colonIndex + 1;
  while (valueStart < (int)json.length() && isspace((unsigned char)json.charAt(valueStart))) valueStart += 1;
  if (valueStart >= (int)json.length()) return "";

  if (json.charAt(valueStart) == '"') {
    String output = "";
    bool escaping = false;
    for (int i = valueStart + 1; i < (int)json.length(); i += 1) {
      char c = json.charAt(i);
      if (escaping) {
        output += c;
        escaping = false;
      } else if (c == '\\') {
        escaping = true;
      } else if (c == '"') {
        break;
      } else {
        output += c;
      }
    }
    return output;
  }

  int valueEnd = valueStart;
  while (valueEnd < (int)json.length() && json.charAt(valueEnd) != ',' && json.charAt(valueEnd) != '}') valueEnd += 1;
  String value = json.substring(valueStart, valueEnd);
  value.trim();
  return value;
}

bool startsWithIgnoreCase(String value, const String& prefix) {
  value.toLowerCase();
  String normalizedPrefix = prefix;
  normalizedPrefix.toLowerCase();
  return value.startsWith(normalizedPrefix);
}

String normalizeTelemetryUrl(String input) {
  input.trim();
  if (!input.length()) return uploadUrl;
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

String lanBaseUrl() {
  if (WiFi.status() != WL_CONNECTED) return "";
  return "http://" + WiFi.localIP().toString() + ":8080";
}

void loadProvisioningConfig() {
  pawPrefs.begin("pawtrace", false);
  wifiSsid = pawPrefs.getString("ssid", "");
  wifiPassword = pawPrefs.getString("pass", "");
  uploadUrl = pawPrefs.getString("url", DEFAULT_UPLOAD_URL);
  deviceToken = pawPrefs.getString("token", DEFAULT_DEVICE_TOKEN);
}

void saveProvisioningConfig() {
  pawPrefs.putString("ssid", wifiSsid);
  pawPrefs.putString("pass", wifiPassword);
  pawPrefs.putString("url", uploadUrl);
  pawPrefs.putString("token", deviceToken);
}

String buildStatusJson(bool ok = true, const String& error = "") {
  String json = "{";
  json += "\"type\":\"wifi_provision_status\",";
  json += "\"ok\":" + jsonBool(ok) + ",";
  if (error.length()) json += "\"error\":" + jsonString(error) + ",";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\",";
  json += "\"ble_connected\":" + jsonBool(bleConnected) + ",";
  json += "\"wifi_ssid\":" + jsonString(wifiSsid) + ",";
  json += "\"wifi_connected\":" + jsonBool(WiFi.status() == WL_CONNECTED) + ",";
  json += "\"wifi_ip\":" + jsonString(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "") + ",";
  json += "\"wifi_rssi\":" + String(WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0) + ",";
  json += "\"upload_url\":" + jsonString(uploadUrl) + ",";
  json += "\"token_set\":" + jsonBool(deviceToken.length() > 0) + ",";
  json += "\"lan_base_url\":" + jsonString(lanBaseUrl()) + ",";
  json += "\"message_seq\":" + String(messageSeq) + ",";
  json += "\"last_message\":" + jsonString(lastProvisionMessage);
  json += "}";
  return json;
}

void notifyStatus(bool ok = true, const String& error = "") {
  String payload = buildStatusJson(ok, error);
  if (statusChar) {
    statusChar->setValue(payload.c_str());
    if (bleConnected) statusChar->notify();
  }
  if (wifiConfigChar) wifiConfigChar->setValue(payload.c_str());
  Serial.println(payload);
}

void drawText(int x, int y, const String& text, uint16_t color, int maxChars) {
  String clipped = text;
  if (maxChars > 0 && clipped.length() > maxChars) clipped = clipped.substring(0, maxChars - 1) + ".";
  M5.Lcd.setTextSize(1);
  M5.Lcd.setTextColor(color);
  M5.Lcd.setCursor(x, y);
  M5.Lcd.print(clipped);
}

void drawStatusDashboard(const String& subtitle) {
  M5.Lcd.fillScreen(uiColor(255, 248, 250));
  M5.Lcd.fillRoundRect(5, 5, 230, 124, 14, uiColor(255, 252, 248));
  M5.Lcd.drawRoundRect(5, 5, 230, 124, 14, uiColor(255, 255, 255));
  M5.Lcd.fillCircle(24, 23, 8, uiColor(153, 205, 216));
  M5.Lcd.fillCircle(18, 17, 3, uiColor(153, 205, 216));
  M5.Lcd.fillCircle(24, 13, 3, uiColor(153, 205, 216));
  M5.Lcd.fillCircle(30, 17, 3, uiColor(153, 205, 216));
  drawText(38, 13, "PawTrace", uiColor(31, 59, 66), 18);
  drawText(38, 25, "BLE WiFi Setup", uiColor(100, 119, 130), 20);
  M5.Lcd.fillRoundRect(168, 13, 56, 15, 7, bleConnected ? uiColor(205, 236, 242) : uiColor(245, 239, 242));
  drawText(174, 17, bleConnected ? "BLE ON" : "PAIR", uiColor(31, 84, 96), 9);

  bool wifiOk = WiFi.status() == WL_CONNECTED;
  M5.Lcd.fillRoundRect(14, 39, 212, 27, 9, uiColor(245, 251, 252));
  M5.Lcd.fillCircle(27, 52, 8, uiColor(225, 241, 245));
  M5.Lcd.fillCircle(27, 52, 4, wifiOk ? uiColor(31, 84, 96) : uiColor(145, 161, 170));
  drawText(42, 43, wifiOk ? "WiFi connected" : "WiFi waiting", uiColor(31, 59, 66), 20);
  drawText(42, 55, wifiOk ? WiFi.localIP().toString() : subtitle, uiColor(100, 119, 130), 28);

  M5.Lcd.fillRoundRect(14, 73, 212, 33, 7, uiColor(255, 252, 248));
  M5.Lcd.drawRoundRect(14, 73, 212, 33, 7, uiColor(248, 231, 238));
  drawText(22, 82, "SSID", uiColor(100, 119, 130), 8);
  drawText(58, 82, wifiSsid.length() ? wifiSsid : "not set", uiColor(31, 59, 66), 24);
  drawText(22, 94, "API", uiColor(100, 119, 130), 8);
  drawText(58, 94, uploadUrl, uiColor(31, 59, 66), 28);
  drawText(18, 116, "BLE sends credentials only; data uploads use WiFi.", uiColor(100, 119, 130), 42);
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

void startWifiConnect() {
  if (!wifiSsid.length()) {
    lastProvisionMessage = "ssid_missing";
    drawStatusDashboard("send ssid/password");
    notifyStatus(false, "WiFi SSID is required");
    return;
  }
  configureWifiRadio();
  WiFi.disconnect(false, false);
  delay(30);
  wifiConnecting = true;
  wifiConnectStartedMs = millis();
  if (wifiPassword.length()) WiFi.begin(wifiSsid.c_str(), wifiPassword.c_str());
  else WiFi.begin(wifiSsid.c_str());
  lastProvisionMessage = "wifi_connecting";
  drawStatusDashboard("connecting");
  notifyStatus();
}

void processWifiState() {
  if (!wifiConnecting) return;
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnecting = false;
    lastProvisionMessage = "wifi_connected";
    drawStatusDashboard(WiFi.localIP().toString());
    notifyStatus();
    return;
  }
  if (millis() - wifiConnectStartedMs >= WIFI_CONNECT_TIMEOUT_MS) {
    wifiConnecting = false;
    lastProvisionMessage = "wifi_timeout";
    drawStatusDashboard("wifi timeout");
    notifyStatus(false, "WiFi connection timed out");
  }
}

void applyWifiConfigMessage(String incoming, const char* transport) {
  incoming.trim();
  if (!incoming.length()) return;
  if (incoming.length() > 520) incoming = incoming.substring(0, 520);

  String typeValue = extractJsonStringField(incoming, "type");
  typeValue.toLowerCase();
  if (incoming.startsWith("{") && typeValue != "wifi_config") {
    messageSeq += 1;
    lastProvisionMessage = "ignored_non_wifi_config";
    notifyStatus(false, "BLE accepts only wifi_config messages");
    return;
  }

  String nextSsid = extractJsonStringField(incoming, "ssid");
  String nextPassword = extractJsonStringField(incoming, "password");
  String nextUrl = extractJsonStringField(incoming, "url");
  String nextHost = extractJsonStringField(incoming, "host");
  String nextToken = extractJsonStringField(incoming, "token");

  if (!incoming.startsWith("{")) {
    if (startsWithIgnoreCase(incoming, "WIFI ")) {
      String value = incoming.substring(5);
      int sep = value.indexOf('|');
      if (sep < 0) sep = value.indexOf(',');
      if (sep >= 0) {
        nextSsid = value.substring(0, sep);
        nextPassword = value.substring(sep + 1);
      }
    } else if (startsWithIgnoreCase(incoming, "HOST ")) {
      nextHost = incoming.substring(5);
    } else if (startsWithIgnoreCase(incoming, "URL ")) {
      nextUrl = incoming.substring(4);
    } else if (startsWithIgnoreCase(incoming, "TOKEN ")) {
      nextToken = incoming.substring(6);
    }
  }

  nextSsid.trim();
  nextPassword.trim();
  nextUrl.trim();
  nextHost.trim();
  nextToken.trim();

  if (nextSsid.length()) wifiSsid = nextSsid;
  if (nextPassword.length() || incoming.indexOf("\"password\"") >= 0) wifiPassword = nextPassword;
  if (nextUrl.length()) uploadUrl = normalizeTelemetryUrl(nextUrl);
  else if (nextHost.length()) uploadUrl = normalizeTelemetryUrl(nextHost);
  if (nextToken.length()) deviceToken = nextToken;

  messageSeq += 1;
  if (!wifiSsid.length()) {
    lastProvisionMessage = "ssid_missing";
    notifyStatus(false, "WiFi SSID is required");
    return;
  }

  saveProvisioningConfig();
  lastProvisionMessage = String(transport) + "_wifi_saved";
  notifyStatus();
  startWifiConnect();
}

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* server) {
    bleConnected = true;
    drawStatusDashboard("ble connected");
    notifyStatus();
  }

  void onDisconnect(BLEServer* server) {
    bleConnected = false;
    drawStatusDashboard("advertising");
    server->getAdvertising()->start();
  }
};

class WifiConfigCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) {
    String incoming = characteristic->getValue();
    applyWifiConfigMessage(incoming, "ble");
  }
};

void handleUsbSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\r' || c == '\n') {
      String command = usbLine;
      usbLine = "";
      command.trim();
      if (!command.length()) return;
      if (command.equalsIgnoreCase("PING")) {
        Serial.println("{\"ok\":true,\"reply\":\"PONG\",\"device_id\":\"" + String(DEVICE_ID) + "\",\"transport\":\"usb-serial\"}");
      } else if (command.equalsIgnoreCase("STATUS") || command.equalsIgnoreCase("CONFIG")) {
        Serial.println(buildStatusJson());
      } else if (command.equalsIgnoreCase("WIFI") || command.equalsIgnoreCase("RECONNECT")) {
        startWifiConnect();
      } else {
        applyWifiConfigMessage(command, "usb-serial");
      }
    } else if (usbLine.length() < 540) {
      usbLine += c;
    }
  }
}

void setup() {
  M5.begin();
  Serial.begin(115200);
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  loadProvisioningConfig();
  configureWifiRadio();
  drawStatusDashboard("booting setup");
  Serial.println("{\"ready\":true,\"device_id\":\"" + String(DEVICE_ID) +
    "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) +
    "\",\"mode\":\"ble-wifi-provision\"}");

  BLEDevice::init(DEVICE_NAME);
  BLEDevice::setMTU(512);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  BLEService* service = server->createService(SERVICE_UUID);
  statusChar = service->createCharacteristic(
    STATUS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  statusChar->addDescriptor(new BLE2902());
  statusChar->setValue(buildStatusJson().c_str());

  wifiConfigChar = service->createCharacteristic(
    WIFI_CONFIG_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_WRITE_NR
  );
  wifiConfigChar->setCallbacks(new WifiConfigCallbacks());
  wifiConfigChar->setValue(buildStatusJson().c_str());

  service->start();
  BLEAdvertising* advertising = server->getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();

  if (wifiSsid.length()) startWifiConnect();
  else drawStatusDashboard("advertising");
}

void loop() {
  M5.update();
  handleUsbSerial();
  processWifiState();
  if (millis() - lastStatusNotifyMs >= STATUS_NOTIFY_MS) {
    lastStatusNotifyMs = millis();
    notifyStatus();
    drawStatusDashboard(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : lastProvisionMessage);
  }
  delay(40);
}
