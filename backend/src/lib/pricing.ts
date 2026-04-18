export interface PriceTier {
  oneTime: number;
  yearly: number;
  currency: string;
  displayCountry: string;
}

const TIER_WESTERN: Omit<PriceTier, 'displayCountry'> = {
  oneTime: 49,
  yearly: 99,
  currency: 'EUR',
};

const TIER_SOUTHERN: Omit<PriceTier, 'displayCountry'> = {
  oneTime: 39,
  yearly: 79,
  currency: 'EUR',
};

const TIER_EASTERN: Omit<PriceTier, 'displayCountry'> = {
  oneTime: 29,
  yearly: 59,
  currency: 'EUR',
};

const TIER_NORDIC_NON_EUR = {
  SE: { oneTime: 549, yearly: 1099, currency: 'SEK' },
  NO: { oneTime: 549, yearly: 1099, currency: 'NOK' },
  DK: { oneTime: 379, yearly: 749, currency: 'DKK' },
};

const TIER_GBP = { oneTime: 45, yearly: 89, currency: 'GBP' };
const TIER_CHF = { oneTime: 49, yearly: 99, currency: 'CHF' };
const TIER_PLN = { oneTime: 129, yearly: 259, currency: 'PLN' };
const TIER_CZK = { oneTime: 749, yearly: 1499, currency: 'CZK' };
const TIER_HUF = { oneTime: 11900, yearly: 23900, currency: 'HUF' };
const TIER_RON = { oneTime: 149, yearly: 299, currency: 'RON' };
const TIER_BGN = { oneTime: 59, yearly: 119, currency: 'BGN' };

const COUNTRY_TO_TIER: Record<string, Omit<PriceTier, 'displayCountry'>> = {
  DE: TIER_WESTERN, AT: TIER_WESTERN, CH: TIER_CHF, FR: TIER_WESTERN,
  BE: TIER_WESTERN, NL: TIER_WESTERN, LU: TIER_WESTERN, IE: TIER_WESTERN,
  GB: TIER_GBP, UK: TIER_GBP, FI: TIER_WESTERN, IS: TIER_WESTERN,
  SE: TIER_NORDIC_NON_EUR.SE, NO: TIER_NORDIC_NON_EUR.NO, DK: TIER_NORDIC_NON_EUR.DK,
  IT: TIER_SOUTHERN, ES: TIER_SOUTHERN, PT: TIER_SOUTHERN, GR: TIER_SOUTHERN,
  MT: TIER_SOUTHERN, CY: TIER_SOUTHERN, SI: TIER_SOUTHERN, HR: TIER_SOUTHERN,
  PL: TIER_PLN, CZ: TIER_CZK, SK: TIER_EASTERN, HU: TIER_HUF,
  RO: TIER_RON, BG: TIER_BGN, EE: TIER_EASTERN, LV: TIER_EASTERN, LT: TIER_EASTERN,
};

const DEFAULT_TIER = TIER_WESTERN;

export function priceForCountry(country?: string): PriceTier {
  const c = (country || '').toUpperCase();
  const tier = COUNTRY_TO_TIER[c] || DEFAULT_TIER;
  return { ...tier, displayCountry: c || 'EU' };
}

const EU_COUNTRIES = Object.keys(COUNTRY_TO_TIER);

export function isEuropean(country?: string): boolean {
  if (!country) return false;
  return EU_COUNTRIES.includes(country.toUpperCase());
}

export function detectCountryFromHeaders(headers: Record<string, unknown>): string | undefined {
  const cf = headers['cf-ipcountry'];
  if (typeof cf === 'string' && cf.length === 2) return cf.toUpperCase();

  const accept = headers['accept-language'];
  if (typeof accept === 'string') {
    const match = accept.match(/[a-z]{2}-([A-Z]{2})/);
    if (match) return match[1].toUpperCase();
  }
  return undefined;
}
