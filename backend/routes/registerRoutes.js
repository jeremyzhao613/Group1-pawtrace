const crypto = require('crypto');
const config = require('../config');
const ai = require('../services/aiService');
const { requireMonitorAuth } = require('../middleware/monitorAuth');

function toIsoTimestamp(input) {
  if (!input) return new Date().toISOString();
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function canonicalNfcPayload({ v, userId, petId, exp }) {
  return `v=${v}&userId=${userId}&petId=${petId}&exp=${exp}`;
}

function registerRoutes(app, { repo, metrics, requireDeviceAuth }) {
  app.get('/api/pets', (_req, res) => {
    res.json({ pets: repo.listPets() });
  });

  app.get('/api/pets/:id', (req, res) => {
    const pet = repo.getPet(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json({ pet });
  });

  app.post('/api/pets', (req, res) => {
    const payload = req.body || {};
    if (!payload.name) {
      return res.status(400).json({ error: 'Pet name is required' });
    }
    const pet = repo.createPet(payload);
    res.json({ pet });
  });

  app.delete('/api/pets/:id', (req, res) => {
    repo.deletePet(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/chat/history/:contactId', (req, res) => {
    res.json({ history: repo.getChatHistory(req.params.contactId) });
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      ready: true,
      aiEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      lastSync: new Date().toISOString(),
    });
  });

  app.get('/api/users', (_req, res) => {
    res.json({ users: repo.listUsers() });
  });

  app.post('/api/location/points', requireDeviceAuth, (req, res) => {
    const payload = req.body || {};
    const lat = Number(payload.lat);
    const lon = Number(payload.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required (numbers)' });
    }
    const point = {
      id: `loc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      source: payload.source || 'unknown',
      tagId: payload.tagId || null,
      deviceId: payload.deviceId || null,
      userId: payload.userId ? repo.resolveUserId(payload.userId) : null,
      timestamp: toIsoTimestamp(payload.timestamp),
      lat,
      lon,
      accuracy: payload.accuracy !== undefined ? Number(payload.accuracy) : null,
      altitude: payload.altitude !== undefined ? Number(payload.altitude) : null,
    };
    repo.addLocationPoint(point);
    res.json({ success: true, id: point.id });
  });

  app.get('/api/location/points', (req, res) => {
    const { deviceId, userId, limit } = req.query || {};
    const max = Math.min(Number(limit || 100), 500);
    const normalizedUserId = userId ? repo.resolveUserId(userId) : null;
    const points = repo.listLocationPoints(
      { deviceId: deviceId || null, userId: normalizedUserId },
      max
    );
    res.json({ points });
  });

  app.post('/api/location/last', (req, res) => {
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
    const userId = repo.resolveUserId(rawUserId);
    repo.setLastLocation(userId, {
      lat,
      lon,
      accuracy: payload.accuracy !== undefined ? Number(payload.accuracy) : null,
      timestamp: toIsoTimestamp(payload.timestamp),
      source: payload.source || 'app-gps',
    });
    res.json({ success: true, userId, updatedAt: new Date().toISOString(), ageMs: 0 });
  });

  app.post('/api/health/measurements', requireDeviceAuth, (req, res) => {
    const payload = req.body || {};
    const receivedAt = new Date().toISOString();
    const normalizedUserId = payload.userId ? repo.resolveUserId(payload.userId) : null;
    const measurement = {
      id: `health-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
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
      lat: payload.lat !== undefined ? Number(payload.lat) : null,
      lon: payload.lon !== undefined ? Number(payload.lon) : null,
      locationAccuracy: payload.locationAccuracy !== undefined ? Number(payload.locationAccuracy) : null,
      locationTimestamp: payload.locationTimestamp ? toIsoTimestamp(payload.locationTimestamp) : null,
      quality: payload.quality !== undefined ? payload.quality : null,
      metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : null,
      receivedAt,
    };

    if (
      (!Number.isFinite(measurement.lat) || !Number.isFinite(measurement.lon)) &&
      measurement.userId
    ) {
      const last = repo.getLastLocation(measurement.userId);
      if (last && last.timestamp) {
        const tsMs = new Date(last.timestamp).getTime();
        if (Number.isFinite(tsMs)) {
          const ageMs = Date.now() - tsMs;
          if (ageMs <= config.LOCATION_LAST_MAX_AGE_MS) {
            measurement.lat = Number(last.lat);
            measurement.lon = Number(last.lon);
            measurement.locationAccuracy = last.accuracy !== undefined ? last.accuracy : null;
            measurement.locationTimestamp = last.timestamp;
            measurement.metadata = measurement.metadata || {};
            measurement.metadata.locationSource = last.source || 'app-gps';
          }
        }
      }
    }

    repo.addHealthMeasurement(measurement);
    res.json({ success: true, id: measurement.id });
  });

  app.get('/api/health/measurements', (req, res) => {
    const { deviceId, userId, limit } = req.query || {};
    const max = Math.min(Number(limit || 100), 500);
    const normalizedUserId = userId ? repo.resolveUserId(userId) : null;
    const items = repo.listHealthMeasurements(
      { deviceId: deviceId || null, userId: normalizedUserId },
      max
    );
    res.json({ items });
  });

  function signNfcPayload({ userId, petId, exp }) {
    const msg = canonicalNfcPayload({ v: config.NFC_PAYLOAD_VERSION, userId, petId, exp });
    return crypto.createHmac('sha256', config.NFC_CARD_SECRET).update(msg).digest('hex');
  }

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
    const sig = signNfcPayload({ userId, petId, exp });

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

  app.get('/api/nfc/public', (req, res) => {
    const { userId, petId } = req.query || {};
    if (!userId || !petId) {
      return res.status(400).json({ error: 'userId and petId are required' });
    }
    const card = repo.getPublicCard(userId, petId);
    if (!card) return res.status(404).json({ error: 'User or pet not found' });
    res.json({ valid: true, ...card });
  });

  app.post('/api/nfc/verify', (req, res) => {
    const body = req.body || {};
    const raw = body.payload;

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

    const { v, userId, petId, exp, sig } = payload;
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
      const card = repo.getPublicCard(userId, petId);
      if (!card) return res.status(404).json({ valid: false, error: 'User or pet not found' });
      return res.json({ valid: true, unsigned: true, ...card });
    }

    const expectedSig = signNfcPayload({ userId, petId, exp });
    const a = Buffer.from(String(expectedSig), 'utf8');
    const b = Buffer.from(String(sig), 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ valid: false, error: 'Invalid NFC signature' });
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (Number(exp) < nowSec) {
      return res.status(401).json({ valid: false, error: 'NFC payload expired' });
    }

    const card = repo.getPublicCard(userId, petId);
    if (!card) return res.status(404).json({ valid: false, error: 'User or pet not found' });
    res.json({ valid: true, ...card });
  });

  app.get('/api/map-locations', (_req, res) => {
    res.json({
      spots: [
        { id: '1', name: 'Central Lawn', desc: 'Wide grass field...', link: '#' },
        { id: '2', name: 'Orange Corner Café', desc: 'Pet-friendly café with outdoor seating.', link: '#' },
      ],
    });
  });

  app.get('/api/sticky-notes', (_req, res) => {
    res.json({ notes: repo.listStickyNotes() });
  });

  app.post('/api/sticky-notes', (req, res) => {
    const text = (req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Note text is required' });
    }
    const note = repo.addStickyNote(text);
    res.json({ note });
  });

  app.delete('/api/sticky-notes/:id', (req, res) => {
    repo.deleteStickyNote(req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/sticky-notes', (_req, res) => {
    repo.clearStickyNotes();
    res.json({ success: true });
  });

  app.get('/api/monitor/metrics', requireMonitorAuth, (_req, res) => {
    const summary = Object.entries(metrics.routes).reduce((acc, [route, stat]) => {
      acc[route] = {
        count: stat.count,
        avgMs: stat.count ? Number(stat.sumMs / stat.count).toFixed(2) : '0',
        maxMs: Number(stat.maxMs).toFixed(2),
        status: stat.status,
      };
      return acc;
    }, {});
    res.json({
      uptimeSeconds: Math.floor((Date.now() - metrics.startedAt) / 1000),
      requests: metrics.requests,
      routes: summary,
    });
  });

  app.post('/api/monitor/collect', requireMonitorAuth, (req, res) => {
    const payload = req.body || {};
    const metadata =
      payload && typeof payload.metadata === 'object' && payload.metadata !== null ? payload.metadata : {};
    const personalInfo =
      payload && typeof payload.personalInfo === 'object' && payload.personalInfo !== null
        ? payload.personalInfo
        : undefined;
    const captured = { userProfiles: 0, petProfiles: 0, purchases: 0 };

    if (payload.userProfile && typeof payload.userProfile === 'object') {
      repo.monitoringAppendUserProfile({ ...payload, metadata, personalInfo });
      captured.userProfiles += 1;
    }

    const petPayload = Array.isArray(payload.pets) ? payload.pets.filter((p) => p && typeof p === 'object') : [];
    if (petPayload.length) {
      const ownerLabel =
        payload?.userProfile?.username || personalInfo?.username || metadata.username || 'anonymous';
      repo.monitoringAppendPetProfiles(ownerLabel, petPayload, metadata);
      captured.petProfiles += petPayload.length;
    }

    const shoppingPayload = Array.isArray(payload.shopping)
      ? payload.shopping.filter((item) => item && typeof item === 'object')
      : [];
    if (shoppingPayload.length) {
      repo.monitoringAppendPurchases(shoppingPayload, metadata);
      captured.purchases += shoppingPayload.length;
    }

    const monitoring = repo.getMonitoringOverview();
    res.json({
      success: true,
      captured,
      totals: {
        userProfiles: monitoring.userProfiles?.length || 0,
        petProfiles: monitoring.petProfiles?.length || 0,
        purchases: monitoring.purchases?.length || 0,
        chatLogs: monitoring.chatLogs?.length || 0,
      },
    });
  });

  app.get('/api/monitor/overview', requireMonitorAuth, (_req, res) => {
    const monitoring = repo.getMonitoringOverview();
    res.json({
      capturedAt: new Date().toISOString(),
      summary: {
        userProfiles: monitoring.userProfiles?.length || 0,
        petProfiles: monitoring.petProfiles?.length || 0,
        purchases: monitoring.purchases?.length || 0,
        chatLogs: monitoring.chatLogs?.length || 0,
        contactsTracked: Object.keys(repo.getChatHistoryMap()).length,
      },
      monitoring: {
        purchases: monitoring.purchases || [],
      },
    });
  });

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
      const data = await response.json();
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
    const messages = ai.buildQwenAdviceMessages(service, context, profile, pets);
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
        const messages = ai.buildQwenAdviceMessages(service, context, profile, pets);
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

    const prompt = ai.buildGeminiAdvicePrompt(service, context, profile, pets);
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
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n\n');
      res.json({ result: text || 'Unable to generate advice. Please try again.' });
    } catch (err) {
      console.error('Gemini advice server error:', err);
      try {
        const messages = ai.buildQwenAdviceMessages(service, context, profile, pets);
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
### 🩺 Visual Analysis
### 🔍 Potential Causes
### ⚠️ Severity Assessment
### 💡 Recommended Actions
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
    if (!config.DASHSCOPE_API_KEY || config.DASHSCOPE_API_KEY === 'YOUR_DASHSCOPE_API_KEY_HERE') {
      return res.status(500).json({
        error: 'Backend is not configured with a valid DASHSCOPE_API_KEY.',
      });
    }
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const normalizedMessages = messages
      .map((msg) => ({
        role: msg?.role === 'assistant' ? 'assistant' : 'user',
        content: typeof msg?.content === 'string' ? msg.content.trim() : '',
      }))
      .filter((entry) => entry.content);

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

      const data = await response.json();
      const reply =
        data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
          ? data.choices[0].message.content
          : 'I could not generate a proper reply, but your backend is reachable.';

      repo.appendChatTurns(contactId, normalizedMessages, reply);
      repo.recordChatForMonitoring(contactId, normalizedMessages, reply);

      res.json({ reply });
    } catch (err) {
      console.error('Chat backend error:', err);
      res.status(500).json({ error: 'Server error', detail: String(err) });
    }
  });
}

module.exports = { registerRoutes };
