import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  getKeywordIdeas,
  listCampaigns,
  setCampaignStatus,
  analyseKeywordProfitability,
  isMockMode,
  type CampaignSummary,
} from '../lib/googleAds.js';
import { priceForCountry } from '../lib/pricing.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', (_req, res) => {
  const totalUsers = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c;
  const totalPlans = (db.prepare('SELECT COUNT(*) AS c FROM plans').get() as { c: number }).c;
  const paidPlans = (db.prepare('SELECT COUNT(*) AS c FROM plans WHERE paid = 1').get() as { c: number }).c;
  const activeSubs = (
    db
      .prepare('SELECT COUNT(*) AS c FROM users WHERE subscription_tier IS NOT NULL AND subscription_expires_at > ?')
      .get(Date.now()) as { c: number }
  ).c;
  const revenue30d = (
    db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) AS total, currency
         FROM payments
         WHERE status = 'paid' AND created_at > ?
         GROUP BY currency`
      )
      .all(Date.now() - 30 * 24 * 3600 * 1000) as Array<{ total: number; currency: string }>
  );
  const usersByCountry = db
    .prepare('SELECT country, COUNT(*) AS count FROM users WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC')
    .all() as Array<{ country: string; count: number }>;

  res.json({ totalUsers, totalPlans, paidPlans, activeSubs, revenue30d, usersByCountry });
});

router.get('/users', (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const rows = db
    .prepare(
      `SELECT id, email, country, language, role, subscription_tier, subscription_expires_at, created_at
       FROM users ORDER BY created_at DESC LIMIT ?`
    )
    .all(limit);
  res.json({ users: rows });
});

router.get('/payments', (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const rows = db
    .prepare(
      `SELECT p.id, p.user_id, p.plan_id, p.type, p.amount, p.currency,
              p.status, p.created_at, u.email
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC LIMIT ?`
    )
    .all(limit);
  res.json({ payments: rows });
});

router.get('/plans', (req, res) => {
  const limit = Math.min(500, Number(req.query.limit) || 100);
  const rows = db
    .prepare(
      `SELECT p.id, p.title, p.language, p.country, p.status, p.paid,
              p.created_at, p.updated_at, u.email
       FROM plans p
       LEFT JOIN users u ON u.id = p.user_id
       ORDER BY p.updated_at DESC LIMIT ?`
    )
    .all(limit);
  res.json({ plans: rows });
});

router.get('/ads/campaigns', async (_req, res) => {
  try {
    const remote: CampaignSummary[] = await listCampaigns();
    const local = db
      .prepare('SELECT * FROM ads_campaigns ORDER BY updated_at DESC')
      .all() as Array<{
        id: string;
        google_campaign_id: string | null;
        name: string;
        country: string;
        region: string | null;
        status: string;
        max_cpc_micros: number;
        daily_budget_micros: number;
      }>;
    res.json({ remote, local, mock: isMockMode() });
  } catch (err) {
    console.error('[admin.ads.campaigns]', err);
    res.status(500).json({ error: 'google_ads_failed' });
  }
});

const campaignSchema = z.object({
  name: z.string().min(1),
  country: z.string().length(2),
  region: z.string().optional().nullable(),
  maxCpcEur: z.number().min(0),
  dailyBudgetEur: z.number().min(0),
  status: z.enum(['enabled', 'paused']).default('paused'),
});

router.post('/ads/campaigns', (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues });
  const id = randomUUID();
  const now = Date.now();
  db.prepare(
    `INSERT INTO ads_campaigns
      (id, name, country, region, status, max_cpc_micros, daily_budget_micros, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    parsed.data.name,
    parsed.data.country.toUpperCase(),
    parsed.data.region ?? null,
    parsed.data.status,
    Math.round(parsed.data.maxCpcEur * 1_000_000),
    Math.round(parsed.data.dailyBudgetEur * 1_000_000),
    now,
    now
  );
  res.json({ id });
});

router.patch('/ads/campaigns/:id/status', async (req, res) => {
  const schema = z.object({ enabled: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const row = db.prepare('SELECT google_campaign_id FROM ads_campaigns WHERE id = ?').get(req.params.id) as
    | { google_campaign_id: string | null }
    | undefined;
  if (!row) return res.status(404).json({ error: 'not_found' });
  db.prepare('UPDATE ads_campaigns SET status = ?, updated_at = ? WHERE id = ?').run(
    parsed.data.enabled ? 'enabled' : 'paused',
    Date.now(),
    req.params.id
  );
  if (row.google_campaign_id) {
    try {
      await setCampaignStatus(row.google_campaign_id, parsed.data.enabled);
    } catch (err) {
      console.warn('[admin.ads.status.sync] google ads update failed', err);
    }
  }
  res.json({ ok: true });
});

const keywordIdeasSchema = z.object({
  seedKeywords: z.array(z.string()).min(1).max(20),
  country: z.string().length(2),
  language: z.string().optional(),
});

router.post('/ads/keywords/ideas', async (req, res) => {
  const parsed = keywordIdeasSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  try {
    const ideas = await getKeywordIdeas(parsed.data);
    const tier = priceForCountry(parsed.data.country);
    const enriched = ideas.map((idea) => {
      const avgCpcMicros = (idea.lowTopOfPageCpcMicros + idea.highTopOfPageCpcMicros) / 2;
      const profit = analyseKeywordProfitability(
        { keyword: idea.keyword, country: parsed.data.country.toUpperCase(), avgCpcMicros },
        tier.oneTime
      );
      return { ...idea, analysis: profit };
    });
    res.json({ country: parsed.data.country.toUpperCase(), priceEur: tier.oneTime, ideas: enriched, mock: isMockMode() });
  } catch (err) {
    console.error('[admin.ads.ideas]', err);
    res.status(500).json({ error: 'google_ads_failed' });
  }
});

router.post('/grant-admin', (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });
  const info = db.prepare('UPDATE users SET role = ? WHERE email = ?').run('admin', parsed.data.email);
  if (info.changes === 0) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export default router;
