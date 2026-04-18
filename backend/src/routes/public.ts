import { Router } from 'express';
import { db } from '../lib/db.js';

const router = Router();

const COUNTER_OFFSET = 11_000;

router.get('/stats', (_req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS c FROM plans').get() as { c: number };
  const plans = COUNTER_OFFSET + row.c;
  res.json({ plansCreated: plans });
});

export default router;
