import { api } from '../api/client';

export interface AdminStats {
  totalUsers: number;
  totalPlans: number;
  paidPlans: number;
  activeSubs: number;
  revenue30d: Array<{ total: number; currency: string }>;
  usersByCountry: Array<{ country: string; count: number }>;
}

export interface AdminUser {
  id: string;
  email: string;
  country: string | null;
  language: string | null;
  role: string;
  subscription_tier: string | null;
  subscription_expires_at: number | null;
  created_at: number;
}

export interface AdminPayment {
  id: string;
  email: string | null;
  user_id: string | null;
  plan_id: string | null;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: number;
}

export interface AdminPlan {
  id: string;
  title: string | null;
  email: string | null;
  language: string;
  country: string | null;
  status: string;
  paid: number;
  created_at: number;
  updated_at: number;
}

export interface CampaignRemote {
  googleCampaignId: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number;
  country: string;
}

export interface CampaignLocal {
  id: string;
  google_campaign_id: string | null;
  name: string;
  country: string;
  region: string | null;
  status: string;
  max_cpc_micros: number;
  daily_budget_micros: number;
}

export interface KeywordIdea {
  keyword: string;
  avgMonthlySearches: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  lowTopOfPageCpcMicros: number;
  highTopOfPageCpcMicros: number;
  analysis: {
    keyword: string;
    country: string;
    avgCpcEur: number;
    conversionValueEur: number;
    assumedConversionRate: number;
    expectedProfitPerClick: number;
    recommendation: 'run' | 'borderline' | 'avoid';
  };
}

export const admin = {
  stats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),
  users: () => api.get<{ users: AdminUser[] }>('/admin/users').then((r) => r.data.users),
  payments: () => api.get<{ payments: AdminPayment[] }>('/admin/payments').then((r) => r.data.payments),
  plans: () => api.get<{ plans: AdminPlan[] }>('/admin/plans').then((r) => r.data.plans),
  adsCampaigns: () =>
    api
      .get<{ remote: CampaignRemote[]; local: CampaignLocal[]; mock: boolean }>('/admin/ads/campaigns')
      .then((r) => r.data),
  keywordIdeas: (payload: { seedKeywords: string[]; country: string; language?: string }) =>
    api
      .post<{ country: string; priceEur: number; ideas: KeywordIdea[]; mock: boolean }>('/admin/ads/keywords/ideas', payload)
      .then((r) => r.data),
  createCampaign: (payload: {
    name: string;
    country: string;
    region?: string | null;
    maxCpcEur: number;
    dailyBudgetEur: number;
    status?: 'enabled' | 'paused';
  }) => api.post('/admin/ads/campaigns', payload).then((r) => r.data),
  setCampaignStatus: (id: string, enabled: boolean) =>
    api.patch(`/admin/ads/campaigns/${id}/status`, { enabled }).then((r) => r.data),
};
