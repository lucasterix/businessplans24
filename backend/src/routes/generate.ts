import { Router } from 'express';
import { z } from 'zod';
import { generateSection, generateSectionStream } from '../lib/anthropic.js';
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

router.post(
  '/section/stream',
  burstLimiter,
  generationHourlyLimiter,
  dailyQuotaLimiter('generate'),
  async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_input' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const write = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let closed = false;
    req.on('close', () => { closed = true; });

    try {
      for await (const chunk of generateSectionStream(parsed.data)) {
        if (closed) break;
        write('delta', { text: chunk });
      }
      if (!closed) write('done', {});
    } catch (err) {
      console.error('[generate.stream]', err);
      if (!closed) write('error', { error: 'generation_failed' });
    } finally {
      res.end();
    }
  }
);

export default router;
