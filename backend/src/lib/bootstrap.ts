import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

/**
 * Idempotent: on startup, ensure the configured ADMIN_EMAIL user exists
 * and has role=admin. Password is only set when the user doesn't exist yet
 * (we never overwrite an existing password on restart).
 */
export async function ensureInitialAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(email) as
    | { id: string; role: string }
    | undefined;

  if (existing) {
    if (existing.role !== 'admin') {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', existing.id);
      console.log(`[bootstrap] promoted existing user ${email} to admin`);
    }
    return;
  }

  const id = randomUUID();
  const hash = await bcrypt.hash(password, 10);
  db.prepare(
    `INSERT INTO users (id, email, password_hash, country, language, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, email, hash, 'DE', 'de', 'admin', Date.now());
  console.log(`[bootstrap] created initial admin ${email}`);
}
