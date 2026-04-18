import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  country: z.string().length(2).optional(),
  message: z.string().max(2000).optional(),
});

router.post('/apply', authLimiter, (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const id = randomUUID();
  const code = 'P' + id.slice(0, 7).toUpperCase();
  db.prepare(
    `INSERT INTO partners (id, email, name, company, country, message, referral_code, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    parsed.data.email,
    parsed.data.name,
    parsed.data.company || null,
    parsed.data.country || null,
    parsed.data.message || null,
    code,
    Date.now()
  );
  res.json({ ok: true, referralCode: code });
});

router.get('/', requireAdmin, (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM partners ORDER BY created_at DESC LIMIT 500')
    .all();
  res.json({ partners: rows });
});

router.patch('/:id/status', requireAdmin, (req, res) => {
  const s = z.object({ status: z.enum(['pending', 'approved', 'rejected']) }).safeParse(req.body);
  if (!s.success) return res.status(400).json({ error: 'invalid_input' });
  const info = db.prepare('UPDATE partners SET status = ? WHERE id = ?').run(s.data.status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export default router;
