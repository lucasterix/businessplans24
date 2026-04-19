import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db } from '../lib/db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

/** Create a share token for a plan (auth required — owner only). */
router.post('/plan/:id', requireAuth, (req, res) => {
  const plan = db.prepare('SELECT id, user_id FROM plans WHERE id = ?').get(req.params.id) as
    | { id: string; user_id: string | null }
    | undefined;
  if (!plan) return res.status(404).json({ error: 'not_found' });
  if (plan.user_id && plan.user_id !== req.user!.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }

  // Re-use any existing non-revoked token instead of creating duplicates.
  const existing = db
    .prepare('SELECT token FROM plan_shares WHERE plan_id = ? AND revoked = 0 LIMIT 1')
    .get(req.params.id) as { token: string } | undefined;
  if (existing) return res.json({ token: existing.token });

  const token = randomBytes(18).toString('base64url');
  db.prepare(
    `INSERT INTO plan_shares (token, plan_id, created_by, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(token, req.params.id, req.user!.sub, Date.now());
  res.json({ token });
});

/** Revoke share token. */
router.delete('/plan/:id', requireAuth, (req, res) => {
  const plan = db.prepare('SELECT user_id FROM plans WHERE id = ?').get(req.params.id) as
    | { user_id: string | null }
    | undefined;
  if (!plan) return res.status(404).json({ error: 'not_found' });
  if (plan.user_id && plan.user_id !== req.user!.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }
  db.prepare('UPDATE plan_shares SET revoked = 1 WHERE plan_id = ?').run(req.params.id);
  res.json({ ok: true });
});

/** Public read of a shared plan by token. */
router.get('/:token', optionalAuth, (req, res) => {
  const row = db
    .prepare(
      `SELECT p.id, p.title, p.language, p.country, p.answers_json, p.texts_json,
              p.finance_json, p.status, p.paid
       FROM plan_shares s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.token = ? AND s.revoked = 0`
    )
    .get(req.params.token) as
    | {
        id: string;
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

  db.prepare('UPDATE plan_shares SET view_count = view_count + 1 WHERE token = ?').run(req.params.token);

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
    readOnly: true,
  });
});

export default router;
