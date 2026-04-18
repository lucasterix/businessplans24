import { randomUUID } from 'node:crypto';
import { db } from './db.js';

type DripTemplate = 'welcome' | 'day3_value' | 'day7_upsell';

const DAY = 24 * 60 * 60 * 1000;

const TEMPLATES: Record<DripTemplate, { subject: string; text: string; html: string }> = {
  welcome: {
    subject: 'Willkommen bei Businessplan24',
    text: `Hallo,\n\ndanke, dass du dich registriert hast. Dein Wizard wartet hier: https://businessplans24.com\n\nViel Erfolg!\nLucas`,
    html: `<p>Hallo,</p><p>danke, dass du dich registriert hast. Dein Wizard wartet <a href="https://businessplans24.com">hier</a>.</p><p>Viel Erfolg!<br>Lucas</p>`,
  },
  day3_value: {
    subject: 'Dein Plan entscheidet über deine Gründung',
    text: `Hallo,\n\n70% der Neugründungen scheitern ohne fundierten Finanzplan. Mit den richtigen Zahlen sinkt das auf 30%.\n\nWenn du noch zögerst: Deine Vorschau ist schon gespeichert, du musst nur weitermachen: https://businessplans24.com\n\nFragen? Antworte einfach auf diese Mail.\n\nLucas`,
    html: `<p>Hallo,</p><p><strong>70% der Neugründungen scheitern ohne fundierten Finanzplan.</strong> Mit den richtigen Zahlen sinkt das auf 30%.</p><p>Wenn du noch zögerst: Deine Vorschau ist schon gespeichert, du musst nur weitermachen.</p><p><a href="https://businessplans24.com">Jetzt fortsetzen</a></p><p>Fragen? Antworte einfach auf diese Mail.<br>Lucas</p>`,
  },
  day7_upsell: {
    subject: '10 % Rabatt auf deinen Plan — nur heute',
    text: `Hallo,\n\nals Dankeschön fürs Registrieren: Code FIRST10 gibt dir 10% auf deinen Businessplan. Gilt 48 Stunden.\n\nhttps://businessplans24.com/pricing\n\nLucas`,
    html: `<p>Hallo,</p><p>als Dankeschön fürs Registrieren: Code <strong>FIRST10</strong> gibt dir <strong>10% auf deinen Businessplan</strong>. Gilt 48 Stunden.</p><p><a href="https://businessplans24.com/pricing">Jetzt einlösen</a></p><p>Lucas</p>`,
  },
};

export function scheduleDrip(userId: string, email: string, createdAt: number) {
  const plan: Array<[DripTemplate, number]> = [
    ['welcome', 5 * 60 * 1000],
    ['day3_value', 3 * DAY],
    ['day7_upsell', 7 * DAY],
  ];
  for (const [template, offset] of plan) {
    const exists = db
      .prepare('SELECT id FROM drip_queue WHERE user_id = ? AND template = ?')
      .get(userId, template);
    if (exists) continue;
    db.prepare(
      `INSERT INTO drip_queue (id, user_id, email, template, send_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(randomUUID(), userId, email, template, createdAt + offset);
  }
}

export async function runDripOnce(send: (email: string, subject: string, html: string, text: string) => Promise<void>) {
  const due = db
    .prepare('SELECT * FROM drip_queue WHERE sent_at IS NULL AND send_at <= ? LIMIT 50')
    .all(Date.now()) as Array<{ id: string; email: string; template: DripTemplate }>;
  for (const d of due) {
    const tpl = TEMPLATES[d.template];
    if (!tpl) continue;
    try {
      await send(d.email, tpl.subject, tpl.html, tpl.text);
      db.prepare('UPDATE drip_queue SET sent_at = ? WHERE id = ?').run(Date.now(), d.id);
    } catch (err) {
      console.warn('[drip.send] failed for', d.id, err);
    }
  }
}

export function startDripScheduler(send: (email: string, subject: string, html: string, text: string) => Promise<void>) {
  const run = () => runDripOnce(send).catch((err) => console.warn('[drip]', err));
  run();
  setInterval(run, 10 * 60 * 1000);
}
