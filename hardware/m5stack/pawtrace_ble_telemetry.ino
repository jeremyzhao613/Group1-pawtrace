#include <M5StickCPlus.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <string>
#include <math.h>

// PawTrace BLE GATT contract.
// Web/phone app:
// 1. scan "PawTrace-001"
// 2. connect to SERVICE_UUID
// 3. subscribe to TELEMETRY_UUID and POST each JSON notify payload to /api/device/telemetry
// 4. write short UTF-8 text or JSON messages to MESSAGE_UUID
#define DEVICE_NAME "PawTrace-001"
#define DEVICE_ID "pawtrace_001"
#define FIRMWARE_VERSION "9.0.0-m5-ui"
#define SERVICE_UUID "7b9f0001-6f3a-4f8a-9f4d-111111111111"
#define TELEMETRY_UUID "7b9f0002-6f3a-4f8a-9f4d-222222222222"
#define MESSAGE_UUID "7b9f0003-6f3a-4f8a-9f4d-333333333333"

BLECharacteristic* telemetryChar = nullptr;
BLECharacteristic* messageChar = nullptr;
bool deviceConnected = false;
uint32_t notifySeq = 0;
uint32_t messageSeq = 0;
unsigned long lastNotifyMs = 0;
unsigned long lastMessageMs = 0;
const unsigned long NOTIFY_INTERVAL_MS = 2000;
String lastBleMessage = "";
String usbLine = "";
int uiBatteryPct = 82;
int uiBatteryMv = 0;
int uiBpm = 92;
int uiSpo2 = 0;
bool uiSpo2Valid = false;
float uiTempC = 0;
float uiLat = 31.298300;
float uiLon = 120.585300;
bool uiLocationValid = true;
int uiGpsFix = 1;
bool uiLostAlert = false;
float uiActivityScore = 0;
String uiActivity = "REST";

String buildTelemetryJson();
void processIncomingMessage(String incoming, const char* transport);

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* server) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* server) {
    deviceConnected = false;
    server->getAdvertising()->start();
  }
};

class MessageCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) {
    String incoming = characteristic->getValue();
    processIncomingMessage(incoming, "ble");
  }
};

String jsonBool(bool value) {
  return value ? "true" : "false";
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

uint16_t uiColor(uint8_t r, uint8_t g, uint8_t b) {
  return M5.Lcd.color565(r, g, b);
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
  if (!uiLocationValid || uiGpsFix <= 0) return "NO FIX";
  return String(uiLat, 2) + "," + String(uiLon, 2);
}

void drawStatusDashboard(const String& subtitle) {
  drawAppBackground();
  M5.Lcd.fillRoundRect(5, 5, 230, 124, 14, uiColor(255, 252, 248));
  M5.Lcd.drawRoundRect(5, 5, 230, 124, 14, uiColor(255, 255, 255));

  drawPawMark(15, 13, uiColor(153, 205, 216));
  drawText(38, 13, "PawTrace", uiColor(31, 59, 66), 18);
  drawText(38, 25, "Health Monitor", uiColor(100, 119, 130), 20);
  drawPill(172, 13, 52, deviceConnected ? "BLE ON" : "PAIR", deviceConnected);

  M5.Lcd.fillRoundRect(14, 39, 212, 27, 9, uiColor(245, 251, 252));
  M5.Lcd.fillCircle(27, 52, 8, uiColor(225, 241, 245));
  M5.Lcd.fillCircle(27, 52, 4, uiColor(31, 84, 96));
  drawText(42, 43, deviceConnected ? "Connected" : "Advertising", uiColor(31, 59, 66), 18);
  drawText(42, 55, subtitle, uiColor(100, 119, 130), 28);
  drawText(183, 52, "seq " + String(notifySeq), uiColor(123, 144, 152), 8);

  drawMetricCard(14, 73, 50, "BPM", String(uiBpm), uiColor(153, 205, 216));
  drawMetricCard(68, 73, 50, "GPS", uiGpsFix > 0 ? "FIX " + String(uiGpsFix) : "NO", uiColor(111, 181, 194));
  drawMetricCard(122, 73, 50, "ACT", uiActivity, uiColor(153, 205, 216));
  drawMetricCard(176, 73, 50, "BAT", String(uiBatteryPct) + "%", uiColor(111, 181, 194));
  drawBottomNav();
}

int batteryPercentFromMv(int mv) {
  if (mv <= 0) return 82;
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
  return isfinite(temp) ? temp : 0;
}

void processIncomingMessage(String incoming, const char* transport) {
  incoming.trim();
  if (!incoming.length()) return;
  if (incoming.length() > 160) {
    incoming = incoming.substring(0, 160);
  }

  lastBleMessage = incoming;
  lastMessageMs = millis();
  messageSeq += 1;

  String ack = "{\"ok\":true,\"transport\":\"" + String(transport) + "\",\"message_seq\":" + String(messageSeq) + "}";
  if (messageChar) {
    messageChar->setValue(ack.c_str());
  }
  Serial.println(ack);
}

void handleUsbSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\r' || c == '\n') {
      String command = usbLine;
      usbLine = "";
      command.trim();
      if (command.equalsIgnoreCase("PING")) {
        Serial.println("{\"ok\":true,\"reply\":\"PONG\",\"device_id\":\"" + String(DEVICE_ID) + "\",\"transport\":\"usb-serial\"}");
      } else if (command.equalsIgnoreCase("STATUS")) {
        Serial.println(buildTelemetryJson());
      } else {
        processIncomingMessage(command, "usb-serial");
      }
    } else if (usbLine.length() < 180) {
      usbLine += c;
    }
  }
}

String buildTelemetryJson() {
  float accX = 0;
  float accY = 0;
  float accZ = 0;
  M5.IMU.getAccelData(&accX, &accY, &accZ);
  float accelPeak = fmaxf(fabsf(accX), fmaxf(fabsf(accY), fabsf(accZ)));
  const char* activity = accelPeak > 1.8 ? "RUN" : (accelPeak > 1.15 ? "WALK" : "REST");

  // Replace these demo values with GPS v1.1 and Heart Rate HAT readings.
  uiBatteryMv = readBatteryMv();
  uiBatteryPct = batteryPercentFromMv(uiBatteryMv);
  uiBpm = 92;
  uiSpo2 = 0;
  uiSpo2Valid = false;
  uiTempC = readTemperatureC();
  uiLat = 31.298300;
  uiLon = 120.585300;
  uiLocationValid = true;
  uiGpsFix = 1;
  uiLostAlert = M5.BtnA.isPressed();
  uiActivityScore = accelPeak;
  uiActivity = String(activity);

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"source\":\"m5stickc-plus-ble\",";
  json += "\"transport\":\"ble\",";
  json += "\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\",";
  json += "\"board\":\"m5stickc-plus-1.1\",";
  json += "\"battery_pct\":" + String(uiBatteryPct) + ",";
  json += "\"battery_mv\":" + String(uiBatteryMv) + ",";
  json += "\"pet_bpm\":" + String(uiBpm) + ",";
  json += "\"spo2\":" + String(uiSpo2) + ",";
  json += "\"spo2_valid\":" + jsonBool(uiSpo2Valid) + ",";
  json += "\"temp_c\":" + String(uiTempC, 1) + ",";
  json += "\"lat\":" + String(uiLat, 6) + ",";
  json += "\"lon\":" + String(uiLon, 6) + ",";
  json += "\"location_valid\":" + jsonBool(uiLocationValid) + ",";
  json += "\"last_location_valid\":" + jsonBool(uiLocationValid) + ",";
  json += "\"gps_fix\":" + String(uiGpsFix) + ",";
  json += "\"gps_sats_used\":8,";
  json += "\"gps_visible\":12,";
  json += "\"gps_hdop\":1.2,";
  json += "\"track_samples\":" + String(notifySeq) + ",";
  json += "\"geofence_enabled\":true,";
  json += "\"distance_m\":0.0,";
  json += "\"lost_alert\":" + jsonBool(uiLostAlert) + ",";
  json += "\"heart_found\":true,";
  json += "\"finger\":false,";
  json += "\"activity\":\"" + String(activity) + "\",";
  json += "\"activity_score\":" + String(accelPeak, 2) + ",";
  json += "\"accelPeak\":" + String(accelPeak, 2) + ",";
  json += "\"ble_connected\":" + jsonBool(deviceConnected) + ",";
  json += "\"ble_service_uuid\":\"" + String(SERVICE_UUID) + "\",";
  json += "\"ble_telemetry_uuid\":\"" + String(TELEMETRY_UUID) + "\",";
  json += "\"ble_message_uuid\":\"" + String(MESSAGE_UUID) + "\",";
  json += "\"ble_last_message\":" + jsonString(lastBleMessage) + ",";
  json += "\"ble_message_seq\":" + String(messageSeq) + ",";
  json += "\"ble_message_age_ms\":" + String(lastMessageMs ? millis() - lastMessageMs : 0) + ",";
  json += "\"wifi_connected\":false,";
  json += "\"wifi_rssi\":0,";
  json += "\"upload_enabled\":false,";
  json += "\"upload_ok\":false,";
  json += "\"upload_code\":0,";
  json += "\"usb_serial\":true,";
  json += "\"notify_seq\":" + String(notifySeq);
  json += "}";
  return json;
}

void drawStatus(const String& payload) {
  String subtitle = lastBleMessage.length()
    ? "msg " + lastBleMessage.substring(0, 18)
    : gpsLabel();
  drawStatusDashboard(subtitle);
}

void setup() {
  M5.begin();
  M5.IMU.Init();
  Serial.begin(115200);
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  drawStatusDashboard("booting BLE bridge");
  Serial.println("{\"ready\":true,\"device_id\":\"" + String(DEVICE_ID) + "\",\"firmwareVersion\":\"" + String(FIRMWARE_VERSION) + "\",\"transport\":\"usb-serial\"}");

  BLEDevice::init(DEVICE_NAME);
  BLEDevice::setMTU(512);
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  BLEService* service = server->createService(SERVICE_UUID);
  telemetryChar = service->createCharacteristic(
    TELEMETRY_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  telemetryChar->addDescriptor(new BLE2902());
  telemetryChar->setValue(buildTelemetryJson().c_str());

  messageChar = service->createCharacteristic(
    MESSAGE_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_WRITE_NR
  );
  messageChar->setCallbacks(new MessageCallbacks());
  messageChar->setValue("{\"ready\":true}");

  service->start();
  BLEAdvertising* advertising = server->getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->start();

  drawStatusDashboard("advertising");
}

void loop() {
  M5.update();
  handleUsbSerial();
  if (millis() - lastNotifyMs < NOTIFY_INTERVAL_MS) {
    delay(20);
    return;
  }

  lastNotifyMs = millis();
  notifySeq += 1;
  String payload = buildTelemetryJson();
  telemetryChar->setValue(payload.c_str());

  if (deviceConnected) {
    telemetryChar->notify();
  }

  Serial.println(payload);
  drawStatus(payload);
}
