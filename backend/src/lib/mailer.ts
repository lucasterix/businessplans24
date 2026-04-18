/**
 * Transactional email. Two modes:
 *
 *  - SMTP_HOST set → sends via nodemailer to the configured relay.
 *    Works with Postmark, Resend SMTP, Mailgun, SendGrid, Gmail, etc.
 *  - SMTP_HOST empty → logs the rendered email to stdout so dev works
 *    without credentials. Nothing is sent to real inboxes.
 *
 * Required env when enabled:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 */

import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null | 'disabled' = null;

function getTransporter(): Transporter | null {
  if (transporter === 'disabled') return null;
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = 'disabled';
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
      : undefined,
  });
  return transporter;
}

const FROM = process.env.MAIL_FROM || 'Businessplan24 <no-reply@businessplans24.com>';

export async function send(to: string, subject: string, html: string, text: string) {
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer.stub] to=${to} subject="${subject}"\n${text}\n---`);
    return;
  }
  await t.sendMail({ from: FROM, to, subject, html, text });
}

const TEMPLATES_DE = {
  welcome: (_email: string) => ({
    subject: 'Willkommen bei Businessplan24',
    text: `Hallo,

danke, dass du dich bei Businessplan24 angemeldet hast.
Du kannst ab sofort deinen Businessplan erstellen und speichern:
https://businessplans24.com

Viel Erfolg!
Businessplan24-Team`,
    html: `<p>Hallo,</p><p>danke, dass du dich bei <strong>Businessplan24</strong> angemeldet hast.</p><p>Du kannst ab sofort deinen Businessplan erstellen und speichern.</p><p><a href="https://businessplans24.com">Jetzt starten</a></p><p>Viel Erfolg!<br>Businessplan24-Team</p>`,
  }),
  receipt: (planId: string, amount: number, currency: string) => ({
    subject: 'Deine Zahlung bei Businessplan24',
    text: `Vielen Dank für deinen Kauf.

Plan-ID: ${planId}
Betrag: ${(amount / 100).toFixed(2)} ${currency}

Die saubere PDF-Version kannst du hier herunterladen:
https://businessplans24.com/preview/${planId}

Bei Fragen: lucas.schmutz@businessplans24.com
Businessplan24-Team`,
    html: `<p>Vielen Dank für deinen Kauf.</p><p><strong>Plan:</strong> ${planId}<br><strong>Betrag:</strong> ${(amount / 100).toFixed(2)} ${currency}</p><p><a href="https://businessplans24.com/preview/${planId}">PDF herunterladen</a></p>`,
  }),
  subExpiring: (daysLeft: number) => ({
    subject: `Dein Abo läuft in ${daysLeft} Tagen aus`,
    text: `Hallo,\n\ndein Businessplan24-Jahresabo läuft in ${daysLeft} Tagen aus. Wenn du weitermachen möchtest, kümmerst du dich um die Verlängerung unter https://businessplans24.com/account.\n\nBusinessplan24-Team`,
    html: `<p>Hallo,</p><p>dein Businessplan24-Jahresabo läuft in <strong>${daysLeft} Tagen</strong> aus.</p><p><a href="https://businessplans24.com/account">Jetzt verwalten</a></p>`,
  }),
};

export async function sendWelcomeEmail(email: string, _lang: string) {
  const tpl = TEMPLATES_DE.welcome(email);
  await send(email, tpl.subject, tpl.html, tpl.text);
}

export async function sendReceiptEmail(email: string, planId: string, amount: number, currency: string) {
  const tpl = TEMPLATES_DE.receipt(planId, amount, currency);
  await send(email, tpl.subject, tpl.html, tpl.text);
}

export async function sendSubscriptionExpiringEmail(email: string, daysLeft: number) {
  const tpl = TEMPLATES_DE.subExpiring(daysLeft);
  await send(email, tpl.subject, tpl.html, tpl.text);
}
