import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import generateRouter from './routes/generate.js';
import plansRouter from './routes/plans.js';
import authRouter from './routes/auth.js';
import pricingRouter from './routes/pricing.js';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';
import exportRouter from './routes/export.js';
import adminRouter from './routes/admin.js';
import publicRouter from './routes/public.js';
import partnerRouter from './routes/partner.js';
import newsletterRouter from './routes/newsletter.js';
import shareRouter from './routes/share.js';
import { ensureInitialAdmin } from './lib/bootstrap.js';
import { startDripScheduler } from './lib/drip.js';
import { send as sendMail } from './lib/mailer.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.set('trust proxy', 1);

app.use('/api/webhook/stripe', webhookRouter);

app.use(
  cors({
    origin: FRONTEND_ORIGIN ? FRONTEND_ORIGIN.split(',').map((s) => s.trim()) : true,
    credentials: false,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'businessplans24-backend' });
});

app.use('/api/generate', generateRouter);
app.use('/api/plans', plansRouter);
app.use('/api/auth', authRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/export', exportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/share', shareRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'internal_error' });
});

ensureInitialAdmin()
  .then(() => {
    startDripScheduler(sendMail);
    app.listen(PORT, () => {
      console.log(`Businessplans24 backend on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[bootstrap] failed', err);
    process.exit(1);
  });
