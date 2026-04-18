import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({ baseURL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bp24_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface PricingResponse {
  country: string;
  oneTime: number;
  yearly: number;
  currency: string;
  displayCountry: string;
}

export async function fetchPricing(country?: string): Promise<PricingResponse> {
  const { data } = await api.get('/pricing', { params: country ? { country } : {} });
  return data;
}

export interface GenerateInput {
  section: string;
  answers: Record<string, unknown>;
  language: string;
  planContext?: Record<string, unknown>;
}

export async function generateSection(input: GenerateInput): Promise<string> {
  const { data } = await api.post<{ text: string }>('/generate/section', input);
  return data.text;
}

export async function createPlan(input: { title?: string; language: string; country?: string }): Promise<string> {
  const { data } = await api.post<{ id: string }>('/plans', input);
  return data.id;
}

export async function updatePlan(
  id: string,
  patch: Partial<{
    title: string;
    answers: Record<string, unknown>;
    texts: Record<string, string>;
    finance: Record<string, unknown>;
    status: 'draft' | 'preview' | 'paid';
  }>
): Promise<void> {
  await api.patch(`/plans/${id}`, patch);
}

export interface Plan {
  id: string;
  title: string | null;
  language: string;
  country: string | null;
  answers: Record<string, unknown>;
  texts: Record<string, string>;
  finance: Record<string, unknown>;
  status: string;
  paid: boolean;
}

export async function getPlan(id: string): Promise<Plan> {
  const { data } = await api.get<Plan>(`/plans/${id}`);
  return data;
}

export async function listPlans(): Promise<Array<{ id: string; title: string | null; language: string; status: string; paid: number; updated_at: number }>> {
  const { data } = await api.get<{ plans: [] }>('/plans');
  return data.plans;
}

export async function startCheckout(input: {
  planId?: string;
  type: 'one_time' | 'subscription';
  country?: string;
  email?: string;
}): Promise<{ sessionUrl: string; mock?: boolean }> {
  const { data } = await api.post('/checkout/session', input);
  return data;
}

export async function registerUser(input: { email: string; password: string; country?: string; language?: string }) {
  const { data } = await api.post('/auth/register', input);
  return data;
}

export async function loginUser(input: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', input);
  return data;
}
