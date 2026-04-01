import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export type AuthUser = { sub: string; username: string };

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  req.authUser = undefined;
  if (!h?.startsWith('Bearer ')) return next();
  try {
    const payload = jwt.verify(h.slice(7), config.JWT_SECRET) as AuthUser & { sub: string };
    req.authUser = { sub: payload.sub, username: payload.username };
  } catch {
    /* ignore invalid token */
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
