import { Router, raw } from 'express';
import Stripe from 'stripe';
import { db } from '../lib/db.js';
import { sendOrderConfirmationEmail } from '../lib/mailer.js';
import { renderPlanPdf } from '../lib/pdf.js';

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
      // Render PDF asynchronously so we don't block the webhook response.
      // If the plan has no section texts yet, send the mail without attachment.
      void (async () => {
        try {
          const plan = db
            .prepare('SELECT title, language, texts_json, finance_json, answers_json, settings_json FROM plans WHERE id = ?')
            .get(planId) as
              | { title: string | null; language: string; texts_json: string; finance_json: string; answers_json: string; settings_json: string }
              | undefined;

          let pdf: Buffer | undefined;
          let planIsEmpty = true;
          if (plan) {
            const texts = JSON.parse(plan.texts_json || '{}') as Record<string, string>;
            planIsEmpty = Object.values(texts).every((v) => !v || v.trim() === '');
            if (!planIsEmpty) {
              const answers = JSON.parse(plan.answers_json || '{}') as Record<string, Record<string, unknown>>;
              const flat: Record<string, unknown> = {};
              Object.values(answers).forEach((a) => Object.assign(flat, a));
              pdf = await renderPlanPdf({
                title: plan.title || (flat.company_name as string) || 'Businessplan',
                subtitle: (flat.one_liner as string) || undefined,
                language: plan.language,
                texts,
                finance: JSON.parse(plan.finance_json || '{}'),
                watermarked: false, // paid → clean version
                settings: JSON.parse(plan.settings_json || '{}'),
              });
            }
          }

          await sendOrderConfirmationEmail({
            email,
            planId,
            amountMinor: amount,
            currency,
            invoiceRef: session.id.slice(-12).toUpperCase(),
            type: (type as 'one_time' | 'subscription' | 'plan_review') || 'one_time',
            pdf,
            planIsEmpty,
          });
        } catch (err) {
          console.warn('[mail.order-confirmation] failed', err);
        }
      })();
    }
  }

  res.json({ received: true });
});

export default router;
