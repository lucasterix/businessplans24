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
    role TEXT NOT NULL DEFAULT 'user',
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

  CREATE TABLE IF NOT EXISTS ads_campaigns (
    id TEXT PRIMARY KEY,
    google_campaign_id TEXT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT,
    status TEXT NOT NULL DEFAULT 'paused',
    max_cpc_micros INTEGER NOT NULL DEFAULT 0,
    daily_budget_micros INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ads_keywords (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    match_type TEXT NOT NULL DEFAULT 'BROAD',
    max_cpc_micros INTEGER,
    country TEXT NOT NULL,
    region TEXT,
    avg_cpc_micros INTEGER,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions REAL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES ads_campaigns(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_ads_keywords_campaign ON ads_keywords(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_ads_keywords_country ON ads_keywords(country);
`);

const cols = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
if (!cols.some((c) => c.name === 'role')) {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
}
