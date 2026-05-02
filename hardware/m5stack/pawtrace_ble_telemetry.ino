#include <M5StickCPlus.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <string>

// PawTrace BLE GATT contract.
// Web/phone app:
// 1. scan "PawTrace-001"
// 2. connect to SERVICE_UUID
// 3. subscribe to TELEMETRY_UUID and POST each JSON notify payload to /api/device/telemetry
// 4. write short UTF-8 text or JSON messages to MESSAGE_UUID
#define DEVICE_NAME "PawTrace-001"
#define DEVICE_ID "pawtrace_001"
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
    std::string value = characteristic->getValue();
    String incoming = String(value.c_str());
    incoming.trim();
    if (incoming.length() > 160) {
      incoming = incoming.substring(0, 160);
    }
    lastBleMessage = incoming;
    lastMessageMs = millis();
    messageSeq += 1;
    if (messageChar) {
      String ack = "{\"ok\":true,\"message_seq\":" + String(messageSeq) + "}";
      messageChar->setValue(ack.c_str());
    }
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

String buildTelemetryJson() {
  float accX = 0;
  float accY = 0;
  float accZ = 0;
  M5.IMU.getAccelData(&accX, &accY, &accZ);
  float accelPeak = max(abs(accX), max(abs(accY), abs(accZ)));
  const char* activity = accelPeak > 1.8 ? "RUN" : (accelPeak > 1.15 ? "WALK" : "REST");

  // Replace these demo values with GPS v1.1 and Heart Rate HAT readings.
  int batteryPct = 82;
  int bpm = 92;
  float lat = 31.298300;
  float lon = 120.585300;
  bool locationValid = true;
  int gpsFix = 1;
  bool lostAlert = M5.BtnA.isPressed();

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"source\":\"m5stickc-plus-ble\",";
  json += "\"transport\":\"ble\",";
  json += "\"battery_pct\":" + String(batteryPct) + ",";
  json += "\"pet_bpm\":" + String(bpm) + ",";
  json += "\"lat\":" + String(lat, 6) + ",";
  json += "\"lon\":" + String(lon, 6) + ",";
  json += "\"location_valid\":" + jsonBool(locationValid) + ",";
  json += "\"gps_fix\":" + String(gpsFix) + ",";
  json += "\"lost_alert\":" + jsonBool(lostAlert) + ",";
  json += "\"activity\":\"" + String(activity) + "\",";
  json += "\"activity_score\":" + String(accelPeak, 2) + ",";
  json += "\"ble_connected\":" + jsonBool(deviceConnected) + ",";
  json += "\"ble_service_uuid\":\"" + String(SERVICE_UUID) + "\",";
  json += "\"ble_telemetry_uuid\":\"" + String(TELEMETRY_UUID) + "\",";
  json += "\"ble_message_uuid\":\"" + String(MESSAGE_UUID) + "\",";
  json += "\"ble_last_message\":" + jsonString(lastBleMessage) + ",";
  json += "\"ble_message_seq\":" + String(messageSeq) + ",";
  json += "\"ble_message_age_ms\":" + String(lastMessageMs ? millis() - lastMessageMs : 0) + ",";
  json += "\"notify_seq\":" + String(notifySeq);
  json += "}";
  return json;
}

void drawStatus(const String& payload) {
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setCursor(0, 0);
  M5.Lcd.println("PawTrace BLE");
  M5.Lcd.println(deviceConnected ? "Central connected" : "Advertising...");
  M5.Lcd.printf("Seq %lu\n", (unsigned long)notifySeq);
  if (lastBleMessage.length()) {
    M5.Lcd.print("Msg: ");
    M5.Lcd.println(lastBleMessage.substring(0, 40));
  }
  M5.Lcd.println(payload.substring(0, 120));
}

void setup() {
  M5.begin();
  M5.IMU.Init();
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextSize(1);
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.println("PawTrace BLE");

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

  M5.Lcd.println("Advertising...");
}

void loop() {
  M5.update();
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

  drawStatus(payload);
}
