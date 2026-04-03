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
import { optionalAuth, requireAuth } from './middleware/jwtAuth.js';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
function asyncHandler(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
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
  };
}

async function resolveUserId(input: string | undefined | null): Promise<string | null> {
  if (!input) return null;
  const v = String(input).trim();
  if (!v) return null;
  const u = await prisma.user.findFirst({ where: { OR: [{ id: v }, { username: v }] } });
  return u?.id ?? v;
}

async function trimRows(model: { count: () => Promise<number>; findMany: (args: unknown) => Promise<{ id: string }[]>; deleteMany: (args: unknown) => Promise<unknown> }, max: number, orderField = 'createdAt') {
  const count = await model.count();
  if (count <= max) return;
  const rows = await (model.findMany as Function)({ orderBy: { [orderField]: 'asc' }, take: count - max, select: { id: true } });
  await (model.deleteMany as Function)({ where: { id: { in: rows.map((r: { id: string }) => r.id) } } });
}

export function registerRoutes(app: Express, deps: { metrics: AppMetrics }) {

  // ─── Auth ───
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

  app.get('/api/auth/me', optionalAuth, asyncHandler(async (req, res) => {
    if (!req.authUser) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: req.authUser.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: mapUser(user) });
  }));

  // ─── Pets & Users ───
  app.get('/api/pets', asyncHandler(async (_req, res) => {
    const pets = await prisma.pet.findMany({ orderBy: { id: 'asc' } });
    res.json({ pets: pets.map(mapPet) });
  }));

  app.get('/api/pets/:id', asyncHandler(async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json({ pet: mapPet(pet) });
  }));

  app.post('/api/pets', optionalAuth, asyncHandler(async (req, res) => {
    const payload = req.body || {};
    if (!payload.name) return res.status(400).json({ error: 'Pet name is required' });
    const petSprites = ['/assets/1.png', '/assets/2.png', '/assets/3.png', '/assets/4.png', '/assets/5.png', '/assets/6.png'];
    const randomSprite = petSprites[Math.floor(Math.random() * petSprites.length)];
    const traits = Array.isArray(payload.traits)
      ? payload.traits
      : String(payload.traits || '').split(',').map((t: string) => t.trim()).filter(Boolean);
    const pet = await prisma.pet.create({
      data: {
        id: `p${Date.now()}`, ownerId: req.authUser?.sub ?? null,
        name: payload.name, type: payload.type || 'Pet', breed: payload.breed || 'Unknown',
        age: payload.age || 'Unknown', gender: payload.gender || 'Unknown',
        avatar: payload.avatar || randomSprite, traits: traits as unknown as Prisma.InputJsonValue,
        health: payload.health || 'No health notes yet.', status: payload.status || 'Just joined the crew.',
      },
    });
    res.json({ pet: mapPet(pet) });
  }));

  app.delete('/api/pets/:id', optionalAuth, asyncHandler(async (req, res) => {
    const pet = await prisma.pet.findUnique({ where: { id: req.params.id } });
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (req.authUser && pet.ownerId && pet.ownerId !== req.authUser.sub) return res.status(403).json({ error: 'Forbidden' });
    await prisma.pet.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  app.get('/api/users', asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
    res.json({ users: users.map(mapUser) });
  }));

  // ─── Chat ───
  app.get('/api/chat/history/:contactId', asyncHandler(async (req, res) => {
    const rows = await prisma.chatMessage.findMany({
      where: { contactId: req.params.contactId }, orderBy: { id: 'asc' },
      select: { role: true, content: true },
    });
    res.json({ history: rows });
  }));

  app.post('/api/chat', async (req, res) => {
    const { contactId, messages, contactProfile } = req.body || {};
    if (!contactId || typeof contactId !== 'string') return res.status(400).json({ error: 'contactId is required' });
    if (!config.DASHSCOPE_API_KEY) return res.status(500).json({ error: 'DASHSCOPE_API_KEY not configured.' });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages array is required' });

    const normalizedMessages = messages
      .map((msg: { role?: string; content?: string }) => ({
        role: msg?.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg?.content === 'string' ? msg.content.trim() : '',
      }))
      .filter((entry: { content: string }) => entry.content);

    try {
      const sysPrompt = ai.getSystemPrompt(contactId, contactProfile);
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.DASHSCOPE_API_KEY}` },
        body: JSON.stringify({ model: 'qwen-plus', messages: [{ role: 'system', content: sysPrompt }, ...normalizedMessages] }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('DashScope error:', response.status, text);
        return res.status(500).json({ error: 'DashScope API error', detail: text });
      }
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const reply = data.choices?.[0]?.message?.content || 'I could not generate a proper reply.';

      const now = new Date().toISOString();
      for (const m of normalizedMessages) {
        await prisma.chatMessage.create({ data: { contactId, role: m.role, content: m.content, createdAt: new Date(now) } });
      }
      await prisma.chatMessage.create({ data: { contactId, role: 'assistant', content: reply, createdAt: new Date(now) } });
      res.json({ reply });
    } catch (err) {
      console.error('Chat backend error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });

  // ─── Map & Notes ───
  app.get('/api/status', (_req, res) => {
    res.json({ ready: true, lastSync: new Date().toISOString() });
  });

  app.get('/api/map-locations', (_req, res) => {
    res.json({
      spots: [
        { id: '1', name: 'Central Lawn', desc: 'Wide grass field...', link: '#' },
        { id: '2', name: 'Orange Corner Café', desc: 'Pet-friendly café with outdoor seating.', link: '#' },
      ],
    });
  });

  app.get('/api/sticky-notes', asyncHandler(async (_req, res) => {
    const notes = await prisma.stickyNote.findMany({ orderBy: { createdAt: 'asc' } });
    res.json({ notes: notes.map((n) => ({ id: n.id, text: n.text, createdAt: n.createdAt.toISOString() })) });
  }));

  app.post('/api/sticky-notes', asyncHandler(async (req, res) => {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Note text is required' });
    const note = await prisma.stickyNote.create({ data: { id: `note-${Date.now()}`, text } });
    res.json({ note: { id: note.id, text: note.text, createdAt: note.createdAt.toISOString() } });
  }));

  app.delete('/api/sticky-notes/:id', asyncHandler(async (req, res) => {
    await prisma.stickyNote.deleteMany({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  app.delete('/api/sticky-notes', asyncHandler(async (_req, res) => {
    await prisma.stickyNote.deleteMany();
    res.json({ success: true });
  }));

  // ─── Location (simplified, JWT-auth only) ───
  app.get('/api/location/points', asyncHandler(async (req, res) => {
    const { userId, limit } = req.query || {};
    const max = Math.min(Number(limit || 100), 500);
    const normalizedUserId = userId ? await resolveUserId(String(userId)) : null;
    const where: Prisma.LocationPointWhereInput = {};
    if (normalizedUserId) where.userId = normalizedUserId;
    const points = await prisma.locationPoint.findMany({ where, orderBy: { createdAt: 'desc' }, take: max });
    res.json({ points: points.reverse().map((r) => ({ id: r.id, source: r.source, userId: r.userId, timestamp: r.timestamp, lat: r.lat, lon: r.lon })) });
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

  // ─── AI (Qwen only) ───
  app.post('/api/pet-prediction', async (req, res) => {
    const profile = req.body?.profile || {};
    if (!profile.starSign && !profile.petName) return res.json({ prediction: 'Share your star sign or pet info to unlock predictions.' });
    const fallback = ai.getLocalPetPrediction(profile);
    if (!config.DASHSCOPE_API_KEY) return res.json({ prediction: fallback, source: 'local' });
    try {
      const result = await ai.callQwen([
        { role: 'system', content: 'You are an upbeat pet behavior astrologist. Reply with at most 3 short sentences including one actionable tip.' },
        { role: 'user', content: ai.buildPetPredictionPrompt(profile) },
      ]);
      res.json({ prediction: result || fallback });
    } catch (err) {
      console.error('Pet prediction error:', err);
      res.json({ prediction: fallback, source: 'local' });
    }
  });

  app.post('/api/ai/qwen-advice', async (req, res) => {
    const { service, context, profile, pets } = req.body || {};
    if (!service || !['health', 'behavior', 'diet'].includes(service)) return res.status(400).json({ error: 'service must be health | behavior | diet' });
    try {
      const messages = ai.buildAdviceMessages(service, context, profile || {}, pets || []);
      const result = await ai.callQwen(messages);
      res.json({ result: result || 'Unable to generate advice.' });
    } catch (err) {
      console.error('AI advice error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });

  app.post('/api/ai/gemini-advice', async (req, res) => {
    const { service, context, profile, pets } = req.body || {};
    if (!service || !['health', 'behavior', 'diet'].includes(service)) return res.status(400).json({ error: 'service must be health | behavior | diet' });
    try {
      const messages = ai.buildAdviceMessages(service, context, profile || {}, pets || []);
      const result = await ai.callQwen(messages);
      res.json({ result: result || 'Unable to generate advice.' });
    } catch (err) {
      console.error('AI advice error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });

  app.post('/api/ai/gemini-diagnosis', async (req, res) => {
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
    try {
      const result = await ai.callQwenVision({ imageBase64, mimeType, prompt });
      if (result) return res.json({ result, source: 'qwen-vl' });
    } catch (err) {
      console.error('Qwen-VL error:', err);
    }
    try {
      const messages = ai.buildAdviceMessages('health', `Symptoms: ${symptoms || 'not provided'}.`, {}, []);
      const result = await ai.callQwen(messages);
      res.json({ result: result || 'AI could not analyze; please try again.', source: 'qwen-text-fallback' });
    } catch (err) {
      console.error('Diagnosis fallback error:', err);
      res.status(500).json({ error: 'AI service unavailable.', detail: String(err) });
    }
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
    const payload = req.body || {};
    const metadata = (payload.metadata && typeof payload.metadata === 'object') ? payload.metadata : {};
    const captured = { userProfiles: 0, petProfiles: 0, purchases: 0 };
    if (payload.userProfile && typeof payload.userProfile === 'object') {
      await prisma.monitoringUserProfile.create({
        data: { id: `profile-${Date.now()}-${Math.floor(Math.random() * 1000)}`, profileJson: payload.userProfile as Prisma.InputJsonValue, metadataJson: metadata as Prisma.InputJsonValue },
      });
      await trimRows(prisma.monitoringUserProfile as never, config.MONITOR_MAX, 'capturedAt');
      captured.userProfiles = 1;
    }
    res.json({ success: true, captured });
  }));

  app.get('/api/monitor/overview', requireMonitorAuth, asyncHandler(async (_req, res) => {
    const [userProfiles, petProfiles, purchases, chatLogs] = await Promise.all([
      prisma.monitoringUserProfile.count(), prisma.monitoringPetProfile.count(),
      prisma.monitoringPurchase.count(), prisma.monitoringChatLog.count(),
    ]);
    res.json({ capturedAt: new Date().toISOString(), summary: { userProfiles, petProfiles, purchases, chatLogs } });
  }));
}
