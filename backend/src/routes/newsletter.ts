import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(60).optional(),
  language: z.string().optional(),
  country: z.string().optional(),
});

router.post('/signup', authLimiter, (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

  const existing = db.prepare('SELECT id FROM newsletter_signups WHERE email = ?').get(parsed.data.email);
  if (existing) return res.json({ ok: true, already: true });

  db.prepare(
    `INSERT INTO newsletter_signups (id, email, source, language, country, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    parsed.data.email,
    parsed.data.source || 'landing',
    parsed.data.language || null,
    parsed.data.country || null,
    Date.now()
  );
  res.json({ ok: true });
});

export default router;
