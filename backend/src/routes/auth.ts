import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db.js';
import { signToken } from '../lib/auth.js';

const router = Router();

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().optional(),
  language: z.string().optional(),
});

router.post('/register', async (req, res) => {
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
  res.json({ token, user: { id, email, country, language, role: 'user' } });
});

router.post('/login', async (req, res) => {
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

export default router;
