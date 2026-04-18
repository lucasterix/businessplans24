import { Router } from 'express';
import { z } from 'zod';
import { generateSection } from '../lib/anthropic.js';
import { burstLimiter, generationHourlyLimiter, dailyQuotaLimiter } from '../middleware/rateLimit.js';

const router = Router();

const schema = z.object({
  section: z.enum(['executive_summary', 'business_idea', 'customers', 'company', 'finance', 'appendix']),
  answers: z.record(z.unknown()),
  language: z.string().min(2).max(5),
  planContext: z.record(z.unknown()).optional(),
});

router.post(
  '/section',
  burstLimiter,
  generationHourlyLimiter,
  dailyQuotaLimiter('generate'),
  async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues });
    }
    try {
      const text = await generateSection(parsed.data);
      res.json({ text });
    } catch (err) {
      console.error('[generate.section]', err);
      res.status(500).json({ error: 'generation_failed' });
    }
  }
);

export default router;
