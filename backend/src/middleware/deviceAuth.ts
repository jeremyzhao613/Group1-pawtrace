import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

function parseDeviceTokens(raw = ''): Record<string, string> {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const [id, token] = pair.split('=');
      if (id && token) acc[id.trim()] = token.trim();
      return acc;
    }, {});
}

const DEVICE_TOKENS = parseDeviceTokens(config.DEVICE_TOKENS_RAW);

export function createRequireDeviceAuth() {
  return function requireDeviceAuth(req: Request, res: Response, next: NextFunction) {
    const configured = Object.keys(DEVICE_TOKENS).length > 0;
    if (!configured && !config.REQUIRE_DEVICE_TOKEN) return next();

    const deviceId = String(req.body?.deviceId || req.query?.deviceId || '').trim();
    if (!deviceId) {
      return res.status(401).json({ error: 'deviceId is required for device-authenticated endpoints' });
    }

    const expected = DEVICE_TOKENS[deviceId];
    if (!expected) return res.status(401).json({ error: 'Unknown deviceId (not provisioned)' });

    const provided = String(req.headers['x-device-token'] || '').trim();
    if (!provided) return res.status(401).json({ error: 'Missing x-device-token header' });

    const a = Buffer.from(String(expected), 'utf8');
    const b = Buffer.from(String(provided), 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: 'Invalid device token' });
    }

    next();
  };
}
