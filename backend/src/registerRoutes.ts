import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Express, Request, Response, NextFunction } from 'express';
import type { Prisma, Pet as PetRow, User as UserRow } from '@prisma/client';
import { prisma } from './lib/prisma.js';
import { config } from './config.js';
import * as ai from './services/aiService.js';
import type { AppMetrics } from './middleware/metrics.js';
import { requireMonitorAuth } from './middleware/monitorAuth.js';
import { optionalAuth } from './middleware/jwtAuth.js';

function toIsoTimestamp(input?: string): string {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function canonicalNfcPayload(v: number, userId: string, petId: string, exp: number) {
  return `v=${v}&userId=${userId}&petId=${petId}&exp=${exp}`;
}

function mapPet(p: PetRow) {
  const traits = Array.isArray(p.traits) ? (p.traits as unknown[]) : JSON.parse(JSON.stringify(p.traits || []));
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    breed: p.breed,
    age: p.age,
    gender: p.gender,
    avatar: p.avatar,
    traits,
    health: p.health,
    status: p.status,
  };
}

function mapUser(u: UserRow) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatar,
    bio: u.bio,
    campus: u.campus,
    contact: u.contact,
  };
}

async function resolveUserId(input: string | undefined | null): Promise<string | null> {
  if (!input) return null;
  const v = String(input).trim();
  if (!v) return null;
  const u = await prisma.user.findFirst({
    where: { OR: [{ id: v }, { username: v }] },
  });
  return u?.id ?? v;
}

async function trimLocationPoints(max: number) {
  const count = await prisma.locationPoint.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.locationPoint.findMany({
    orderBy: { createdAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.locationPoint.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

async function trimHealthMeasurements(max: number) {
  const count = await prisma.healthMeasurement.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.healthMeasurement.findMany({
    orderBy: { createdAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.healthMeasurement.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

async function trimMonitoringUserProfiles(max: number) {
  const count = await prisma.monitoringUserProfile.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.monitoringUserProfile.findMany({
    orderBy: { capturedAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.monitoringUserProfile.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

async function trimMonitoringPetProfiles(max: number) {
  const count = await prisma.monitoringPetProfile.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.monitoringPetProfile.findMany({
    orderBy: { capturedAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.monitoringPetProfile.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

async function trimMonitoringPurchases(max: number) {
  const count = await prisma.monitoringPurchase.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.monitoringPurchase.findMany({
    orderBy: { capturedAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.monitoringPurchase.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

async function trimMonitoringChatLogs(max: number) {
  const count = await prisma.monitoringChatLog.count();
  if (count <= max) return;
  const toDelete = count - max;
  const rows = await prisma.monitoringChatLog.findMany({
    orderBy: { capturedAt: 'asc' },
    take: toDelete,
    select: { id: true },
  });
  await prisma.monitoringChatLog.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
}

export function registerRoutes(
  app: Express,
  deps: { metrics: AppMetrics; requireDeviceAuth: (req: Request, res: Response, next: NextFunction) => void }
) {
  const { requireDeviceAuth } = deps;

  function signNfcPayload(userId: string, petId: string, exp: number) {
    const msg = canonicalNfcPayload(config.NFC_PAYLOAD_VERSION, userId, petId, exp);
    return crypto.createHmac('sha256', config.NFC_CARD_SECRET).update(msg).digest('hex');
  }

  // --- Auth ---
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, displayName } = req.body || {};
      const u = String(username || '').trim();
      const p = String(password || '');
      if (!u || u.length < 2) return res.status(400).json({ error: 'username required (min 2 chars)' });
      if (!p || p.length < 4) return res.status(400).json({ error: 'password required (min 4 chars)' });
      const exists = await prisma.user.findUnique({ where: { username: u } });
      if (exists) return res.status(409).json({ error: 'username taken' });
      const passwordHash = await bcrypt.hash(p, 10);
      const id = `u-${crypto.randomBytes(6).toString('hex')}`;
      const user = await prisma.user.create({
        data: {
          id,
          username: u,
          passwordHash,
          displayName: String(displayName || u).slice(0, 80),
        },
      });
      const token = jwt.sign({ sub: user.id, username: user.username }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES,
      } as SignOptions);
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
      const token = jwt.sign({ sub: user.id, username: user.username }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES,
      } as SignOptions);
      res.json({ token, user: mapUser(user) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', optionalAuth, async (req, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: req.authUser.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: mapUser(user) });
  });

  // --- Pets & users ---
  app.get('/api/pets', async (_req, res) => {
    const pets = await prisma.pet.findMany({ orderBy: { id: 'asc' } });
    res.json({ pets: pets.map(mapPet) });
  });

  app.get('/api/pets/:id', async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json({ pet: mapPet(pet) });
  });

  app.post('/api/pets', optionalAuth, async (req, res) => {
    const payload = req.body || {};
    if (!payload.name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }
    const petSprites = ['/assets/1.png', '/assets/2.png', '/assets/3.png', '/assets/4.png', '/assets/5.png', '/assets/6.png'];
    const randomSprite = petSprites[Math.floor(Math.random() * petSprites.length)];
    const traits = Array.isArray(payload.traits)
      ? payload.traits
      : String(payload.traits || '')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
    const newId = `p${Date.now()}`;
    const traitsJson = traits as unknown as Prisma.InputJsonValue;
    const pet = await prisma.pet.create({
      data: {
        id: newId,
        ownerId: req.authUser?.sub ?? null,
        name: payload.name,
        type: payload.type || 'Pet',
        breed: payload.breed || 'Unknown',
        age: payload.age || 'Unknown',
        gender: payload.gender || 'Unknown',
        avatar: payload.avatar || randomSprite,
        traits: traitsJson,
        health: payload.health || 'No health notes yet.',
        status: payload.status || 'Just joined the crew.',
      },
    });
    res.json({ pet: mapPet(pet) });
  });

  app.delete('/api/pets/:id', optionalAuth, async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (req.authUser && pet.ownerId && pet.ownerId !== req.authUser.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.pet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.get('/api/chat/history/:contactId', async (req, res) => {
    const rows = await prisma.chatMessage.findMany({
      where: { contactId: req.params.contactId },
      orderBy: { id: 'asc' },
      select: { role: true, content: true },
    });
    res.json({ history: rows });
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      ready: true,
      aiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      lastSync: new Date().toISOString(),
    });
  });

  app.get('/api/users', async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json({ users: users.map(mapUser) });
  });

  app.post('/api/location/points', requireDeviceAuth, async (req, res) => {
    const payload = req.body || {};
    const lat = Number(payload.lat);
    const lon = Number(payload.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required (numbers)' });
    }
    const pointId = `loc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const userId = payload.userId ? await resolveUserId(payload.userId) : null;
    await prisma.locationPoint.create({
      data: {
        id: pointId,
        source: payload.source || 'unknown',
        tagId: payload.tagId || null,
        deviceId: payload.deviceId || null,
        userId,
        timestamp: toIsoTimestamp(payload.timestamp),
        lat,
        lon,
        accuracy: payload.accuracy !== undefined ? Number(payload.accuracy) : null,
        altitude: payload.altitude !== undefined ? Number(payload.altitude) : null,
      },
    });
    await trimLocationPoints(config.SENSOR_MAX);
    res.json({ success: true, id: pointId });
  });

  app.get('/api/location/points', async (req, res) => {
    const { deviceId, userId, limit } = req.query || {};
    const max = Math.min(Number(limit || 100), 500);
    const normalizedUserId = userId ? await resolveUserId(String(userId)) : null;
    const where: Prisma.LocationPointWhereInput = {};
    if (deviceId) where.deviceId = String(deviceId);
    if (normalizedUserId) where.userId = normalizedUserId;
    const points = await prisma.locationPoint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: max,
    });
    const mapped = points.reverse().map((r) => ({
      id: r.id,
      source: r.source,
      tagId: r.tagId,
      deviceId: r.deviceId,
      userId: r.userId,
      timestamp: r.timestamp,
      lat: r.lat,
      lon: r.lon,
      accuracy: r.accuracy,
      altitude: r.altitude,
    }));
    res.json({ points: mapped.slice(-max) });
  });

  app.post('/api/location/last', async (req, res) => {
    const payload = req.body || {};
    const lat = Number(payload.lat);
    const lon = Number(payload.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required (numbers)' });
    }
    const rawUserId = payload.userId || null;
    if (!rawUserId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const userId = await resolveUserId(String(rawUserId));
    if (!userId) return res.status(400).json({ error: 'user not found' });
    await prisma.lastLocation.upsert({
      where: { userId },
      create: {
        userId,
        lat,
        lon,
        accuracy: payload.accuracy !== undefined ? Number(payload.accuracy) : null,
        timestamp: toIsoTimestamp(payload.timestamp),
        source: payload.source || 'app-gps',
      },
      update: {
        lat,
        lon,
        accuracy: payload.accuracy !== undefined ? Number(payload.accuracy) : null,
        timestamp: toIsoTimestamp(payload.timestamp),
        source: payload.source || 'app-gps',
      },
    });
    res.json({ success: true, userId, updatedAt: new Date().toISOString(), ageMs: 0 });
  });

  app.post('/api/health/measurements', requireDeviceAuth, async (req, res) => {
    const payload = req.body || {};
    const receivedAt = new Date().toISOString();
    const normalizedUserId = payload.userId ? await resolveUserId(payload.userId) : null;
    const measurementId = `health-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    let lat = payload.lat !== undefined ? Number(payload.lat) : null;
    let lon = payload.lon !== undefined ? Number(payload.lon) : null;
    let locationAccuracy = payload.locationAccuracy !== undefined ? Number(payload.locationAccuracy) : null;
    let locationTimestamp = payload.locationTimestamp ? toIsoTimestamp(payload.locationTimestamp) : null;
    let metadata: Prisma.InputJsonValue | undefined =
      payload.metadata && typeof payload.metadata === 'object'
        ? (payload.metadata as Prisma.InputJsonValue)
        : undefined;

    if (
      (!Number.isFinite(lat as number) || !Number.isFinite(lon as number)) &&
      normalizedUserId
    ) {
      const last = await prisma.lastLocation.findUnique({ where: { userId: normalizedUserId } });
      if (last?.timestamp) {
        const tsMs = new Date(last.timestamp).getTime();
        if (Number.isFinite(tsMs)) {
          const ageMs = Date.now() - tsMs;
          if (ageMs <= config.LOCATION_LAST_MAX_AGE_MS) {
            lat = Number(last.lat);
            lon = Number(last.lon);
            locationAccuracy = last.accuracy !== undefined && last.accuracy !== null ? last.accuracy : null;
            locationTimestamp = last.timestamp;
            const metaObj =
              metadata && typeof metadata === 'object' && !Array.isArray(metadata)
                ? { ...(metadata as object) }
                : {};
            (metaObj as Record<string, string>).locationSource = last.source || 'app-gps';
            metadata = metaObj as Prisma.InputJsonValue;
          }
        }
      }
    }

    await prisma.healthMeasurement.create({
      data: {
        id: measurementId,
        deviceId: payload.deviceId || null,
        userId: normalizedUserId,
        tagId: payload.tagId || null,
        timestamp: toIsoTimestamp(payload.timestamp),
        heartRateBpm: payload.heartRateBpm !== undefined ? Number(payload.heartRateBpm) : null,
        soundLevelDb: payload.soundLevelDb !== undefined ? Number(payload.soundLevelDb) : null,
        batteryPct: payload.batteryPct !== undefined ? Number(payload.batteryPct) : null,
        steps: payload.steps !== undefined ? Number(payload.steps) : null,
        tempC: payload.tempC !== undefined ? Number(payload.tempC) : null,
        accelPeak: payload.accelPeak !== undefined ? Number(payload.accelPeak) : null,
        activity: payload.activity !== undefined ? String(payload.activity) : null,
        lat: lat !== null && Number.isFinite(lat) ? lat : null,
        lon: lon !== null && Number.isFinite(lon) ? lon : null,
        locationAccuracy,
        locationTimestamp,
        quality: payload.quality !== undefined ? String(payload.quality) : null,
        metadata,
        receivedAt,
      },
    });
    await trimHealthMeasurements(config.SENSOR_MAX);
    res.json({ success: true, id: measurementId });
  });

  app.get('/api/health/measurements', async (req, res) => {
    const { deviceId, userId, limit } = req.query || {};
    const max = Math.min(Number(limit || 100), 500);
    const normalizedUserId = userId ? await resolveUserId(String(userId)) : null;
    const where: Prisma.HealthMeasurementWhereInput = {};
    if (deviceId) where.deviceId = String(deviceId);
    if (normalizedUserId) where.userId = normalizedUserId;
    const rows = await prisma.healthMeasurement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: max,
    });
    const items = rows.reverse().map((r) => {
      let meta: unknown = null;
      try {
        meta = r.metadata ?? null;
      } catch {
        meta = null;
      }
      return {
        id: r.id,
        deviceId: r.deviceId,
        userId: r.userId,
        tagId: r.tagId,
        timestamp: r.timestamp,
        heartRateBpm: r.heartRateBpm,
        soundLevelDb: r.soundLevelDb,
        batteryPct: r.batteryPct,
        steps: r.steps,
        tempC: r.tempC,
        accelPeak: r.accelPeak,
        activity: r.activity,
        lat: r.lat,
        lon: r.lon,
        locationAccuracy: r.locationAccuracy,
        locationTimestamp: r.locationTimestamp,
        quality: r.quality,
        metadata: meta,
        receivedAt: r.receivedAt,
      };
    });
    res.json({ items: items.slice(-max) });
  });

  app.post('/api/nfc/payload', (req, res) => {
    if (!config.NFC_CARD_SECRET) {
      return res.status(500).json({ error: 'NFC_CARD_SECRET is not configured on the server' });
    }
    const payload = req.body || {};
    const { userId, petId } = payload;
    const ttlSeconds = payload.ttlSeconds ? Number(payload.ttlSeconds) : 86400;
    if (!userId || !petId) {
      return res.status(400).json({ error: 'userId and petId are required' });
    }
    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
      return res.status(400).json({ error: 'ttlSeconds must be a positive number' });
    }
    const exp = Math.floor(Date.now() / 1000) + Math.floor(ttlSeconds);
    const sig = signNfcPayload(String(userId), String(petId), exp);
    res.json({
      payload: {
        v: config.NFC_PAYLOAD_VERSION,
        userId,
        petId,
        exp,
        sig,
      },
    });
  });

  app.get('/api/nfc/public', async (req, res) => {
    const { userId, petId } = req.query || {};
    if (!userId || !petId) {
      return res.status(400).json({ error: 'userId and petId are required' });
    }
    const uid = await resolveUserId(String(userId));
    const card = await getPublicCard(uid || String(userId), String(petId));
    if (!card) return res.status(404).json({ error: 'User or pet not found' });
    res.json({ valid: true, ...card });
  });

  app.post('/api/nfc/verify', async (req, res) => {
    const body = req.body || {};
    let raw = body.payload;
    let payload = raw;
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw);
      } catch {
        return res.status(400).json({ error: 'payload must be a JSON object or JSON string' });
      }
    }
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'payload is required' });
    }
    const { v, userId, petId, exp, sig } = payload as Record<string, unknown>;
    if (v !== config.NFC_PAYLOAD_VERSION) {
      return res.status(400).json({ error: 'Unsupported NFC payload version' });
    }
    if (!userId || !petId || !exp || !sig) {
      return res.status(400).json({ error: 'payload missing required fields' });
    }

    if (!config.NFC_CARD_SECRET) {
      const nowSec = Math.floor(Date.now() / 1000);
      if (Number(exp) < nowSec) {
        return res.status(401).json({ valid: false, error: 'NFC payload expired' });
      }
      const card = await getPublicCard(String(userId), String(petId));
      if (!card) return res.status(404).json({ valid: false, error: 'User or pet not found' });
      return res.json({ valid: true, unsigned: true, ...card });
    }

    const expectedSig = signNfcPayload(String(userId), String(petId), Number(exp));
    const a = Buffer.from(String(expectedSig), 'utf8');
    const b = Buffer.from(String(sig), 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ valid: false, error: 'Invalid NFC signature' });
    }
    const nowSec = Math.floor(Date.now() / 1000);
    if (Number(exp) < nowSec) {
      return res.status(401).json({ valid: false, error: 'NFC payload expired' });
    }
    const card = await getPublicCard(String(userId), String(petId));
    if (!card) return res.status(404).json({ valid: false, error: 'User or pet not found' });
    res.json({ valid: true, ...card });
  });

  async function getPublicCard(userId: string, petId: string) {
    const user = await prisma.user.findFirst({ where: { OR: [{ id: userId }, { username: userId }] } });
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!user || !pet) return null;
    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        contact: user.contact,
        campus: user.campus,
        bio: user.bio,
      },
      pet: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        avatar: pet.avatar,
        status: pet.status,
        health: pet.health,
      },
    };
  }

  app.get('/api/map-locations', (_req, res) => {
    res.json({
      spots: [
        { id: '1', name: 'Central Lawn', desc: 'Wide grass field...', link: '#' },
        { id: '2', name: 'Orange Corner Café', desc: 'Pet-friendly café with outdoor seating.', link: '#' },
      ],
    });
  });

  app.get('/api/sticky-notes', async (_req, res) => {
    const notes = await prisma.stickyNote.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ notes: notes.map((n) => ({ id: n.id, text: n.text, createdAt: n.createdAt.toISOString() })) });
  });

  app.post('/api/sticky-notes', async (req, res) => {
    const text = String(req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Note text is required' });
    }
    const note = await prisma.stickyNote.create({
      data: { id: `note-${Date.now()}`, text },
    });
    res.json({ note: { id: note.id, text: note.text, createdAt: note.createdAt.toISOString() } });
  });

  app.delete('/api/sticky-notes/:id', async (req, res) => {
    await prisma.stickyNote.deleteMany({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.delete('/api/sticky-notes', async (_req, res) => {
    await prisma.stickyNote.deleteMany();
    res.json({ success: true });
  });

  app.get('/api/monitor/metrics', requireMonitorAuth, (_req, res) => {
    const metrics = deps.metrics;
    const summary = Object.entries(metrics.routes).reduce(
      (acc, [route, stat]) => {
        acc[route] = {
          count: stat.count,
          avgMs: stat.count ? Number(stat.sumMs / stat.count).toFixed(2) : '0',
          maxMs: Number(stat.maxMs).toFixed(2),
          status: stat.status,
        };
        return acc;
      },
      {} as Record<string, Record<string, unknown>>
    );
    res.json({
      uptimeSeconds: Math.floor((Date.now() - metrics.startedAt) / 1000),
      requests: metrics.requests,
      routes: summary,
    });
  });

  app.post('/api/monitor/collect', requireMonitorAuth, async (req, res) => {
    const payload = req.body || {};
    const metadata =
      payload && typeof payload.metadata === 'object' && payload.metadata !== null ? payload.metadata : {};
    const personalInfo =
      payload && typeof payload.personalInfo === 'object' && payload.personalInfo !== null
        ? payload.personalInfo
        : undefined;
    const captured = { userProfiles: 0, petProfiles: 0, purchases: 0 };

    if (payload.userProfile && typeof payload.userProfile === 'object') {
      const id = `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await prisma.monitoringUserProfile.create({
        data: {
          id,
          profileJson: payload.userProfile as Prisma.InputJsonValue,
          personalInfoJson: personalInfo as Prisma.InputJsonValue | undefined,
          metadataJson: metadata as Prisma.InputJsonValue,
        },
      });
      await trimMonitoringUserProfiles(config.MONITOR_MAX);
      captured.userProfiles += 1;
    }

    const petPayload = Array.isArray(payload.pets) ? payload.pets.filter((p: unknown) => p && typeof p === 'object') : [];
    if (petPayload.length) {
      const ownerLabel =
        payload?.userProfile?.username || personalInfo?.username || (metadata as { username?: string }).username || 'anonymous';
      for (const pet of petPayload) {
        const id = `pet-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await prisma.monitoringPetProfile.create({
          data: {
            id,
            ownerLabel: String(ownerLabel),
            petJson: pet as Prisma.InputJsonValue,
            metadataJson: metadata as Prisma.InputJsonValue,
          },
        });
      }
      await trimMonitoringPetProfiles(config.MONITOR_MAX);
      captured.petProfiles += petPayload.length;
    }

    const shoppingPayload = Array.isArray(payload.shopping)
      ? payload.shopping.filter((item: unknown) => item && typeof item === 'object')
      : [];
    for (const item of shoppingPayload) {
      const id = (item as { id?: string }).id || `purchase-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await prisma.monitoringPurchase.create({
        data: {
          id,
          purchaseJson: item as Prisma.InputJsonValue,
          metadataJson: metadata as Prisma.InputJsonValue,
        },
      });
    }
    if (shoppingPayload.length) await trimMonitoringPurchases(config.MONITOR_MAX);
    captured.purchases += shoppingPayload.length;

    const [up, pp, pur, ch] = await Promise.all([
      prisma.monitoringUserProfile.count(),
      prisma.monitoringPetProfile.count(),
      prisma.monitoringPurchase.count(),
      prisma.monitoringChatLog.count(),
    ]);
    res.json({
      success: true,
      captured,
      totals: {
        userProfiles: up,
        petProfiles: pp,
        purchases: pur,
        chatLogs: ch,
      },
    });
  });

  app.get('/api/monitor/overview', requireMonitorAuth, async (_req, res) => {
    const monitoring = await getMonitoringOverview();
    const distinctContacts = await prisma.chatMessage.findMany({ distinct: ['contactId'], select: { contactId: true } });
    res.json({
      capturedAt: new Date().toISOString(),
      summary: {
        userProfiles: monitoring.userProfiles,
        petProfiles: monitoring.petProfiles,
        purchases: monitoring.purchases,
        chatLogs: monitoring.chatLogs,
        contactsTracked: distinctContacts.length,
      },
      monitoring: {
        purchases: await prisma.monitoringPurchase.findMany({ orderBy: { capturedAt: 'desc' }, take: 50 }),
      },
    });
  });

  async function getMonitoringOverview() {
    const [userProfiles, petProfiles, purchases, chatLogs] = await Promise.all([
      prisma.monitoringUserProfile.count(),
      prisma.monitoringPetProfile.count(),
      prisma.monitoringPurchase.count(),
      prisma.monitoringChatLog.count(),
    ]);
    return { userProfiles, petProfiles, purchases, chatLogs };
  }

  app.post('/api/pet-prediction', async (req, res) => {
    const profile = req.body?.profile || {};
    if (!profile.starSign && !profile.petName) {
      return res.json({ prediction: 'Share your star sign or main pet info to unlock predictions.' });
    }
    const fallback = ai.getLocalPetPrediction(profile);
    if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
      return res.json({ prediction: fallback, source: 'local' });
    }
    const qPayload = {
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content:
            'You are an upbeat pet behavior astrologist for a campus pet community. Reply with at most 3 short sentences including one actionable tip.',
        },
        { role: 'user', content: ai.buildPetPredictionPrompt(profile) },
      ],
    };
    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify(qPayload),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Pet prediction error', text);
        return res.json({ prediction: fallback, source: 'local' });
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const prediction =
        data.choices && data.choices[0] && data.choices[0].message
          ? data.choices[0].message.content
          : fallback;
      res.json({ prediction });
    } catch (err) {
      console.error('Pet prediction server error:', err);
      res.json({ prediction: fallback, source: 'local' });
    }
  });

  app.post('/api/ai/qwen-advice', async (req, res) => {
    const { service, context, profile, pets } = req.body || {};
    if (!service || !['health', 'behavior', 'diet'].includes(service)) {
      return res.status(400).json({ error: 'service must be one of health | behavior | diet' });
    }
    const messages = ai.buildQwenAdviceMessages(service, context, profile || {}, pets || []);
    try {
      const result = await ai.callQwen(messages);
      res.json({ result: result || 'Unable to generate advice. Please try again.' });
    } catch (err) {
      console.error('Qwen advice server error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });

  app.post('/api/ai/gemini-advice', async (req, res) => {
    const { service, context, profile, pets } = req.body || {};
    if (!service || !['health', 'behavior', 'diet'].includes(service)) {
      return res.status(400).json({ error: 'service must be one of health | behavior | diet' });
    }
    if (!config.GEMINI_API_KEY) {
      try {
        const messages = ai.buildQwenAdviceMessages(service, context, profile || {}, pets || []);
        const result = await ai.callQwen(messages);
        return res.json({
          result: result || 'Unable to generate advice. Please try again.',
          source: 'qwen-fallback',
        });
      } catch (err) {
        return res
          .status(500)
          .json({ error: 'Gemini API key missing and Qwen fallback failed.', detail: String(err) });
      }
    }
    const prompt = ai.buildGeminiAdvicePrompt(service, context, profile || {}, pets || []);
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': config.GEMINI_API_KEY,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );
      clearTimeout(timer);
      if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini advice error:', errText);
        return res.status(500).json({ error: 'Gemini API error', detail: errText });
      }
      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n\n');
      res.json({ result: text || 'Unable to generate advice. Please try again.' });
    } catch (err) {
      console.error('Gemini advice server error:', err);
      try {
        const messages = ai.buildQwenAdviceMessages(service, context, profile || {}, pets || []);
        const result = await ai.callQwen(messages);
        return res.json({
          result: result || 'Unable to generate advice. Please try again.',
          source: 'qwen-fallback',
        });
      } catch (_err) {
        res.status(500).json({ error: 'Server error', detail: String(err) });
      }
    }
  });

  app.post('/api/ai/gemini-diagnosis', async (req, res) => {
    const { imageBase64, mimeType, symptoms } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }
    const prompt = `
You are an expert veterinary AI assistant named "PawTrace Health Engine".
Analyze the provided pet image and symptoms: "${symptoms || 'No symptoms given; do a general visual check.'}"
Provide a structured Markdown response:
### Visual Analysis
### Potential Causes
### Severity Assessment
### Recommended Actions
**Disclaimer:** You are an AI, not a licensed veterinarian. This is informational only.
`;
    try {
      if (config.GEMINI_API_KEY) {
        const geminiVisionResult = await ai.callGeminiVision({ imageBase64, mimeType, prompt });
        if (geminiVisionResult) return res.json({ result: geminiVisionResult, source: 'gemini' });
      }
    } catch (err) {
      console.error('Gemini vision error:', err);
    }
    try {
      if (config.DASHSCOPE_API_KEY) {
        const qwenVisionResult = await ai.callQwenVision({ imageBase64, mimeType, prompt });
        if (qwenVisionResult) return res.json({ result: qwenVisionResult, source: 'qwen-vl' });
      }
    } catch (err) {
      console.error('Qwen-VL error:', err);
    }
    try {
      if (!config.DASHSCOPE_API_KEY) {
        return res.status(500).json({
          error: 'AI service unavailable. Configure DASHSCOPE_API_KEY / GEMINI_API_KEY.',
          detail: 'No model keys configured.',
        });
      }
      const messages = ai.buildQwenAdviceMessages(
        'health',
        `Symptoms: ${symptoms || 'not provided'}. Image attached but processed as text.`,
        {},
        []
      );
      const result = await ai.callQwen(messages);
      return res.json({
        result: result || 'AI could not analyze the image; please try again.',
        source: 'qwen-text-fallback',
      });
    } catch (err) {
      console.error('Diagnosis AI error:', err);
      return res.status(500).json({ error: 'AI service unavailable.', detail: String(err) });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { contactId, messages, contactProfile } = req.body || {};
    if (!contactId || typeof contactId !== 'string') {
      return res.status(400).json({ error: 'contactId is required' });
    }
    if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
      return res.status(500).json({
        error: 'Backend is not configured with a valid DASHSCOPE_API_KEY.',
      });
    }
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const normalizedMessages = messages
      .map((msg: { role?: string; content?: string }) => ({
        role: msg?.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg?.content === 'string' ? msg.content.trim() : '',
      }))
      .filter((entry: { content: string }) => entry.content);

    const sysPrompt = ai.getSystemPrompt(contactId, contactProfile);
    const qPayload = {
      model: 'qwen-plus',
      messages: [{ role: 'system', content: sysPrompt }, ...normalizedMessages],
    };

    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify(qPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('DashScope error:', response.status, text);
        return res.status(500).json({ error: 'DashScope API error', detail: text });
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply =
        data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
          ? data.choices[0].message.content
          : 'I could not generate a proper reply, but your backend is reachable.';

      const now = new Date().toISOString();
      for (const m of normalizedMessages) {
        await prisma.chatMessage.create({
          data: { contactId, role: m.role, content: m.content, createdAt: new Date(now) },
        });
      }
      await prisma.chatMessage.create({
        data: { contactId, role: 'assistant', content: reply, createdAt: new Date(now) },
      });

      const logId = `chat-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await prisma.monitoringChatLog.create({
        data: {
          id: logId,
          contactId,
          messagesJson: normalizedMessages as Prisma.InputJsonValue,
          reply,
        },
      });
      await trimMonitoringChatLogs(config.MONITOR_MAX);

      res.json({ reply });
    } catch (err) {
      console.error('Chat backend error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });
}
