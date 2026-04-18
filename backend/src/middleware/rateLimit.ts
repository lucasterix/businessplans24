import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth.js';
import { db } from '../lib/db.js';

/**
 * Abuse & spam protection strategy:
 *
 * 1. Global IP burst protection on anything expensive (generate, export):
 *    30 requests / minute / IP — catches bots; real users never hit this.
 *
 * 2. Generation hourly cap per IP (anonymous): 40 / hour / IP.
 *    A real wizard run is ~6 generations + a few regenerations → ~10-15.
 *    Plenty of headroom for normal users; kills scraped API abuse.
 *
 * 3. Per-user daily cap (logged-in) enforced via DB counter:
 *    50/day for free users, 300/day for active subscribers, 5000/day admin.
 *
 * 4. Auth brute-force protection: 10 attempts / 15 min / IP.
 *
 * 5. Admin endpoints: no rate limit (already gated by requireAdmin).
 */

// When the app sits behind Nginx, req.ip comes from X-Forwarded-For.
// For IPv6, collapse to the /64 prefix to avoid per-address rotation bypass.
function ipKey(req: Request): string {
  const ip = req.ip ?? '0.0.0.0';
  if (!ip.includes(':')) return ip;
  const parts = ip.split(':');
  return parts.slice(0, 4).join(':') + '::';
}

function getAuthUserId(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const user = verifyToken(auth.slice(7));
  return user?.sub ?? null;
}

function getAuthRole(req: Request): 'admin' | 'user' | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const user = verifyToken(auth.slice(7));
  return user?.role ?? null;
}

/** Burst limiter — one minute, strict. Applied globally to expensive endpoints. */
export const burstLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => getAuthUserId(req) ?? ipKey(req),
  message: { error: 'rate_limited', retryAfter: 'burst' },
  skip: (req) => getAuthRole(req) === 'admin',
});

/** Hourly limiter for generation endpoints. */
export const generationHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => {
    const role = getAuthRole(req);
    if (role === 'admin') return 1000;
    const uid = getAuthUserId(req);
    return uid ? 120 : 40; // logged-in: generous; anonymous: tight
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => getAuthUserId(req) ?? ipKey(req),
  message: { error: 'rate_limited', retryAfter: 'hour' },
  skip: (req) => getAuthRole(req) === 'admin',
});

/**
 * Auth endpoints — protect login/register from brute force.
 * Only failed attempts (4xx/5xx) count against the limit; successful logins
 * never consume quota, so a legit user is never locked out.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => ipKey(req),
  skipSuccessfulRequests: true,
  message: { error: 'too_many_attempts' },
});

/**
 * Per-user daily quota, enforced via SQLite counter.
 * Applied only for logged-in users; anonymous users are already capped
 * by the hourly IP limit above.
 */

db.exec(`
  CREATE TABLE IF NOT EXISTS usage_daily (
    user_id TEXT NOT NULL,
    day TEXT NOT NULL,
    kind TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day, kind)
  );
  CREATE INDEX IF NOT EXISTS idx_usage_daily_day ON usage_daily(day);
`);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyQuota(userId: string): number {
  const row = db
    .prepare(
      `SELECT role, subscription_tier, subscription_expires_at
       FROM users WHERE id = ?`
    )
    .get(userId) as
    | { role: string; subscription_tier: string | null; subscription_expires_at: number | null }
    | undefined;
  if (!row) return 0;
  if (row.role === 'admin') return 5000;
  const subActive =
    row.subscription_tier &&
    row.subscription_expires_at &&
    row.subscription_expires_at > Date.now();
  return subActive ? 300 : 50;
}

/**
 * Daily quota middleware. For logged-in requests, checks and increments a
 * per-day counter on each generation. For anonymous requests, passes through
 * (hourly IP limit above already covers abuse).
 */
export function dailyQuotaLimiter(kind: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = getAuthUserId(req);
    if (!userId) return next();

    const day = today();
    const quota = getDailyQuota(userId);
    const row = db
      .prepare('SELECT count FROM usage_daily WHERE user_id = ? AND day = ? AND kind = ?')
      .get(userId, day, kind) as { count: number } | undefined;
    const current = row?.count ?? 0;
    if (current >= quota) {
      return res.status(429).json({
        error: 'daily_quota_exceeded',
        quota,
        used: current,
        retryAfter: 'tomorrow',
      });
    }

    db.prepare(
      `INSERT INTO usage_daily (user_id, day, kind, count) VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, day, kind) DO UPDATE SET count = count + 1`
    ).run(userId, day, kind);
    next();
  };
}
