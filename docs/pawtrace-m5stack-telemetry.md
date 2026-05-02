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

BLE is treated as a near-field sync path, not the long-range tracking path:

```text
GPS v1.1 + Heart Rate HAT + IMU
  -> M5StickC Plus BLE GATT notify
  -> PawTrace web Bluetooth bridge or mobile app BLE Central / GATT Client
  -> App POSTs normalized telemetry JSON to /api/device/telemetry
  -> same PostgreSQL tables, latest cache, map, health panel, and dashboard
```

Use this split:

| Link | Role | Use |
| --- | --- | --- |
| BLE | near-field sync / provisioning | battery, vitals, GPS snapshot, Wi-Fi setup, buzzer or LED control |
| Wi-Fi HTTP | remote upload | live map, last known location, geofence alert, history |

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
```

The M5StickC must send this token as either:

```http
x-device-token: replace-with-a-shared-device-token
```

or:

```http
Authorization: Bearer replace-with-a-shared-device-token
```

For local testing, the backend runs on port `3000`. From the M5StickC, use the computer LAN IP, not `localhost`:

```text
http://10.13.180.141:3000/api/device/telemetry
```

The included Arduino example is:

```text
hardware/m5stack/pawtrace_wifi_telemetry.ino
```

Update `WIFI_SSID` and `WIFI_PASSWORD` in that sketch before flashing. If your Mac LAN IP changes, update `PAWTRACE_TELEMETRY_URL` to the new `http://<mac-lan-ip>:3000/api/device/telemetry`.

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
  "wifi_connected": false,
  "wifi_rssi": 0,
  "upload_enabled": false,
  "upload_ok": false,
  "upload_code": 0
}
```

The backend stores `pet_bpm` as `heartRateBpm`, `temp_c` as `tempC`, `spo2` as `spo2Pct`, and keeps the hardware status fields in telemetry metadata. If `location_valid` is false, `gps_fix` is `0`, or the coordinates are `0,0`, PawTrace still records the health packet but does not create a map location point.

## BLE Interface Contract

M5StickC Plus should act as the BLE Peripheral / GATT Server. The phone app acts as the BLE Central / GATT Client.

```text
Service UUID:        7b9f0001-6f3a-4f8a-9f4d-111111111111
Telemetry UUID:      7b9f0002-6f3a-4f8a-9f4d-222222222222
Telemetry property:  READ + NOTIFY
Message UUID:        7b9f0003-6f3a-4f8a-9f4d-333333333333
Message property:    READ + WRITE + WRITE_WITHOUT_RESPONSE
Device name:         PawTrace-001
```

Recommended canonical BLE notify JSON:

```json
{
  "device_id": "pawtrace_001",
  "source": "m5stickc-plus-ble",
  "transport": "ble",
  "battery_pct": 82,
  "pet_bpm": 92,
  "lat": 31.2983,
  "lon": 120.5853,
  "location_valid": true,
  "gps_fix": 1,
  "lost_alert": false,
  "ble_rssi": -58,
  "ble_mtu": 185,
  "ble_message_uuid": "7b9f0003-6f3a-4f8a-9f4d-333333333333",
  "ble_last_message": "hello from web bridge",
  "ble_message_seq": 1
}
```

The backend also accepts the compact BLE JSON you can use for quick demos:

```json
{
  "id": "pawtrace_001",
  "bat": 82,
  "bpm": 92,
  "lat": 31.2983,
  "lon": 120.5853,
  "alert": 0,
  "source": "m5stickc-plus-ble",
  "transport": "ble"
}
```

And compact CSV:

```text
pawtrace_001,82,92,31.2983,120.5853,0
```

CSV field order:

```text
device_id,battery_pct,pet_bpm,lat,lon,lost_alert
```

Mobile app bridge rule:

```text
BLE notify payload -> parse JSON or CSV -> POST to /api/device/telemetry
BLE message input -> write UTF-8 text or JSON to Message UUID
```

The main web app now includes a Web Bluetooth bridge in:

```text
Health -> Bluetooth Bridge
```

Use Chrome or Edge on `localhost` or HTTPS, sign in, click `Connect BLE`, choose `PawTrace-001`, send a short message, and keep the page open. The bridge subscribes to telemetry notifications and stores GPS, vitals, activity, Wi-Fi, and BLE metadata through the signed-in user's JWT.

If the mobile app is logged in, use the user JWT:

```http
Authorization: Bearer <app-user-jwt>
```

For local bridge testing, use:

```http
x-device-token: pawtrace-m5-dev-token
```

The included BLE Arduino example is:

```text
hardware/m5stack/pawtrace_ble_telemetry.ino
```

## Real Map Display

The glass dashboard at `http://localhost:3001/` uses a real OpenStreetMap embed for the pet location panel. The marker is driven by Wi-Fi telemetry:

```text
location_valid = true
gps_fix = 1 or 2
lat/lon = valid non-zero coordinates
```

When those conditions are met, the dashboard shows `Live Wi-Fi GPS` and centers the real map on `lat/lon`. If the current packet has no GPS fix but the database already has a valid `LocationPoint`, the dashboard falls back to the last valid GPS point.

## Local Curl Test

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

BLE compact JSON test:

```bash
curl -X POST http://localhost:3000/api/device/telemetry \
  -H "Content-Type: application/json" \
  -H "x-device-token: pawtrace-m5-dev-token" \
  -d '{"id":"pawtrace_001","bat":82,"bpm":92,"lat":31.2983,"lon":120.5853,"alert":0,"source":"m5stickc-plus-ble","transport":"ble","ble_rssi":-58}'
```

BLE compact CSV test:

```bash
curl -X POST http://localhost:3000/api/device/telemetry \
  -H "Content-Type: text/csv" \
  -H "x-device-token: pawtrace-m5-dev-token" \
  --data 'pawtrace_001,82,92,31.2983,120.5853,0'
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
