#include <M5StickCPlus.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WebServer.h>
#include <Wire.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "TinyGPSPlus.h"
#include <math.h>
#include <string.h>

// Defaults. You can override and persist these over USB serial without reflashing:
// WIFI Jeremy’s iphone|00000000
// URL https://pawtrace-api.jeremyzhao613.workers.dev/api/device/telemetry
// TOKEN pawtrace-m5-dev-token
const char* DEFAULT_WIFI_SSID = "Jeremy’s iphone";
const char* DEFAULT_WIFI_PASSWORD = "00000000";

// Use the Cloudflare HTTPS API so the M5 can upload from school Wi-Fi or a hotspot.
const char* DEFAULT_PAWTRACE_TELEMETRY_URL = "https://pawtrace-api.jeremyzhao613.workers.dev/api/device/telemetry";
const char* DEFAULT_DEVICE_TOKEN = "pawtrace-m5-dev-token";
const char* DEFAULT_CONFIG_PROFILE = "cloudflare-command-2026-05-05";
const char* DEVICE_ID = "m5stickc-plus-1-1";
const char* USER_ID = "demo";
const char* FIRMWARE_VERSION = "10.4.3-stable-wifi-interface";

unsigned long lastUploadMs = 0;
const unsigned long UPLOAD_INTERVAL_MS = 1000;
const unsigned long WIFI_CONNECT_TIMEOUT_MS = 12000;
const unsigned long WIFI_RECONNECT_BASE_MS = 2500;
const unsigned long WIFI_RECONNECT_MAX_MS = 30000;
const unsigned long HTTP_TIMEOUT_MS = 4500;
const unsigned long HTTP_MIN_GAP_MS = 120;
const unsigned long UI_REFRESH_MS = 10;
const unsigned long UI_FRAME_MIN_MS = 120;
const unsigned long UI_STABLE_REDRAW_MS = 1000;
const unsigned long BOOT_ANIMATION_MS = 1900;
const unsigned long BOOT_ANIMATION_FRAME_MS = 33;
const unsigned long LOOP_DELAY_MS = 10;
const unsigned long SERIAL_STATUS_INTERVAL_MS = 5000;
const unsigned long HEART_SENSOR_RETRY_MS = 2500;
const unsigned long CLOUD_COMMAND_POLL_MS = 2500;
const uint16_t LAN_SERVER_PORT = 8080;
const uint8_t TELEMETRY_QUEUE_CAPACITY = 24;
const uint8_t TELEMETRY_UPLOAD_BATCH_MAX = 4;
const uint8_t UI_PAGE_COUNT = 5;
const size_t TELEMETRY_PAYLOAD_MAX = 1280;
const size_t LAN_MESSAGE_MAX = 512;
const bool SERIAL_LOG_UPLOAD_PAYLOAD = false;
const uint8_t ACTIVITY_REST = 0;
const uint8_t ACTIVITY_WALK = 1;
const uint8_t ACTIVITY_RUN = 2;
const int HEART_SDA_PIN = 0;
const int HEART_SCL_PIN = 26;
const uint8_t HEART_I2C_ADDRESS = 0x57;
const int GPS_RX_PIN = 33;
const int GPS_TX_PIN = 32;
const uint32_t GPS_BAUD = 9600;
const uint32_t GPS_VALID_AGE_MS = 10000;
Preferences pawPrefs;
WebServer lanServer(LAN_SERVER_PORT);
TFT_eSprite uiCanvas = TFT_eSprite(&M5.Lcd);
MAX30105 heartSensor;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
String wifiSsid = DEFAULT_WIFI_SSID;
String wifiPassword = DEFAULT_WIFI_PASSWORD;
String telemetryUrl = DEFAULT_PAWTRACE_TELEMETRY_URL;
String deviceToken = DEFAULT_DEVICE_TOKEN;
String usbLine = "";
String lastUsbMessage = "";
String lastLanMessage = "";
String lastServerResponse = "";
String lastWifiStatus = "boot";
String lastUiSubtitle = "";
String lastUiSignature = "";
uint32_t uploadSeq = 0;
uint32_t uploadAttemptSeq = 0;
uint32_t lanMessageSeq = 0;
uint32_t uploadOkCount = 0;
uint32_t uploadFailCountTotal = 0;
uint32_t cloudCommandSeq = 0;
int uiBatteryPct = 100;
int uiBatteryMv = 0;
int uiBpm = 0;
int uiSpo2 = 0;
bool uiSpo2Valid = false;
float uiTempC = 32.5;
float uiLat = 31.48303;
float uiLon = 121.15569;
int uiGpsFix = 0;
int uiGpsSats = 0;
float uiGpsHdop = 0;
unsigned long uiGpsAgeMs = 0;
bool uiLocationValid = false;
float uiAccelMagnitude = 1.0;
float uiMovementScore = 0;
float movementScoreEma = 0;
float accelMagnitudeEma = 1.0;
float batteryMvEma = 0;
float heartBpmEma = 0;
float spo2Ema = 0;
float gpsLatEma = 0;
float gpsLonEma = 0;
bool gpsLocationFilterReady = false;
uint8_t activityState = ACTIVITY_REST;
float uiActivityScore = 0;
float uiActivityConfidence = 0;
float uiSignalQuality = 0;
String uiActivity = "REST";
bool uiUploadOk = false;
int uiUploadCode = 0;
bool heartSensorReady = false;
bool heartFingerDetected = false;
bool heartBeatFound = false;
uint8_t heartI2cFoundAddress = 0;
uint16_t heartConfigureAttempts = 0;
long heartIrValue = 0;
long heartRedValue = 0;
float heartBpm = 0;
const byte HEART_RATE_WINDOW = 4;
byte heartRates[HEART_RATE_WINDOW] = {0, 0, 0, 0};
byte heartRateSpot = 0;
long heartLastBeatMs = 0;
bool gpsSerialReady = false;
uint32_t gpsCharsProcessed = 0;
uint32_t gpsSentencesWithFix = 0;
bool wifiConnecting = false;
bool telemetryUploadTaskStarted = false;
bool telemetryUploadInFlight = false;
bool uiCanvasReady = false;
unsigned long wifiConnectStartedMs = 0;
unsigned long nextWifiAttemptMs = 0;
unsigned long nextUploadAttemptMs = 0;
unsigned long lastHttpAttemptMs = 0;
unsigned long lastUiRefreshMs = 0;
unsigned long lastSerialStatusMs = 0;
unsigned long lastQueuedSerialLogMs = 0;
unsigned long lastHeartConfigureMs = 0;
unsigned long lastUploadSuccessMs = 0;
unsigned long lastUploadFailureMs = 0;
unsigned long lastCloudCommandPollMs = 0;
unsigned long uiLastUploadDurationMs = 0;
uint8_t uiPage = 0;
uint8_t wifiRetryCount = 0;
uint8_t httpFailCount = 0;
uint8_t telemetryQueueCount = 0;
uint16_t telemetryQueueDropped = 0;
bool lanServerStarted = false;

struct TelemetryUploadItem {
  uint32_t packetSeq;
  char payload[TELEMETRY_PAYLOAD_MAX];
};

QueueHandle_t telemetryUploadQueue = nullptr;
TaskHandle_t telemetryUploadTaskHandle = nullptr;

String buildTelemetryJson(bool compact = false);
void uploadTelemetry();
void enqueueTelemetrySample();
void processWifiState();
void processUploadQueue();
void processCloudCommands();
void configureTelemetryUploadTask();
void telemetryUploadTask(void* parameter);
void startWifiConnect(bool force = false);
void configureWifiRadio();
void configureLanServer();
void processLanServer();
void printWifiScanResults();
void handleLanRoot();
void handleLanStatus();
void handleLanUpload();
void handleLanMessage();
void handleLanOptions();
void handleLanNotFound();
void configureHeartSensor();
void processHeartSensor();
void resetHeartReadings();
uint8_t scanHeartI2cAddress();
void configureGps();
void processGpsSerial();
void printSerialHeartbeat(bool force = false);
void handleUiButtons();
void configureUiCanvas();
float clampFloat(float value, float minValue, float maxValue);
int stableBatteryMv(int rawMv);
void updateMotionFilter(float accX, float accY, float accZ);
const char* stableActivityLabel();
void updateSignalQuality(int wifiRssi, int gpsSatsUsed);
String cloudCommandUrl();
String jsonStringField(const String& json, const String& key);
bool jsonBoolField(const String& json, const String& key);

uint16_t uiColor(uint8_t r, uint8_t g, uint8_t b) {
  return M5.Lcd.color565(r, g, b);
}

void configureUiCanvas() {
  if (uiCanvasReady) return;
  uiCanvas.setColorDepth(16);
  uiCanvasReady = uiCanvas.createSprite(M5.Lcd.width(), M5.Lcd.height()) != nullptr;
  uiCanvas.setTextSize(1);
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
  int width = uiCanvas.width();
  int height = uiCanvas.height();
  uiCanvas.fillScreen(uiColor(255, 254, 248));
  uiCanvas.fillRect(0, 0, width, 22, uiColor(31, 59, 66));
  uiCanvas.fillRect(0, 22, width, height - 22, uiColor(255, 246, 249));
  uiCanvas.fillRect(0, 112, width, height - 112, uiColor(255, 239, 245));
}

void drawPawMark(int x, int y, uint16_t color) {
  uiCanvas.fillCircle(x + 6, y + 8, 5, color);
  uiCanvas.fillCircle(x + 1, y + 4, 2, color);
  uiCanvas.fillCircle(x + 6, y + 1, 2, color);
  uiCanvas.fillCircle(x + 11, y + 4, 2, color);
}

String clipText(const String& text, int maxChars) {
  String clipped = text;
  if (maxChars > 0 && clipped.length() > maxChars) {
    if (maxChars == 1) return ".";
    clipped = clipped.substring(0, maxChars - 1) + ".";
  }
  return clipped;
}

int charsForWidth(int width, uint8_t textSize) {
  int charWidth = 6 * textSize;
  if (charWidth <= 0) return 1;
  int chars = width / charWidth;
  return chars > 0 ? chars : 1;
}

void drawTextSized(int x, int y, const String& text, uint16_t color, int maxChars, uint8_t textSize) {
  String clipped = clipText(text, maxChars);
  uiCanvas.setTextSize(textSize);
  uiCanvas.setTextColor(color);
  uiCanvas.setCursor(x, y);
  uiCanvas.print(clipped);
}

void drawText(int x, int y, const String& text, uint16_t color, int maxChars) {
  drawTextSized(x, y, text, color, maxChars, 1);
}

void drawRightText(int rightX, int y, const String& text, uint16_t color, int maxChars, uint8_t textSize) {
  String clipped = clipText(text, maxChars);
  int x = rightX - (int)clipped.length() * 6 * textSize;
  if (x < 0) x = 0;
  drawTextSized(x, y, clipped, color, maxChars, textSize);
}

void drawPill(int x, int y, int w, const String& label, bool active) {
  uint16_t fill = active ? uiColor(153, 205, 216) : uiColor(255, 229, 236);
  uint16_t text = active ? uiColor(31, 59, 66) : uiColor(124, 78, 91);
  uiCanvas.fillRoundRect(x, y, w, 14, 5, fill);
  drawText(x + 5, y + 4, label, text, charsForWidth(w - 10, 1));
}

String uploadStateLabel() {
  if (uiUploadOk) return "OK " + String(uiUploadCode);
  if (telemetryUploadInFlight) return "TX";
  if (telemetryQueueCount > 0) return "Q " + String(telemetryQueueCount) + "/" + String(TELEMETRY_QUEUE_CAPACITY);
  if (uiUploadCode != 0) return "HTTP " + String(uiUploadCode);
  return WiFi.status() == WL_CONNECTED ? "READY" : "WAIT";
}

String wifiDetailLabel(const String& fallback) {
  if (WiFi.status() == WL_CONNECTED) {
    return WiFi.localIP().toString() + " " + String(WiFi.RSSI()) + "dBm";
  }
  return fallback.length() ? fallback : lastWifiStatus;
}

void drawQueueBar(int x, int y, int w) {
  uiCanvas.fillRoundRect(x, y, w, 4, 2, uiColor(248, 231, 238));
  int fillWidth = telemetryQueueCount > 0 ? (w * telemetryQueueCount) / TELEMETRY_QUEUE_CAPACITY : 0;
  if (fillWidth > w) fillWidth = w;
  if (fillWidth > 0) {
    uiCanvas.fillRoundRect(x, y, fillWidth, 4, 2, telemetryQueueCount > TELEMETRY_QUEUE_CAPACITY / 2 ? uiColor(245, 142, 126) : uiColor(153, 205, 216));
  }
}

void drawMetricCard(int x, int y, int w, const String& label, const String& value, const String& detail, uint16_t accent) {
  uiCanvas.fillRoundRect(x, y, w, 39, 5, uiColor(255, 252, 248));
  uiCanvas.drawRoundRect(x, y, w, 39, 5, uiColor(248, 231, 238));
  uiCanvas.fillRect(x, y, w, 3, accent);
  drawText(x + 5, y + 6, label, uiColor(100, 119, 130), charsForWidth(w - 10, 1));
  drawRightText(x + w - 5, y + 6, detail, uiColor(123, 144, 152), charsForWidth(w - 10, 1), 1);
  drawTextSized(x + 5, y + 19, value, uiColor(31, 59, 66), charsForWidth(w - 10, 2), 2);
}

void drawDetailPanel(int x, int y, int w, const String& title, const String& line1, const String& line2, uint16_t accent) {
  uiCanvas.fillRoundRect(x, y, w, 36, 5, uiColor(255, 252, 248));
  uiCanvas.drawRoundRect(x, y, w, 36, 5, uiColor(248, 231, 238));
  uiCanvas.fillCircle(x + 8, y + 9, 3, accent);
  drawText(x + 15, y + 5, title, uiColor(100, 119, 130), charsForWidth(w - 20, 1));
  drawText(x + 7, y + 17, line1, uiColor(31, 59, 66), charsForWidth(w - 14, 1));
  drawText(x + 7, y + 27, line2, uiColor(123, 144, 152), charsForWidth(w - 14, 1));
}

void drawInfoStrip(int x, int y, int w, const String& title, const String& value, uint16_t accent) {
  uiCanvas.fillRoundRect(x, y, w, 20, 5, uiColor(255, 252, 248));
  uiCanvas.drawRoundRect(x, y, w, 20, 5, uiColor(248, 231, 238));
  uiCanvas.fillCircle(x + 8, y + 10, 3, accent);
  drawText(x + 15, y + 5, title, uiColor(100, 119, 130), 9);
  drawText(x + 70, y + 5, value, uiColor(31, 59, 66), charsForWidth(w - 76, 1));
}

void drawBootThickLine(int x1, int y1, int x2, int y2, uint8_t thickness, uint16_t color) {
  int radius = thickness / 2;
  for (int dx = -radius; dx <= radius; dx += 1) {
    for (int dy = -radius; dy <= radius; dy += 1) {
      if (dx * dx + dy * dy <= radius * radius) {
        uiCanvas.drawLine(x1 + dx, y1 + dy, x2 + dx, y2 + dy, color);
      }
    }
  }
}

void drawBootLimb(int hipX, int hipY, float offsetDeg, int length, uint16_t limbColor, uint16_t pawColor) {
  float angle = offsetDeg * 0.0174532925f;
  int footX = hipX + (int)(sinf(angle) * length);
  int footY = hipY + (int)(cosf(angle) * length);
  drawBootThickLine(hipX, hipY, footX, footY, 3, limbColor);
  uiCanvas.fillCircle(footX, footY, 3, pawColor);
}

void drawBootWheel(int cx, int cy, int radius, float cycleProgress) {
  uint16_t spokeColor = uiColor(218, 226, 227);
  uint16_t rimColor = uiColor(150, 161, 163);
  float spin = -cycleProgress * 6.2831853f;
  uiCanvas.fillCircle(cx, cy, 4, rimColor);
  for (int i = 0; i < 6; i += 1) {
    float angle = spin + (i * 1.0471976f);
    int x = cx + (int)(cosf(angle) * (radius - 5));
    int y = cy + (int)(sinf(angle) * (radius - 5));
    uiCanvas.drawLine(cx, cy, x, y, spokeColor);
  }
  for (int i = 0; i < 3; i += 1) {
    uiCanvas.drawCircle(cx, cy, radius - i, rimColor);
  }
}

void drawBootHamster(int cx, int cy, float cycleProgress) {
  float stride = cosf(cycleProgress * 25.132741f);
  int bob = (int)(sinf(cycleProgress * 25.132741f) * 2.0f);
  int bodyX = cx + 5;
  int bodyY = cy + 15 + bob;
  int headX = bodyX - 31;
  int headY = bodyY - 7 + (stride > 0 ? 0 : 1);

  uint16_t fur = uiColor(242, 142, 45);
  uint16_t furLight = uiColor(255, 229, 192);
  uint16_t furMid = uiColor(252, 190, 116);
  uint16_t paw = uiColor(244, 150, 164);
  uint16_t pawLight = uiColor(255, 202, 211);
  uint16_t eye = uiColor(30, 24, 22);

  drawBootLimb(bodyX - 13, bodyY + 7, 10 + (40 * stride), 18, furMid, paw);
  drawBootLimb(bodyX + 9, bodyY + 7, -20 - (40 * stride), 18, furMid, paw);

  uiCanvas.fillRoundRect(bodyX - 19, bodyY - 12, 43, 25, 12, furLight);
  uiCanvas.fillRoundRect(bodyX - 17, bodyY + 2, 34, 9, 5, fur);
  uiCanvas.fillRoundRect(bodyX - 17, bodyY - 12, 35, 6, 4, furMid);
  uiCanvas.fillRoundRect(bodyX + 22, bodyY - 2, 11, 7, 3, pawLight);
  uiCanvas.fillCircle(bodyX + 32, bodyY + 1, 3, paw);

  drawBootLimb(bodyX - 13, bodyY + 8, 10 - (40 * stride), 18, furLight, pawLight);
  drawBootLimb(bodyX + 8, bodyY + 8, -20 + (40 * stride), 18, furLight, pawLight);

  uiCanvas.fillCircle(headX, headY, 14, fur);
  uiCanvas.fillCircle(headX + 9, headY - 12 + (stride > 0 ? 1 : 0), 5, pawLight);
  uiCanvas.drawCircle(headX + 9, headY - 12 + (stride > 0 ? 1 : 0), 5, fur);
  uiCanvas.fillCircle(headX - 5, headY - 5, 8, furLight);
  uiCanvas.fillCircle(headX - 13, headY + 1, 3, paw);
  if (cycleProgress > 0.90f && cycleProgress < 0.96f) {
    uiCanvas.drawLine(headX + 2, headY - 4, headX + 7, headY - 4, eye);
  } else {
    uiCanvas.fillCircle(headX + 4, headY - 5, 3, eye);
  }
}

void drawBootFrame(float cycleProgress, float bootProgress) {
  int width = uiCanvas.width();
  int height = uiCanvas.height();
  uiCanvas.fillScreen(uiColor(255, 254, 248));
  uiCanvas.fillRect(0, 0, width, height, uiColor(255, 246, 249));
  uiCanvas.fillRect(0, 0, width, 23, uiColor(31, 59, 66));
  uiCanvas.fillRect(0, height - 18, width, 18, uiColor(255, 239, 245));
  uiCanvas.fillCircle(26, 30, 18, uiColor(255, 226, 237));
  uiCanvas.fillCircle(218, 26, 16, uiColor(222, 244, 248));

  int wheelCx = 64;
  int wheelCy = 69;
  int wheelRadius = 45;
  drawBootWheel(wheelCx, wheelCy, wheelRadius, cycleProgress);
  drawBootHamster(wheelCx, wheelCy, cycleProgress);
  drawBootWheel(wheelCx, wheelCy, wheelRadius, cycleProgress);

  drawPawMark(7, 6, uiColor(153, 205, 216));
  drawText(23, 5, "PawTrace", uiColor(255, 254, 248), 12);
  drawText(23, 15, "M5 START", uiColor(232, 248, 251), 14);
  drawTextSized(126, 45, "PawTrace", uiColor(31, 59, 66), 10, 2);
  drawText(128, 66, "tracking collar", uiColor(100, 119, 130), 17);
  drawText(128, 80, "booting sensors", uiColor(124, 78, 91), 18);
  uiCanvas.fillRoundRect(128, 101, 88, 7, 3, uiColor(248, 231, 238));
  int progressWidth = constrain((int)(bootProgress * 88.0f), 0, 88);
  uiCanvas.fillRoundRect(128, 101, progressWidth, 7, 3, uiColor(153, 205, 216));
  uiCanvas.pushSprite(0, 0);
}

void drawBootAnimation() {
  configureUiCanvas();
  if (!uiCanvasReady) return;
  unsigned long startedMs = millis();
  while (millis() - startedMs < BOOT_ANIMATION_MS) {
    M5.update();
    unsigned long elapsedMs = millis() - startedMs;
    float cycleProgress = (float)(elapsedMs % 1000) / 1000.0f;
    float bootProgress = (float)elapsedMs / (float)BOOT_ANIMATION_MS;
    drawBootFrame(cycleProgress, bootProgress);
    if (M5.BtnA.isPressed() || M5.BtnB.isPressed()) break;
    delay(BOOT_ANIMATION_FRAME_MS);
  }
}

String gpsLabel() {
  if (!uiLocationValid || uiGpsFix <= 0) return "GPS wait " + String(uiGpsSats) + " sat";
  return String(uiLat, 2) + "," + String(uiLon, 2);
}

bool hasValidHeartRate() {
  return heartSensorReady && heartFingerDetected && uiBpm > 0;
}

String nullableIntJson(bool valid, int value) {
  return valid ? String(value) : "null";
}

String nullableFloatJson(bool valid, float value, int decimals) {
  return valid && isfinite(value) ? String(value, decimals) : "null";
}

String pageTitle() {
  const char* titles[] = {"LIVE", "LINK", "SYNC", "SENSOR", "DEVICE"};
  return String(titles[uiPage % UI_PAGE_COUNT]);
}

String shortHostLabel() {
  String value = telemetryUrl;
  int schemeIndex = value.indexOf("://");
  int hostStart = schemeIndex >= 0 ? schemeIndex + 3 : 0;
  int pathStart = value.indexOf('/', hostStart);
  String host = pathStart >= 0 ? value.substring(hostStart, pathStart) : value.substring(hostStart);
  return host.length() ? host : value;
}

String ageLabel(unsigned long eventMs) {
  if (!eventMs) return "--";
  unsigned long ageMs = millis() - eventMs;
  if (ageMs < 1000) return String(ageMs) + "ms";
  if (ageMs < 60000) return String(ageMs / 1000) + "s";
  return String(ageMs / 60000) + "m";
}

String yesNo(bool value) {
  return value ? "YES" : "NO";
}

void drawTopBar(const String& title) {
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  drawPawMark(6, 6, uiColor(153, 205, 216));
  drawText(22, 4, "PawTrace", uiColor(255, 254, 248), 10);
  drawText(22, 14, title, uiColor(232, 248, 251), 13);
  for (uint8_t i = 0; i < UI_PAGE_COUNT; i += 1) {
    int x = 105 + i * 8;
    uiCanvas.fillCircle(x, 11, 2, i == uiPage ? uiColor(153, 205, 216) : uiColor(100, 119, 130));
  }
  drawPill(151, 4, 38, wifiOk ? "WIFI" : "OFF", wifiOk);
  drawPill(194, 4, 41, uiUploadOk ? "SENT" : "SYNC", uiUploadOk);
}

void drawFooterHints() {
  uiCanvas.fillRoundRect(42, 123, 156, 9, 4, uiColor(255, 246, 249));
  drawText(53, 125, "A PAGE   B SEND", uiColor(100, 119, 130), 22);
}

void drawLivePage(const String& subtitle) {
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  String wifiDetail = wifiDetailLabel(subtitle);
  String gpsDetail = uiLocationValid ? String(uiGpsSats) + "S" : String(gpsCharsProcessed / 1000) + "k";
  String appLine = uploadStateLabel();
  String activityLine = uiActivity + " M" + String(uiMovementScore, 2);
  String gpsLine = uiLocationValid ? String(uiLat, 2) + "," + String(uiLon, 2) : "GPS " + String(uiGpsSats) + " sat";

  drawAppBackground();
  drawTopBar("LIVE");

  uiCanvas.fillRoundRect(4, 26, 232, 21, 5, uiColor(255, 255, 252));
  uiCanvas.drawRoundRect(4, 26, 232, 21, 5, uiColor(248, 231, 238));
  uiCanvas.fillCircle(13, 36, 4, wifiOk ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawText(22, 31, wifiOk ? "APP LINK" : "NETWORK", uiColor(22, 46, 50), 10);
  drawText(82, 31, wifiDetail, uiColor(78, 94, 90), 14);
  drawRightText(230, 31, appLine, uiUploadOk ? uiColor(37, 120, 90) : uiColor(152, 92, 40), 10, 1);
  drawQueueBar(12, 44, 216);

  drawMetricCard(4, 53, 56, "HR", hasValidHeartRate() ? String(uiBpm) : "--", "BPM", uiColor(153, 205, 216));
  drawMetricCard(62, 53, 56, "O2", uiSpo2Valid ? String(uiSpo2) : "--", "%", uiColor(255, 210, 233));
  drawMetricCard(120, 53, 56, "GPS", uiGpsFix > 0 ? "FIX" : "WAIT", gpsDetail, uiColor(200, 232, 239));
  drawMetricCard(178, 53, 56, "BAT", String(uiBatteryPct) + "%", uiBatteryMv > 0 ? String(uiBatteryMv / 1000.0f, 1) + "V" : "", uiColor(153, 205, 216));

  drawDetailPanel(4, 96, 114, "MOTION", activityLine, gpsLine, uiColor(153, 205, 216));
  drawDetailPanel(122, 96, 114, "APP", appLine, wifiOk ? WiFi.localIP().toString() : lastWifiStatus, uiUploadOk ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawFooterHints();
}

void drawLinkPage(const String& subtitle) {
  bool wifiOk = WiFi.status() == WL_CONNECTED;
  drawAppBackground();
  drawTopBar("LINK");
  drawMetricCard(4, 28, 75, "WIFI", wifiOk ? "ON" : "OFF", String(WiFi.RSSI()) + "dB", wifiOk ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawMetricCard(83, 28, 75, "QUEUE", String(telemetryQueueCount), "/" + String(TELEMETRY_QUEUE_CAPACITY), uiColor(255, 210, 233));
  drawMetricCard(162, 28, 74, "HTTP", uiUploadCode ? String(uiUploadCode) : "--", uiUploadOk ? "OK" : "WAIT", uiUploadOk ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawDetailPanel(4, 72, 114, "SSID", wifiSsid, wifiOk ? WiFi.localIP().toString() : lastWifiStatus, uiColor(153, 205, 216));
  drawDetailPanel(122, 72, 114, "M5 LAN", lanBaseUrl().length() ? lanBaseUrl() : "waiting", "8080 status api", uiColor(200, 232, 239));
  drawInfoStrip(4, 112, 232, "BACKEND", shortHostLabel(), uiColor(255, 210, 233));
}

void drawSyncPage() {
  drawAppBackground();
  drawTopBar("SYNC");
  uiCanvas.fillRoundRect(4, 28, 232, 23, 7, uiColor(255, 252, 248));
  uiCanvas.drawRoundRect(4, 28, 232, 23, 7, uiColor(248, 231, 238));
  drawText(12, 34, uiUploadOk ? "DATA SENT TO APP" : "DATA WAITING / RETRY", uiUploadOk ? uiColor(31, 84, 96) : uiColor(124, 78, 91), 26);
  drawQueueBar(12, 47, 216);

  drawMetricCard(4, 58, 56, "OK", String(uploadOkCount), ageLabel(lastUploadSuccessMs), uiColor(153, 205, 216));
  drawMetricCard(62, 58, 56, "FAIL", String(uploadFailCountTotal), ageLabel(lastUploadFailureMs), uiColor(245, 142, 126));
  drawMetricCard(120, 58, 56, "TRY", String(uploadAttemptSeq), String(uiLastUploadDurationMs) + "ms", uiColor(255, 210, 233));
  drawMetricCard(178, 58, 56, "SEQ", String(uploadSeq), "pkt", uiColor(200, 232, 239));

  drawDetailPanel(4, 98, 114, "RESPONSE", lastServerResponse.length() ? lastServerResponse : "--", "HTTP " + String(uiUploadCode), uiUploadOk ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawDetailPanel(122, 98, 114, "QUEUE", String(telemetryQueueCount) + " held", String(telemetryQueueDropped) + " dropped", telemetryQueueCount ? uiColor(245, 142, 126) : uiColor(153, 205, 216));
}

void drawSensorPage() {
  drawAppBackground();
  drawTopBar("SENSOR");
  drawMetricCard(4, 28, 56, "HR", hasValidHeartRate() ? String(uiBpm) : "--", heartSensorReady ? (heartFingerDetected ? "touch" : "fit") : "scan", uiColor(153, 205, 216));
  drawMetricCard(62, 28, 56, "O2", uiSpo2Valid ? String(uiSpo2) : "--", "%", uiColor(255, 210, 233));
  drawMetricCard(120, 28, 56, "TEMP", String(uiTempC, 1), "board", uiColor(200, 232, 239));
  drawMetricCard(178, 28, 56, "ACC", String(uiMovementScore, 2), uiActivity, uiColor(153, 205, 216));

  drawDetailPanel(4, 72, 114, "HEART HAT", heartSensorReady ? "MAX30102 ready" : "scan 0x" + String(heartI2cFoundAddress, HEX), "IR " + String(heartIrValue) + " #" + String(heartConfigureAttempts), heartSensorReady ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawDetailPanel(122, 72, 114, "GPS", uiLocationValid ? "fix " + String(uiGpsSats) + " sat" : "waiting " + String(uiGpsSats), "hdop " + String(uiGpsHdop, 1) + " age " + String(uiGpsAgeMs / 1000) + "s", uiLocationValid ? uiColor(153, 205, 216) : uiColor(245, 142, 126));
  drawInfoStrip(4, 112, 232, "LOCATION", gpsLabel(), uiColor(200, 232, 239));
}

void drawDevicePage() {
  drawAppBackground();
  drawTopBar("DEVICE");
  drawMetricCard(4, 28, 75, "PAGE", String(uiPage + 1), "/" + String(UI_PAGE_COUNT), uiColor(153, 205, 216));
  drawMetricCard(83, 28, 75, "BAT", String(uiBatteryPct) + "%", String(uiBatteryMv) + "mV", uiColor(255, 210, 233));
  drawMetricCard(162, 28, 74, "LAN", lanServerStarted ? "ON" : "OFF", "8080", uiColor(200, 232, 239));

  drawDetailPanel(4, 72, 114, "USB MSG", lastUsbMessage.length() ? lastUsbMessage : "none", "serial cmd ready", uiColor(153, 205, 216));
  drawDetailPanel(122, 72, 114, "LAN MSG", lastLanMessage.length() ? lastLanMessage : "none", "seq " + String(lanMessageSeq), uiColor(255, 210, 233));
  drawInfoStrip(4, 112, 232, "FIRMWARE", String(FIRMWARE_VERSION), uiColor(200, 232, 239));
}

void drawStatusDashboard(const String& subtitle) {
  configureUiCanvas();
  if (!uiCanvasReady) return;
  lastUiSubtitle = subtitle;
  if (uiPage == 0) {
    drawLivePage(subtitle);
  } else if (uiPage == 1) {
    drawLinkPage(subtitle);
  } else if (uiPage == 2) {
    drawSyncPage();
  } else if (uiPage == 3) {
    drawSensorPage();
  } else {
    drawDevicePage();
  }
  uiCanvas.pushSprite(0, 0);
}

String uiStateSignature(const String& subtitle) {
  return String(uiPage) +
    "|" + subtitle +
    "|" + String(WiFi.status() == WL_CONNECTED ? "1" : "0") +
    "|" + (WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "") +
    "|" + String(WiFi.status() == WL_CONNECTED ? WiFi.RSSI() / 5 : 0) +
    "|" + String(uiUploadOk ? "1" : "0") +
    "|" + String(uiUploadCode) +
    "|" + String(telemetryUploadInFlight ? "1" : "0") +
    "|" + String(telemetryQueueCount) +
    "|" + String(telemetryQueueDropped) +
    "|" + String(uploadOkCount) +
    "|" + String(uploadFailCountTotal) +
    "|" + String(uiBpm) +
    "|" + String(uiSpo2) +
    "|" + String(uiSpo2Valid ? "1" : "0") +
    "|" + String(uiGpsFix) +
    "|" + String(uiGpsSats) +
    "|" + String(uiBatteryPct) +
    "|" + uiActivity +
    "|" + String((int)(uiMovementScore * 100.0f)) +
    "|" + lastWifiStatus +
    "|" + lastServerResponse;
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

float clampFloat(float value, float minValue, float maxValue) {
  if (!isfinite(value)) return minValue;
  if (value < minValue) return minValue;
  if (value > maxValue) return maxValue;
  return value;
}

float smoothFloat(float previous, float raw, float alpha) {
  if (!isfinite(raw)) return previous;
  if (!isfinite(previous) || previous <= 0) return raw;
  return (previous * (1.0f - alpha)) + (raw * alpha);
}

int stableBatteryMv(int rawMv) {
  if (rawMv <= 0) return batteryMvEma > 0 ? (int)(batteryMvEma + 0.5f) : 0;
  batteryMvEma = smoothFloat(batteryMvEma, (float)rawMv, 0.12f);
  return (int)(batteryMvEma + 0.5f);
}

void updateActivityState(float score) {
  if (activityState == ACTIVITY_RUN) {
    if (score < 0.34f) activityState = score < 0.12f ? ACTIVITY_REST : ACTIVITY_WALK;
  } else if (activityState == ACTIVITY_WALK) {
    if (score > 0.62f) activityState = ACTIVITY_RUN;
    else if (score < 0.10f) activityState = ACTIVITY_REST;
  } else {
    if (score > 0.58f) activityState = ACTIVITY_RUN;
    else if (score > 0.20f) activityState = ACTIVITY_WALK;
  }
}

const char* stableActivityLabel() {
  if (activityState == ACTIVITY_RUN) return "RUN";
  if (activityState == ACTIVITY_WALK) return "WALK";
  return "REST";
}

void updateMotionFilter(float accX, float accY, float accZ) {
  float rawMagnitude = sqrtf((accX * accX) + (accY * accY) + (accZ * accZ));
  rawMagnitude = clampFloat(rawMagnitude, 0.0f, 4.0f);
  accelMagnitudeEma = smoothFloat(accelMagnitudeEma, rawMagnitude, 0.18f);
  uiAccelMagnitude = accelMagnitudeEma;

  float movementScore = fabsf(rawMagnitude - accelMagnitudeEma) + fabsf(accelMagnitudeEma - 1.0f);
  movementScore = clampFloat(movementScore, 0.0f, 3.0f);
  movementScoreEma = (movementScoreEma * 0.82f) + (movementScore * 0.18f);
  uiMovementScore = movementScoreEma < 0.03f ? 0.0f : movementScoreEma;
  updateActivityState(uiMovementScore);

  float restConfidence = 1.0f - clampFloat(uiMovementScore / 0.20f, 0.0f, 1.0f);
  float walkConfidence = 1.0f - clampFloat(fabsf(uiMovementScore - 0.34f) / 0.30f, 0.0f, 1.0f);
  float runConfidence = clampFloat((uiMovementScore - 0.45f) / 0.45f, 0.0f, 1.0f);
  if (activityState == ACTIVITY_RUN) uiActivityConfidence = runConfidence;
  else if (activityState == ACTIVITY_WALK) uiActivityConfidence = walkConfidence;
  else uiActivityConfidence = restConfidence;
}

void updateSignalQuality(int wifiRssi, int gpsSatsUsed) {
  float wifiScore = WiFi.status() == WL_CONNECTED ? clampFloat(((float)wifiRssi + 90.0f) / 55.0f, 0.0f, 1.0f) : 0.0f;
  float gpsScore = uiLocationValid ? clampFloat((float)gpsSatsUsed / 8.0f, 0.0f, 1.0f) : 0.0f;
  float heartScore = heartSensorReady ? (heartFingerDetected ? 1.0f : 0.35f) : 0.0f;
  float queueScore = 1.0f - clampFloat((float)telemetryQueueCount / (float)TELEMETRY_QUEUE_CAPACITY, 0.0f, 1.0f);
  float rawQuality = (wifiScore * 0.35f) + (gpsScore * 0.25f) + (heartScore * 0.15f) + (queueScore * 0.25f);
  uiSignalQuality = uiSignalQuality <= 0 ? rawQuality : (uiSignalQuality * 0.85f) + (rawQuality * 0.15f);
}

void configureHeartSensor() {
  lastHeartConfigureMs = millis();
  heartConfigureAttempts += 1;
  Wire.begin(HEART_SDA_PIN, HEART_SCL_PIN);
  Wire.setClock(I2C_SPEED_STANDARD);
  heartI2cFoundAddress = scanHeartI2cAddress();
  heartSensorReady = heartI2cFoundAddress == HEART_I2C_ADDRESS && heartSensor.begin(Wire, I2C_SPEED_STANDARD, HEART_I2C_ADDRESS);
  if (!heartSensorReady) {
    resetHeartReadings();
    return;
  }
  heartSensor.setup(0x3F, 4, 2, 100, 411, 4096);
  heartSensor.clearFIFO();
  heartSensor.setPulseAmplitudeRed(0x3F);
  heartSensor.setPulseAmplitudeIR(0x3F);
  heartSensor.setPulseAmplitudeGreen(0);
}

void resetHeartReadings() {
  heartFingerDetected = false;
  heartBeatFound = false;
  heartBpm = 0;
  heartBpmEma = 0;
  spo2Ema = 0;
  heartIrValue = 0;
  heartRedValue = 0;
  uiBpm = 0;
  uiSpo2 = 0;
  uiSpo2Valid = false;
  for (byte i = 0; i < HEART_RATE_WINDOW; i += 1) {
    heartRates[i] = 0;
  }
  heartRateSpot = 0;
  heartLastBeatMs = 0;
}

uint8_t scanHeartI2cAddress() {
  Wire.beginTransmission(HEART_I2C_ADDRESS);
  if (Wire.endTransmission() == 0) return HEART_I2C_ADDRESS;
  for (uint8_t address = 1; address < 127; address += 1) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) return address;
  }
  return 0;
}

void processHeartSensor() {
  if (!heartSensorReady) {
    if (millis() - lastHeartConfigureMs >= HEART_SENSOR_RETRY_MS) {
      configureHeartSensor();
    }
    return;
  }

  heartIrValue = heartSensor.getIR();
  heartRedValue = heartSensor.getRed();
  heartFingerDetected = heartIrValue > 50000;

  if (!heartFingerDetected) {
    heartBeatFound = false;
    heartBpm = 0;
    heartBpmEma = 0;
    spo2Ema = 0;
    uiBpm = 0;
    uiSpo2 = 0;
    uiSpo2Valid = false;
    return;
  }

  float ratio = heartIrValue > 0 ? (float)heartRedValue / (float)heartIrValue : 1.0f;
  int estimatedSpo2 = 99 - (int)fabsf((ratio - 0.55f) * 10.0f);
  estimatedSpo2 = constrain(estimatedSpo2, 94, 99);
  spo2Ema = spo2Ema <= 0 ? (float)estimatedSpo2 : (spo2Ema * 0.82f) + ((float)estimatedSpo2 * 0.18f);
  uiSpo2 = constrain((int)(spo2Ema + 0.5f), 94, 99);
  uiSpo2Valid = true;

  if (checkForBeat(heartIrValue)) {
    heartBeatFound = true;
    long now = millis();
    long delta = now - heartLastBeatMs;
    heartLastBeatMs = now;
    if (delta > 0) {
      heartBpm = 60.0f / (delta / 1000.0f);
      if (heartBpm >= 35 && heartBpm <= 240) {
        heartRates[heartRateSpot++] = (byte)heartBpm;
        heartRateSpot %= HEART_RATE_WINDOW;
        int total = 0;
        int count = 0;
        for (byte i = 0; i < HEART_RATE_WINDOW; i += 1) {
          if (heartRates[i] > 0) {
            total += heartRates[i];
            count += 1;
          }
        }
        int averagedBpm = count ? total / count : (int)heartBpm;
        heartBpmEma = heartBpmEma <= 0 ? (float)averagedBpm : (heartBpmEma * 0.72f) + ((float)averagedBpm * 0.28f);
        uiBpm = constrain((int)(heartBpmEma + 0.5f), 35, 240);
      }
    }
  }

}

void configureGps() {
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  gpsSerialReady = true;
}

void processGpsSerial() {
  if (!gpsSerialReady) return;
  while (gpsSerial.available() > 0) {
    char c = (char)gpsSerial.read();
    if (gps.encode(c) && gps.location.isValid()) {
      gpsSentencesWithFix += 1;
    }
  }
  gpsCharsProcessed = gps.charsProcessed();
}

bool hasFreshGpsLocation() {
  return gps.location.isValid() && gps.location.age() <= GPS_VALID_AGE_MS;
}

void updateGpsUi() {
  if (hasFreshGpsLocation()) {
    float rawLat = gps.location.lat();
    float rawLon = gps.location.lng();
    if (!gpsLocationFilterReady || fabsf(rawLat - gpsLatEma) + fabsf(rawLon - gpsLonEma) > 0.0025f) {
      gpsLatEma = rawLat;
      gpsLonEma = rawLon;
      gpsLocationFilterReady = true;
    } else {
      gpsLatEma = (gpsLatEma * 0.65f) + (rawLat * 0.35f);
      gpsLonEma = (gpsLonEma * 0.65f) + (rawLon * 0.35f);
    }
    uiLat = gpsLatEma;
    uiLon = gpsLonEma;
    uiGpsFix = 1;
    uiLocationValid = true;
    return;
  }
  if (!gps.location.isValid() || gps.location.age() > 60000) {
    gpsLocationFilterReady = false;
  }
  uiGpsFix = 0;
  uiLocationValid = false;
}

void drawStatusMaybe(const String& subtitle, bool force = false) {
  unsigned long now = millis();
  if (!force && now - lastUiRefreshMs < UI_REFRESH_MS) return;
  String signature = uiStateSignature(subtitle);
  if (!force && now - lastUiRefreshMs < UI_FRAME_MIN_MS) return;
  if (!force && signature == lastUiSignature && now - lastUiRefreshMs < UI_STABLE_REDRAW_MS) return;
  lastUiRefreshMs = now;
  lastUiSignature = signature;
  drawStatusDashboard(subtitle);
}

void handleUiButtons() {
  if (M5.BtnA.wasPressed()) {
    uiPage = (uiPage + 1) % UI_PAGE_COUNT;
    lastUiRefreshMs = 0;
    lastUiSignature = "";
    drawStatusMaybe(pageTitle(), true);
  }
  if (M5.BtnB.wasPressed()) {
    uploadTelemetry();
    lastUiRefreshMs = 0;
    lastUiSignature = "";
    drawStatusMaybe("manual send", true);
  }
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

String ssidMatchKey(String value) {
  value.toLowerCase();
  String output = "";
  for (size_t i = 0; i < value.length(); i += 1) {
    char c = value.charAt(i);
    if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) {
      output += c;
    }
  }
  return output;
}

bool isLikelyJeremyIphone(const String& key) {
  return key.indexOf("jeremy") >= 0 && key.indexOf("iphone") >= 0;
}

String resolveVisibleWifiSsid() {
  configureWifiRadio();
  String target = wifiSsid;
  target.trim();
  String targetKey = ssidMatchKey(target);
  int count = WiFi.scanNetworks(false, true);
  String normalizedMatch = "";
  String likelyMatch = "";
  for (int i = 0; i < count; i += 1) {
    String visible = WiFi.SSID(i);
    if (visible == target) {
      WiFi.scanDelete();
      return visible;
    }
    String visibleKey = ssidMatchKey(visible);
    if (!normalizedMatch.length() && visibleKey.length() && visibleKey == targetKey) {
      normalizedMatch = visible;
    }
    if (!likelyMatch.length() && isLikelyJeremyIphone(targetKey) && isLikelyJeremyIphone(visibleKey)) {
      likelyMatch = visible;
    }
  }
  WiFi.scanDelete();
  if (normalizedMatch.length()) return normalizedMatch;
  if (likelyMatch.length()) return likelyMatch;
  return target;
}

void loadDeviceConfig() {
  pawPrefs.begin("pawtrace", false);
  String profile = pawPrefs.getString("profile", "");
  if (profile != DEFAULT_CONFIG_PROFILE) {
    String savedSsid = pawPrefs.getString("ssid", DEFAULT_WIFI_SSID);
    String savedPassword = pawPrefs.getString("pass", DEFAULT_WIFI_PASSWORD);
    savedSsid.trim();
    wifiSsid = savedSsid.length() ? savedSsid : DEFAULT_WIFI_SSID;
    wifiPassword = savedSsid.length() ? savedPassword : DEFAULT_WIFI_PASSWORD;
    telemetryUrl = DEFAULT_PAWTRACE_TELEMETRY_URL;
    deviceToken = DEFAULT_DEVICE_TOKEN;
    pawPrefs.putString("ssid", wifiSsid);
    pawPrefs.putString("pass", wifiPassword);
    pawPrefs.putString("url", telemetryUrl);
    pawPrefs.putString("token", deviceToken);
    pawPrefs.putString("profile", DEFAULT_CONFIG_PROFILE);
    return;
  }
  wifiSsid = pawPrefs.getString("ssid", DEFAULT_WIFI_SSID);
  wifiPassword = pawPrefs.getString("pass", DEFAULT_WIFI_PASSWORD);
  telemetryUrl = pawPrefs.getString("url", DEFAULT_PAWTRACE_TELEMETRY_URL);
  deviceToken = pawPrefs.getString("token", DEFAULT_DEVICE_TOKEN);
}

String normalizeTelemetryUrl(String input) {
  input.trim();
  if (!input.length()) return telemetryUrl;
  String lowerInput = input;
  lowerInput.toLowerCase();
  bool cloudHost = lowerInput.indexOf("workers.dev") >= 0 ||
    lowerInput.indexOf("pages.dev") >= 0 ||
    lowerInput.indexOf("pawtrace-api") >= 0;
  if (!startsWithIgnoreCase(input, "http://") && !startsWithIgnoreCase(input, "https://")) {
    input = String(cloudHost ? "https://" : "http://") + input;
  }
  int schemeIndex = input.indexOf("://");
  int hostStart = schemeIndex >= 0 ? schemeIndex + 3 : 0;
  int pathStart = input.indexOf('/', hostStart);
  if (pathStart < 0) {
    String hostPort = input.substring(hostStart);
    bool httpsUrl = startsWithIgnoreCase(input, "https://");
    bool hasPort = hostPort.indexOf(':') >= 0;
    input += (hasPort || httpsUrl || cloudHost) ? "/api/device/telemetry" : ":3000/api/device/telemetry";
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
  return ssid.length() > 0;
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
    ",\"queue_dropped\":" + String(telemetryQueueDropped) +
    ",\"heart_sensor_ready\":" + String(heartSensorReady ? "true" : "false") +
    ",\"heart_i2c_address\":" + String(heartI2cFoundAddress) +
    ",\"heart_configure_attempts\":" + String(heartConfigureAttempts) +
    ",\"gps_serial_ready\":" + String(gpsSerialReady ? "true" : "false") +
    ",\"gps_chars\":" + String(gpsCharsProcessed) + "}");
}

void printSerialHeartbeat(bool force) {
  unsigned long now = millis();
  if (!force && now - lastSerialStatusMs < SERIAL_STATUS_INTERVAL_MS) return;
  lastSerialStatusMs = now;
  Serial.println("{\"alive\":true,\"device_id\":" + jsonString(String(DEVICE_ID)) +
    ",\"firmwareVersion\":" + jsonString(String(FIRMWARE_VERSION)) +
    ",\"wifi_connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") +
    ",\"wifi_ssid\":" + jsonString(wifiSsid) +
    ",\"wifi_ip\":" + jsonString(WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "") +
    ",\"upload_url\":" + jsonString(telemetryUrl) +
    ",\"queue_depth\":" + String(telemetryQueueCount) +
    ",\"upload_code\":" + String(uiUploadCode) +
    ",\"upload_ok\":" + String(uiUploadOk ? "true" : "false") +
    ",\"last_wifi_status\":" + jsonString(lastWifiStatus) + "}");
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

String cloudCommandUrl() {
  String url = telemetryUrl;
  int queryIndex = url.indexOf('?');
  if (queryIndex >= 0) url = url.substring(0, queryIndex);
  int telemetryPath = url.indexOf("/api/device/telemetry");
  if (telemetryPath >= 0) {
    url = url.substring(0, telemetryPath) + "/api/device/command/next";
  } else {
    if (url.endsWith("/")) url.remove(url.length() - 1);
    url += "/api/device/command/next";
  }
  url += "?device_id=" + String(DEVICE_ID);
  return url;
}

String jsonStringField(const String& json, const String& key) {
  String pattern = "\"" + key + "\":";
  int start = json.indexOf(pattern);
  if (start < 0) return "";
  start += pattern.length();
  while (start < (int)json.length() && json.charAt(start) == ' ') start += 1;
  if (start >= (int)json.length() || json.charAt(start) != '"') return "";
  start += 1;
  String value = "";
  bool escaping = false;
  for (int i = start; i < (int)json.length(); i += 1) {
    char c = json.charAt(i);
    if (escaping) {
      if (c == 'n' || c == 'r' || c == 't') {
        if (!value.endsWith(" ")) value += " ";
      } else {
        value += c;
      }
      escaping = false;
      continue;
    }
    if (c == '\\') {
      escaping = true;
      continue;
    }
    if (c == '"') break;
    value += c;
  }
  return value;
}

bool jsonBoolField(const String& json, const String& key) {
  String pattern = "\"" + key + "\":";
  int start = json.indexOf(pattern);
  if (start < 0) return false;
  start += pattern.length();
  while (start < (int)json.length() && json.charAt(start) == ' ') start += 1;
  return json.substring(start, start + 4) == "true";
}

void processCloudCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (telemetryUploadInFlight) return;
  unsigned long now = millis();
  if (now - lastCloudCommandPollMs < CLOUD_COMMAND_POLL_MS) return;
  lastCloudCommandPollMs = now;

  WiFiClient client;
  WiFiClientSecure secureClient;
  HTTPClient http;
  String url = cloudCommandUrl();
  bool useHttps = startsWithIgnoreCase(url, "https://");
  if (useHttps) secureClient.setInsecure();
  bool started = useHttps ? http.begin(secureClient, url) : http.begin(client, url);
  if (!started) return;
  http.setConnectTimeout(HTTP_TIMEOUT_MS);
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.setReuse(false);
  if (deviceToken.length()) http.addHeader("x-device-token", deviceToken);
  http.addHeader("Connection", "close");
  int code = http.GET();
  String response = http.getString();
  http.end();
  if (code < 200 || code >= 300 || !jsonBoolField(response, "command")) return;

  String type = jsonStringField(response, "type");
  String message = sanitizeLanText(jsonStringField(response, "message"), 180);
  cloudCommandSeq += 1;
  if (type == "upload") {
    enqueueTelemetrySample();
    nextUploadAttemptMs = 0;
    drawStatusMaybe("cloud upload", true);
    return;
  }
  if (type == "ping") {
    lastLanMessage = "cloud ping " + String(cloudCommandSeq);
  } else {
    lastLanMessage = message.length() ? message : "cloud message";
  }
  lastUsbMessage = lastLanMessage;
  lanMessageSeq += 1;
  drawStatusMaybe("cloud msg " + String(cloudCommandSeq), true);
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
  if (!telemetryUploadQueue) return telemetryQueueCount > 0;
  telemetryQueueCount = (uint8_t)uxQueueMessagesWaiting(telemetryUploadQueue);
  return telemetryQueueCount > 0 || telemetryUploadInFlight;
}

void refreshTelemetryQueueCount() {
  if (!telemetryUploadQueue) return;
  telemetryQueueCount = (uint8_t)uxQueueMessagesWaiting(telemetryUploadQueue);
}

bool dropQueuedTelemetry() {
  if (!telemetryUploadQueue) return false;
  TelemetryUploadItem dropped;
  bool ok = xQueueReceive(telemetryUploadQueue, &dropped, 0) == pdTRUE;
  refreshTelemetryQueueCount();
  return ok;
}

void enqueueTelemetryItemToFront(const TelemetryUploadItem& item) {
  if (!telemetryUploadQueue) return;
  if (xQueueSendToFront(telemetryUploadQueue, &item, 0) == pdTRUE) {
    refreshTelemetryQueueCount();
    return;
  }
  if (dropQueuedTelemetry()) telemetryQueueDropped += 1;
  xQueueSendToFront(telemetryUploadQueue, &item, 0);
  refreshTelemetryQueueCount();
}

void enqueueTelemetryPayload(const String& payload) {
  if (!telemetryUploadQueue) configureTelemetryUploadTask();
  if (!telemetryUploadQueue) return;

  TelemetryUploadItem item;
  item.packetSeq = uploadSeq;
  payload.toCharArray(item.payload, TELEMETRY_PAYLOAD_MAX);
  item.payload[TELEMETRY_PAYLOAD_MAX - 1] = '\0';

  if (xQueueSend(telemetryUploadQueue, &item, 0) != pdTRUE) {
    if (dropQueuedTelemetry()) telemetryQueueDropped += 1;
    xQueueSend(telemetryUploadQueue, &item, 0);
  }
  refreshTelemetryQueueCount();
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
  String connectSsid = resolveVisibleWifiSsid();
  if (wifiPassword.length()) {
    WiFi.begin(connectSsid.c_str(), wifiPassword.c_str());
  } else {
    WiFi.begin(connectSsid.c_str());
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
  processHeartSensor();
  processGpsSerial();
  String payload = buildTelemetryJson(true);
  enqueueTelemetryPayload(payload);
  unsigned long now = millis();
  if (now - lastQueuedSerialLogMs >= 1000) {
    lastQueuedSerialLogMs = now;
    Serial.println("{\"queued\":true,\"packet_seq\":" + String(uploadSeq) +
      ",\"queue_depth\":" + String(telemetryQueueCount) +
      ",\"queue_dropped\":" + String(telemetryQueueDropped) + "}");
  }
  drawStatusMaybe("queued " + String(telemetryQueueCount));
}

String buildTelemetryJson(bool compact) {
  float accX = 0;
  float accY = 0;
  float accZ = 0;
  M5.IMU.getAccelData(&accX, &accY, &accZ);

  updateMotionFilter(accX, accY, accZ);
  const char* activity = stableActivityLabel();

  updateGpsUi();
  uiBatteryMv = stableBatteryMv(readBatteryMv());
  uiBatteryPct = batteryPercentFromMv(uiBatteryMv);
  uiTempC = readTemperatureC();
  uiActivityScore = uiMovementScore;
  uiActivity = String(activity);
  refreshTelemetryQueueCount();

  int wifiRssi = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;
  int gpsSatsUsed = gps.satellites.isValid() ? gps.satellites.value() : 0;
  int gpsVisible = gpsSatsUsed;
  float gpsHdop = gps.hdop.isValid() ? gps.hdop.hdop() : 0;
  unsigned long gpsAgeMs = gps.location.isValid() ? gps.location.age() : 0;
  bool wifiConnected = WiFi.status() == WL_CONNECTED;
  String wifiIp = wifiConnected ? WiFi.localIP().toString() : "";
  uiGpsSats = gpsSatsUsed;
  uiGpsHdop = gpsHdop;
  uiGpsAgeMs = gpsAgeMs;
  updateSignalQuality(wifiRssi, gpsSatsUsed);

  String json = "{";
  json += "\"device_id\":" + jsonString(String(DEVICE_ID)) + ",";
  json += "\"userId\":" + jsonString(String(USER_ID)) + ",";
  json += "\"source\":\"m5stickc-plus-wifi\",";
  json += "\"transport\":\"wifi\",";
  json += "\"firmwareVersion\":" + jsonString(String(FIRMWARE_VERSION)) + ",";
  json += "\"board\":\"m5stickc-plus-1.1\",";
  json += "\"packet_seq\":" + String(uploadSeq) + ",";
  json += "\"seq\":" + String(uploadSeq) + ",";
  json += "\"uptime_ms\":" + String(millis()) + ",";
  json += "\"battery_pct\":" + String(uiBatteryPct) + ",";
  json += "\"battery_mv\":" + String(uiBatteryMv) + ",";
  json += "\"gps_fix\":" + String(uiGpsFix) + ",";
  json += "\"gps_sats_used\":" + String(gpsSatsUsed) + ",";
  json += "\"gps_visible\":" + String(gpsVisible) + ",";
  json += "\"gps_hdop\":" + String(gpsHdop, 1) + ",";
  json += "\"gps_age_ms\":" + String(gpsAgeMs) + ",";
  if (uiLocationValid) {
    json += "\"lat\":" + String(uiLat, 6) + ",";
    json += "\"lon\":" + String(uiLon, 6) + ",";
  } else {
    json += "\"lat\":null,";
    json += "\"lon\":null,";
  }
  json += "\"location_valid\":" + String(uiLocationValid ? "true" : "false") + ",";
  json += "\"last_location_valid\":" + String(uiLocationValid ? "true" : "false") + ",";
  json += "\"track_samples\":" + String(uploadSeq) + ",";
  json += "\"geofence_enabled\":true,";
  json += "\"distance_m\":0.0,";
  json += "\"lost_alert\":" + String(M5.BtnA.isPressed() ? "true" : "false") + ",";
  json += "\"heart_found\":" + String(hasValidHeartRate() ? "true" : "false") + ",";
  json += "\"finger\":" + String(heartFingerDetected ? "true" : "false") + ",";
  json += "\"pet_bpm\":" + nullableIntJson(hasValidHeartRate(), uiBpm) + ",";
  json += "\"spo2\":" + nullableIntJson(uiSpo2Valid, uiSpo2) + ",";
  json += "\"spo2_valid\":" + String(uiSpo2Valid ? "true" : "false") + ",";
  json += "\"temp_c\":null,";
  json += "\"temperature_valid\":false,";
  json += "\"board_temp_c\":" + String(uiTempC, 1) + ",";
  json += "\"activity\":" + jsonString(String(activity)) + ",";
  json += "\"activity_score\":" + String(uiActivityScore, 2) + ",";
  json += "\"activity_confidence\":" + String(uiActivityConfidence, 2) + ",";
  json += "\"accelPeak\":" + String(uiMovementScore, 2) + ",";
  json += "\"filtered_accel_magnitude_g\":" + String(uiAccelMagnitude, 2) + ",";
  json += "\"signal_quality\":" + String(uiSignalQuality, 2) + ",";
  json += "\"sample_interval_ms\":" + String(UPLOAD_INTERVAL_MS) + ",";
  json += "\"wifi_connected\":" + String(wifiConnected ? "true" : "false") + ",";
  json += "\"wifi_rssi\":" + String(wifiRssi) + ",";
  json += "\"wifi_ip\":" + jsonString(wifiIp) + ",";
  json += "\"queue_depth\":" + String(telemetryQueueCount) + ",";
  json += "\"queue_capacity\":" + String(TELEMETRY_QUEUE_CAPACITY) + ",";
  json += "\"queue_dropped\":" + String(telemetryQueueDropped) + ",";
  json += "\"upload_attempt_seq\":" + String(uploadAttemptSeq) + ",";
  json += "\"http_fail_count\":" + String(httpFailCount) + ",";
  json += "\"upload_enabled\":true,";
  json += "\"upload_ok\":" + String(uiUploadOk ? "true" : "false") + ",";
  json += "\"upload_code\":" + String(uiUploadCode);

  if (!compact) {
    json += ",";
    json += "\"gps_chars\":" + String(gpsCharsProcessed) + ",";
    json += "\"gps_sentences_with_fix\":" + String(gpsSentencesWithFix) + ",";
    json += "\"heart_sensor_ready\":" + String(heartSensorReady ? "true" : "false") + ",";
    json += "\"heart_i2c_address\":" + String(heartI2cFoundAddress) + ",";
    json += "\"heart_configure_attempts\":" + String(heartConfigureAttempts) + ",";
    json += "\"heart_beat_found\":" + String(heartBeatFound ? "true" : "false") + ",";
    json += "\"ir\":" + String(heartIrValue) + ",";
    json += "\"red\":" + String(heartRedValue) + ",";
    json += "\"temperature_source\":\"not_installed\",";
    json += "\"movement_score\":" + String(uiMovementScore, 2) + ",";
    json += "\"accel_magnitude_g\":" + String(uiAccelMagnitude, 2) + ",";
    json += "\"wifi_ssid\":" + jsonString(wifiSsid) + ",";
    json += "\"wifi_retry_count\":" + String(wifiRetryCount) + ",";
    json += "\"lan_server_enabled\":" + String(lanServerStarted ? "true" : "false") + ",";
    json += "\"lan_server_port\":" + String(LAN_SERVER_PORT) + ",";
    json += "\"lan_base_url\":" + jsonString(lanBaseUrl()) + ",";
    json += "\"lan_message_seq\":" + String(lanMessageSeq) + ",";
    json += "\"lan_last_message\":" + jsonString(lastLanMessage) + ",";
    json += "\"upload_url\":" + jsonString(telemetryUrl) + ",";
    json += "\"token_set\":" + String(deviceToken.length() ? "true" : "false") + ",";
    json += "\"gpsModule\":\"M5Stack GPS v1.1 UART\",";
    json += "\"heartRateHat\":\"MAX30102 Heart Rate HAT\"";
  }
  json += "}";
  return json;
}

bool isHttpSuccess(int code) {
  return code >= 200 && code < 300;
}

bool responseConfirmsTelemetrySuccess(int code, const String& response) {
  if (!isHttpSuccess(code)) return false;
  if (code == 204) return true;
  return response.indexOf("\"success\":true") >= 0 ||
    response.indexOf("\"ok\":true") >= 0 ||
    response.indexOf("\"queued\":true") >= 0;
}

bool isPermanentHttpError(int code) {
  return code == 400 || code == 401 || code == 403 || code == 404 || code == 413 || code == 422;
}

bool postTelemetryPayload(const char* payload) {
  WiFiClient client;
  WiFiClientSecure secureClient;
  HTTPClient http;
  uploadAttemptSeq += 1;
  lastHttpAttemptMs = millis();
  unsigned long attemptStartedMs = lastHttpAttemptMs;

  bool useHttps = startsWithIgnoreCase(telemetryUrl, "https://");
  if (useHttps) {
    secureClient.setInsecure();
  }
  bool started = useHttps ? http.begin(secureClient, telemetryUrl) : http.begin(client, telemetryUrl);
  if (!started) {
    uiUploadCode = -998;
    uiUploadOk = false;
    uiLastUploadDurationMs = millis() - attemptStartedMs;
    uploadFailCountTotal += 1;
    lastUploadFailureMs = millis();
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
  http.addHeader("x-device-response", "compact");
  http.addHeader("Connection", "close");

  int code = http.POST((uint8_t*)payload, strlen(payload));
  String response = http.getString();
  bool ok = responseConfirmsTelemetrySuccess(code, response);
  http.end();

  uiUploadCode = code;
  uiUploadOk = ok;
  uiLastUploadDurationMs = millis() - attemptStartedMs;
  if (ok) {
    uploadOkCount += 1;
    lastUploadSuccessMs = millis();
  } else {
    uploadFailCountTotal += 1;
    lastUploadFailureMs = millis();
  }
  lastServerResponse = response.substring(0, 80);
  if (SERIAL_LOG_UPLOAD_PAYLOAD) {
    Serial.println(payload);
  }
  Serial.println("{\"upload_attempt\":" + String(uploadAttemptSeq) +
    ",\"upload_code\":" + String(code) +
    ",\"upload_ok\":" + String(uiUploadOk ? "true" : "false") +
    ",\"queue_depth\":" + String(telemetryQueueCount) + "}");
  return uiUploadOk;
}

void processUploadQueue() {
  configureTelemetryUploadTask();
  refreshTelemetryQueueCount();
  if (telemetryQueueCount > TELEMETRY_QUEUE_CAPACITY / 2) {
    drawStatusMaybe("sending queue " + String(telemetryQueueCount));
  }
}

void uploadTelemetry() {
  enqueueTelemetrySample();
  processWifiState();
  processUploadQueue();
}

void configureTelemetryUploadTask() {
  if (!telemetryUploadQueue) {
    telemetryUploadQueue = xQueueCreate(TELEMETRY_QUEUE_CAPACITY, sizeof(TelemetryUploadItem));
    refreshTelemetryQueueCount();
  }
  if (!telemetryUploadTaskStarted && telemetryUploadQueue) {
    BaseType_t ok = xTaskCreatePinnedToCore(
      telemetryUploadTask,
      "pawtrace-upload",
      12288,
      nullptr,
      1,
      &telemetryUploadTaskHandle,
      0
    );
    telemetryUploadTaskStarted = ok == pdPASS;
    if (!telemetryUploadTaskStarted) {
      lastServerResponse = "upload task failed";
      uiUploadCode = -997;
      uiUploadOk = false;
    }
  }
}

void telemetryUploadTask(void* parameter) {
  TelemetryUploadItem item;
  TelemetryUploadItem batchItems[TELEMETRY_UPLOAD_BATCH_MAX];
  for (;;) {
    if (!telemetryUploadQueue || xQueueReceive(telemetryUploadQueue, &item, pdMS_TO_TICKS(250)) != pdTRUE) {
      telemetryUploadInFlight = false;
      refreshTelemetryQueueCount();
      vTaskDelay(pdMS_TO_TICKS(10));
      continue;
    }

    refreshTelemetryQueueCount();
    telemetryUploadInFlight = true;
    batchItems[0] = item;
    uint8_t batchCount = 1;
    while (batchCount < TELEMETRY_UPLOAD_BATCH_MAX && xQueueReceive(telemetryUploadQueue, &batchItems[batchCount], 0) == pdTRUE) {
      batchCount += 1;
    }
    refreshTelemetryQueueCount();

    while (WiFi.status() != WL_CONNECTED) {
      uiUploadOk = false;
      uiUploadCode = -1;
      lastServerResponse = "wifi offline";
      telemetryUploadInFlight = false;
      for (int i = batchCount - 1; i >= 0; i -= 1) {
        enqueueTelemetryItemToFront(batchItems[i]);
      }
      vTaskDelay(pdMS_TO_TICKS(250));
      break;
    }
    if (WiFi.status() != WL_CONNECTED) {
      continue;
    }

    unsigned long now = millis();
    if (now < nextUploadAttemptMs) {
      vTaskDelay(pdMS_TO_TICKS(nextUploadAttemptMs - now));
    }
    now = millis();
    if (now - lastHttpAttemptMs < HTTP_MIN_GAP_MS) {
      vTaskDelay(pdMS_TO_TICKS(HTTP_MIN_GAP_MS - (now - lastHttpAttemptMs)));
    }

    String uploadPayload = "";
    if (batchCount == 1) {
      uploadPayload = String(batchItems[0].payload);
    } else {
      uploadPayload.reserve((TELEMETRY_PAYLOAD_MAX * batchCount) + 24);
      uploadPayload = "{\"samples\":[";
      for (uint8_t i = 0; i < batchCount; i += 1) {
        if (i > 0) uploadPayload += ",";
        uploadPayload += String(batchItems[i].payload);
      }
      uploadPayload += "]}";
    }

    bool ok = postTelemetryPayload(uploadPayload.c_str());
    refreshTelemetryQueueCount();

    if (ok) {
      httpFailCount = 0;
      nextUploadAttemptMs = millis() + HTTP_MIN_GAP_MS;
      telemetryUploadInFlight = false;
      continue;
    }

    telemetryUploadInFlight = false;
    if (isPermanentHttpError(uiUploadCode)) {
      nextUploadAttemptMs = millis() + 1200;
      continue;
    }

    if (httpFailCount < 6) httpFailCount += 1;
    nextUploadAttemptMs = millis() + retryDelayMs(httpFailCount, 350, 3000);
    for (int i = batchCount - 1; i >= 0; i -= 1) {
      enqueueTelemetryItemToFront(batchItems[i]);
    }
  }
}

void setup() {
  M5.begin();
  Serial.begin(115200);
  delay(200);
  Serial.println("{\"boot\":true,\"stage\":\"serial\",\"device_id\":\"" + String(DEVICE_ID) +
    "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\"}");
  M5.IMU.Init();
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  configureUiCanvas();
  drawBootAnimation();
  configureHeartSensor();
  configureGps();
  loadDeviceConfig();
  drawStatusDashboard("booting WiFi");
  Serial.println("{\"ready\":true,\"device_id\":\"" + String(DEVICE_ID) +
    "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) +
    "\",\"transport\":\"usb-serial\",\"wifi_ssid\":" + jsonString(wifiSsid) +
    ",\"upload_url\":" + jsonString(telemetryUrl) +
    ",\"lan_server_port\":" + String(LAN_SERVER_PORT) + "}");
  configureTelemetryUploadTask();
  configureWifiRadio();
  configureLanServer();
  startWifiConnect(true);
  lastUploadMs = millis();
  enqueueTelemetrySample();
  printSerialHeartbeat(true);
}

void loop() {
  M5.update();
  handleUiButtons();
  processHeartSensor();
  processGpsSerial();
  handleUsbSerial();
  processWifiState();
  processLanServer();
  processCloudCommands();
  if (millis() - lastUploadMs >= UPLOAD_INTERVAL_MS) {
    lastUploadMs = millis();
    enqueueTelemetrySample();
  } else {
    drawStatusMaybe(WiFi.status() == WL_CONNECTED ? gpsLabel() : lastWifiStatus);
  }
  processUploadQueue();
  printSerialHeartbeat();
  delay(LOOP_DELAY_MS);
}
