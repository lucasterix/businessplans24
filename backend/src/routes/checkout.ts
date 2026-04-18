import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import Stripe from 'stripe';
import { db } from '../lib/db.js';
import { priceForCountry } from '../lib/pricing.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion }) : null;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN?.split(',')[0].trim() || 'https://businessplans24.com';

const schema = z.object({
  planId: z.string().optional(),
  type: z.enum(['one_time', 'subscription']),
  country: z.string().optional(),
  email: z.string().email().optional(),
});

router.post('/session', optionalAuth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'invalid_input' });

  if (!stripe) {
    const paymentId = randomUUID();
    db.prepare(
      `INSERT INTO payments (id, user_id, plan_id, type, amount, currency, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      paymentId,
      req.user?.sub || null,
      parsed.data.planId || null,
      parsed.data.type,
      0,
      'EUR',
      'mock_pending',
      Date.now()
    );
    return res.json({
      sessionUrl: `${FRONTEND_ORIGIN}/payment/mock?payment=${paymentId}&plan=${parsed.data.planId || ''}`,
      mock: true,
    });
  }

  const price = priceForCountry(parsed.data.country);
  const amount = (parsed.data.type === 'subscription' ? price.yearly : price.oneTime) * 100;

  const session = await stripe.checkout.sessions.create({
    mode: parsed.data.type === 'subscription' ? 'subscription' : 'payment',
    customer_email: parsed.data.email || req.user?.email,
    line_items: [
      {
        price_data: {
          currency: price.currency.toLowerCase(),
          product_data: {
            name:
              parsed.data.type === 'subscription'
                ? 'Businessplan24 Jahres-Abo'
                : 'Businessplan24 Einzel-Plan',
          },
          unit_amount: amount,
          ...(parsed.data.type === 'subscription'
            ? { recurring: { interval: 'year' } }
            : {}),
        },
        quantity: 1,
      },
    ],
    metadata: {
      planId: parsed.data.planId || '',
      userId: req.user?.sub || '',
      type: parsed.data.type,
      country: parsed.data.country || '',
    },
    success_url: `${FRONTEND_ORIGIN}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan=${parsed.data.planId || ''}`,
    cancel_url: `${FRONTEND_ORIGIN}/payment/cancel?plan=${parsed.data.planId || ''}`,
  });

  res.json({ sessionUrl: session.url });
});

export default router;
