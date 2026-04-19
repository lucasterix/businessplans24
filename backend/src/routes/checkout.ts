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
  type: z.enum(['one_time', 'subscription', 'plan_review']),
  country: z.string().optional(),
  email: z.string().email().optional(),
  // Customer-facing Stripe promotion code (e.g. FIRST10). When provided, we
  // look it up server-side and attach as a pre-applied discount so the user
  // sees the final price directly on Stripe Checkout.
  promoCode: z.string().max(40).optional(),
});

router.get('/verify/:sessionId', async (req, res) => {
  if (!stripe) return res.json({ ok: false, mock: true });
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({
      ok: session.payment_status === 'paid',
      planId: session.metadata?.planId,
      amount: session.amount_total,
      currency: session.currency,
      email: session.customer_email || session.customer_details?.email || undefined,
    });
  } catch (err) {
    console.error('[checkout.verify]', err);
    res.status(404).json({ ok: false });
  }
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
  const REVIEW_PRICE = 99;
  const unitAmountEur =
    parsed.data.type === 'subscription'
      ? price.yearly
      : parsed.data.type === 'plan_review'
        ? REVIEW_PRICE
        : price.oneTime;
  const amount = unitAmountEur * 100;

  const productNames: Record<string, string> = {
    subscription: 'Businessplan24 Jahres-Abo',
    one_time: 'Businessplan24 Einzel-Plan',
    plan_review: 'Persönliches Plan-Review durch den Gründer',
  };

  // Resolve customer-facing promo code → Stripe promotion_code id (if any).
  let prefilledDiscount: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (parsed.data.promoCode) {
    try {
      const promos = await stripe.promotionCodes.list({ code: parsed.data.promoCode, active: true, limit: 1 });
      if (promos.data.length > 0) {
        prefilledDiscount = [{ promotion_code: promos.data[0].id }];
      }
    } catch (err) {
      console.warn('[checkout] promo lookup failed', err);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: parsed.data.type === 'subscription' ? 'subscription' : 'payment',
    customer_email: parsed.data.email || req.user?.email,
    // If we pre-applied a discount, Stripe disallows the promo-code field to
    // keep things unambiguous. Otherwise keep it enabled.
    ...(prefilledDiscount ? { discounts: prefilledDiscount } : { allow_promotion_codes: true }),
    line_items: [
      {
        price_data: {
          currency: price.currency.toLowerCase(),
          product_data: { name: productNames[parsed.data.type] },
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
