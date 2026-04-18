import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

const createSchema = z.object({
  title: z.string().optional(),
  language: z.string(),
  country: z.string().optional(),
});

router.post('/', optionalAuth, (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const id = randomUUID();
  const now = Date.now();
  db.prepare(
    `INSERT INTO plans (id, user_id, title, language, country, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user?.sub || null,
    parsed.data.title || null,
    parsed.data.language,
    parsed.data.country || null,
    now,
    now
  );
  res.json({ id });
});

const updateSchema = z.object({
  answers: z.record(z.unknown()).optional(),
  texts: z.record(z.string()).optional(),
  finance: z.record(z.unknown()).optional(),
  title: z.string().optional(),
  status: z.enum(['draft', 'preview', 'paid']).optional(),
});

router.patch('/:id', optionalAuth, (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id) as
    | { user_id: string | null }
    | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.user_id && row.user_id !== req.user?.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  if (parsed.data.answers !== undefined) {
    updates.push('answers_json = ?');
    values.push(JSON.stringify(parsed.data.answers));
  }
  if (parsed.data.texts !== undefined) {
    updates.push('texts_json = ?');
    values.push(JSON.stringify(parsed.data.texts));
  }
  if (parsed.data.finance !== undefined) {
    updates.push('finance_json = ?');
    values.push(JSON.stringify(parsed.data.finance));
  }
  if (parsed.data.title !== undefined) {
    updates.push('title = ?');
    values.push(parsed.data.title);
  }
  if (parsed.data.status !== undefined) {
    updates.push('status = ?');
    values.push(parsed.data.status);
  }
  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(req.params.id);

  db.prepare(`UPDATE plans SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

router.get('/:id', optionalAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id) as
    | {
        id: string;
        user_id: string | null;
        title: string | null;
        language: string;
        country: string | null;
        answers_json: string;
        texts_json: string;
        finance_json: string;
        status: string;
        paid: number;
      }
    | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.user_id && row.user_id !== req.user?.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json({
    id: row.id,
    title: row.title,
    language: row.language,
    country: row.country,
    answers: JSON.parse(row.answers_json),
    texts: JSON.parse(row.texts_json),
    finance: JSON.parse(row.finance_json),
    status: row.status,
    paid: !!row.paid,
  });
});

router.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT id, title, language, status, paid, updated_at FROM plans WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.user!.sub);
  res.json({ plans: rows });
});

export default router;
