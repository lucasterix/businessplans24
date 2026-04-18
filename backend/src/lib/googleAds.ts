/**
 * Google Ads integration layer.
 *
 * Uses the google-ads-api library when credentials are present; otherwise
 * falls back to a deterministic mock so the admin UI is usable during
 * development and before the user uploads their Google Ads credentials.
 *
 * Required env vars for live mode:
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_CLIENT_ID
 *   GOOGLE_ADS_CLIENT_SECRET
 *   GOOGLE_ADS_REFRESH_TOKEN
 *   GOOGLE_ADS_CUSTOMER_ID         — the billed customer
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID   — optional, for manager accounts (MCC)
 */

export interface GoogleAdsKeywordIdea {
  keyword: string;
  avgMonthlySearches: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  lowTopOfPageCpcMicros: number;
  highTopOfPageCpcMicros: number;
}

export interface CampaignSummary {
  googleCampaignId: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  country: string;
}

const HAS_CREDS = !!(
  process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
  process.env.GOOGLE_ADS_CLIENT_ID &&
  process.env.GOOGLE_ADS_CLIENT_SECRET &&
  process.env.GOOGLE_ADS_REFRESH_TOKEN &&
  process.env.GOOGLE_ADS_CUSTOMER_ID
);

export const isMockMode = () => !HAS_CREDS;

type GoogleAdsCustomer = {
  keywordPlanIdeas: {
    generateKeywordIdeas: (params: Record<string, unknown>) => Promise<Array<Record<string, unknown>>>;
  };
  query: (q: string) => Promise<Array<Record<string, unknown>>>;
  campaigns?: { update: (c: Record<string, unknown>) => Promise<unknown> };
};

let cachedCustomer: GoogleAdsCustomer | null = null;
async function getCustomer(): Promise<GoogleAdsCustomer | null> {
  if (!HAS_CREDS) return null;
  if (cachedCustomer) return cachedCustomer;
  const { GoogleAdsApi } = await import('google-ads-api');
  const api = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });
  cachedCustomer = api.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  }) as unknown as GoogleAdsCustomer;
  return cachedCustomer;
}

const GEO_CONSTANT: Record<string, string> = {
  DE: '2276', AT: '2040', CH: '2756', FR: '2250', IT: '2380',
  ES: '2724', PT: '2620', NL: '2528', BE: '2056', PL: '2616',
  CZ: '2203', SK: '2703', HU: '2348', RO: '2642', BG: '2100',
  GR: '2300', HR: '2191', SI: '2705', EE: '2233', LV: '2428',
  LT: '2440', FI: '2246', SE: '2752', NO: '2578', DK: '2208',
  IE: '2372', LU: '2442', GB: '2826', UK: '2826',
};

const LANG_CONSTANT: Record<string, string> = {
  de: '1001', en: '1000', fr: '1002', es: '1003', it: '1004',
  pt: '1014', nl: '1010', pl: '1030', cs: '1021', sk: '1033',
  hu: '1024', ro: '1032', bg: '1020', el: '1022', hr: '1039',
  sl: '1034', et: '1043', lv: '1028', lt: '1029', fi: '1011',
  sv: '1015', da: '1009', no: '1013',
};

function mockKeywordIdeas(seed: string, country: string): GoogleAdsKeywordIdea[] {
  const base = [
    'businessplan erstellen', 'businessplan vorlage', 'businessplan kostenlos',
    'businessplan muster', 'finanzplan erstellen', 'businessplan software',
    'businessplan existenzgründung', 'businessplan beispiel', 'businessplan bank',
    'businessplan wettbewerbsanalyse', 'liquiditätsplan erstellen',
    'rentabilitätsrechnung', 'kapitalbedarfsplan',
  ];
  const seedHash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return base.map((kw, i) => {
    const n = (seedHash + i * 7) % 100;
    const base = country === 'DE' ? 180 : country === 'AT' ? 140 : 90;
    return {
      keyword: kw,
      avgMonthlySearches: Math.round((base + n * 15) * (1 + i * 0.15)),
      competition: (['LOW', 'MEDIUM', 'HIGH'] as const)[(n + i) % 3],
      lowTopOfPageCpcMicros: (0.6 + ((n + i) % 10) * 0.08) * 1_000_000,
      highTopOfPageCpcMicros: (1.8 + ((n + i) % 12) * 0.22) * 1_000_000,
    };
  });
}

export async function getKeywordIdeas(params: {
  seedKeywords: string[];
  country: string;
  language?: string;
}): Promise<GoogleAdsKeywordIdea[]> {
  if (!HAS_CREDS) {
    return mockKeywordIdeas(params.seedKeywords.join('|') || 'businessplan', params.country);
  }
  const customer = await getCustomer();
  if (!customer) return [];
  const geoId = GEO_CONSTANT[params.country.toUpperCase()];
  const langId = LANG_CONSTANT[(params.language || 'de').slice(0, 2)] || '1001';
  const results = await customer.keywordPlanIdeas.generateKeywordIdeas({
    language: `languageConstants/${langId}`,
    geo_target_constants: geoId ? [`geoTargetConstants/${geoId}`] : [],
    keyword_seed: { keywords: params.seedKeywords },
    include_adult_keywords: false,
  });
  return results.map((r) => {
    const metrics = (r.keyword_idea_metrics || {}) as {
      avg_monthly_searches?: number;
      competition?: string;
      low_top_of_page_bid_micros?: number;
      high_top_of_page_bid_micros?: number;
    };
    return {
      keyword: String(r.text ?? ''),
      avgMonthlySearches: metrics.avg_monthly_searches ?? 0,
      competition: (metrics.competition as GoogleAdsKeywordIdea['competition']) ?? 'UNKNOWN',
      lowTopOfPageCpcMicros: metrics.low_top_of_page_bid_micros ?? 0,
      highTopOfPageCpcMicros: metrics.high_top_of_page_bid_micros ?? 0,
    };
  });
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
  if (!HAS_CREDS) {
    return [
      {
        googleCampaignId: 'mock_de',
        name: 'Businessplan24 · DE · Brand',
        status: 'ENABLED',
        impressions: 18234,
        clicks: 842,
        conversions: 47,
        costMicros: 1_240_000_000,
        country: 'DE',
      },
      {
        googleCampaignId: 'mock_at',
        name: 'Businessplan24 · AT · Generic',
        status: 'ENABLED',
        impressions: 4120,
        clicks: 198,
        conversions: 11,
        costMicros: 310_000_000,
        country: 'AT',
      },
      {
        googleCampaignId: 'mock_fr',
        name: 'Businessplan24 · FR · Generic',
        status: 'PAUSED',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        costMicros: 0,
        country: 'FR',
      },
    ];
  }
  const customer = await getCustomer();
  if (!customer) return [];
  const rows = await customer.query(`
    SELECT
      campaign.id, campaign.name, campaign.status,
      campaign.primary_status, metrics.impressions, metrics.clicks,
      metrics.conversions, metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
  `);
  return rows.map((r) => {
    const c = r.campaign as { id?: string; name?: string; status?: string };
    const m = r.metrics as {
      impressions?: number; clicks?: number; conversions?: number; cost_micros?: number;
    };
    return {
      googleCampaignId: String(c.id ?? ''),
      name: c.name ?? '',
      status: (c.status as CampaignSummary['status']) ?? 'PAUSED',
      impressions: Number(m.impressions ?? 0),
      clicks: Number(m.clicks ?? 0),
      conversions: Number(m.conversions ?? 0),
      costMicros: Number(m.cost_micros ?? 0),
      country: '',
    };
  });
}

export async function setCampaignStatus(googleCampaignId: string, enabled: boolean): Promise<void> {
  if (!HAS_CREDS) return;
  const customer = await getCustomer();
  if (!customer?.campaigns) return;
  await customer.campaigns.update({
    resource_name: `customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${googleCampaignId}`,
    status: enabled ? 'ENABLED' : 'PAUSED',
  });
}

export interface KeywordProfitability {
  keyword: string;
  country: string;
  avgCpcEur: number;
  conversionValueEur: number;
  assumedConversionRate: number;
  expectedProfitPerClick: number;
  recommendation: 'run' | 'borderline' | 'avoid';
}

/**
 * Given a keyword's CPC and a target country's average plan price, decide
 * whether the keyword is profitable at the current CPC.
 *
 * Assumed conversion rate is conservative (2%). Callers can override.
 */
export function analyseKeywordProfitability(
  kw: { keyword: string; country: string; avgCpcMicros: number },
  priceEur: number,
  conversionRate = 0.02
): KeywordProfitability {
  const avgCpcEur = kw.avgCpcMicros / 1_000_000;
  const conversionValueEur = priceEur;
  const revenuePerClick = conversionValueEur * conversionRate;
  const expectedProfitPerClick = revenuePerClick - avgCpcEur;
  let recommendation: KeywordProfitability['recommendation'] = 'avoid';
  if (expectedProfitPerClick > avgCpcEur * 0.5) recommendation = 'run';
  else if (expectedProfitPerClick > 0) recommendation = 'borderline';
  return {
    keyword: kw.keyword,
    country: kw.country,
    avgCpcEur,
    conversionValueEur,
    assumedConversionRate: conversionRate,
    expectedProfitPerClick,
    recommendation,
  };
}
