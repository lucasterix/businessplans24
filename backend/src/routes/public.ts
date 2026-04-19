import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';

const router = Router();

const COUNTER_OFFSET = 11_000;

router.get('/stats', (_req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS c FROM plans').get() as { c: number };
  const plans = COUNTER_OFFSET + row.c;
  res.json({ plansCreated: plans });
});

const trackSchema = z.object({
  path: z.string().max(200),
  referrer: z.string().max(500).optional(),
  lang: z.string().max(10).optional(),
  device: z.string().max(20).optional(),
  session: z.string().max(64).optional(),
});

/**
 * DSGVO-safe page view tracking. No IP stored, no cookies beyond an
 * anonymous session token the client generates itself.
 */
router.post('/track', (req, res) => {
  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).end();
  const country =
    (typeof req.headers['cf-ipcountry'] === 'string' ? req.headers['cf-ipcountry'] : undefined) ||
    (typeof req.headers['accept-language'] === 'string' ? req.headers['accept-language'].slice(3, 5).toUpperCase() : undefined);
  db.prepare(
    `INSERT INTO page_views (path, referrer, country, lang, device, session, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    parsed.data.path,
    parsed.data.referrer || null,
    country || null,
    parsed.data.lang || null,
    parsed.data.device || null,
    parsed.data.session || null,
    Date.now()
  );
  res.status(204).end();
});

export default router;
