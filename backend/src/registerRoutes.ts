import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import multer from 'multer';
import type { Express, Request, Response, NextFunction } from 'express';
import type { Prisma, HealthMeasurement as HealthMeasurementRow, Pet as PetRow, User as UserRow } from '@prisma/client';
import { prisma } from './lib/prisma.js';
import { config } from './config.js';
import * as ai from './services/aiService.js';
import type { AppMetrics } from './middleware/metrics.js';
import { requireMonitorAuth } from './middleware/monitorAuth.js';
import { requireAuth } from './middleware/jwtAuth.js';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
type LocalChatMessage = { role?: string; content?: string };
type StreamAuthUser = { sub: string; username: string };
const VIDEO_UPLOAD_MAX_BYTES = 150 * 1024 * 1024;
const VIDEO_UPLOAD_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);
const VIDEO_UPLOAD_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/avi',
  'video/webm',
  'application/octet-stream',
]);
const VIDEO_BEHAVIOR_DISCLAIMER = 'This result is only a behavior-risk hint and does not constitute veterinary diagnosis.';
const videoUploadDir = path.join(os.tmpdir(), 'pawtrace-video-uploads');
const MAP_TILE_TIMEOUT_MS = 3500;
const MAP_TILE_MAX_ZOOM = 19;
const MAP_TILE_SOURCES = [
  {
    name: 'openstreetmap',
    url: (z: number, x: number, y: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  },
  {
    name: 'openstreetmap-a',
    url: (z: number, x: number, y: number) => `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`,
  },
  {
    name: 'openstreetmap-b',
    url: (z: number, x: number, y: number) => `https://b.tile.openstreetmap.org/${z}/${x}/${y}.png`,
  },
  {
    name: 'carto-light',
    url: (z: number, x: number, y: number) => `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
  },
];
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdir(videoUploadDir, { recursive: true })
        .then(() => cb(null, videoUploadDir))
        .catch((err) => cb(err, videoUploadDir));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.video';
      cb(null, `video-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: VIDEO_UPLOAD_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();
    const isAllowed = VIDEO_UPLOAD_EXTENSIONS.has(ext) || VIDEO_UPLOAD_MIME_TYPES.has(mime);
    if (!isAllowed) {
      cb(new Error('Unsupported video format. Use mp4, mov, avi, or webm.'));
      return;
    }
    cb(null, true);
  },
});

function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function validMapTile(z: number, x: number, y: number): boolean {
  if (![z, x, y].every(Number.isInteger)) return false;
  if (z < 0 || z > MAP_TILE_MAX_ZOOM) return false;
  const maxTile = 2 ** z;
  return x >= 0 && x < maxTile && y >= 0 && y < maxTile;
}

function boundedPositiveInt(input: unknown, fallback: number, max: number): number {
  const value = Array.isArray(input) ? input[0] : input;
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(Math.max(Math.trunc(numeric), 1), max);
}

function toIsoTimestamp(input?: string): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function mapPet(p: PetRow) {
  const traits = Array.isArray(p.traits) ? (p.traits as unknown[]) : JSON.parse(JSON.stringify(p.traits || []));
  return {
    id: p.id, name: p.name, type: p.type, breed: p.breed,
    age: p.age, gender: p.gender, avatar: p.avatar, traits,
    health: p.health, status: p.status,
  };
}

function mapUser(u: UserRow) {
  return {
    id: u.id, username: u.username, displayName: u.displayName,
    avatar: u.avatar, bio: u.bio, campus: u.campus, contact: u.contact,
    createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString(),
  };
}

function scopedContactId(userId: string, contactId: string): string {
  return `${userId}:${contactId}`;
}

async function resolveUserId(input: string | undefined | null): Promise<string | null> {
  if (!input) return null;
  const v = String(input).trim();
  if (!v) return null;
  const u = await prisma.user.findFirst({ where: { OR: [{ id: v }, { username: v }] } });
  return u?.id ?? v;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function textField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function monitorId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function jsonObject(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function jsonList(value: Record<string, unknown>[]): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function compactRecord(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function latestUserChatText(messages: LocalChatMessage[]): string {
  return [...messages].reverse().find((message) => message.role === 'user' && message.content)?.content?.trim() || '';
}

function contactPetName(contactProfile = ''): string {
  const match = contactProfile.match(/^Pet:\s*([^(,\n]+)/im);
  return match?.[1]?.trim() || 'your pet';
}

function localChatTopic(text: string): 'appetite' | 'health' | 'meetup' | 'training' | 'media' | 'greeting' | 'default' {
  const normalized = text.toLowerCase();
  if (/不吃|没胃口|食欲|饭|food|eat|appetite|meal|vomit|吐|拉肚|diarrhea/.test(normalized)) return 'appetite';
  if (/病|疼|痛|发烧|咳|vet|doctor|health|sick|pain|fever|cough/.test(normalized)) return 'health';
  if (/见面|散步|一起|约|meet|walk|playdate|weekend|tomorrow|咖啡|草坪/.test(normalized)) return 'meetup';
  if (/训练|叫不回|乱叫|咬|拉绳|training|bark|bite|leash|recall/.test(normalized)) return 'training';
  if (/image|photo|picture|sticker|照片|图片|贴纸/.test(normalized)) return 'media';
  if (/^(hi|hello|hey|你好|在吗|嗨)(\b|$)/.test(normalized.trim())) return 'greeting';
  return 'default';
}

function pickReply(replies: string[], seed: string): string {
  return replies[stableHash(seed) % replies.length];
}

function getLocalChatReply(contactProfile = '', messages: LocalChatMessage[] = []): string {
  const latestText = latestUserChatText(messages);
  const petName = contactPetName(contactProfile);
  const topic = localChatTopic(latestText);
  const seed = `${topic}:${petName}:${latestText}:${contactProfile}`;

  const replies: Record<ReturnType<typeof localChatTopic>, string[]> = {
    appetite: [
      `${petName} skipping food is worth watching with water intake, energy, vomiting, and stool changes. Try a small amount of familiar food without forcing it; if it lasts more than a day or energy drops, a vet check is safer. Is ${petName} still drinking and moving normally today?`,
      `I would note when ${petName} last ate normally and whether anything changed, like treats, heat, stress, or a new food. If they refuse every food rather than just being picky, I would take it more seriously. How long has this been going on?`,
    ],
    health: [
      `That sounds worth checking carefully. I would watch ${petName}'s energy, breathing, stool, drinking, and any pain signs; if it continues or gets worse, a vet is the right next step. When did you first notice it?`,
      `If ${petName} seems clearly different from normal, I would keep activity gentle, offer water, and track the timing of symptoms. Online chat can only help you triage, so persistent discomfort needs a vet. Are they still responding and walking normally?`,
    ],
    meetup: [
      `That works. I would keep the first meetup short and relaxed, with enough open space so ${petName} can step back if needed. Would the lawn or the cafe area be easier for you?`,
      `A short walk sounds better than jumping straight into close play. It gives ${petName} time to settle and lets us read the mood. Are you thinking today or tomorrow?`,
    ],
    training: [
      `I would train this in tiny rounds with a high-value reward, then stop while ${petName} is still succeeding. Consistency will matter more than one long session. Are you working on recall, leash manners, or waiting calmly?`,
      `The trigger matters here, so I would first note where it happens and what comes right before it. For ${petName}, a noisy place or a long session could make it harder. What situation brings it out most often?`,
    ],
    media: [
      `I saw the image or sticker. The useful clues are posture, eyes, and energy, but I would still pair that with ${petName}'s eating, stool, and activity today. Was this taken just now?`,
      `That helps, but the scene around it matters too. Had ${petName} just exercised, eaten, or woken up when you captured it?`,
    ],
    greeting: [
      `Hi, I'm here. How is ${petName} doing today? We can talk walks, food, training, or a pet-friendly place to meet.`,
      `Hey. I was just thinking about ${petName}'s routine. Any new update today, or are we planning a campus pet route?`,
    ],
    default: [
      `Got it. For ${petName}, I would look at this together with appetite, energy, and activity rather than judging one detail alone. Is this the first time today, or has it been happening for a few days?`,
      `Thanks for telling me. I would jot down the time, place, and what happened afterward so patterns are easier to spot for ${petName}. Did things go back to normal after that?`,
    ],
  };
  return pickReply(replies[topic], seed);
}

function normalizeRecordList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  return isRecord(value) ? [value] : [];
}

function numericField(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function firstNumericField(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = numericField(record, key);
    if (value !== undefined) return value;
  }
  return undefined;
}

function firstTextField(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = textField(record, key);
    if (value) return value;
  }
  return '';
}

function normalizeTelemetryKey(key: string): string {
  return key
    .trim()
    .replace(/[-\s]+/g, '_')
    .replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
    .replace(/^_+/, '')
    .toLowerCase();
}

function coerceTelemetryValue(value: string): string | number | boolean {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const normalized = trimmed.toLowerCase();
  if (['true', 'yes', 'ok'].includes(normalized)) return true;
  if (['false', 'no', 'invalid'].includes(normalized)) return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) return numeric;
  }
  return trimmed;
}

function parseTelemetryCsv(input: string): Record<string, unknown> {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return {};

  const first = lines[0].split(',').map((part) => part.trim());
  const second = lines[1]?.split(',').map((part) => part.trim()) || [];
  const firstLooksLikeHeader = first.some((part) => /^(device_?id|battery|bat|bpm|pet_?bpm|lat|lon|lost_?alert|alert|source)$/i.test(part));
  if (firstLooksLikeHeader && second.length) {
    return compactRecord(
      Object.fromEntries(first.map((key, index) => [normalizeTelemetryKey(key), coerceTelemetryValue(second[index] || '')]))
    );
  }

  const [deviceId, batteryPct, heartRateBpm, lat, lon, lostAlert] = first;
  return compactRecord({
    deviceId,
    batteryPct: coerceTelemetryValue(batteryPct || ''),
    heartRateBpm: coerceTelemetryValue(heartRateBpm || ''),
    lat: coerceTelemetryValue(lat || ''),
    lon: coerceTelemetryValue(lon || ''),
    lostAlert: coerceTelemetryValue(lostAlert || ''),
    source: 'm5stickc-plus-ble-csv',
    transport: 'ble',
  });
}

function parseTelemetryPayload(body: unknown): Record<string, unknown> {
  if (Array.isArray(body)) return { samples: body.filter(isRecord) };
  if (isRecord(body)) return body;
  if (typeof body !== 'string') return {};
  const raw = body.trim();
  if (!raw) return {};
  if (raw.startsWith('{') || raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { samples: parsed.filter(isRecord) };
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return parseTelemetryCsv(raw);
}

function isBleTelemetryPayload(payload: Record<string, unknown>): boolean {
  const source = firstTextField(payload, ['source', 'transport', 'connection']).toLowerCase();
  return source.includes('ble')
    || payload.bat !== undefined
    || payload.alert !== undefined
    || payload.bleRssi !== undefined
    || payload.ble_rssi !== undefined
    || payload.bleName !== undefined
    || payload.ble_name !== undefined;
}

function isUsbTelemetryPayload(payload: Record<string, unknown>): boolean {
  const source = [
    firstTextField(payload, ['source']),
    firstTextField(payload, ['transport']),
    firstTextField(payload, ['connection']),
  ].join(' ').toLowerCase();
  return source.includes('usb') || source.includes('serial-bridge');
}

function isBleTelemetryRow(row: DeviceTelemetry): boolean {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  const source = `${row.source || ''} ${row.transport || ''} ${metadata.source || ''} ${metadata.transport || ''}`.toLowerCase();
  return source.includes('ble')
    || row.bleConnected !== null
    || row.bleRssi !== undefined
    || row.bleMtu !== undefined
    || row.bleName !== null
    || row.bleServiceUuid !== null
    || row.bleTelemetryUuid !== null
    || row.bleMessageUuid !== null;
}

function isUsbTelemetryRow(row: DeviceTelemetry): boolean {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  const source = `${row.source || ''} ${row.transport || ''} ${metadata.source || ''} ${metadata.transport || ''}`.toLowerCase();
  return source.includes('usb') || source.includes('serial-bridge');
}

function isWifiTelemetryRow(row: DeviceTelemetry): boolean {
  return !isBleTelemetryRow(row) && !isUsbTelemetryRow(row);
}

function telemetryDeviceId(payload: Record<string, unknown>): string {
  const explicit = firstTextField(payload, [
    'deviceId',
    'deviceID',
    'device_id',
    'device',
    'bleDeviceId',
    'ble_device_id',
  ]);
  if (explicit) return explicit;
  return isBleTelemetryPayload(payload) ? firstTextField(payload, ['id', 'i']) : '';
}

function optionalBooleanField(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'ok'].includes(normalized)) return true;
    if (['false', '0', 'no', 'invalid'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value !== 0;
  return undefined;
}

function firstBooleanField(record: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = optionalBooleanField(record, key);
    if (value !== undefined) return value;
  }
  return undefined;
}

function headerValue(req: Request, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim();
}

function safeTokenEquals(a: string, b: string): boolean {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function normalizeRemoteAddress(value: string): string {
  let address = String(value || '').trim().toLowerCase();
  if (!address) return '';
  if (address.startsWith('::ffff:')) address = address.slice('::ffff:'.length);
  const zoneIndex = address.indexOf('%');
  if (zoneIndex >= 0) address = address.slice(0, zoneIndex);
  return address;
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts;
  return a === 10
    || a === 127
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 169 && b === 254);
}

function isPrivateRemoteAddress(value: string): boolean {
  const address = normalizeRemoteAddress(value);
  if (!address) return false;
  if (isPrivateIpv4(address)) return true;
  return address === '::1'
    || address === 'localhost'
    || address.startsWith('fc')
    || address.startsWith('fd')
    || address.startsWith('fe80:');
}

function isLanDeviceIngestRequest(req: Request): boolean {
  const candidates = [req.ip, req.socket.remoteAddress].filter(Boolean) as string[];
  return candidates.some(isPrivateRemoteAddress);
}

function requireDeviceIngestAuth(req: Request, res: Response, next: NextFunction) {
  if (req.authUser) return next();

  const configuredToken = config.DEVICE_INGEST_TOKEN;
  const deviceToken = headerValue(req, 'x-device-token');
  const authHeader = headerValue(req, 'authorization');
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  if (configuredToken && (safeTokenEquals(deviceToken, configuredToken) || safeTokenEquals(bearerToken, configuredToken))) {
    return next();
  }
  if (config.DEVICE_INGEST_ALLOW_LAN && isLanDeviceIngestRequest(req)) {
    return next();
  }

  if (!configuredToken) {
    return res.status(401).json({ error: 'Device ingest token is not configured; use a user JWT, set DEVICE_INGEST_TOKEN, or enable DEVICE_INGEST_ALLOW_LAN for local hotspot demos.' });
  }
  return res.status(401).json({ error: 'Unauthorized device telemetry request' });
}

function telemetryMetadata(payload: Record<string, unknown>, source: string): Record<string, unknown> {
  const rawMetadata = isRecord(payload.metadata) ? payload.metadata : {};
  const mapCoordSource = isRecord(payload.mapCoords) ? payload.mapCoords : payload;
  const mapCoords = compactRecord({
    x: isRecord(payload.mapCoords) ? numericField(mapCoordSource, 'x') : firstNumericField(mapCoordSource, ['mapX', 'x']),
    y: isRecord(payload.mapCoords) ? numericField(mapCoordSource, 'y') : firstNumericField(mapCoordSource, ['mapY', 'y']),
  });

  return compactRecord({
    ...rawMetadata,
    source,
    transport: firstTextField(payload, ['transport', 'connection']) || (source.toLowerCase().includes('ble') ? 'ble' : ''),
    petId: firstTextField(payload, ['petId', 'petID', 'pet_id']),
    gpsValid: firstBooleanField(payload, ['gpsValid', 'gps_valid', 'location_valid']),
    gpsFix: firstNumericField(payload, ['gpsFix', 'gps_fix']),
    gpsSatsUsed: firstNumericField(payload, ['gpsSatsUsed', 'gps_sats_used']),
    gpsVisible: firstNumericField(payload, ['gpsVisible', 'gps_visible', 'sat', 'sats', 'satellites']),
    gpsHdop: firstNumericField(payload, ['gpsHdop', 'gps_hdop']),
    locationValid: firstBooleanField(payload, ['locationValid', 'location_valid']),
    lastLocationValid: firstBooleanField(payload, ['lastLocationValid', 'last_location_valid']),
    trackSamples: firstNumericField(payload, ['trackSamples', 'track_samples']),
    geofenceEnabled: firstBooleanField(payload, ['geofenceEnabled', 'geofence_enabled']),
    distanceM: firstNumericField(payload, ['distanceM', 'distance_m']),
    lostAlert: firstBooleanField(payload, ['lostAlert', 'lost_alert', 'alert']),
    heartFound: firstBooleanField(payload, ['heartFound', 'heart_found']),
    finger: firstBooleanField(payload, ['finger']),
    spo2Valid: firstBooleanField(payload, ['spo2Valid', 'spo2_valid']),
    batteryMv: firstNumericField(payload, ['batteryMv', 'battery_mv']),
    bleConnected: firstBooleanField(payload, ['bleConnected', 'ble_connected']),
    bleRssi: firstNumericField(payload, ['bleRssi', 'ble_rssi', 'rssi']),
    bleMtu: firstNumericField(payload, ['bleMtu', 'ble_mtu', 'mtu']),
    bleName: firstTextField(payload, ['bleName', 'ble_name', 'name']),
    bleServiceUuid: firstTextField(payload, ['bleServiceUuid', 'ble_service_uuid', 'serviceUuid', 'service_uuid']),
    bleTelemetryUuid: firstTextField(payload, ['bleTelemetryUuid', 'ble_telemetry_uuid', 'characteristicUuid', 'characteristic_uuid']),
    bleMessageUuid: firstTextField(payload, ['bleMessageUuid', 'ble_message_uuid', 'messageUuid', 'message_uuid']),
    bleLastMessage: firstTextField(payload, ['bleLastMessage', 'ble_last_message', 'lastBleMessage', 'last_ble_message', 'message']),
    bleMessageSeq: firstNumericField(payload, ['bleMessageSeq', 'ble_message_seq', 'messageSeq', 'message_seq']),
    bleBridgeReceivedAt: firstTextField(payload, ['bleBridgeReceivedAt', 'ble_bridge_received_at']),
    bleBridgeStoredBy: firstTextField(payload, ['bleBridgeStoredBy', 'ble_bridge_stored_by']),
    notifySeq: firstNumericField(payload, ['notifySeq', 'notify_seq', 'packetSeq', 'packet_seq', 'seq']),
    uptimeMs: firstNumericField(payload, ['uptimeMs', 'uptime_ms']),
    activityScore: firstNumericField(payload, ['activityScore', 'activity_score']),
    wifiConnected: firstBooleanField(payload, ['wifiConnected', 'wifi_connected']),
    wifiSsid: firstTextField(payload, ['wifiSsid', 'wifi_ssid']),
    wifiIp: firstTextField(payload, ['wifiIp', 'wifi_ip']),
    wifiRssi: firstNumericField(payload, ['wifiRssi', 'wifi_rssi']),
    wifiRetryCount: firstNumericField(payload, ['wifiRetryCount', 'wifi_retry_count']),
    lanServerEnabled: firstBooleanField(payload, ['lanServerEnabled', 'lan_server_enabled']),
    lanServerPort: firstNumericField(payload, ['lanServerPort', 'lan_server_port']),
    lanBaseUrl: firstTextField(payload, ['lanBaseUrl', 'lan_base_url']),
    lanMessageSeq: firstNumericField(payload, ['lanMessageSeq', 'lan_message_seq']),
    lanLastMessage: firstTextField(payload, ['lanLastMessage', 'lan_last_message']),
    queueDepth: firstNumericField(payload, ['queueDepth', 'queue_depth']),
    queueCapacity: firstNumericField(payload, ['queueCapacity', 'queue_capacity']),
    queueDropped: firstNumericField(payload, ['queueDropped', 'queue_dropped']),
    uploadEnabled: firstBooleanField(payload, ['uploadEnabled', 'upload_enabled']),
    uploadOk: firstBooleanField(payload, ['uploadOk', 'upload_ok']),
    uploadCode: firstNumericField(payload, ['uploadCode', 'upload_code']),
    uploadAttemptSeq: firstNumericField(payload, ['uploadAttemptSeq', 'upload_attempt_seq']),
    httpFailCount: firstNumericField(payload, ['httpFailCount', 'http_fail_count']),
    ir: firstNumericField(payload, ['ir', 'irValue', 'irRaw']),
    red: firstNumericField(payload, ['red', 'redValue', 'redRaw']),
    spo2Pct: firstNumericField(payload, ['spo2Pct', 'spo2', 'bloodOxygenPct']),
    firmwareVersion: firstTextField(payload, ['firmwareVersion', 'firmware']),
    board: firstTextField(payload, ['board', 'hardware']),
    gpsModule: firstTextField(payload, ['gpsModule']),
    heartRateHat: firstTextField(payload, ['heartRateHat']),
    temperatureValid: firstBooleanField(payload, ['temperatureValid', 'temperature_valid', 'tempValid', 'temp_valid']),
    temperatureSource: firstTextField(payload, ['temperatureSource', 'temperature_source', 'tempSource', 'temp_source']),
    boardTempC: firstNumericField(payload, ['boardTempC', 'board_temp_c', 'chipTempC', 'chip_temp_c']),
    movementScore: firstNumericField(payload, ['movementScore', 'movement_score']),
    accelMagnitudeG: firstNumericField(payload, ['accelMagnitudeG', 'accel_magnitude_g']),
    filteredAccelMagnitudeG: firstNumericField(payload, ['filteredAccelMagnitudeG', 'filtered_accel_magnitude_g']),
    activityConfidence: firstNumericField(payload, ['activityConfidence', 'activity_confidence']),
    signalQuality: firstNumericField(payload, ['signalQuality', 'signal_quality']),
    sampleIntervalMs: firstNumericField(payload, ['sampleIntervalMs', 'sample_interval_ms']),
    mapCoords: Object.keys(mapCoords).length ? mapCoords : undefined,
  });
}

function mapTelemetryRow(row: HealthMeasurementRow) {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  const mapCoords = isRecord(metadata.mapCoords) ? metadata.mapCoords : {};
  const mapX = numericField(mapCoords, 'x');
  const mapY = numericField(mapCoords, 'y');
  return {
    id: row.id,
    deviceId: row.deviceId,
    userId: row.userId,
    tagId: row.tagId,
    petId: typeof metadata.petId === 'string' ? metadata.petId : null,
    source: typeof metadata.source === 'string' ? metadata.source : null,
    transport: typeof metadata.transport === 'string' ? metadata.transport : null,
    timestamp: row.timestamp,
    receivedAt: row.receivedAt,
    heartRateBpm: row.heartRateBpm,
    soundLevelDb: row.soundLevelDb,
    batteryPct: row.batteryPct,
    steps: row.steps,
    tempC: row.tempC,
    temperature: row.tempC,
    accelPeak: row.accelPeak,
    activity: row.activity,
    lat: row.lat,
    lon: row.lon,
    locationAccuracy: row.locationAccuracy,
    locationTimestamp: row.locationTimestamp,
    quality: row.quality,
    gpsValid: typeof metadata.gpsValid === 'boolean' ? metadata.gpsValid : null,
    gpsFix: numericField(metadata, 'gpsFix'),
    gpsSatsUsed: numericField(metadata, 'gpsSatsUsed'),
    gpsVisible: numericField(metadata, 'gpsVisible'),
    gpsHdop: numericField(metadata, 'gpsHdop'),
    locationValid: typeof metadata.locationValid === 'boolean' ? metadata.locationValid : null,
    lastLocationValid: typeof metadata.lastLocationValid === 'boolean' ? metadata.lastLocationValid : null,
    trackSamples: numericField(metadata, 'trackSamples'),
    geofenceEnabled: typeof metadata.geofenceEnabled === 'boolean' ? metadata.geofenceEnabled : null,
    distanceM: numericField(metadata, 'distanceM'),
    lostAlert: typeof metadata.lostAlert === 'boolean' ? metadata.lostAlert : null,
    heartFound: typeof metadata.heartFound === 'boolean' ? metadata.heartFound : null,
    finger: typeof metadata.finger === 'boolean' ? metadata.finger : null,
    ir: numericField(metadata, 'ir'),
    red: numericField(metadata, 'red'),
    spo2Pct: numericField(metadata, 'spo2Pct'),
    spo2Valid: typeof metadata.spo2Valid === 'boolean' ? metadata.spo2Valid : null,
    batteryMv: numericField(metadata, 'batteryMv'),
    bleConnected: typeof metadata.bleConnected === 'boolean' ? metadata.bleConnected : null,
    bleRssi: numericField(metadata, 'bleRssi'),
    bleMtu: numericField(metadata, 'bleMtu'),
    bleName: typeof metadata.bleName === 'string' ? metadata.bleName : null,
    bleServiceUuid: typeof metadata.bleServiceUuid === 'string' ? metadata.bleServiceUuid : null,
    bleTelemetryUuid: typeof metadata.bleTelemetryUuid === 'string' ? metadata.bleTelemetryUuid : null,
    bleMessageUuid: typeof metadata.bleMessageUuid === 'string' ? metadata.bleMessageUuid : null,
    bleLastMessage: typeof metadata.bleLastMessage === 'string' ? metadata.bleLastMessage : null,
    bleMessageSeq: numericField(metadata, 'bleMessageSeq'),
    bleBridgeReceivedAt: typeof metadata.bleBridgeReceivedAt === 'string' ? metadata.bleBridgeReceivedAt : null,
    bleBridgeStoredBy: typeof metadata.bleBridgeStoredBy === 'string' ? metadata.bleBridgeStoredBy : null,
    notifySeq: numericField(metadata, 'notifySeq'),
    uptimeMs: numericField(metadata, 'uptimeMs'),
    activityScore: numericField(metadata, 'activityScore'),
    wifiConnected: typeof metadata.wifiConnected === 'boolean' ? metadata.wifiConnected : null,
    wifiSsid: typeof metadata.wifiSsid === 'string' ? metadata.wifiSsid : null,
    wifiIp: typeof metadata.wifiIp === 'string' ? metadata.wifiIp : null,
    wifiRssi: numericField(metadata, 'wifiRssi'),
    wifiRetryCount: numericField(metadata, 'wifiRetryCount'),
    lanServerEnabled: typeof metadata.lanServerEnabled === 'boolean' ? metadata.lanServerEnabled : null,
    lanServerPort: numericField(metadata, 'lanServerPort'),
    lanBaseUrl: typeof metadata.lanBaseUrl === 'string' ? metadata.lanBaseUrl : null,
    lanMessageSeq: numericField(metadata, 'lanMessageSeq'),
    lanLastMessage: typeof metadata.lanLastMessage === 'string' ? metadata.lanLastMessage : null,
    queueDepth: numericField(metadata, 'queueDepth'),
    queueCapacity: numericField(metadata, 'queueCapacity'),
    queueDropped: numericField(metadata, 'queueDropped'),
    uploadEnabled: typeof metadata.uploadEnabled === 'boolean' ? metadata.uploadEnabled : null,
    uploadOk: typeof metadata.uploadOk === 'boolean' ? metadata.uploadOk : null,
    uploadCode: numericField(metadata, 'uploadCode'),
    uploadAttemptSeq: numericField(metadata, 'uploadAttemptSeq'),
    httpFailCount: numericField(metadata, 'httpFailCount'),
    temperatureValid: typeof metadata.temperatureValid === 'boolean' ? metadata.temperatureValid : null,
    temperatureSource: typeof metadata.temperatureSource === 'string' ? metadata.temperatureSource : null,
    boardTempC: numericField(metadata, 'boardTempC'),
    movementScore: numericField(metadata, 'movementScore'),
    accelMagnitudeG: numericField(metadata, 'accelMagnitudeG'),
    filteredAccelMagnitudeG: numericField(metadata, 'filteredAccelMagnitudeG'),
    activityConfidence: numericField(metadata, 'activityConfidence'),
    signalQuality: numericField(metadata, 'signalQuality'),
    sampleIntervalMs: numericField(metadata, 'sampleIntervalMs'),
    mapCoords: mapX !== undefined && mapY !== undefined ? { x: mapX, y: mapY } : undefined,
    metadata,
  };
}

type DeviceTelemetry = ReturnType<typeof mapTelemetryRow>;
type TelemetryStreamClient = {
  id: string;
  userId: string;
  deviceId: string;
  res: Response;
};

const DEVICE_TELEMETRY_CACHE_MAX = 100;
const TELEMETRY_STREAM_HEARTBEAT_MS = 25000;
const latestDeviceTelemetry = new Map<string, DeviceTelemetry>();
const telemetryStreamClients = new Set<TelemetryStreamClient>();

function telemetryTimeMs(row: DeviceTelemetry): number {
  const receivedAtMs = Date.parse(String(row.receivedAt || ''));
  if (Number.isFinite(receivedAtMs)) return receivedAtMs;
  const timestampMs = Date.parse(String(row.timestamp || ''));
  return Number.isFinite(timestampMs) ? timestampMs : 0;
}

function telemetryCacheKey(row: DeviceTelemetry): string {
  return [
    row.userId || 'anonymous',
    row.deviceId || row.tagId || row.id,
  ].join(':');
}

function cacheLatestTelemetry(row: DeviceTelemetry) {
  if (!isWifiTelemetryRow(row)) return;
  latestDeviceTelemetry.set(telemetryCacheKey(row), row);
  if (latestDeviceTelemetry.size <= DEVICE_TELEMETRY_CACHE_MAX) return;

  const oldest = [...latestDeviceTelemetry.entries()]
    .sort((a, b) => telemetryTimeMs(a[1]) - telemetryTimeMs(b[1]))
    .slice(0, latestDeviceTelemetry.size - DEVICE_TELEMETRY_CACHE_MAX);
  oldest.forEach(([key]) => latestDeviceTelemetry.delete(key));
}

function getCachedTelemetry(userId: string, deviceId: string, limit: number): DeviceTelemetry[] {
  return [...latestDeviceTelemetry.values()]
    .filter((row) => row.userId === userId)
    .filter((row) => !deviceId || row.deviceId === deviceId)
    .filter(isWifiTelemetryRow)
    .sort((a, b) => telemetryTimeMs(b) - telemetryTimeMs(a))
    .slice(0, limit);
}

function uniqueLatestTelemetry(rows: DeviceTelemetry[], limit: number): DeviceTelemetry[] {
  const seen = new Set<string>();
  const latest: DeviceTelemetry[] = [];
  for (const row of rows.filter(isWifiTelemetryRow).sort((a, b) => telemetryTimeMs(b) - telemetryTimeMs(a))) {
    const key = telemetryCacheKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    latest.push(row);
    if (latest.length >= limit) break;
  }
  return latest;
}

function streamToken(req: Request): string {
  const value = req.query.token;
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

function authUserFromTelemetryStream(req: Request): StreamAuthUser | null {
  if (req.authUser) return req.authUser;
  const token = streamToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as StreamAuthUser & { sub?: string };
    if (!payload.sub) return null;
    return { sub: payload.sub, username: String(payload.username || '') };
  } catch {
    return null;
  }
}

function writeTelemetryStreamEvent(res: Response, event: string, data: Record<string, unknown>, id?: string) {
  if (id) res.write(`id: ${id}\n`);
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcastTelemetry(row: DeviceTelemetry) {
  if (!isWifiTelemetryRow(row) || !row.userId || telemetryStreamClients.size === 0) return;
  for (const client of telemetryStreamClients) {
    if (client.userId !== row.userId) continue;
    if (client.deviceId && client.deviceId !== row.deviceId) continue;
    try {
      writeTelemetryStreamEvent(client.res, 'telemetry', { telemetry: row, latest: row }, row.id);
    } catch {
      telemetryStreamClients.delete(client);
    }
  }
}

class TelemetryIngestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'TelemetryIngestError';
    this.status = status;
  }
}

type StoredTelemetryPayload = {
  telemetry: DeviceTelemetry;
  deviceId: string;
  receivedAt: string;
  locationPointId: string | null;
};

function telemetryPayloadSamples(payload: Record<string, unknown>): Record<string, unknown>[] {
  const rawSamples = Array.isArray(payload.samples) ? payload.samples.filter(isRecord) : [payload];
  return rawSamples.slice(0, 24);
}

async function storeTelemetryPayload(payload: Record<string, unknown>, authUser?: StreamAuthUser | null): Promise<StoredTelemetryPayload> {
  if (isBleTelemetryPayload(payload)) {
    throw new TelemetryIngestError(400, 'BLE telemetry is disabled. Use BLE only for WiFi provisioning; device data must be uploaded over WiFi.');
  }
  if (isUsbTelemetryPayload(payload)) {
    throw new TelemetryIngestError(400, 'USB telemetry is disabled. Device data must be uploaded over WiFi HTTP.');
  }
  const deviceId = telemetryDeviceId(payload);
  if (!deviceId) throw new TelemetryIngestError(400, 'deviceId is required');

  const payloadUserId = await resolveUserId(firstTextField(payload, ['userId', 'user_id', 'username', 'ownerId', 'owner_id']));
  if (authUser && payloadUserId && payloadUserId !== authUser.sub) {
    throw new TelemetryIngestError(403, 'Authenticated users can only write telemetry to their own account.');
  }
  const defaultUserId = authUser || payloadUserId ? null : await resolveUserId(config.DEVICE_DEFAULT_USER);
  const userId = authUser?.sub || payloadUserId || defaultUserId || null;

  const tagId = firstTextField(payload, ['tagId', 'tagID', 'tag_id', 'nfcId', 'nfc_id']);
  const source = firstTextField(payload, ['source']) || 'm5stack-wifi-http';
  const timestamp = toIsoTimestamp(firstTextField(payload, ['timestamp', 'capturedAt', 'time']));
  const receivedAt = new Date().toISOString();
  const heartRateBpm = firstNumericField(payload, ['heartRateBpm', 'heart_rate_bpm', 'heartRate', 'pet_bpm', 'bpm']);
  const tempC = firstNumericField(payload, ['tempC', 'temp_c', 'temperatureC', 'temperature']);
  const lat = firstNumericField(payload, ['lat', 'latitude']);
  const lon = firstNumericField(payload, ['lon', 'lng', 'longitude']);
  const locationValid = firstBooleanField(payload, ['locationValid', 'location_valid', 'gpsValid', 'gps_valid']);
  const gpsFix = firstNumericField(payload, ['gpsFix', 'gps_fix']);
  const shouldStoreLocation = lat !== undefined
    && lon !== undefined
    && lat !== 0
    && lon !== 0
    && locationValid !== false
    && gpsFix !== 0;
  const storedLat = shouldStoreLocation ? lat : undefined;
  const storedLon = shouldStoreLocation ? lon : undefined;
  const locationAccuracy = firstNumericField(payload, ['locationAccuracy', 'location_accuracy', 'accuracy', 'gpsAccuracy']);
  const altitude = firstNumericField(payload, ['altitude', 'alt']);
  const locationTimestamp = firstTextField(payload, ['locationTimestamp', 'location_timestamp', 'gpsTimestamp', 'gps_timestamp']);
  const quality = payload.quality === undefined || payload.quality === null || payload.quality === ''
    ? undefined
    : String(payload.quality);
  const metadata = telemetryMetadata(payload, source);

  const health = await prisma.healthMeasurement.create({
    data: {
      id: `health-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      deviceId,
      userId,
      tagId: tagId || null,
      timestamp,
      heartRateBpm,
      soundLevelDb: firstNumericField(payload, ['soundLevelDb', 'soundDb', 'soundLevel']),
      batteryPct: firstNumericField(payload, ['batteryPct', 'battery_pct', 'batteryPercent', 'battery', 'bat']),
      steps: firstNumericField(payload, ['steps', 'stepCount']),
      tempC,
      accelPeak: firstNumericField(payload, ['accelPeak', 'accelerationPeak']),
      activity: firstTextField(payload, ['activity', 'activityState', 'motionState']),
      lat: storedLat,
      lon: storedLon,
      locationAccuracy,
      locationTimestamp: locationTimestamp ? toIsoTimestamp(locationTimestamp) : undefined,
      quality,
      metadata: Object.keys(metadata).length ? jsonObject(metadata) : undefined,
      receivedAt,
    },
  });

  let locationPointId: string | null = null;
  if (storedLat !== undefined && storedLon !== undefined) {
    const point = await prisma.locationPoint.create({
      data: {
        id: `loc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        source,
        tagId: tagId || null,
        deviceId,
        userId,
        timestamp: locationTimestamp ? toIsoTimestamp(locationTimestamp) : timestamp,
        lat: storedLat,
        lon: storedLon,
        accuracy: locationAccuracy,
        altitude,
      },
    });
    locationPointId = point.id;

    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (userExists) {
        await prisma.lastLocation.upsert({
          where: { userId },
          create: {
            userId,
            lat: storedLat,
            lon: storedLon,
            accuracy: locationAccuracy,
            timestamp: locationTimestamp ? toIsoTimestamp(locationTimestamp) : timestamp,
            source,
          },
          update: {
            lat: storedLat,
            lon: storedLon,
            accuracy: locationAccuracy,
            timestamp: locationTimestamp ? toIsoTimestamp(locationTimestamp) : timestamp,
            source,
          },
        });
      }
    }
  }

  const telemetry = mapTelemetryRow(health);
  cacheLatestTelemetry(telemetry);
  broadcastTelemetry(telemetry);
  return { telemetry, deviceId, receivedAt, locationPointId };
}

function ownerLabelFrom(payload: Record<string, unknown>): string {
  const personalInfo = isRecord(payload.personalInfo) ? payload.personalInfo : {};
  const profile = isRecord(payload.userProfile) ? payload.userProfile : {};
  return (
    textField(personalInfo, 'displayName') ||
    textField(profile, 'displayName') ||
    textField(personalInfo, 'username') ||
    textField(profile, 'username') ||
    'Unknown owner'
  );
}

async function trimRows(
  countRows: () => Promise<number>,
  findOldestIds: (take: number) => Promise<{ id: string }[]>,
  deleteIds: (ids: string[]) => Promise<unknown>,
  max: number
) {
  const count = await countRows();
  if (count <= max) return;
  const rows = await findOldestIds(count - max);
  const ids = rows.map((row) => row.id);
  if (ids.length) await deleteIds(ids);
}

export function registerRoutes(app: Express, deps: { metrics: AppMetrics }) {

  // ─── Auth ───
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, displayName } = req.body || {};
      const u = String(username || '').trim();
      const p = String(password || '');
      if (!u || u.length < 2) return res.status(400).json({ error: 'username required (min 2 chars)' });
      if (!p || p.length < 8) return res.status(400).json({ error: 'password required (min 8 chars)' });
      const exists = await prisma.user.findUnique({ where: { username: u } });
      if (exists) return res.status(409).json({ error: 'username taken' });
      const passwordHash = await bcrypt.hash(p, 10);
      const id = `u-${crypto.randomBytes(6).toString('hex')}`;
      const user = await prisma.user.create({
        data: { id, username: u, passwordHash, displayName: String(displayName || u).slice(0, 80) },
      });
      const token = jwt.sign({ sub: user.id, username: user.username }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES } as SignOptions);
      res.json({ token, user: mapUser(user) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      const u = String(username || '').trim();
      const p = String(password || '');
      if (!u || !p) return res.status(400).json({ error: 'username and password required' });
      const user = await prisma.user.findUnique({ where: { username: u } });
      if (!user?.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(p, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ sub: user.id, username: user.username }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES } as SignOptions);
      res.json({ token, user: mapUser(user) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', requireAuth, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.authUser!.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: mapUser(user) });
  }));

  // ─── Pets & Users ───
  app.get('/api/pets', requireAuth, asyncHandler(async (req, res) => {
    const pets = await prisma.pet.findMany({
      where: { OR: [{ ownerId: req.authUser!.sub }, { ownerId: null }] },
      orderBy: { id: 'asc' },
    });
    res.json({ pets: pets.map(mapPet) });
  }));

  app.get('/api/pets/:id', requireAuth, asyncHandler(async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (pet.ownerId && pet.ownerId !== req.authUser!.sub) return res.status(403).json({ error: 'Forbidden' });
    res.json({ pet: mapPet(pet) });
  }));

  app.post('/api/pets', requireAuth, asyncHandler(async (req, res) => {
    const payload = req.body || {};
    if (!payload.name) return res.status(400).json({ error: 'Pet name is required' });
    const petSprites = ['/assets/1.png', '/assets/2.png', '/assets/3.png', '/assets/4.png', '/assets/5.png', '/assets/6.png'];
    const randomSprite = petSprites[Math.floor(Math.random() * petSprites.length)];
    const traits = Array.isArray(payload.traits)
      ? payload.traits
      : String(payload.traits || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const pet = await prisma.pet.create({
      data: {
        id: `p${Date.now()}`, ownerId: req.authUser!.sub,
        name: payload.name, type: payload.type || 'Pet', breed: payload.breed || 'Unknown',
        age: payload.age || 'Unknown', gender: payload.gender || 'Unknown',
        avatar: payload.avatar || randomSprite, traits: traits as unknown as Prisma.InputJsonValue,
        health: payload.health || 'No health notes yet.', status: payload.status || 'Just joined the crew.',
      },
    });
    res.json({ pet: mapPet(pet) });
  }));

  app.delete('/api/pets/:id', requireAuth, asyncHandler(async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (!pet.ownerId || pet.ownerId !== req.authUser!.sub) return res.status(403).json({ error: 'Forbidden' });
    await prisma.pet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  app.get('/api/users', requireAuth, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.authUser!.sub } });
    res.json({ users: user ? [mapUser(user)] : [] });
  }));

  // ─── Chat ───
  app.get('/api/chat/history/:contactId', requireAuth, asyncHandler(async (req, res) => {
    const contactId = scopedContactId(req.authUser!.sub, req.params.contactId);
    const rows = await prisma.chatMessage.findMany({
      where: { contactId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { role: true, content: true },
    });
    res.json({ history: rows });
  }));

  app.post('/api/chat', async (req, res) => {
    const { contactId, messages, contactProfile } = req.body || {};
    if (!contactId || typeof contactId !== 'string') return res.status(400).json({ error: 'contactId is required' });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array is required' });
    const authUserId = req.authUser?.sub || '';
    const scopedId = authUserId ? scopedContactId(authUserId, contactId) : '';

    const normalizedMessages = messages
      .map((msg: { role?: string; content?: string }) => ({
        role: msg?.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg?.content === 'string' ? msg.content.trim() : '',
      }))
      .filter((entry: { content: string }) => entry.content);

    try {
      const sysPrompt = ai.getSystemPrompt(contactId, contactProfile);
      let generatedReply: string | undefined;
      let aiWarning = '';
      if (ai.hasDashScopeKey()) {
        try {
          generatedReply = await ai.callQwen([{ role: 'system', content: sysPrompt }, ...normalizedMessages]);
        } catch (err) {
          aiWarning = err instanceof Error ? err.message : String(err);
          console.error('Chat AI request failed:', err);
        }
      } else {
        aiWarning = 'DASHSCOPE_API_KEY missing';
      }
      const reply = generatedReply || getLocalChatReply(contactProfile, normalizedMessages);
      const source = generatedReply ? 'qwen' : 'local';

      if (scopedId) {
        const now = new Date().toISOString();
        const latestUserMessage = [...normalizedMessages].reverse().find((m) => m.role === 'user');
        if (latestUserMessage) {
          await prisma.chatMessage.create({ data: { contactId: scopedId, role: 'user', content: latestUserMessage.content, createdAt: new Date(now) } });
        }
        await prisma.chatMessage.create({ data: { contactId: scopedId, role: 'assistant', content: reply, createdAt: new Date(now) } });
      }
      res.json({ reply, source, saved: Boolean(scopedId), ...(aiWarning && !generatedReply ? { warning: aiWarning } : {}) });
    } catch (err) {
      console.error('Chat backend error:', err);
      res.json({ reply: getLocalChatReply(contactProfile, normalizedMessages), source: 'local', warning: String(err) });
    }
  });

  // ─── Map & Notes ───
  app.get('/api/status', (_req, res) => {
    res.json({
      ready: true,
      lastSync: new Date().toISOString(),
      ai: {
        dashscopeConfigured: ai.hasDashScopeKey(),
        textModel: ai.QWEN_TEXT_MODEL,
        visionModel: ai.QWEN_VISION_MODEL,
        thinkingEnabled: config.QWEN_ENABLE_THINKING,
      },
      videoAi: {
        url: config.VIDEO_AI_URL,
      },
    });
  });

  app.get('/api/map-locations', (_req, res) => {
    res.json({
      spots: [
        { id: '1', name: 'Central Lawn', desc: 'Wide grass field...', link: '#' },
        { id: '2', name: 'Orange Corner Café', desc: 'Pet-friendly café with outdoor seating.', link: '#' },
      ],
    });
  });

  app.get('/api/map/tile/:z/:x/:y.png', asyncHandler(async (req, res) => {
    const z = Number(req.params.z);
    const x = Number(req.params.x);
    const y = Number(req.params.y);
    if (!validMapTile(z, x, y)) {
      return res.status(400).json({ error: 'Invalid map tile coordinates' });
    }

    const controllers: AbortController[] = [];
    const attempts = MAP_TILE_SOURCES.map(async (source) => {
      const controller = new AbortController();
      controllers.push(controller);
      const timer = setTimeout(() => controller.abort(), MAP_TILE_TIMEOUT_MS);
      try {
        const upstream = await fetch(source.url(z, x, y), {
          headers: {
            'User-Agent': 'PawTrace/10.1 local development map tile proxy',
            Accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
          },
          signal: controller.signal,
        });
        if (!upstream.ok) {
          throw new Error(`${upstream.status} ${upstream.statusText}`);
        }
        const body = Buffer.from(await upstream.arrayBuffer());
        return {
          body,
          contentType: upstream.headers.get('content-type') || 'image/png',
          source: source.name,
        };
      } catch (err) {
        throw new Error(`${source.name}: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        clearTimeout(timer);
      }
    });

    try {
      const tile = await Promise.any(attempts);
      controllers.forEach((controller) => controller.abort());
      res.setHeader('Content-Type', tile.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      res.setHeader('X-PawTrace-Tile-Source', tile.source);
      return res.send(tile.body);
    } catch (err) {
      const detail = err instanceof AggregateError
        ? err.errors.map((entry) => entry instanceof Error ? entry.message : String(entry)).join('; ')
        : err instanceof Error ? err.message : String(err);
      return res.status(502).json({ error: 'Map tile unavailable', detail });
    }
  }));

  app.get('/api/sticky-notes', requireAuth, asyncHandler(async (_req, res) => {
    const notes = await prisma.stickyNote.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ notes: notes.map((n) => ({ id: n.id, text: n.text, createdAt: n.createdAt.toISOString() })) });
  }));

  app.post('/api/sticky-notes', requireAuth, asyncHandler(async (req, res) => {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Note text is required' });
    const note = await prisma.stickyNote.create({ data: { id: `note-${Date.now()}`, text } });
    res.json({ note: { id: note.id, text: note.text, createdAt: note.createdAt.toISOString() } });
  }));

  app.delete('/api/sticky-notes/:id', requireAuth, asyncHandler(async (req, res) => {
    await prisma.stickyNote.deleteMany({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  app.delete('/api/sticky-notes', requireAuth, asyncHandler(async (_req, res) => {
    await prisma.stickyNote.deleteMany();
    res.json({ success: true });
  }));

  // ─── Location (simplified, JWT-auth only) ───
  app.get('/api/location/points', requireAuth, asyncHandler(async (req, res) => {
    const { userId, limit } = req.query || {};
    const max = boundedPositiveInt(limit, 100, 500);
    const normalizedUserId = userId ? await resolveUserId(String(userId)) : req.authUser!.sub;
    if (normalizedUserId !== req.authUser!.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const where: Prisma.LocationPointWhereInput = { userId: req.authUser!.sub };
    const points = await prisma.locationPoint.findMany({ where, orderBy: { createdAt: 'desc' }, take: max * 3 });
    const wifiPoints = points.filter((r) => !String(r.source || '').toLowerCase().includes('ble')).slice(0, max);
    res.json({ points: wifiPoints.reverse().map((r) => ({ id: r.id, source: r.source, userId: r.userId, timestamp: r.timestamp, lat: r.lat, lon: r.lon })) });
  }));

  app.post('/api/location/last', requireAuth, asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const lat = Number(payload.lat);
    const lon = Number(payload.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return res.status(400).json({ error: 'lat and lon required' });
    const userId = req.authUser!.sub;
    await prisma.lastLocation.upsert({
      where: { userId },
      create: { userId, lat, lon, timestamp: toIsoTimestamp(payload.timestamp), source: 'app-gps' },
      update: { lat, lon, timestamp: toIsoTimestamp(payload.timestamp), source: 'app-gps' },
    });
    res.json({ success: true, userId });
  }));

  // ─── M5Stack Device Telemetry ───
  app.get('/api/device/telemetry/stream', asyncHandler(async (req, res) => {
    const authUser = authUserFromTelemetryStream(req);
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' });

    const deviceId = String(req.query.deviceId || '').trim();
    const initialLimit = boundedPositiveInt(req.query.limit, 1, 10);
    const client: TelemetryStreamClient = {
      id: `stream-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId: authUser.sub,
      deviceId,
      res,
    };

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    telemetryStreamClients.add(client);
    writeTelemetryStreamEvent(res, 'ready', {
      ready: true,
      clientId: client.id,
      deviceId: deviceId || null,
      heartbeatMs: TELEMETRY_STREAM_HEARTBEAT_MS,
    });

    const cachedTelemetry = getCachedTelemetry(authUser.sub, deviceId, initialLimit);
    cachedTelemetry.forEach((row) => {
      writeTelemetryStreamEvent(res, 'telemetry', { telemetry: row, latest: row, fromCache: true }, row.id);
    });

    const heartbeat = setInterval(() => {
      try {
        writeTelemetryStreamEvent(res, 'ping', { time: new Date().toISOString() });
      } catch {
        clearInterval(heartbeat);
        telemetryStreamClients.delete(client);
      }
    }, TELEMETRY_STREAM_HEARTBEAT_MS);

    req.on('close', () => {
      clearInterval(heartbeat);
      telemetryStreamClients.delete(client);
    });
  }));

  app.post('/api/device/telemetry', express.text({ type: ['text/csv', 'text/plain'], limit: '64kb' }), requireDeviceIngestAuth, asyncHandler(async (req, res) => {
    const payload = parseTelemetryPayload(req.body);
    const samples = telemetryPayloadSamples(payload);
    if (!samples.length) return res.status(400).json({ error: 'telemetry payload is required' });

    let stored: StoredTelemetryPayload[] = [];
    try {
      for (const sample of samples) {
        stored.push(await storeTelemetryPayload(sample, req.authUser));
      }
    } catch (err) {
      if (err instanceof TelemetryIngestError) {
        return res.status(err.status).json({ error: err.message });
      }
      throw err;
    }

    const latest = stored[stored.length - 1];

    const responseMode = String(req.get('x-device-response') || req.query.response || req.query.compact || '').trim().toLowerCase();
    if (['1', 'true', 'compact', 'minimal', 'fast'].includes(responseMode)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.json({
        success: true,
        count: stored.length,
        id: latest.telemetry.id,
        deviceId: latest.deviceId,
        receivedAt: latest.receivedAt,
        locationPointId: latest.locationPointId,
      });
    }

    res.json({
      success: true,
      count: stored.length,
      telemetry: latest.telemetry,
      locationPointId: latest.locationPointId,
    });
  }));

  app.get('/api/device/telemetry/latest', requireAuth, asyncHandler(async (req, res) => {
    const deviceId = String(req.query.deviceId || '').trim();
    const max = boundedPositiveInt(req.query.limit, 6, 25);
    const cachedTelemetry = getCachedTelemetry(req.authUser!.sub, deviceId, max);
    const rows = await prisma.healthMeasurement.findMany({
      where: {
        userId: req.authUser!.sub,
        ...(deviceId ? { deviceId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });

    const telemetry = uniqueLatestTelemetry([...cachedTelemetry, ...rows.map(mapTelemetryRow)], max);
    res.json({ telemetry, latest: telemetry[0] || null, cacheSize: cachedTelemetry.length });
  }));

  app.get('/api/device/telemetry/history', requireAuth, asyncHandler(async (req, res) => {
    const deviceId = String(req.query.deviceId || '').trim();
    const max = boundedPositiveInt(req.query.limit, 120, 500);
    const fromRaw = String(req.query.from || req.query.since || '').trim();
    const toRaw = String(req.query.to || req.query.until || '').trim();
    const fromDate = fromRaw ? new Date(fromRaw) : null;
    const toDate = toRaw ? new Date(toRaw) : null;
    const createdAt: Prisma.DateTimeFilter = {};
    if (fromDate && !Number.isNaN(fromDate.getTime())) createdAt.gte = fromDate;
    if (toDate && !Number.isNaN(toDate.getTime())) createdAt.lte = toDate;
    const where: Prisma.HealthMeasurementWhereInput = {
      userId: req.authUser!.sub,
      ...(deviceId ? { deviceId } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    };
    const rows = await prisma.healthMeasurement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: max * 3,
    });

    res.json({ telemetry: rows.map(mapTelemetryRow).filter(isWifiTelemetryRow).slice(0, max), range: { from: fromRaw || null, to: toRaw || null }, limit: max });
  }));

  // ─── AI (Qwen only) ───
  app.get('/api/ai/status', (_req, res) => {
    res.json({
      dashscopeConfigured: ai.hasDashScopeKey(),
      textModel: ai.QWEN_TEXT_MODEL,
      visionModel: ai.QWEN_VISION_MODEL,
      thinkingEnabled: config.QWEN_ENABLE_THINKING,
      timeoutMs: config.AI_TIMEOUT_MS,
    });
  });

  app.post('/api/pet-prediction', async (req, res) => {
    const profile = req.body?.profile || {};
    if (!profile.starSign && !profile.petName) return res.json({ prediction: 'Share your star sign or pet info to unlock predictions.' });
    const fallback = ai.getLocalPetPrediction(profile);
    if (!ai.hasDashScopeKey()) return res.json({ prediction: fallback, source: 'local' });
    try {
      const result = await ai.callQwen([
        { role: 'system', content: 'You are an upbeat pet behavior astrologist. Reply with at most 3 short sentences including one actionable tip.' },
        { role: 'user', content: ai.buildPetPredictionPrompt(profile) },
      ]);
      res.json({ prediction: result || fallback, source: result ? 'qwen' : 'local' });
    } catch (err) {
      console.error('Pet prediction error:', err);
      res.json({ prediction: fallback, source: 'local', warning: String(err) });
    }
  });

  app.post(['/api/ai/qwen-advice', '/api/ai/gemini-advice'], async (req, res) => {
    const { service, context, profile, pets } = req.body || {};
    if (!service || !['health', 'behavior', 'diet'].includes(service)) return res.status(400).json({ error: 'service must be health | behavior | diet' });
    const fallback = ai.getLocalAdvice(service, profile || {});
    if (!ai.hasDashScopeKey()) {
      return res.json({ result: fallback, source: 'local', warning: 'DASHSCOPE_API_KEY is not configured.' });
    }
    try {
      const messages = ai.buildAdviceMessages(service, context, profile || {}, pets || []);
      const result = await ai.callQwen(messages);
      res.json({ result: result || fallback, source: result ? 'qwen' : 'local' });
    } catch (err) {
      console.error('AI advice error:', err);
      res.json({ result: fallback, source: 'local', warning: String(err) });
    }
  });

  app.post(['/api/ai/qwen-diagnosis', '/api/ai/gemini-diagnosis'], async (req, res) => {
    const { imageBase64, mimeType, symptoms } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
    const prompt = `You are an expert veterinary AI assistant named "PawTrace Health Engine".
Analyze the provided pet image and symptoms: "${symptoms || 'No symptoms given; do a general visual check.'}"
Provide a structured Markdown response:
### Visual Analysis
### Potential Causes
### Severity Assessment
### Recommended Actions
**Disclaimer:** You are an AI, not a licensed veterinarian. This is informational only.`;
    const fallback = ai.getLocalDiagnosis(String(symptoms || ''));
    if (!ai.hasDashScopeKey()) {
      return res.json({ result: fallback, source: 'local', warning: 'DASHSCOPE_API_KEY is not configured.' });
    }
    try {
      const result = await ai.callQwenVision({ imageBase64, mimeType, prompt });
      if (result) return res.json({ result, source: 'qwen-vl' });
    } catch (err) {
      console.error('Qwen-VL error:', err);
    }
    try {
      const messages = ai.buildAdviceMessages('health', `Symptoms: ${symptoms || 'not provided'}.`, {}, []);
      const result = await ai.callQwen(messages);
      res.json({ result: result || fallback, source: result ? 'qwen-text-fallback' : 'local' });
    } catch (err) {
      console.error('Diagnosis fallback error:', err);
      res.json({ result: fallback, source: 'local', warning: String(err) });
    }
  });

  app.post('/api/ai/video-behavior', (req, res) => {
    videoUpload.single('video')(req, res, async (uploadErr: unknown) => {
      const uploaded = req.file;
      const cleanup = () => {
        if (uploaded?.path) fs.unlink(uploaded.path).catch(() => undefined);
      };

      if (uploadErr) {
        cleanup();
        if (uploadErr instanceof multer.MulterError) {
          const message = uploadErr.code === 'LIMIT_FILE_SIZE'
            ? 'Video is too large. Please upload a file under 150MB.'
            : uploadErr.message;
          return res.status(400).json({ error: message });
        }
        return res.status(400).json({ error: uploadErr instanceof Error ? uploadErr.message : 'Video upload failed' });
      }

      if (!uploaded) {
        return res.status(400).json({ error: 'video file is required' });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.VIDEO_AI_TIMEOUT_MS);

      try {
        const fileBuffer = await fs.readFile(uploaded.path);
        const form = new FormData();
        const videoBlob = new Blob([new Uint8Array(fileBuffer)], {
          type: uploaded.mimetype || 'application/octet-stream',
        });
        form.append('video', videoBlob, uploaded.originalname || 'pet-video.mp4');

        const response = await fetch(config.VIDEO_AI_URL, {
          method: 'POST',
          body: form,
          signal: controller.signal,
        });
        const responseText = await response.text();
        let payload: unknown = responseText;
        try {
          payload = responseText ? JSON.parse(responseText) : {};
        } catch {
          payload = { raw: responseText };
        }

        if (!response.ok) {
          console.error('Video AI service error:', response.status, payload);
          return res.status(502).json({
            error: 'Video AI service error',
            status: response.status,
            detail: payload,
          });
        }

        const result = isRecord(payload)
          ? { ...payload, disclaimer: String(payload.disclaimer || VIDEO_BEHAVIOR_DISCLAIMER) }
          : { success: true, result: payload, disclaimer: VIDEO_BEHAVIOR_DISCLAIMER };
        return res.json(result);
      } catch (err) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        console.error('Video behavior analysis error:', err);
        return res.status(isAbort ? 504 : 502).json({
          error: isAbort ? 'Video AI service timed out' : 'Unable to analyze video right now',
          detail: err instanceof Error ? err.message : String(err),
        });
      } finally {
        clearTimeout(timer);
        cleanup();
      }
    });
  });

  // ─── Monitor (simplified) ───
  app.get('/api/monitor/metrics', requireMonitorAuth, (_req, res) => {
    const m = deps.metrics;
    const summary = Object.entries(m.routes).reduce((acc, [route, stat]) => {
      acc[route] = { count: stat.count, avgMs: stat.count ? (stat.sumMs / stat.count).toFixed(2) : '0', maxMs: stat.maxMs.toFixed(2), status: stat.status };
      return acc;
    }, {} as Record<string, Record<string, unknown>>);
    res.json({ uptimeSeconds: Math.floor((Date.now() - m.startedAt) / 1000), requests: m.requests, routes: summary });
  });

  app.post('/api/monitor/collect', requireMonitorAuth, asyncHandler(async (req, res) => {
    const payload = isRecord(req.body) ? req.body : {};
    const metadata = (payload.metadata && typeof payload.metadata === 'object') ? payload.metadata : {};
    const captured = { userProfiles: 0, petProfiles: 0, purchases: 0, chatLogs: 0 };
    const personalInfo = isRecord(payload.personalInfo) ? payload.personalInfo : null;
    const userProfile = isRecord(payload.userProfile) ? payload.userProfile : null;
    const pets = normalizeRecordList(payload.pets ?? payload.pet);
    const purchases = normalizeRecordList(payload.purchases ?? payload.purchase);
    const chatLogs = normalizeRecordList(payload.chatLogs ?? payload.chatLog);
    const metadataJson = jsonObject(metadata as Record<string, unknown>);

    if (userProfile) {
      await prisma.monitoringUserProfile.create({
        data: {
          id: monitorId('profile'),
          profileJson: jsonObject(userProfile),
          ...(personalInfo ? { personalInfoJson: jsonObject(personalInfo) } : {}),
          metadataJson,
        },
      });
      captured.userProfiles = 1;
    }
    for (const pet of pets) {
      await prisma.monitoringPetProfile.create({
        data: {
          id: monitorId('pet'),
          ownerLabel: ownerLabelFrom(payload),
          petJson: jsonObject(pet),
          metadataJson,
        },
      });
      captured.petProfiles += 1;
    }
    for (const purchase of purchases) {
      await prisma.monitoringPurchase.create({
        data: {
          id: monitorId('purchase'),
          purchaseJson: jsonObject(purchase),
          metadataJson,
        },
      });
      captured.purchases += 1;
    }
    for (const log of chatLogs) {
      const messages = normalizeRecordList(log.messages);
      await prisma.monitoringChatLog.create({
        data: {
          id: monitorId('chat'),
          contactId: textField(log, 'contactId') || 'unknown',
          messagesJson: jsonList(messages),
          reply: textField(log, 'reply'),
        },
      });
      captured.chatLogs += 1;
    }
    await Promise.all([
      trimRows(
        () => prisma.monitoringUserProfile.count(),
        (take) => prisma.monitoringUserProfile.findMany({ orderBy: { capturedAt: 'asc' }, take, select: { id: true } }),
        (ids) => prisma.monitoringUserProfile.deleteMany({ where: { id: { in: ids } } }),
        config.MONITOR_MAX
      ),
      trimRows(
        () => prisma.monitoringPetProfile.count(),
        (take) => prisma.monitoringPetProfile.findMany({ orderBy: { capturedAt: 'asc' }, take, select: { id: true } }),
        (ids) => prisma.monitoringPetProfile.deleteMany({ where: { id: { in: ids } } }),
        config.MONITOR_MAX
      ),
      trimRows(
        () => prisma.monitoringPurchase.count(),
        (take) => prisma.monitoringPurchase.findMany({ orderBy: { capturedAt: 'asc' }, take, select: { id: true } }),
        (ids) => prisma.monitoringPurchase.deleteMany({ where: { id: { in: ids } } }),
        config.MONITOR_MAX
      ),
      trimRows(
        () => prisma.monitoringChatLog.count(),
        (take) => prisma.monitoringChatLog.findMany({ orderBy: { capturedAt: 'asc' }, take, select: { id: true } }),
        (ids) => prisma.monitoringChatLog.deleteMany({ where: { id: { in: ids } } }),
        config.MONITOR_MAX
      ),
    ]);
    res.json({ success: true, captured });
  }));

  app.get('/api/monitor/overview', requireMonitorAuth, asyncHandler(async (_req, res) => {
    const [
      userProfiles,
      petProfiles,
      purchases,
      chatLogs,
      contacts,
      recentUsers,
      recentPets,
      recentPurchases,
      recentChatLogs,
      appUsers,
      appPets,
      healthMeasurements,
      locationPoints,
      chatMessages,
      deviceRows,
      recentAppUsers,
      recentAppPets,
      recentTelemetry,
      recentAppChatMessages,
    ] = await Promise.all([
      prisma.monitoringUserProfile.count(), prisma.monitoringPetProfile.count(),
      prisma.monitoringPurchase.count(), prisma.monitoringChatLog.count(),
      prisma.monitoringChatLog.findMany({ distinct: ['contactId'], select: { contactId: true } }),
      prisma.monitoringUserProfile.findMany({ orderBy: { capturedAt: 'desc' }, take: 140 }),
      prisma.monitoringPetProfile.findMany({ orderBy: { capturedAt: 'desc' }, take: 160 }),
      prisma.monitoringPurchase.findMany({ orderBy: { capturedAt: 'desc' }, take: 160 }),
      prisma.monitoringChatLog.findMany({ orderBy: { capturedAt: 'desc' }, take: 180 }),
      prisma.user.count(),
      prisma.pet.count(),
      prisma.healthMeasurement.count(),
      prisma.locationPoint.count(),
      prisma.chatMessage.count(),
      prisma.healthMeasurement.findMany({ where: { deviceId: { not: null } }, distinct: ['deviceId'], select: { deviceId: true } }),
      prisma.user.findMany({ orderBy: { updatedAt: 'desc' }, take: 140 }),
      prisma.pet.findMany({
        orderBy: { createdAt: 'desc' },
        take: 160,
        include: { owner: true },
      }),
      prisma.healthMeasurement.findMany({ orderBy: { createdAt: 'desc' }, take: 360 }),
      prisma.chatMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 140 }),
    ]);
    res.json({
      capturedAt: new Date().toISOString(),
      summary: { userProfiles, petProfiles, purchases, chatLogs, contactsTracked: contacts.length },
      appData: {
        summary: {
          users: appUsers,
          pets: appPets,
          healthMeasurements,
          locationPoints,
          chatMessages,
          devicesTracked: deviceRows.filter((row) => row.deviceId).length,
        },
        users: recentAppUsers.map(mapUser),
        pets: recentAppPets.map((row) => ({
          pet: mapPet(row),
          owner: row.owner ? mapUser(row.owner) : null,
          createdAt: row.createdAt.toISOString(),
        })),
        telemetry: recentTelemetry.map(mapTelemetryRow).filter(isWifiTelemetryRow).slice(0, 120),
        chatMessages: recentAppChatMessages.map((row) => ({
          id: row.id,
          contactId: row.contactId,
          role: row.role,
          content: row.content,
          createdAt: row.createdAt.toISOString(),
        })),
      },
      monitoring: {
        userProfiles: recentUsers.map((row) => ({
          id: row.id,
          capturedAt: row.capturedAt.toISOString(),
          profile: row.profileJson,
          personalInfo: row.personalInfoJson,
          metadata: row.metadataJson,
        })),
        petProfiles: recentPets.map((row) => ({
          id: row.id,
          capturedAt: row.capturedAt.toISOString(),
          ownerLabel: row.ownerLabel,
          pet: row.petJson,
          metadata: row.metadataJson,
        })),
        purchases: recentPurchases.map((row) => ({
          id: row.id,
          capturedAt: row.capturedAt.toISOString(),
          purchase: row.purchaseJson,
          metadata: row.metadataJson,
        })),
        chatLogs: recentChatLogs.map((row) => ({
          id: row.id,
          capturedAt: row.capturedAt.toISOString(),
          contactId: row.contactId,
          messages: row.messagesJson,
          reply: row.reply,
        })),
      },
    });
  }));
}
