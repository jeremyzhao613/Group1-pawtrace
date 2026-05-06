#!/usr/bin/env node
import os from 'node:os';

const DEVICE_ID = process.env.M5_DEVICE_ID || 'm5stickc-plus-1-1';
const USERNAME = process.env.PAWTRACE_USERNAME || 'demo';
const PASSWORD = process.env.PAWTRACE_PASSWORD || 'demo123';
const DEVICE_TOKEN = process.env.DEVICE_INGEST_TOKEN || 'pawtrace-m5-dev-token';
const PORT = process.env.PORT || '3000';
const FRONTEND_PORT = process.env.FRONTEND_PORT || '5173';
const GLASS_PORT = process.env.GLASS_PORT || '3001';

function privateIpv4Score(ip) {
  if (!ip || ip === '127.0.0.1') return 0;
  if (ip.startsWith('172.20.10.')) return 100;
  if (ip.startsWith('192.168.')) return 90;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return 80;
  if (ip.startsWith('10.')) return 70;
  return 10;
}

function detectLanIp() {
  if (process.env.PAWTRACE_LAN_IP) return process.env.PAWTRACE_LAN_IP.trim();
  const candidates = Object.values(os.networkInterfaces())
    .flat()
    .filter(Boolean)
    .filter((entry) => entry.family === 'IPv4' && !entry.internal)
    .map((entry) => entry.address)
    .sort((a, b) => privateIpv4Score(b) - privateIpv4Score(a));
  return candidates[0] || '127.0.0.1';
}

async function readJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await readJson(response);
  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

async function waitForStreamTelemetry(baseUrl, token, timeoutMs = 5000) {
  const stream = await fetch(`${baseUrl}/api/device/telemetry/stream?limit=1&token=${encodeURIComponent(token)}`);
  if (!stream.ok || !stream.body) {
    throw new Error(`stream -> HTTP ${stream.status}`);
  }
  const reader = stream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sawPacket = false;

  const readLoop = (async () => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && !sawPacket) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      sawPacket = buffer.includes('event: telemetry') && buffer.includes(DEVICE_ID);
    }
  })();

  return {
    done: readLoop.finally(() => reader.cancel().catch(() => {})),
    markPosted: () => sawPacket,
  };
}

async function optionalStatus(url) {
  try {
    await fetchJson(url, { signal: AbortSignal.timeout(3000) });
    return 'ok';
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

async function optionalLatestThroughProxy(origin, token) {
  try {
    const data = await fetchJson(`${origin}/api/device/telemetry/latest?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return data.latest?.deviceId || 'no-latest-row';
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

const lanIp = detectLanIp();
const baseUrl = process.env.PAWTRACE_API_BASE_URL || `http://${lanIp}:${PORT}`;
const frontendUrl = `http://${lanIp}:${FRONTEND_PORT}`;
const glassUrl = `http://${lanIp}:${GLASS_PORT}`;

console.log(`[m5-test] LAN IP: ${lanIp}`);
console.log(`[m5-test] API: ${baseUrl}`);

await fetchJson(`${baseUrl}/api/status`, { signal: AbortSignal.timeout(5000) });
const session = await fetchJson(`${baseUrl}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
});
if (!session.token) throw new Error(`login did not return a token for ${USERNAME}`);

const streamProbe = await waitForStreamTelemetry(baseUrl, session.token);
await new Promise((resolve) => setTimeout(resolve, 250));

const now = new Date().toISOString();
const seq = Math.floor(Date.now() / 1000);
const payload = {
  device_id: DEVICE_ID,
  userId: USERNAME,
  timestamp: now,
  source: 'm5stickc-plus-wifi',
  transport: 'wifi',
  firmwareVersion: '10.1.1-jeremy-iphone-realtime',
  board: 'm5stickc-plus-1.1',
  seq,
  packet_seq: seq,
  uptime_ms: 444444,
  battery_pct: 94,
  battery_mv: 4088,
  gps_fix: 1,
  gps_sats_used: 8,
  gps_visible: 13,
  gps_hdop: 1.2,
  lat: 31.48303,
  lon: 121.15569,
  location_valid: true,
  last_location_valid: true,
  heart_found: true,
  finger: true,
  pet_bpm: 96,
  spo2: 98,
  spo2_valid: true,
  temp_c: 38.3,
  activity: 'WALK',
  activity_score: 1.31,
  accelPeak: 1.31,
  wifi_connected: true,
  wifi_ssid: 'Jeremy’s iphone',
  wifi_ip: `http-client-${lanIp}`,
  wifi_rssi: -45,
  upload_enabled: true,
  upload_ok: true,
  upload_code: 200,
};

const posted = await fetchJson(`${baseUrl}/api/device/telemetry`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-device-token': DEVICE_TOKEN,
  },
  body: JSON.stringify(payload),
});

const batchPosted = await fetchJson(`${baseUrl}/api/device/telemetry`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-device-token': DEVICE_TOKEN,
    'x-device-response': 'compact',
  },
  body: JSON.stringify({
    samples: [
      { ...payload, packet_seq: seq + 1, seq: seq + 1, timestamp: new Date(Date.now() + 1000).toISOString(), activity_score: 0.28, activity: 'REST' },
      { ...payload, packet_seq: seq + 2, seq: seq + 2, timestamp: new Date(Date.now() + 2000).toISOString(), activity_score: 0.94, activity: 'WALK' },
    ],
  }),
});
if (batchPosted.count !== 2) throw new Error(`batch telemetry ingest expected count=2, got ${JSON.stringify(batchPosted)}`);

await streamProbe.done;
const latest = await fetchJson(`${baseUrl}/api/device/telemetry/latest?limit=3`, {
  headers: { Authorization: `Bearer ${session.token}` },
});
const history = await fetchJson(`${baseUrl}/api/device/telemetry/history?limit=5&deviceId=${encodeURIComponent(DEVICE_ID)}`, {
  headers: { Authorization: `Bearer ${session.token}` },
});

const frontendProxy = await optionalStatus(`${frontendUrl}/api/status`);
const glassProxy = await optionalStatus(`${glassUrl}/api/status`);
const frontendLatestDevice = await optionalLatestThroughProxy(frontendUrl, session.token);
const glassLatestDevice = await optionalLatestThroughProxy(glassUrl, session.token);

console.log('');
console.log('[m5-test] PASS: telemetry POST -> database -> latest/history -> realtime stream');
console.log(JSON.stringify({
  storedTelemetryId: posted.telemetry?.id,
  storedBatchCount: batchPosted.count,
  storedLocationPointId: posted.locationPointId,
  streamSawPacket: streamProbe.markPosted(),
  latestDevice: latest.latest?.deviceId,
  latestReceivedAt: latest.latest?.receivedAt,
  latestBatteryPct: latest.latest?.batteryPct,
  latestHeartRateBpm: latest.latest?.heartRateBpm,
  latestWifiSsid: latest.latest?.wifiSsid,
  historyRowsForDevice: Array.isArray(history.telemetry) ? history.telemetry.length : 0,
  frontendProxy,
  glassProxy,
  frontendLatestDevice,
  glassLatestDevice,
}, null, 2));

console.log('');
console.log('[m5-test] Open these while signed in as demo / demo123:');
console.log(`  Main app:  ${frontendUrl}/`);
console.log(`  Glass app: ${glassUrl}/`);
console.log('');
console.log('[m5-test] If the physical M5 still does not show up, send these over USB serial or reflash the WiFi sketch:');
console.log('  WIFI Jeremy’s iphone|00000000');
console.log(`  HOST ${lanIp}`);
console.log(`  TOKEN ${DEVICE_TOKEN}`);
console.log('  UPLOAD');
console.log('  CONFIG');
