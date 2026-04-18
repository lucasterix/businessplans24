import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new Database(path.join(DB_DIR, 'businessplans24.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    country TEXT,
    language TEXT,
    subscription_tier TEXT,
    subscription_expires_at INTEGER,
    stripe_customer_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    language TEXT NOT NULL,
    country TEXT,
    answers_json TEXT NOT NULL DEFAULT '{}',
    texts_json TEXT NOT NULL DEFAULT '{}',
    finance_json TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    paid INTEGER NOT NULL DEFAULT 0,
    payment_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    plan_id TEXT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    stripe_session_id TEXT,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);
