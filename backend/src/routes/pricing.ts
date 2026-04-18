import { Router } from 'express';
import { detectCountryFromHeaders, priceForCountry } from '../lib/pricing.js';

const router = Router();

router.get('/', (req, res) => {
  const queryCountry = typeof req.query.country === 'string' ? req.query.country : undefined;
  const detected = detectCountryFromHeaders(req.headers as Record<string, unknown>);
  const country = (queryCountry || detected || 'DE').toUpperCase();
  const price = priceForCountry(country);
  res.json({ country, ...price });
});

export default router;
