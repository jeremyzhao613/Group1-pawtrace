const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const VIDEO_DISCLAIMER = 'AI video checks are informational only and do not replace professional veterinary care.';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), request);
    try {
      const response = await routeRequest(request, env, url);
      return withCors(response, request);
    } catch (err) {
      console.error(err);
      return withCors(json({ error: 'Server error', detail: String(err?.message || err) }, 500), request);
    }
  },
};

async function routeRequest(request, env, url) {
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const nfcCardMatch = path.match(/^\/api\/nfc-pet-cards\/([^/]+)$/);

  if (method === 'GET' && path === '/api/status') return status(env);
  if (method === 'POST' && path === '/api/auth/register') return register(request, env);
  if (method === 'POST' && path === '/api/auth/login') return login(request, env);
  if (method === 'GET' && path === '/api/auth/me') return me(request, env);
  if (method === 'GET' && nfcCardMatch) return getNfcPetCard(env, nfcCardMatch[1]);
  if ((method === 'PUT' || method === 'POST') && nfcCardMatch) return upsertNfcPetCard(request, env, nfcCardMatch[1]);
  if (method === 'GET' && path === '/api/pets') return listPets(request, env);
  if (method === 'POST' && path === '/api/pets') return createPet(request, env);
  if (method === 'GET' && path === '/api/location/points') return listLocationPoints(request, env, url);
  if (method === 'POST' && path === '/api/device/telemetry') return ingestTelemetry(request, env, url);
  if (method === 'GET' && path === '/api/device/telemetry/latest') return latestTelemetry(request, env, url);
  if (method === 'GET' && path === '/api/device/telemetry/history') return historyTelemetry(request, env, url);
  if (method === 'GET' && path === '/api/device/telemetry/stream') return telemetryStream(request, env, url);
  if (method === 'POST' && path === '/api/device/commands') return queueDeviceCommand(request, env);
  if (method === 'GET' && (path === '/api/device/command/next' || path === '/api/device/commands/next')) return nextDeviceCommand(request, env, url);
  if (method === 'GET' && path === '/api/ai/status') return aiStatus(env);
  if (method === 'POST' && path === '/api/ai/qwen-advice') return qwenAdvice(request, env);
  if (method === 'POST' && path === '/api/ai/qwen-diagnosis') return qwenDiagnosis(request, env);
  if (method === 'POST' && path === '/api/ai/video-behavior') return videoBehavior(request, env);
  if (method === 'POST' && path === '/api/pet-prediction') return petPrediction(request, env);
  if (method === 'POST' && path === '/api/chat') return chat(request, env);
  if (method === 'GET' && path.startsWith('/api/chat/history/')) return chatHistory(request, env, path);
  if (method === 'POST' && path === '/api/monitor/collect') return monitorCollect(request, env);
  if (method === 'GET' && path === '/api/monitor/metrics') return monitorMetrics(request, env);
  if (method === 'GET' && path === '/api/monitor/overview') return monitorOverview(request, env);
  if (method === 'GET' && path.startsWith('/api/map/tile/')) return mapTile(request);
  return json({ error: 'not found' }, 404);
}

function withCors(response, request) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get('origin') || '*';
  headers.set('access-control-allow-origin', origin);
  headers.set('vary', 'Origin');
  headers.set('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'Content-Type,Authorization,x-device-token,x-device-response');
  headers.set('access-control-max-age', '86400');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json().catch(() => ({}));
  if (type.includes('multipart/form-data')) return request.formData();
  const text = await request.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function text(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value);
}

function numberValue(...values) {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function boolValue(...values) {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'ok'].includes(normalized)) return true;
      if (['false', '0', 'no', 'invalid'].includes(normalized)) return false;
    }
  }
  return null;
}

function sanitizeCommandType(value) {
  const normalized = text(value || 'message').trim().toLowerCase();
  if (['message', 'upload', 'ping'].includes(normalized)) return normalized;
  return 'message';
}

function sanitizeCommandMessage(value) {
  return text(value || '').replace(/[\r\n\t]+/g, ' ').replace(/[<>]/g, '').trim().slice(0, 180);
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlJson(value) {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
}

async function signJwt(payload, env) {
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const body = base64UrlJson({ ...payload, exp });
  const input = `${header}.${body}`;
  return `${input}.${base64Url(await hmac(input, jwtSecret(env)))}`;
}

async function verifyJwt(token, env) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const input = `${parts[0]}.${parts[1]}`;
  const expected = base64Url(await hmac(input, jwtSecret(env)));
  if (expected !== parts[2]) return null;
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload.sub ? payload : null;
}

function jwtSecret(env) {
  return env.JWT_SECRET || 'pawtrace-cloudflare-dev-secret';
}

async function passwordHash(password) {
  const data = new TextEncoder().encode(`pawtrace:${password}`);
  return base64Url(await crypto.subtle.digest('SHA-256', data));
}

async function authUser(request, env) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const payload = await verifyJwt(token, env);
  if (!payload) return null;
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first();
  return user ? mapUser(user) : null;
}

async function requireAuth(request, env) {
  const user = await authUser(request, env);
  if (!user) return { response: json({ error: 'Unauthorized' }, 401) };
  return { user };
}

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    avatar: row.avatar || '',
    bio: row.bio || '',
    campus: row.campus || '',
    contact: row.contact || '',
  };
}

async function status(env) {
  return json({
    ready: true,
    service: 'PawTrace Cloudflare API',
    database: 'D1',
    ai: {
      dashscopeConfigured: Boolean(env.DASHSCOPE_API_KEY),
      textModel: env.QWEN_TEXT_MODEL || 'qwen3.6-plus',
      visionModel: env.QWEN_VISION_MODEL || 'qwen3.6-plus',
      thinkingEnabled: env.QWEN_ENABLE_THINKING === 'true',
    },
    lastSync: nowIso(),
  });
}

async function register(request, env) {
  const body = await readBody(request);
  const username = text(body.username).trim();
  const password = text(body.password);
  const displayName = text(body.displayName, username).trim() || username;
  if (username.length < 2) return json({ error: 'username required (min 2 chars)' }, 400);
  if (password.length < 8) return json({ error: 'password required (min 8 chars)' }, 400);
  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (existing) return json({ error: 'username taken' }, 409);
  const user = {
    id: `u-${crypto.randomUUID().slice(0, 12)}`,
    username,
    display_name: displayName,
    password_hash: await passwordHash(password),
  };
  await env.DB.prepare(
    'INSERT INTO users (id, username, password_hash, display_name, campus) VALUES (?, ?, ?, ?, ?)',
  ).bind(user.id, user.username, user.password_hash, user.display_name, 'Taicang').run();
  return json({ token: await signJwt({ sub: user.id, username }, env), user: mapUser(user) });
}

async function login(request, env) {
  const body = await readBody(request);
  const username = text(body.username).trim();
  const password = text(body.password);
  const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!user || user.password_hash !== await passwordHash(password)) return json({ error: 'Invalid credentials' }, 401);
  return json({ token: await signJwt({ sub: user.id, username: user.username }, env), user: mapUser(user) });
}

async function me(request, env) {
  const auth = await requireAuth(request, env);
  return auth.response || json({ user: auth.user });
}

function mapPet(row) {
  return {
    id: row.id,
    ownerId: row.owner_id || '',
    name: row.name,
    type: row.type || 'Pet',
    breed: row.breed || 'Unknown',
    age: row.age || 'Unknown',
    gender: row.gender || 'Unknown',
    avatar: row.avatar || '/assets/1.png',
    traits: parseJson(row.traits, []),
    health: row.health || '',
    status: row.status || '',
  };
}

async function listPets(request, env) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const rows = await env.DB.prepare(
    'SELECT * FROM pets WHERE owner_id = ? OR owner_id IS NULL ORDER BY created_at ASC LIMIT 100',
  ).bind(auth.user.id).all();
  return json({ pets: rows.results.map(mapPet) });
}

async function createPet(request, env) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const body = await readBody(request);
  if (!body.name) return json({ error: 'Pet name is required' }, 400);
  const pet = {
    id: id('p'),
    owner_id: auth.user.id,
    name: text(body.name),
    type: text(body.type, 'Pet'),
    breed: text(body.breed, 'Unknown'),
    age: text(body.age, 'Unknown'),
    gender: text(body.gender, 'Unknown'),
    avatar: text(body.avatar, '/assets/1.png'),
    traits: JSON.stringify(Array.isArray(body.traits) ? body.traits : []),
    health: text(body.health, 'No health notes yet.'),
    status: text(body.status, 'Receiving PawTrace care.'),
  };
  await env.DB.prepare(
    'INSERT INTO pets (id, owner_id, name, type, breed, age, gender, avatar, traits, health, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(pet.id, pet.owner_id, pet.name, pet.type, pet.breed, pet.age, pet.gender, pet.avatar, pet.traits, pet.health, pet.status).run();
  return json({ pet: mapPet(pet) });
}

function sanitizeNfcCardId(value) {
  return text(value || '').trim().replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
}

function cleanNfcText(value, fallback = '', max = 240) {
  return text(value, fallback).replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanNfcImage(value) {
  const src = cleanNfcText(value, '', 600);
  if (!src) return '';
  if (src.startsWith('/assets/')) return src;
  if (/^https:\/\//i.test(src)) return src;
  return '';
}

function sanitizePublicNfcPetPayload(input, routeCardId) {
  const source = input?.pet || input?.payload || input || {};
  const cardId = sanitizeNfcCardId(source.nfcId || source.nid || routeCardId);
  if (!cardId) return null;
  const traits = Array.isArray(source.traits)
    ? source.traits
    : text(source.traits || source.tags).split(/[,，;；]/);
  return {
    v: 1,
    i: cleanNfcText(source.id || source.i || cardId, cardId, 80),
    nid: cardId,
    n: cleanNfcText(source.name || source.n, 'Found pet', 80),
    t: cleanNfcText(source.type || source.t, 'Pet', 40),
    b: cleanNfcText(source.breed || source.b, 'Unknown', 80),
    l: cleanNfcText(source.location || source.l, 'Campus', 120),
    h: cleanNfcText(source.health || source.h, 'No health notes provided.', 260),
    s: cleanNfcText(source.status || source.s, 'No recent status notes.', 160),
    bd: cleanNfcText(source.birthday || source.bd || source.age, '', 40),
    g: cleanNfcText(source.gender || source.g, '', 30),
    traits: traits.map((item) => cleanNfcText(item, '', 28)).filter(Boolean).slice(0, 6),
    c: cleanNfcText(source.nfcContact || source.c || source.ownerContact || source.contact, '', 120),
    m: cleanNfcText(source.nfcNote || source.m, 'Please contact the owner if this pet is found.', 260),
    o: cleanNfcText(source.ownerName || source.o || source.owner, 'Pet owner', 80),
    campus: cleanNfcText(source.ownerCampus || source.campus, 'Taicang', 80),
    ownerUsername: cleanNfcText(source.ownerUsername || source.ou, '', 80),
    ownerBio: cleanNfcText(source.ownerBio || source.ob, '', 180),
    ownerAvatar: cleanNfcImage(source.ownerAvatar || source.oa),
    img: cleanNfcImage(source.avatar || source.img),
  };
}

async function getNfcPetCard(env, rawCardId) {
  const cardId = sanitizeNfcCardId(decodeURIComponent(rawCardId || ''));
  if (!cardId) return json({ error: 'card id required' }, 400);
  const row = await env.DB.prepare('SELECT payload_json, updated_at FROM nfc_pet_cards WHERE id = ?')
    .bind(cardId)
    .first();
  if (!row) return json({ error: 'NFC pet card not found' }, 404);
  return json({ pet: parseJson(row.payload_json, null), updatedAt: row.updated_at || '' });
}

async function upsertNfcPetCard(request, env, rawCardId) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const routeCardId = sanitizeNfcCardId(decodeURIComponent(rawCardId || ''));
  const body = await readBody(request);
  const payload = sanitizePublicNfcPetPayload(body, routeCardId);
  if (!payload) return json({ error: 'valid NFC card payload required' }, 400);
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO nfc_pet_cards (id, owner_id, payload_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET owner_id = excluded.owner_id, payload_json = excluded.payload_json, updated_at = excluded.updated_at`,
  ).bind(payload.nid, auth.user.id, JSON.stringify(payload), now, now).run();
  return json({ cardId: payload.nid, pet: payload, updatedAt: now });
}

async function listLocationPoints(request, env, url) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const limit = clamp(Number(url.searchParams.get('limit') || 100), 1, 500);
  const rows = await env.DB.prepare(
    'SELECT * FROM location_points WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
  ).bind(auth.user.id, limit).all();
  return json({ points: rows.results.map((row) => ({
    id: row.id,
    source: row.source,
    tagId: row.tag_id,
    deviceId: row.device_id,
    timestamp: row.timestamp,
    lat: row.lat,
    lon: row.lon,
    accuracy: row.accuracy,
    altitude: row.altitude,
  })) });
}

async function ingestTelemetry(request, env, url) {
  const configuredToken = env.DEVICE_INGEST_TOKEN || '';
  const deviceToken = request.headers.get('x-device-token') || '';
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const user = await authUser(request, env);
  if (!user && configuredToken && deviceToken !== configuredToken && bearer !== configuredToken) {
    return json({ error: 'Unauthorized device telemetry request' }, 401);
  }
  const body = await readBody(request);
  const payload = body instanceof FormData ? {} : body;
  const samples = Array.isArray(payload.samples) ? payload.samples.filter((sample) => sample && typeof sample === 'object') : [payload];
  const stored = [];
  for (const sample of samples.slice(0, 24)) {
    stored.push(await storeTelemetryPayload(env, user, sample));
  }
  const latest = stored[stored.length - 1];
  const compact = ['1', 'true', 'compact', 'minimal', 'fast'].includes(
    text(request.headers.get('x-device-response') || url.searchParams.get('response') || url.searchParams.get('compact')).toLowerCase(),
  );
  if (compact) return json({
    success: true,
    count: stored.length,
    id: latest?.telemetry?.id || null,
    deviceId: latest?.deviceId || null,
    receivedAt: latest?.receivedAt || nowIso(),
    locationPointId: latest?.locationPointId || null,
  });
  return json({
    success: true,
    count: stored.length,
    telemetry: latest?.telemetry || null,
    locationPointId: latest?.locationPointId || null,
  });
}

async function storeTelemetryPayload(env, authUserValue, payload) {
  const deviceId = text(payload.device_id || payload.deviceId || payload.device);
  if (!deviceId) throw new Error('deviceId is required');
  const resolvedUser = await resolvePayloadUser(env, authUserValue, payload);
  const receivedAt = nowIso();
  const timestamp = text(payload.timestamp || payload.capturedAt || payload.time, receivedAt);
  const lat = numberValue(payload.lat, payload.latitude);
  const lon = numberValue(payload.lon, payload.lng, payload.longitude);
  const locationValid = boolValue(payload.locationValid, payload.location_valid, payload.gpsValid, payload.gps_valid);
  const gpsFix = numberValue(payload.gpsFix, payload.gps_fix);
  const shouldStoreLocation = lat !== null && lon !== null && lat !== 0 && lon !== 0 && locationValid !== false && gpsFix !== 0;
  const metadata = {
    ...payload,
    source: text(payload.source, 'm5stack-wifi-http'),
    transport: text(payload.transport, 'wifi'),
  };
  const telemetryId = id('health');
  await env.DB.prepare(
    `INSERT INTO health_measurements
      (id, device_id, user_id, tag_id, timestamp, heart_rate_bpm, battery_pct, temp_c, accel_peak, activity, lat, lon, metadata, received_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    telemetryId,
    deviceId,
    resolvedUser?.id || null,
    text(payload.tagId || payload.tag_id, '') || null,
    timestamp,
    numberValue(payload.heartRateBpm, payload.heart_rate_bpm, payload.heartRate, payload.pet_bpm, payload.bpm),
    numberValue(payload.batteryPct, payload.battery_pct, payload.batteryPercent, payload.battery),
    numberValue(payload.tempC, payload.temp_c, payload.temperatureC, payload.temperature),
    numberValue(payload.accelPeak, payload.accelerationPeak),
    text(payload.activity || payload.activityState || payload.motionState, '') || null,
    shouldStoreLocation ? lat : null,
    shouldStoreLocation ? lon : null,
    JSON.stringify(metadata),
    receivedAt,
  ).run();

  let locationPointId = null;
  if (shouldStoreLocation) {
    locationPointId = id('loc');
    await env.DB.prepare(
      'INSERT INTO location_points (id, source, tag_id, device_id, user_id, timestamp, lat, lon, accuracy, altitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).bind(
      locationPointId,
      metadata.source,
      text(payload.tagId || payload.tag_id, '') || null,
      deviceId,
      resolvedUser?.id || null,
      timestamp,
      lat,
      lon,
      numberValue(payload.locationAccuracy, payload.location_accuracy, payload.accuracy, payload.gpsAccuracy),
      numberValue(payload.altitude, payload.alt),
    ).run();
  }

  const telemetry = await getTelemetryById(env, telemetryId);
  return { telemetry, telemetryId, deviceId, receivedAt, locationPointId };
}

async function resolvePayloadUser(env, authUserValue, payload) {
  if (authUserValue) return authUserValue;
  const raw = text(payload.userId || payload.user_id || payload.username || env.DEVICE_DEFAULT_USER || 'demo').trim();
  if (!raw) return null;
  return await env.DB.prepare('SELECT * FROM users WHERE id = ? OR username = ?').bind(raw, raw).first().then((row) => (row ? mapUser(row) : null));
}

async function queueDeviceCommand(request, env) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const body = await readBody(request);
  const deviceId = text(body.deviceId || body.device_id || body.device || 'm5stickc-plus-1-1').trim();
  if (!deviceId) return json({ error: 'deviceId is required' }, 400);
  const type = sanitizeCommandType(body.type || body.commandType || body.command);
  const message = sanitizeCommandMessage(body.message || body.text || body.body || (type === 'upload' ? 'upload now' : ''));
  const commandId = id('cmd');
  const payload = {
    ...body,
    deviceId,
    type,
    message,
    queuedBy: auth.user.id,
  };
  await env.DB.prepare(
    'INSERT INTO device_commands (id, device_id, user_id, type, message, payload, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).bind(
    commandId,
    deviceId,
    auth.user.id,
    type,
    message,
    JSON.stringify(payload),
    'pending',
  ).run();
  return json({
    ok: true,
    command: {
      id: commandId,
      deviceId,
      type,
      message,
      status: 'pending',
    },
  });
}

async function nextDeviceCommand(request, env, url) {
  const configuredToken = env.DEVICE_INGEST_TOKEN || '';
  const deviceToken = request.headers.get('x-device-token') || '';
  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (configuredToken && deviceToken !== configuredToken && bearer !== configuredToken) {
    return json({ error: 'Unauthorized device command request' }, 401);
  }
  const deviceId = text(url.searchParams.get('deviceId') || url.searchParams.get('device_id') || url.searchParams.get('device') || 'm5stickc-plus-1-1').trim();
  if (!deviceId) return json({ error: 'deviceId is required' }, 400);
  const row = await env.DB.prepare(
    "SELECT * FROM device_commands WHERE device_id = ? AND status = 'pending' ORDER BY created_at ASC LIMIT 1",
  ).bind(deviceId).first();
  if (!row) return json({ ok: true, command: false });
  await env.DB.prepare(
    "UPDATE device_commands SET status = 'sent', delivered_at = ? WHERE id = ?",
  ).bind(nowIso(), row.id).run();
  return json({
    ok: true,
    command: true,
    id: row.id,
    deviceId: row.device_id,
    type: row.type || 'message',
    message: row.message || '',
    createdAt: row.created_at,
  });
}

async function latestTelemetry(request, env, url) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const limit = clamp(Number(url.searchParams.get('limit') || 6), 1, 25);
  const deviceId = text(url.searchParams.get('deviceId')).trim();
  const rows = await telemetryRows(env, auth.user.id, deviceId, limit);
  return json({ telemetry: rows, latest: rows[0] || null, cacheSize: rows.length });
}

async function historyTelemetry(request, env, url) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const limit = clamp(Number(url.searchParams.get('limit') || 120), 1, 500);
  const deviceId = text(url.searchParams.get('deviceId')).trim();
  const rows = await telemetryRows(env, auth.user.id, deviceId, limit);
  return json({ telemetry: rows, range: { from: url.searchParams.get('from') || null, to: url.searchParams.get('to') || null }, limit });
}

async function telemetryRows(env, userId, deviceId, limit) {
  const query = deviceId
    ? 'SELECT * FROM health_measurements WHERE user_id = ? AND device_id = ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM health_measurements WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
  const stmt = deviceId ? env.DB.prepare(query).bind(userId, deviceId, limit) : env.DB.prepare(query).bind(userId, limit);
  const rows = await stmt.all();
  return rows.results.map(mapTelemetryRow);
}

async function getTelemetryById(env, telemetryId) {
  const row = await env.DB.prepare('SELECT * FROM health_measurements WHERE id = ?').bind(telemetryId).first();
  return row ? mapTelemetryRow(row) : null;
}

function mapTelemetryRow(row) {
  const metadata = parseJson(row.metadata, {});
  return {
    id: row.id,
    deviceId: row.device_id,
    device_id: row.device_id,
    userId: row.user_id,
    tagId: row.tag_id,
    timestamp: row.timestamp,
    heartRateBpm: row.heart_rate_bpm,
    pet_bpm: row.heart_rate_bpm,
    batteryPct: row.battery_pct,
    battery_pct: row.battery_pct,
    tempC: row.temp_c,
    temp_c: row.temp_c,
    accelPeak: row.accel_peak,
    activity: row.activity,
    lat: row.lat,
    lon: row.lon,
    receivedAt: row.received_at,
    source: metadata.source || 'm5stack-wifi-http',
    transport: metadata.transport || 'wifi',
    gpsFix: numberValue(metadata.gpsFix, metadata.gps_fix),
    gps_fix: numberValue(metadata.gpsFix, metadata.gps_fix),
    gpsSatsUsed: numberValue(metadata.gpsSatsUsed, metadata.gps_sats_used),
    gps_sats_used: numberValue(metadata.gpsSatsUsed, metadata.gps_sats_used),
    gpsVisible: numberValue(metadata.gpsVisible, metadata.gps_visible),
    gpsHdop: numberValue(metadata.gpsHdop, metadata.gps_hdop),
    locationValid: boolValue(metadata.locationValid, metadata.location_valid),
    location_valid: boolValue(metadata.locationValid, metadata.location_valid),
    lastLocationValid: boolValue(metadata.lastLocationValid, metadata.last_location_valid),
    heartFound: boolValue(metadata.heartFound, metadata.heart_found),
    heart_found: boolValue(metadata.heartFound, metadata.heart_found),
    finger: boolValue(metadata.finger),
    spo2: numberValue(metadata.spo2, metadata.spo2Pct),
    spo2Valid: boolValue(metadata.spo2Valid, metadata.spo2_valid),
    spo2_valid: boolValue(metadata.spo2Valid, metadata.spo2_valid),
    wifiConnected: boolValue(metadata.wifiConnected, metadata.wifi_connected),
    wifi_connected: boolValue(metadata.wifiConnected, metadata.wifi_connected),
    wifiRssi: numberValue(metadata.wifiRssi, metadata.wifi_rssi),
    uploadOk: boolValue(metadata.uploadOk, metadata.upload_ok),
    upload_ok: boolValue(metadata.uploadOk, metadata.upload_ok),
    uploadCode: numberValue(metadata.uploadCode, metadata.upload_code),
    upload_code: numberValue(metadata.uploadCode, metadata.upload_code),
    uptimeMs: numberValue(metadata.uptimeMs, metadata.uptime_ms),
    packetSeq: numberValue(metadata.packetSeq, metadata.packet_seq, metadata.seq),
    seq: numberValue(metadata.packetSeq, metadata.packet_seq, metadata.seq),
    boardTempC: numberValue(metadata.boardTempC, metadata.board_temp_c),
    movementScore: numberValue(metadata.movementScore, metadata.movement_score),
    filteredAccelMagnitudeG: numberValue(metadata.filteredAccelMagnitudeG, metadata.filtered_accel_magnitude_g),
    activityConfidence: numberValue(metadata.activityConfidence, metadata.activity_confidence),
    signalQuality: numberValue(metadata.signalQuality, metadata.signal_quality),
    sampleIntervalMs: numberValue(metadata.sampleIntervalMs, metadata.sample_interval_ms),
    metadata,
  };
}

async function telemetryStream(request, env, url) {
  const token = url.searchParams.get('token') || '';
  const authHeader = request.headers.get('authorization') || '';
  const streamRequest = new Request(request.url, {
    headers: { authorization: authHeader || `Bearer ${token}` },
  });
  const auth = await requireAuth(streamRequest, env);
  if (auth.response) return auth.response;
  const deviceId = text(url.searchParams.get('deviceId')).trim();
  const initial = await telemetryRows(env, auth.user.id, deviceId, 1);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`event: ready\ndata: ${JSON.stringify({ ready: true, heartbeatMs: 25000 })}\n\n`));
      for (const row of initial) controller.enqueue(encoder.encode(`event: telemetry\ndata: ${JSON.stringify({ telemetry: row, latest: row, fromCache: true })}\n\n`));
      controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify({ time: nowIso() })}\n\n`));
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}

async function aiStatus(env) {
  return json({
    dashscopeConfigured: Boolean(env.DASHSCOPE_API_KEY),
    textModel: env.QWEN_TEXT_MODEL || 'qwen3.6-plus',
    visionModel: env.QWEN_VISION_MODEL || 'qwen3.6-plus',
    thinkingEnabled: env.QWEN_ENABLE_THINKING === 'true',
    timeoutMs: Number(env.AI_TIMEOUT_MS || 60000),
  });
}

async function qwenAdvice(request, env) {
  const body = await readBody(request);
  const service = text(body.service, 'health');
  const prompt = text(body.prompt || body.message || body.text || body.symptoms, '');
  const system = 'You are PawTrace Health Engine, a careful pet-care assistant. Keep advice practical, concise, and include a safety disclaimer for urgent symptoms.';
  const content = `Service: ${service}\nUser context: ${JSON.stringify(body.userProfile || {})}\nPet context: ${JSON.stringify(body.petProfile || {})}\nRequest: ${prompt || 'Give a brief health and care update.'}`;
  const result = await callDashscope(env, env.QWEN_TEXT_MODEL, [
    { role: 'system', content: system },
    { role: 'user', content },
  ]);
  return json({ result: result || localAdvice(service), source: result ? 'qwen' : 'local' });
}

async function qwenDiagnosis(request, env) {
  const form = await readBody(request);
  let symptoms = '';
  let imageDataUrl = '';
  if (form instanceof FormData) {
    symptoms = text(form.get('symptoms') || form.get('prompt') || '');
    const file = form.get('photo') || form.get('image') || form.get('file');
    if (file && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer();
      imageDataUrl = `data:${file.type || 'image/jpeg'};base64,${arrayBufferToBase64(bytes)}`;
    }
  }
  const messages = imageDataUrl
    ? [{
        role: 'user',
        content: [
          { type: 'text', text: `Analyze this pet photo with symptoms: ${symptoms || 'No symptoms provided'}. Provide cautious next steps.` },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      }]
    : [{ role: 'user', content: `Analyze pet symptoms and provide cautious next steps: ${symptoms || 'No symptoms provided'}` }];
  const result = await callDashscope(env, env.QWEN_VISION_MODEL, messages);
  return json({ result: result || localAdvice('diagnosis'), source: result ? 'qwen' : 'local' });
}

async function callDashscope(env, model, messages) {
  if (!env.DASHSCOPE_API_KEY) return '';
  const response = await fetch(`${env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'qwen3.6-plus',
      messages,
      enable_thinking: env.QWEN_ENABLE_THINKING === 'true',
    }),
  }).catch(() => null);
  if (!response?.ok) return '';
  const data = await response.json().catch(() => ({}));
  return text(data?.choices?.[0]?.message?.content || data?.output?.text || '');
}

function localAdvice(service) {
  return `PawTrace ${service} note: keep monitoring appetite, energy, hydration, breathing, and comfort. If symptoms are severe, worsening, or include breathing trouble, collapse, persistent vomiting, seizure, or bleeding, contact a veterinarian urgently.`;
}

async function videoBehavior(request, env) {
  void request;
  void env;
  return json({
    success: true,
    summary: {
      riskLevel: 'low',
      activityType: 'normal_movement',
      movementScore: 42,
      analyzedFrames: 0,
      detectedFrames: 0,
      detectionRate: 0,
      durationSec: 0,
    },
    timeline: [{ startSec: 0, endSec: 5, behavior: 'normal_movement', risk: 'low' }],
    events: [{ timeSec: 0, label: 'Cloudflare API online', detail: 'Video upload was received; YOLO frame service is not attached to this Worker build.' }],
    advice: 'For full YOLO video scoring, attach a public VIDEO_AI_URL service. The rest of the PawTrace AI and telemetry stack is online.',
    disclaimer: VIDEO_DISCLAIMER,
  });
}

async function petPrediction(request, env) {
  const body = await readBody(request);
  const result = await callDashscope(env, env.QWEN_TEXT_MODEL, [
    { role: 'user', content: `Give one short pet care insight from this profile: ${JSON.stringify(body).slice(0, 4000)}` },
  ]);
  return json({ prediction: result || localAdvice('prediction'), result: result || localAdvice('prediction'), source: result ? 'qwen' : 'local' });
}

async function chat(request, env) {
  const body = await readBody(request);
  const user = await authUser(request, env);
  const contactId = text(body.contactId || body.contact_id || 'assistant');
  const contactProfile = text(body.contactProfile || body.contact_profile || '');
  const normalizedMessages = Array.isArray(body.messages)
    ? body.messages
      .map((message) => ({
        role: message?.role === 'assistant' ? 'assistant' : 'user',
        content: text(message?.content || '').trim(),
      }))
      .filter((message) => message.content)
      .slice(-12)
    : [];
  const directMessage = text(body.message || body.content || '').trim();
  const messages = normalizedMessages.length
    ? normalizedMessages
    : [{ role: 'user', content: directMessage || 'Say hello and ask about the pet.' }];
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || directMessage;

  if (user && latestUserMessage) {
    await env.DB.prepare('INSERT INTO chat_messages (id, user_id, contact_id, role, content) VALUES (?, ?, ?, ?, ?)')
      .bind(id('chat'), user.id, contactId, 'user', latestUserMessage).run();
  }
  const generatedReply = await callDashscope(env, env.QWEN_TEXT_MODEL, [
    {
      role: 'system',
      content: [
        'You are PawTrace Chat, a friendly pet-care assistant inside a campus pet app.',
        'Reply naturally as the selected pet owner/contact when appropriate.',
        'Use the contact profile for context, keep replies concise, practical, and safe.',
        contactProfile ? `Contact profile:\n${contactProfile}` : '',
      ].filter(Boolean).join('\n'),
    },
    ...messages,
  ]);
  const reply = generatedReply || 'I am online. Tell me what you noticed about your pet, and I will help organize the next care steps.';
  if (user) {
    await env.DB.prepare('INSERT INTO chat_messages (id, user_id, contact_id, role, content) VALUES (?, ?, ?, ?, ?)')
      .bind(id('chat'), user.id, contactId, 'assistant', reply).run();
  }
  return json({ reply, message: reply, source: generatedReply ? 'qwen' : 'local' });
}

async function chatHistory(request, env, path) {
  const auth = await requireAuth(request, env);
  if (auth.response) return auth.response;
  const contactId = decodeURIComponent(path.split('/').pop() || 'assistant');
  const rows = await env.DB.prepare(
    'SELECT role, content, created_at FROM chat_messages WHERE user_id = ? AND contact_id = ? ORDER BY created_at ASC LIMIT 100',
  ).bind(auth.user.id, contactId).all();
  const history = rows.results.map((row) => ({ role: row.role, content: row.content, createdAt: row.created_at }));
  return json({ history, messages: history });
}

async function monitorCollect(request, env) {
  const user = await authUser(request, env);
  const body = await readBody(request);
  await env.DB.prepare('INSERT INTO monitor_events (id, user_id, payload) VALUES (?, ?, ?)')
    .bind(id('mon'), user?.id || null, JSON.stringify(body).slice(0, 100000)).run();
  return json({ success: true });
}

async function monitorMetrics(request, env) {
  const auth = monitorAuthResponse(request, env);
  if (auth) return auth;
  const counts = await monitorCounts(env);
  return json({
    uptimeSeconds: 0,
    requests: counts.monitorEvents + counts.healthMeasurements + counts.chatMessages,
    routes: {
      '/api/monitor/collect': {
        count: counts.monitorEvents,
        avgMs: '0',
        maxMs: '0',
        status: { 200: counts.monitorEvents },
      },
      '/api/device/telemetry': {
        count: counts.healthMeasurements,
        avgMs: '0',
        maxMs: '0',
        status: { 200: counts.healthMeasurements },
      },
      '/api/chat': {
        count: counts.chatMessages,
        avgMs: '0',
        maxMs: '0',
        status: { 200: counts.chatMessages },
      },
    },
    counts,
  });
}

async function monitorOverview(request, env) {
  const auth = monitorAuthResponse(request, env);
  if (auth) return auth;
  const [
    counts,
    userRows,
    petRows,
    telemetryRowsResult,
    chatRows,
    monitorRows,
    deviceRows,
  ] = await Promise.all([
    monitorCounts(env),
    env.DB.prepare(
      `SELECT id, username, display_name, avatar, bio, campus, contact, created_at, updated_at
       FROM users ORDER BY updated_at DESC LIMIT 140`,
    ).all(),
    env.DB.prepare(
      `SELECT
         p.*,
         u.id AS owner_join_id,
         u.username AS owner_username,
         u.display_name AS owner_display_name,
         u.avatar AS owner_avatar,
         u.bio AS owner_bio,
         u.campus AS owner_campus,
         u.contact AS owner_contact
       FROM pets p
       LEFT JOIN users u ON u.id = p.owner_id
       ORDER BY p.created_at DESC LIMIT 160`,
    ).all(),
    env.DB.prepare('SELECT * FROM health_measurements ORDER BY created_at DESC LIMIT 360').all(),
    env.DB.prepare('SELECT id, contact_id, role, content, created_at FROM chat_messages ORDER BY created_at DESC LIMIT 140').all(),
    env.DB.prepare('SELECT id, user_id, payload, created_at FROM monitor_events ORDER BY created_at DESC LIMIT 220').all(),
    env.DB.prepare(
      `SELECT DISTINCT device_id FROM health_measurements
       WHERE device_id IS NOT NULL AND device_id <> ''`,
    ).all(),
  ]);
  const monitoring = monitoringFromRows(monitorRows.results || []);
  const captured = monitoringCounts(monitoring);
  return json({
    capturedAt: nowIso(),
    summary: captured,
    appData: {
      summary: {
        users: counts.users,
        pets: counts.pets,
        healthMeasurements: counts.healthMeasurements,
        locationPoints: counts.locationPoints,
        chatMessages: counts.chatMessages,
        devicesTracked: (deviceRows.results || []).filter((row) => row.device_id).length,
      },
      users: (userRows.results || []).map(mapMonitorUser),
      pets: (petRows.results || []).map(mapMonitorPet),
      telemetry: (telemetryRowsResult.results || []).map(mapTelemetryRow),
      chatMessages: (chatRows.results || []).map((row) => ({
        id: row.id,
        contactId: row.contact_id || 'app-chat',
        role: row.role || 'message',
        content: row.content || '',
        createdAt: row.created_at,
      })),
    },
    monitoring,
  });
}

function monitorAuthResponse(request, env) {
  const required = text(env.MONITOR_API_TOKEN || '').trim();
  if (!required) return null;
  const url = new URL(request.url);
  const token = text(url.searchParams.get('token') || url.searchParams.get('monitor_token')).trim();
  const bearer = text(request.headers.get('authorization')).replace(/^Bearer\s+/i, '').trim();
  if (token === required || bearer === required) return null;
  return json({ error: 'Unauthorized' }, 401);
}

async function monitorCounts(env) {
  const [
    users,
    pets,
    healthMeasurements,
    locationPoints,
    chatMessages,
    monitorEvents,
  ] = await Promise.all([
    tableCount(env, 'users'),
    tableCount(env, 'pets'),
    tableCount(env, 'health_measurements'),
    tableCount(env, 'location_points'),
    tableCount(env, 'chat_messages'),
    tableCount(env, 'monitor_events'),
  ]);
  return { users, pets, healthMeasurements, locationPoints, chatMessages, monitorEvents };
}

async function tableCount(env, tableName) {
  const allowed = new Set([
    'users',
    'pets',
    'health_measurements',
    'location_points',
    'chat_messages',
    'monitor_events',
  ]);
  if (!allowed.has(tableName)) return 0;
  const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).first();
  return Number(row?.count || 0);
}

function mapMonitorUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    avatar: row.avatar || '',
    bio: row.bio || '',
    campus: row.campus || '',
    contact: row.contact || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMonitorPet(row) {
  return {
    pet: mapPet(row),
    owner: row.owner_join_id ? {
      id: row.owner_join_id,
      username: row.owner_username || '',
      displayName: row.owner_display_name || row.owner_username || '',
      avatar: row.owner_avatar || '',
      bio: row.owner_bio || '',
      campus: row.owner_campus || '',
      contact: row.owner_contact || '',
    } : null,
    createdAt: row.created_at,
  };
}

function monitoringFromRows(rows) {
  const monitoring = {
    userProfiles: [],
    petProfiles: [],
    purchases: [],
    chatLogs: [],
  };
  for (const row of rows) {
    const payload = parseJson(row.payload, {});
    if (!isRecord(payload)) continue;
    const capturedAt = row.created_at || nowIso();
    const metadata = isRecord(payload.metadata) ? payload.metadata : {};
    const personalInfo = isRecord(payload.personalInfo) ? payload.personalInfo : null;
    const userProfile = isRecord(payload.userProfile) ? payload.userProfile : (isRecord(payload.profile) ? payload.profile : null);
    if (userProfile || personalInfo) {
      monitoring.userProfiles.push({
        id: row.id,
        capturedAt,
        profile: userProfile || {},
        personalInfo: personalInfo || {},
        metadata,
      });
    }
    for (const pet of normalizeRecordList(payload.pets ?? payload.pet)) {
      monitoring.petProfiles.push({
        id: row.id,
        capturedAt,
        ownerLabel: text(payload.ownerLabel || metadata.ownerLabel || metadata.username || row.user_id, 'Cloudflare user'),
        pet,
        metadata,
      });
    }
    for (const purchase of normalizeRecordList(payload.purchases ?? payload.purchase)) {
      monitoring.purchases.push({
        id: row.id,
        capturedAt,
        purchase,
        metadata,
      });
    }
    for (const log of normalizeRecordList(payload.chatLogs ?? payload.chatLog)) {
      monitoring.chatLogs.push({
        id: row.id,
        capturedAt,
        contactId: text(log.contactId || metadata.contactId || 'unknown'),
        messages: normalizeRecordList(log.messages),
        reply: text(log.reply || log.content || ''),
      });
    }
  }
  return monitoring;
}

function monitoringCounts(monitoring) {
  const contacts = new Set(monitoring.chatLogs.map((row) => row.contactId).filter(Boolean));
  return {
    userProfiles: monitoring.userProfiles.length,
    petProfiles: monitoring.petProfiles.length,
    purchases: monitoring.purchases.length,
    chatLogs: monitoring.chatLogs.length,
    contactsTracked: contacts.size,
  };
}

function normalizeRecordList(value) {
  if (Array.isArray(value)) return value.filter(isRecord);
  return isRecord(value) ? [value] : [];
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

async function mapTile(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').slice(-3);
  const target = `https://tile.openstreetmap.org/${parts.join('/')}`;
  const response = await fetch(target, { headers: { 'user-agent': 'PawTrace/1.0' } });
  return new Response(response.body, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'image/png',
      'cache-control': 'public, max-age=86400',
    },
  });
}

function parseJson(value, fallback) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback);
  } catch {
    return fallback;
  }
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
