import { Router } from 'express';
import { db } from '../lib/db.js';
import { renderPlanPdf } from '../lib/pdf.js';
import { optionalAuth } from '../middleware/auth.js';
import { burstLimiter, dailyQuotaLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/:id/pdf', burstLimiter, optionalAuth, dailyQuotaLimiter('export'), async (req, res) => {
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
        paid: number;
      }
    | undefined;

  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.user_id && row.user_id !== req.user?.sub) {
    return res.status(403).json({ error: 'forbidden' });
  }

  let hasActiveSub = false;
  if (req.user?.sub) {
    const user = db
      .prepare('SELECT subscription_tier, subscription_expires_at FROM users WHERE id = ?')
      .get(req.user.sub) as { subscription_tier: string | null; subscription_expires_at: number | null } | undefined;
    if (user?.subscription_tier && user.subscription_expires_at && user.subscription_expires_at > Date.now()) {
      hasActiveSub = true;
    }
  }

  const watermarked = !row.paid && !hasActiveSub;

  try {
    const pdf = await renderPlanPdf({
      title: row.title || 'Businessplan',
      language: row.language,
      texts: JSON.parse(row.texts_json),
      finance: JSON.parse(row.finance_json),
      watermarked,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="businessplan${watermarked ? '-preview' : ''}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    console.error('[export.pdf]', err);
    res.status(500).json({ error: 'pdf_failed' });
  }
});

export default router;
