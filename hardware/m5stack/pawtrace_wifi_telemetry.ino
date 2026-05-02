#include <M5StickCPlus.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Change these before flashing.
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Use the Mac LAN IP, not localhost. Current detected LAN IP: 10.13.180.141.
const char* PAWTRACE_TELEMETRY_URL = "http://10.13.180.141:3000/api/device/telemetry";
const char* DEVICE_TOKEN = "pawtrace-m5-dev-token";
const char* DEVICE_ID = "m5stickc-plus-1-1";
const char* USER_ID = "demo";

unsigned long lastUploadMs = 0;
const unsigned long UPLOAD_INTERVAL_MS = 5000;

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 8);
  M5.Lcd.println("WiFi connecting...");

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(300);
    M5.Lcd.print(".");
  }

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 8);
  if (WiFi.status() == WL_CONNECTED) {
    M5.Lcd.println("WiFi OK");
    M5.Lcd.println(WiFi.localIP());
  } else {
    M5.Lcd.println("WiFi failed");
  }
}

String buildTelemetryJson() {
  float accX = 0;
  float accY = 0;
  float accZ = 0;
  M5.IMU.getAccelData(&accX, &accY, &accZ);

  float accelPeak = max(abs(accX), max(abs(accY), abs(accZ)));
  const char* activity = accelPeak > 1.8 ? "RUN" : (accelPeak > 1.15 ? "WALK" : "REST");

  // Replace these GPS values with GPS v1.1 parsed latitude/longitude when wired.
  float lat = 31.48303;
  float lon = 121.15569;
  int gpsFix = 1;
  bool locationValid = true;

  int batteryPct = 100;
  int wifiRssi = WiFi.RSSI();

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"userId\":\"" + String(USER_ID) + "\",";
  json += "\"source\":\"m5stickc-plus-wifi\",";
  json += "\"battery_pct\":" + String(batteryPct) + ",";
  json += "\"gps_fix\":" + String(gpsFix) + ",";
  json += "\"gps_sats_used\":8,";
  json += "\"gps_visible\":12,";
  json += "\"gps_hdop\":1.2,";
  json += "\"lat\":" + String(lat, 6) + ",";
  json += "\"lon\":" + String(lon, 6) + ",";
  json += "\"location_valid\":" + String(locationValid ? "true" : "false") + ",";
  json += "\"last_location_valid\":" + String(locationValid ? "true" : "false") + ",";
  json += "\"heart_found\":false,";
  json += "\"finger\":false,";
  json += "\"pet_bpm\":0,";
  json += "\"spo2\":0,";
  json += "\"spo2_valid\":false,";
  json += "\"temp_c\":32.5,";
  json += "\"activity\":\"" + String(activity) + "\",";
  json += "\"activity_score\":" + String(accelPeak, 2) + ",";
  json += "\"accelPeak\":" + String(accelPeak, 2) + ",";
  json += "\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
  json += "\"wifi_rssi\":" + String(wifiRssi) + ",";
  json += "\"upload_enabled\":true";
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

  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 8);
  M5.Lcd.printf("POST %d\n", code);
  M5.Lcd.println(WiFi.localIP());
  M5.Lcd.println(response.substring(0, 80));
}

void setup() {
  M5.begin();
  M5.IMU.Init();
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  connectWifi();
}

void loop() {
  M5.update();
  if (millis() - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = millis();
    uploadTelemetry();
  }
  delay(50);
}
