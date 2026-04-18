import { Router, raw } from 'express';
import Stripe from 'stripe';
import { db } from '../lib/db.js';
import { sendReceiptEmail } from '../lib/mailer.js';

const router = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion }) : null;

router.post('/', raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !webhookSecret) return res.status(200).end();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      webhookSecret
    );
  } catch (err) {
    console.error('[webhook] signature verification failed', err);
    return res.status(400).json({ error: 'invalid_signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const planId = session.metadata?.planId;
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;

    const amount = session.amount_total ?? 0;
    const currency = (session.currency || 'eur').toUpperCase();

    if (planId) {
      db.prepare(
        `UPDATE plans SET paid = 1, status = 'paid', payment_id = ?, updated_at = ? WHERE id = ?`
      ).run(session.id, Date.now(), planId);
    }

    db.prepare(
      `INSERT INTO payments (id, user_id, plan_id, type, amount, currency, stripe_session_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      session.id,
      userId || null,
      planId || null,
      type || 'one_time',
      amount,
      currency,
      session.id,
      'paid',
      Date.now()
    );

    if (userId && type === 'subscription') {
      const expires = Date.now() + 365 * 24 * 60 * 60 * 1000;
      db.prepare(
        `UPDATE users SET subscription_tier = 'yearly', subscription_expires_at = ?, stripe_customer_id = ? WHERE id = ?`
      ).run(expires, session.customer as string, userId);
    }

    const email = session.customer_email || session.customer_details?.email;
    if (email && planId) {
      sendReceiptEmail(email, planId, amount, currency).catch((err) =>
        console.warn('[mail.receipt]', err)
      );
    }
  }

  res.json({ received: true });
});

export default router;
