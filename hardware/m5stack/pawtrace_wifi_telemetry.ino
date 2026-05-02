#include <M5StickCPlus.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <math.h>

// Change these before flashing.
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Use the Mac LAN IP, not localhost. Current detected LAN IP: 10.13.180.141.
const char* PAWTRACE_TELEMETRY_URL = "http://10.13.180.141:3000/api/device/telemetry";
const char* DEVICE_TOKEN = "pawtrace-m5-dev-token";
const char* DEVICE_ID = "m5stickc-plus-1-1";
const char* USER_ID = "demo";
const char* FIRMWARE_VERSION = "9.0.0-m5-ui";

unsigned long lastUploadMs = 0;
const unsigned long UPLOAD_INTERVAL_MS = 5000;
String usbLine = "";
String lastUsbMessage = "";
String lastServerResponse = "";
uint32_t uploadSeq = 0;
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

String buildTelemetryJson();
void uploadTelemetry();

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
  drawText(42, 43, uiUploadOk ? "Uploaded" : (wifiOk ? "Ready" : "Waiting"), uiColor(31, 59, 66), 18);
  drawText(42, 55, subtitle, uiColor(100, 119, 130), 28);
  drawText(184, 52, "HTTP " + String(uiUploadCode), uiColor(123, 144, 152), 9);

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

void handleUsbCommand(String command) {
  command.trim();
  if (!command.length()) return;
  if (command.equalsIgnoreCase("PING")) {
    Serial.println("{\"ok\":true,\"reply\":\"PONG\",\"device_id\":\"" + String(DEVICE_ID) + "\",\"transport\":\"usb-serial\"}");
    return;
  }
  if (command.equalsIgnoreCase("STATUS")) {
    Serial.println(buildTelemetryJson());
    return;
  }
  if (command.equalsIgnoreCase("UPLOAD")) {
    uploadTelemetry();
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

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  drawStatusDashboard("WiFi connecting");

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(300);
    drawStatusDashboard("WiFi connecting");
  }

  if (WiFi.status() == WL_CONNECTED) {
    drawStatusDashboard(WiFi.localIP().toString());
  } else {
    drawStatusDashboard("WiFi failed");
  }
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
  json += "\"wifi_rssi\":" + String(wifiRssi) + ",";
  json += "\"upload_enabled\":true,";
  json += "\"upload_ok\":" + String(uiUploadOk ? "true" : "false") + ",";
  json += "\"upload_code\":" + String(uiUploadCode) + ",";
  json += "\"usb_serial\":true,";
  json += "\"usb_last_message\":" + jsonString(lastUsbMessage);
  json += "}";
  return json;
}

void uploadTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWifi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  HTTPClient http;
  http.begin(PAWTRACE_TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", DEVICE_TOKEN);

  String payload = buildTelemetryJson();
  int code = http.POST(payload);
  String response = http.getString();
  http.end();

  uploadSeq += 1;
  uiUploadCode = code;
  uiUploadOk = code >= 200 && code < 300;
  lastServerResponse = response.substring(0, 80);
  Serial.println(payload);
  Serial.println("{\"upload_code\":" + String(code) + ",\"upload_ok\":" + String(uiUploadOk ? "true" : "false") + "}");
  drawStatusDashboard(uiUploadOk ? gpsLabel() : lastServerResponse);
}

void setup() {
  M5.begin();
  M5.IMU.Init();
  Serial.begin(115200);
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  drawStatusDashboard("booting WiFi");
  Serial.println("{\"ready\":true,\"device_id\":\"" + String(DEVICE_ID) + "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\",\"transport\":\"usb-serial\"}");
  connectWifi();
}

void loop() {
  M5.update();
  handleUsbSerial();
  if (millis() - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = millis();
    uploadTelemetry();
  } else {
    drawStatusDashboard(WiFi.status() == WL_CONNECTED ? gpsLabel() : "WiFi waiting");
  }
  delay(50);
}
