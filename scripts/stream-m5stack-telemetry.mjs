#!/usr/bin/env node
import os from 'node:os';

const DEVICE_ID = process.env.M5_DEVICE_ID || 'm5stickc-plus-1-1';
const USERNAME = process.env.PAWTRACE_USERNAME || 'demo';
const PASSWORD = process.env.PAWTRACE_PASSWORD || 'demo123';
const DEVICE_TOKEN = process.env.DEVICE_INGEST_TOKEN || 'pawtrace-m5-dev-token';
const PORT = process.env.PORT || '3000';
const FRONTEND_PORT = process.env.FRONTEND_PORT || '5173';
const HOTSPOT_SSID = process.env.M5_WIFI_SSID || 'Jeremy\u2019s iphone';
const DEFAULT_INTERVAL_MS = 1000;

function parseNumberArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((entry) => entry.startsWith(prefix));
  const value = arg ? Number(arg.slice(prefix.length)) : Number.NaN;
  return Number.isFinite(value) ? value : fallback;
}

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
    .filter((entry) => entry.family === 'IPv4' && !entry.internal && !entry.address.startsWith('169.254.'))
    .map((entry) => entry.address)
    .sort((a, b) => privateIpv4Score(b) - privateIpv4Score(a));
  return candidates[0] || '127.0.0.1';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function livePayload(index, lanIp) {
  const phase = index / 4;
  const seq = Math.floor(Date.now() / 1000) * 1000 + index;
  const heart = Math.round(clamp(96 + (Math.sin(phase) * 13) + (Math.cos(index / 7) * 4), 72, 138));
  const temp = Number(clamp(38.3 + (Math.sin(index / 5) * 0.45), 37.4, 39.4).toFixed(1));
  const spo2 = Math.round(clamp(98 + Math.sin(index / 6), 95, 100));
  const battery = Math.round(clamp(94 - (index * 0.04) + (Math.sin(index / 12) * 0.3), 72, 100));
  const activityList = ['REST', 'WALK', 'WALK', 'RUN', 'WALK'];
  const activity = activityList[index % activityList.length];
  const locationPhase = index / 18;
  const lat = Number((31.48303 + (Math.sin(locationPhase) * 0.00018)).toFixed(6));
  const lon = Number((121.15569 + (Math.cos(locationPhase) * 0.00018)).toFixed(6));
  const distanceM = Number((Math.abs(Math.sin(locationPhase)) * 32).toFixed(1));

  return {
    device_id: DEVICE_ID,
    userId: USERNAME,
    timestamp: new Date().toISOString(),
    source: 'm5stickc-plus-wifi-live',
    transport: 'wifi',
    firmwareVersion: '10.1.1-live-realtime',
    board: 'm5stickc-plus-1.1',
    seq,
    packet_seq: seq,
    uptime_ms: 444444 + (index * DEFAULT_INTERVAL_MS),
    battery_pct: battery,
    battery_mv: 3980 + Math.round((battery - 70) * 4.2),
    gps_fix: 1,
    gps_sats_used: 7 + (index % 4),
    gps_visible: 11 + (index % 5),
    gps_hdop: Number((1.0 + ((index % 5) * 0.08)).toFixed(1)),
    lat,
    lon,
    location_valid: true,
    last_location_valid: true,
    track_samples: index + 1,
    geofence_enabled: true,
    distance_m: distanceM,
    lost_alert: false,
    heart_found: true,
    finger: true,
    pet_bpm: heart,
    spo2,
    spo2_valid: true,
    temp_c: temp,
    activity,
    activity_score: Number((activity === 'RUN' ? 2.4 : activity === 'WALK' ? 1.35 : 0.35).toFixed(2)),
    accelPeak: Number((activity === 'RUN' ? 2.1 : activity === 'WALK' ? 1.25 : 0.42).toFixed(2)),
    wifi_connected: true,
    wifi_ssid: HOTSPOT_SSID,
    wifi_ip: `http-client-${lanIp}`,
    wifi_rssi: -42 - (index % 11),
    upload_enabled: true,
    upload_ok: true,
    upload_code: 200,
  };
}

const lanIp = detectLanIp();
const baseUrl = process.env.PAWTRACE_API_BASE_URL || `http://${lanIp}:${PORT}`;
const frontendUrl = `http://${lanIp}:${FRONTEND_PORT}/?openApp=profile&m5Demo=1#health`;
const intervalMs = Math.max(200, parseNumberArg('interval', DEFAULT_INTERVAL_MS));
const count = parseNumberArg('count', null);
let shouldStop = false;

process.on('SIGINT', () => {
  shouldStop = true;
});

console.log(`[m5-live] API: ${baseUrl}`);
console.log(`[m5-live] Frontend: ${frontendUrl}`);
console.log(`[m5-live] Device: ${DEVICE_ID}`);
console.log(`[m5-live] Interval: ${intervalMs}ms${count ? `, count: ${count}` : ', continuous until Ctrl+C'}`);

await fetchJson(`${baseUrl}/api/status`, { signal: AbortSignal.timeout(5000) });
await fetchJson(`${baseUrl}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
});

let index = 0;
while (!shouldStop && (!count || index < count)) {
  const payload = livePayload(index, lanIp);
  const posted = await fetchJson(`${baseUrl}/api/device/telemetry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-device-token': DEVICE_TOKEN,
    },
    body: JSON.stringify(payload),
  });
  console.log(`[m5-live] #${index + 1} ${payload.timestamp} bpm=${payload.pet_bpm} temp=${payload.temp_c} spo2=${payload.spo2} battery=${payload.battery_pct}% rssi=${payload.wifi_rssi} id=${posted.telemetry?.id || 'stored'}`);
  index += 1;
  if (!count || index < count) await sleep(intervalMs);
}

console.log('[m5-live] stopped');
