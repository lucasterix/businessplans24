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

export async function generateSectionStreamed(
  input: GenerateInput,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const baseURL = import.meta.env.VITE_API_URL || '/api';
  const token = localStorage.getItem('bp24_token');
  const resp = await fetch(`${baseURL}/generate/section/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
    signal,
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`stream_failed_${resp.status}`);
  }
  const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let full = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const raw of events) {
      const lines = raw.split('\n');
      const ev = lines.find((l) => l.startsWith('event:'))?.slice(6).trim();
      const dataLine = lines.find((l) => l.startsWith('data:'))?.slice(5).trim() || '{}';
      let payload: { text?: string; error?: string };
      try { payload = JSON.parse(dataLine); } catch { payload = {}; }
      if (ev === 'delta' && payload.text) {
        full += payload.text;
        onDelta(payload.text);
      } else if (ev === 'error') {
        throw new Error(payload.error || 'stream_failed');
      } else if (ev === 'done') {
        return full.trim();
      }
    }
  }
  return full.trim();
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
    settings: Record<string, unknown>;
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
  settings?: Record<string, unknown>;
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
  type: 'one_time' | 'subscription' | 'plan_review';
  country?: string;
  email?: string;
  promoCode?: string;
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
