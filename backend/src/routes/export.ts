import { Router } from 'express';
import { db } from '../lib/db.js';
import { renderPlanPdf } from '../lib/pdf.js';
import { renderPlanDocx } from '../lib/docx.js';
import { optionalAuth } from '../middleware/auth.js';
import { burstLimiter, dailyQuotaLimiter } from '../middleware/rateLimit.js';

const router = Router();

interface PlanRow {
  id: string;
  user_id: string | null;
  title: string | null;
  language: string;
  country: string | null;
  answers_json: string;
  texts_json: string;
  finance_json: string;
  settings_json: string;
  paid: number;
}

function loadPlan(id: string): PlanRow | undefined {
  return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as PlanRow | undefined;
}

function userHasActiveSub(userId?: string | null): boolean {
  if (!userId) return false;
  const user = db
    .prepare('SELECT subscription_tier, subscription_expires_at FROM users WHERE id = ?')
    .get(userId) as { subscription_tier: string | null; subscription_expires_at: number | null } | undefined;
  return !!(
    user?.subscription_tier &&
    user.subscription_expires_at &&
    user.subscription_expires_at > Date.now()
  );
}

function authorize(row: PlanRow | undefined, userId?: string | null): { ok: boolean; status?: number } {
  if (!row) return { ok: false, status: 404 };
  if (row.user_id && row.user_id !== userId) return { ok: false, status: 403 };
  return { ok: true };
}

router.get('/:id/pdf', burstLimiter, optionalAuth, dailyQuotaLimiter('export'), async (req, res) => {
  const row = loadPlan(req.params.id);
  const auth = authorize(row, req.user?.sub);
  if (!auth.ok) return res.status(auth.status!).json({ error: auth.status === 404 ? 'not_found' : 'forbidden' });

  const watermarked = !row!.paid && !userHasActiveSub(req.user?.sub);
  const settings = JSON.parse(row!.settings_json || '{}');
  const answers = JSON.parse(row!.answers_json) as Record<string, Record<string, unknown>>;
  const flat: Record<string, unknown> = {};
  Object.values(answers).forEach((a) => Object.assign(flat, a));
  try {
    const pdf = await renderPlanPdf({
      title: row!.title || (flat.company_name as string) || 'Businessplan',
      subtitle: (flat.one_liner as string) || undefined,
      language: row!.language,
      texts: JSON.parse(row!.texts_json),
      finance: JSON.parse(row!.finance_json),
      watermarked,
      settings,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="businessplan${watermarked ? '-preview' : ''}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('[export.pdf]', err);
    res.status(500).json({ error: 'pdf_failed' });
  }
});

router.get('/:id/docx', burstLimiter, optionalAuth, dailyQuotaLimiter('export'), async (req, res) => {
  const row = loadPlan(req.params.id);
  const auth = authorize(row, req.user?.sub);
  if (!auth.ok) return res.status(auth.status!).json({ error: auth.status === 404 ? 'not_found' : 'forbidden' });

  const watermarked = !row!.paid && !userHasActiveSub(req.user?.sub);
  try {
    const buf = await renderPlanDocx({
      title: row!.title || 'Businessplan',
      language: row!.language,
      texts: JSON.parse(row!.texts_json),
      watermarked,
    });
    const filename = `businessplan${watermarked ? '-vorschau' : ''}.docx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (err) {
    console.error('[export.docx]', err);
    res.status(500).json({ error: 'docx_failed' });
  }
});

export default router;
