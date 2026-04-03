import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId =
    String(req.headers['x-request-id'] || '').trim() || `req_${crypto.randomBytes(6).toString('hex')}`;
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

