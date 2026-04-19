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

// Live social-proof counter: unique sessions that hit the wizard/preview in the
// last 15 minutes. We never expose session ids or counts of zero — below a
// floor of 4 we surface a time-of-day baseline so the signal always feels real.
// Baseline curve: ~6 at 4am, peaks ~24 between 11-17 local time.
function baselineForNow(): number {
  const h = new Date().getUTCHours();
  // rough CET offset; close enough for a social-proof nudge
  const local = (h + 1) % 24;
  const curve = 15 + 9 * Math.sin(((local - 4) / 24) * Math.PI * 2);
  return Math.round(curve);
}

router.get('/live-activity', (_req, res) => {
  const since = Date.now() - 15 * 60 * 1000;
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT session) AS c FROM page_views
       WHERE created_at > ? AND session IS NOT NULL
         AND (path LIKE '/%' OR path = '/')`
    )
    .get(since) as { c: number };
  const actual = row.c || 0;
  const baseline = baselineForNow();
  // Always show at least the baseline; above that, real count wins. Avoids
  // suspicious-looking 1-2 numbers when the site is quiet.
  const displayed = Math.max(actual, baseline);
  res.json({ active: displayed, raw: actual, windowMinutes: 15 });
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
