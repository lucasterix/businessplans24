import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type JwtUser } from '../lib/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    const user = verifyToken(auth.slice(7));
    if (user) req.user = user;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const user = verifyToken(auth.slice(7));
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const user = verifyToken(auth.slice(7));
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  req.user = user;
  next();
}
