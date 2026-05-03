# PawTrace M5Stack Telemetry Integration

## Prototype Positioning

M5StickC Plus 1.1 is a good controller for a smart pet vest prototype, not the final production hardware. It gives the project Wi-Fi, a 6-axis IMU, LCD, buzzer, RTC, buttons, Grove expansion, and HAT support, which is enough to validate the sensing and cloud-sync workflow quickly. Its built-in battery is only 120mAh, so long-wear use needs an external battery, lower upload frequency, and sleep-mode strategy.

Recommended project definition:

```text
We developed a prototype smart pet vest based on M5StickC Plus.
The system integrates GPS-based location tracking, IMU-based activity monitoring,
and a proof-of-concept heart-rate sensing module. Sensor data is transmitted to
the PawTrace software platform through Wi-Fi, enabling real-time visualization
of pet location, movement status, and preliminary physiological signals.
```

## Data Path

```text
GPS v1.1 + Heart Rate HAT + IMU
  -> M5StickC Plus 1.1
  -> Wi-Fi HTTP POST JSON
  -> PawTrace backend /api/device/telemetry
  -> PostgreSQL HealthMeasurement / LocationPoint / LastLocation + temporary latest cache
  -> Frontend fetch /api/device/telemetry/latest
  -> Map, Health Monitoring, and Pet Cards
```

BLE is now provisioning-only. It sends the Wi-Fi SSID, password, backend upload URL, and optional device token to the M5. Sensor data itself must use Wi-Fi:

```text
GPS v1.1 + Heart Rate HAT + IMU
  -> M5StickC Plus Wi-Fi station
  -> same hotspot / LAN
  -> HTTP POST /api/device/telemetry
  -> PostgreSQL + latest cache + frontend polling
```

Use this split:

| Link | Role | Use |
| --- | --- | --- |
| Wi-Fi HTTP | only telemetry upload path | live map, last known location, geofence alert, history |
| Wi-Fi LAN API | same-network direct access | phone/laptop reads M5 status, sends simple messages, triggers upload |
| BLE | Wi-Fi provisioning only | send SSID/password/backend URL so the M5 can join Wi-Fi |

## MVP Scope

| Priority | Function | Recommendation |
| --- | --- | --- |
| P0 | GPS location upload | Required |
| P0 | Latest location in PawTrace | Required |
| P1 | IMU activity recognition | Strongly recommended |
| P1 | Battery and connection status | Recommended |
| P2 | Heart-rate raw signal capture | Good for prototype |
| P2 | Heart-rate trend | Use with clear accuracy limitations |
| P3 | Buzzer or LED alert | Optional |
| P3 | Medical diagnosis | Do not claim at this stage |

The strongest MVP is:

```text
GPS tracking + activity state + heart-rate prototype + PawTrace visualization
```

## Hardware Layout

```text
Pet vest back
├── M5StickC Plus controller
├── GPS v1.1 module, facing upward
├── External battery pack
└── Cable strain relief

Pet vest chest/side contact area
└── Heart Rate HAT / PPG sensor contact point
```

Recommended placement:

| Part | Position | Reason |
| --- | --- | --- |
| M5StickC Plus | Center back | Easier to fix, less movement interference |
| GPS v1.1 | Back, facing upward | Better GNSS reception |
| Heart Rate HAT | Stable skin-contact area | PPG requires steady optical contact |
| Battery | Back or side | Balances weight and improves runtime |
| LCD | Facing outward | Useful for demo status |

## Sensing Modules

### Smart Location Tracking

GPS v1.1 provides the core location signal for:

- real-time location upload
- last known location
- route recording
- geofence alerts
- PawTrace map display

### Activity and Motion Pattern Monitoring

M5StickC Plus IMU data can classify prototype states:

| State | Typical signal |
| --- | --- |
| still | low acceleration variance |
| walking | periodic medium movement |
| running | higher-frequency and higher-amplitude movement |
| abnormal shaking | short high-frequency bursts |
| impact | sudden acceleration peak |

### Physiological Signal Prototype

Heart Rate HAT is useful as a proof-of-concept physiological sensing interface, but it should not be described as reliable pet heart-rate measurement yet. Pet fur, motion artifacts, and unstable contact pressure make the signal harder than finger-based demos.

Use this report wording:

```text
The MAX30102 heart-rate module is used as a proof-of-concept physiological sensing interface.
For real pet deployment, further mechanical contact design, fur-interference reduction,
motion-artifact filtering, and validation against veterinary-grade sensors are required.
```

## Backend Configuration

Set a device ingest token in `backend/.env`:

```env
DEVICE_INGEST_TOKEN="pawtrace-m5-dev-token"
DEVICE_INGEST_ALLOW_LAN=true
```

The M5StickC must send this token as either:

```http
x-device-token: replace-with-a-shared-device-token
```

or:

```http
Authorization: Bearer replace-with-a-shared-device-token
```

For hotspot demos, `DEVICE_INGEST_ALLOW_LAN=true` lets private-network clients such as `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, and localhost upload without a token. Keep using `DEVICE_INGEST_TOKEN` for any network you do not fully control.

For local testing, the backend runs on port `3000`. From the M5StickC, use the computer LAN IP, not `localhost`:

```text
http://192.168.31.199:3000/api/device/telemetry
```

The included Arduino example is:

```text
hardware/m5stack/pawtrace_wifi_telemetry.ino
```

Flash the sketch once, then set the hotspot, backend host, and token over USB serial. The values are stored in ESP32 Preferences, so changing Wi-Fi networks or a Mac LAN IP does not require editing and reflashing the sketch.

For same-network demos, put the Mac, phone, browser, and M5Stick on the same Wi-Fi or phone hotspot. Start the backend on all network interfaces:

```bash
HOST=0.0.0.0 PORT=3000 DEVICE_INGEST_ALLOW_LAN=true npm --prefix backend start
```

Find the Mac LAN IP, then point the M5Stick at that IP:

```bash
ipconfig getifaddr en0
```

Example serial setup:

```text
WIFI MyHotspot|MyPassword
HOST 192.168.31.199
TOKEN pawtrace-m5-dev-token
CONFIG
```

`HOST 192.168.31.199` expands to `http://192.168.31.199:3000/api/device/telemetry`. Use `URL http://<host>:<port>/api/device/telemetry` if you need a custom path or port.

For a mobile hotspot demo, keep the backend bound to `0.0.0.0:3000` and use the Mac hotspot/LAN IP. The Wi-Fi firmware keeps radio sleep off, auto-reconnects to the same SSID, queues up to 24 telemetry packets while the hotspot drops, and flushes the queue after HTTP recovers.

The 3001 glass dashboard is also LAN-ready. Start it after the backend:

```bash
npm run dev:glass
```

Then open the dashboard from the same Wi-Fi or phone hotspot:

```text
http://192.168.31.199:3001/
```

The 3001 Vite server listens on `0.0.0.0`, allows same-network hosts, and proxies `/api` to the backend on port `3000`, so the page reads the same Wi-Fi telemetry that the M5Stick uploads.

USB serial commands for hotspot testing:

```text
CONFIG                  print saved Wi-Fi/backend/token state
STATUS                  print current telemetry JSON
QUEUE                   print queued packet count and dropped count
SCAN                    list visible Wi-Fi hotspots
LAN                     print M5 same-network HTTP base URL
WIFI                    force Wi-Fi reconnect to the configured hotspot
WIFI ssid|password      save hotspot credentials and reconnect
HOST 192.168.31.199     save backend host on the same network
URL http://host:3000/... save full upload URL
TOKEN shared-token      save ingest token
UPLOAD                  queue and immediately try one upload
```

After Wi-Fi connects, the M5 also exposes a small same-network HTTP API on port `8080`:

```text
GET  http://<m5-ip>:8080/status     live telemetry JSON
GET  http://<m5-ip>:8080/telemetry  alias of /status
POST http://<m5-ip>:8080/message    send a text or JSON message to the M5 display/status state
POST http://<m5-ip>:8080/upload     queue one telemetry sample and try to POST it to PawTrace
```

The M5 LAN API sends `Access-Control-Allow-Origin: *`, so a phone or laptop browser on the same hotspot can read/write those endpoints directly during the demo.

## Telemetry Payload

Minimum useful payload:

```json
{
  "deviceId": "pawtrace-vest-001",
  "userId": "demo",
  "timestamp": "2026-04-30T10:00:00.000Z",
  "lat": 31.48303,
  "lon": 121.15569,
  "gpsValid": true,
  "heartRateBpm": 92,
  "ir": 238000,
  "red": 185000,
  "activityState": "walking",
  "batteryPct": 76,
  "steps": 123,
  "accelPeak": 1.9
}
```

Optional display mapping:

```json
{
  "petId": "pet-123",
  "tagId": "collar-001",
  "mapCoords": { "x": 50, "y": 69 }
}
```

If `petId` is omitted, the frontend attaches the latest telemetry to an existing local pet. If there are no pets, it creates a tracked pet named from the M5Stack device ID.

Actual M5StickC Plus snake_case packet supported by the backend:

```json
{
  "device_id": "m5stickc-plus-1-1",
  "battery_pct": 100,
  "battery_mv": 4193,
  "gps_fix": 0,
  "gps_sats_used": 0,
  "gps_visible": 16,
  "gps_hdop": 25.5,
  "lat": 0.0,
  "lon": 0.0,
  "location_valid": false,
  "last_location_valid": false,
  "track_samples": 0,
  "geofence_enabled": false,
  "distance_m": -1.0,
  "lost_alert": false,
  "heart_found": true,
  "finger": false,
  "pet_bpm": 0,
  "spo2": 0,
  "spo2_valid": false,
  "temp_c": 32.5,
  "activity": "REST",
  "activity_score": 0.5,
  "wifi_connected": true,
  "wifi_ssid": "MyHotspot",
  "wifi_rssi": -51,
  "wifi_ip": "192.168.31.42",
  "lan_server_enabled": true,
  "lan_server_port": 8080,
  "lan_base_url": "http://192.168.31.42:8080",
  "queue_depth": 0,
  "upload_enabled": true,
  "upload_ok": true,
  "upload_code": 200
}
```

The backend stores `pet_bpm` as `heartRateBpm`, `temp_c` as `tempC`, `spo2` as `spo2Pct`, and keeps the hardware status fields in telemetry metadata. If `location_valid` is false, `gps_fix` is `0`, or the coordinates are `0,0`, PawTrace still records the health packet but does not create a map location point.

## BLE Wi-Fi Provisioning Contract

BLE is not a telemetry transport in the current app. Use it only once to configure Wi-Fi credentials and the backend upload URL. After that, the M5 uploads GPS, health, battery, and activity packets through Wi-Fi.

```text
Service UUID:        7b9f0001-6f3a-4f8a-9f4d-111111111111
Status UUID:         7b9f0002-6f3a-4f8a-9f4d-222222222222
Status property:     READ + NOTIFY
WiFi Config UUID:    7b9f0003-6f3a-4f8a-9f4d-333333333333
Config property:     READ + WRITE + WRITE_WITHOUT_RESPONSE
Device name:         PawTrace-001
```

Write this JSON to the WiFi Config UUID:

```json
{
  "type": "wifi_config",
  "ssid": "MyHotspot",
  "password": "hotspot-password",
  "host": "192.168.31.199",
  "url": "http://192.168.31.199:3000/api/device/telemetry",
  "token": "pawtrace-m5-dev-token",
  "source": "pawtrace-web"
}
```

The M5 returns status JSON on the Status UUID and as the readable value of the config characteristic:

```json
{
  "type": "wifi_provision_status",
  "ok": true,
  "device_id": "pawtrace_001",
  "ble_connected": true,
  "wifi_ssid": "MyHotspot",
  "wifi_connected": true,
  "wifi_ip": "192.168.31.42",
  "wifi_rssi": -51,
  "upload_url": "http://192.168.31.199:3000/api/device/telemetry",
  "token_set": true,
  "lan_base_url": "http://192.168.31.42:8080"
}
```

Main app flow:

```text
Health -> BLE WiFi Setup -> Connect BLE -> Send WiFi
Health -> WiFi Telemetry -> read /status or trigger /upload over the same hotspot
```

The BLE provisioning sketch is:

```text
hardware/m5stack/pawtrace_ble_telemetry.ino
```

The backend rejects BLE telemetry packets now. This request is intentionally invalid:

```bash
curl -X POST http://localhost:3000/api/device/telemetry \
  -H "Content-Type: application/json" \
  -H "x-device-token: pawtrace-m5-dev-token" \
  -d '{"id":"pawtrace_001","source":"m5stickc-plus-ble","transport":"ble"}'
```

## Real Map Display

The glass dashboard at `http://localhost:3001/` or `http://<computer-lan-ip>:3001/` uses a real OpenStreetMap embed for the pet location panel. The marker is driven by Wi-Fi telemetry:

```text
location_valid = true
gps_fix = 1 or 2
lat/lon = valid non-zero coordinates
```

When those conditions are met, the dashboard shows `Live Wi-Fi GPS` and centers the real map on `lat/lon`. If the current packet has no GPS fix but the database already has a valid `LocationPoint`, the dashboard falls back to the last valid GPS point.

## Local Curl Test

With `DEVICE_INGEST_ALLOW_LAN=true`, the same request works from a private LAN/hotspot client without the token header. The token header below is still recommended when you are not on a controlled local network.

```bash
curl -X POST http://localhost:3000/api/device/telemetry \
  -H "Content-Type: application/json" \
  -H "x-device-token: pawtrace-m5-dev-token" \
  -d '{
    "deviceId": "pawtrace-vest-001",
    "userId": "demo",
    "timestamp": "2026-04-30T10:00:00.000Z",
    "lat": 31.123,
    "lon": 121.456,
    "gpsValid": true,
    "locationAccuracy": 9.9,
    "heartRateBpm": 88,
    "ir": 238000,
    "red": 185000,
    "batteryPct": 77,
    "activityState": "walking",
    "mapCoords": { "x": 50, "y": 69 }
  }'
```

Then log in as `demo / demo123` and open:

```text
http://localhost:5173/#map
```

The frontend polls:

```text
GET /api/device/telemetry/latest
```

and updates the map marker, health panel, and pet card.

## Recommended Build Route

```text
1. Run Arduino on M5StickC Plus
2. Parse GPS v1.1 latitude and longitude
3. Read Heart Rate HAT IR/RED raw values
4. Read IMU and classify still/walking/running/shaking
5. POST JSON telemetry to PawTrace
6. Display latest location, heart-rate prototype, battery, and activity state
7. Add vest structure diagram and system architecture diagram
```

## Reference Hardware Docs

- M5StickC Plus: https://docs.m5stack.com/en/core/m5stickc_plus
- GPS v1.1: https://docs.m5stack.com/en/unit/Unit-GPS%20v1.1
- Heart Rate HAT: https://docs.m5stack.com/en/hat/hat_heart_rate
