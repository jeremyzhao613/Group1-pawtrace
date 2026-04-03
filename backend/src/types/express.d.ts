import type { AuthUser } from '../middleware/jwtAuth.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      requestId?: string;
    }
  }
}

export {};
