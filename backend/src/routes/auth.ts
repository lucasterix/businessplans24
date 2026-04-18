import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../lib/mailer.js';

const router = Router();

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().optional(),
  language: z.string().optional(),
});

router.post('/register', authLimiter, async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const { email, password, country, language } = parsed.data;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'email_taken' });

  const id = randomUUID();
  const hash = await bcrypt.hash(password, 10);
  db.prepare(
    `INSERT INTO users (id, email, password_hash, country, language, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, email, hash, country || null, language || null, Date.now());

  const token = signToken({ sub: id, email, role: 'user' });
  sendWelcomeEmail(email, language || 'de').catch((err) => console.warn('[mail.welcome]', err));
  res.json({ token, user: { id, email, country, language, role: 'user' } });
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

  const row = db
    .prepare(
      `SELECT id, email, password_hash, country, language, role,
              subscription_tier, subscription_expires_at
       FROM users WHERE email = ?`
    )
    .get(parsed.data.email) as
    | {
        id: string;
        email: string;
        password_hash: string;
        country: string | null;
        language: string | null;
        role: string;
        subscription_tier: string | null;
        subscription_expires_at: number | null;
      }
    | undefined;

  if (!row) return res.status(401).json({ error: 'invalid_credentials' });
  const ok = await bcrypt.compare(parsed.data.password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const role = (row.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user';
  const token = signToken({ sub: row.id, email: row.email, role });
  res.json({
    token,
    user: {
      id: row.id,
      email: row.email,
      country: row.country,
      language: row.language,
      role,
      subscription: row.subscription_tier
        ? { tier: row.subscription_tier, expiresAt: row.subscription_expires_at }
        : null,
    },
  });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const schema = z.object({ oldPassword: z.string(), newPassword: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const row = db
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .get(req.user!.sub) as { password_hash: string } | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  const ok = await bcrypt.compare(parsed.data.oldPassword, row.password_hash);
  if (!ok) return res.status(403).json({ error: 'invalid_old_password' });
  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user!.sub);
  res.json({ ok: true });
});

router.patch('/me', requireAuth, (req, res) => {
  const schema = z.object({
    language: z.string().optional(),
    country: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const updates: string[] = [];
  const values: unknown[] = [];
  if (parsed.data.language !== undefined) { updates.push('language = ?'); values.push(parsed.data.language); }
  if (parsed.data.country !== undefined) { updates.push('country = ?'); values.push(parsed.data.country); }
  if (updates.length === 0) return res.json({ ok: true });
  values.push(req.user!.sub);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

router.delete('/me', requireAuth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user!.sub);
  res.json({ ok: true });
});

export default router;
