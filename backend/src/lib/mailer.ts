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

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export async function send(
  to: string,
  subject: string,
  html: string,
  text: string,
  attachments?: MailAttachment[]
) {
  const t = getTransporter();
  if (!t) {
    const att = attachments?.length ? ` +${attachments.length} attachment(s)` : '';
    console.log(`[mailer.stub] to=${to} subject="${subject}"${att}\n${text}\n---`);
    return;
  }
  await t.sendMail({ from: FROM, to, subject, html, text, attachments });
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

/**
 * Order confirmation email with the rendered PDF attached when the plan
 * already has content. For empty plans (user bought from /pricing before
 * running the wizard), we skip the attachment and link back to the wizard.
 *
 * invoiceRef is displayed as a human-readable order reference — uses the
 * first 12 chars of the Stripe session id which are sufficient to identify
 * the order in support and the Stripe dashboard.
 */
export async function sendOrderConfirmationEmail(params: {
  email: string;
  planId: string;
  amountMinor: number;
  currency: string;
  invoiceRef: string;
  type: 'one_time' | 'subscription' | 'plan_review';
  pdf?: Buffer;
  planIsEmpty?: boolean;
}) {
  const { email, planId, amountMinor, currency, invoiceRef, type, pdf, planIsEmpty } = params;
  const amount = (amountMinor / 100).toFixed(2);
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  const productName =
    type === 'subscription' ? 'Businessplan24 Jahres-Abo'
    : type === 'plan_review' ? 'Persönliches Plan-Review'
    : 'Businessplan24 Einzel-Plan';

  const planUrl = `https://businessplans24.com/preview/${planId}`;
  const wizardUrl = `https://businessplans24.com/de`;

  const cta = planIsEmpty
    ? `<p style="margin:24px 0">Dein Businessplan ist jetzt freigeschaltet. <a href="${wizardUrl}" style="color:#0b5cff;font-weight:600">Jetzt ausfüllen →</a></p>`
    : pdf
      ? `<p style="margin:24px 0">Dein fertiger Businessplan liegt im PDF-Anhang. Die Live-Vorschau findest du hier: <a href="${planUrl}" style="color:#0b5cff;font-weight:600">Plan öffnen</a></p>`
      : `<p style="margin:24px 0">Dein Plan ist freigeschaltet. <a href="${planUrl}" style="color:#0b5cff;font-weight:600">Zur Vorschau</a></p>`;

  const subject = planIsEmpty
    ? `Bestätigung Businessplan24 — dein Plan ist freigeschaltet`
    : `Dein Businessplan von Businessplan24`;

  const html = `<!doctype html><html><body style="font-family:Helvetica,Arial,sans-serif;color:#0b1120;background:#f5f5f7;margin:0;padding:24px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px 28px 24px;box-shadow:0 2px 8px rgba(15,23,42,0.06)">
  <h1 style="margin:0 0 8px;font-size:22px;letter-spacing:-0.01em">Vielen Dank für deinen Kauf 🎉</h1>
  <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Datum: ${today}</p>

  <div style="background:#fafafa;border-left:3px solid #0b5cff;padding:14px 16px;border-radius:4px;margin-bottom:20px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:3px 0;color:#6b7280">Produkt</td><td style="padding:3px 0;text-align:right"><strong>${productName}</strong></td></tr>
      <tr><td style="padding:3px 0;color:#6b7280">Betrag</td><td style="padding:3px 0;text-align:right"><strong>${amount} ${currency.toUpperCase()}</strong> <span style="color:#9ca3af;font-size:12px">(inkl. MwSt.)</span></td></tr>
      <tr><td style="padding:3px 0;color:#6b7280">Bestell-Nr.</td><td style="padding:3px 0;text-align:right;font-family:monospace;font-size:13px">${invoiceRef}</td></tr>
      <tr><td style="padding:3px 0;color:#6b7280">Plan-ID</td><td style="padding:3px 0;text-align:right;font-family:monospace;font-size:13px">${planId}</td></tr>
    </table>
  </div>

  ${cta}

  <p style="margin:20px 0 8px;font-size:13px;color:#6b7280">Diese E-Mail dient als Zahlungsbestätigung. Eine formelle Rechnung bekommst du bei Bedarf per Antwort auf diese Mail.</p>
  <p style="margin:0;font-size:13px;color:#6b7280">Fragen? Schreib an <a href="mailto:info@businessplans24.com" style="color:#0b5cff">info@businessplans24.com</a>.</p>
</div>
<p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">
  Businessplan24 · businessplans24.com · <a href="https://businessplans24.com/de/imprint" style="color:#9ca3af">Impressum</a>
</p>
</body></html>`;

  const text = `Vielen Dank für deinen Kauf.

Datum: ${today}
Produkt: ${productName}
Betrag: ${amount} ${currency.toUpperCase()} (inkl. MwSt.)
Bestell-Nr.: ${invoiceRef}
Plan-ID: ${planId}

${planIsEmpty
  ? `Dein Plan ist freigeschaltet. Jetzt ausfüllen: ${wizardUrl}`
  : pdf
    ? `Dein fertiger Businessplan liegt im PDF-Anhang. Vorschau: ${planUrl}`
    : `Vorschau: ${planUrl}`}

Fragen? info@businessplans24.com
Businessplan24-Team`;

  const attachments: MailAttachment[] | undefined = pdf
    ? [{ filename: 'businessplan.pdf', content: pdf, contentType: 'application/pdf' }]
    : undefined;

  await send(email, subject, html, text, attachments);
}

export async function sendSubscriptionExpiringEmail(email: string, daysLeft: number) {
  const tpl = TEMPLATES_DE.subExpiring(daysLeft);
  await send(email, tpl.subject, tpl.html, tpl.text);
}
