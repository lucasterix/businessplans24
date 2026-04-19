// Cloudflare zone analytics + settings adapter.
// Token + zone id are provided via env so nothing sensitive lands in git:
//   CLOUDFLARE_API_TOKEN  = cfat_… with Zone:Analytics:Read + Zone:Zone:Read
//   CLOUDFLARE_ZONE_ID    = 32-hex zone id for businessplans24.com

const API = 'https://api.cloudflare.com/client/v4';

export interface CfAnalyticsSummary {
  periodHours: number;
  requests: { all: number; cached: number; uncached: number; cachedPct: number };
  bandwidth: { allBytes: number; cachedBytes: number; cachedPct: number };
  threats: { total: number };
  uniques: number;
}

export interface CfZoneSnapshot {
  configured: boolean;
  zoneId?: string;
  planName?: string;
  status?: string;
  analytics?: CfAnalyticsSummary;
  settings?: { rocketLoader?: string; brotli?: string; http3?: string; earlyHints?: string };
  error?: string;
}

function cfHeaders(): Record<string, string> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error('no_token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function cfGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: cfHeaders() });
  const body = (await res.json()) as { success: boolean; errors?: Array<{ message: string }>; result?: T };
  if (!body.success) throw new Error(body.errors?.[0]?.message || 'cf_error');
  return body.result as T;
}

export async function getZoneSnapshot(hours = 24): Promise<CfZoneSnapshot> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!process.env.CLOUDFLARE_API_TOKEN || !zoneId) {
    return { configured: false, error: 'CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID nicht gesetzt' };
  }

  try {
    const zone = await cfGet<{ id: string; plan: { name: string }; status: string }>(`/zones/${zoneId}`);

    // Dashboard analytics (since=-<minutes>, until=0)
    const since = -hours * 60;
    const analytics = await cfGet<{
      totals: {
        requests: { all: number; cached: number; uncached: number };
        bandwidth: { all: number; cached: number; uncached: number };
        threats: { all: number };
        uniques: { all: number };
      };
    }>(`/zones/${zoneId}/analytics/dashboard?since=${since}&until=0`);
    const t = analytics.totals;
    const reqAll = t.requests.all || 0;
    const bwAll = t.bandwidth.all || 0;

    const [rocketLoader, brotli, http3, earlyHints] = await Promise.all([
      cfGet<{ value: string }>(`/zones/${zoneId}/settings/rocket_loader`).then((r) => r.value).catch(() => 'unknown'),
      cfGet<{ value: string }>(`/zones/${zoneId}/settings/brotli`).then((r) => r.value).catch(() => 'unknown'),
      cfGet<{ value: string }>(`/zones/${zoneId}/settings/http3`).then((r) => r.value).catch(() => 'unknown'),
      cfGet<{ value: string }>(`/zones/${zoneId}/settings/early_hints`).then((r) => r.value).catch(() => 'unknown'),
    ]);

    return {
      configured: true,
      zoneId: zone.id,
      planName: zone.plan.name,
      status: zone.status,
      analytics: {
        periodHours: hours,
        requests: {
          all: reqAll,
          cached: t.requests.cached,
          uncached: t.requests.uncached,
          cachedPct: reqAll ? Math.round((t.requests.cached / reqAll) * 100) : 0,
        },
        bandwidth: {
          allBytes: bwAll,
          cachedBytes: t.bandwidth.cached,
          cachedPct: bwAll ? Math.round((t.bandwidth.cached / bwAll) * 100) : 0,
        },
        threats: { total: t.threats.all },
        uniques: t.uniques.all,
      },
      settings: { rocketLoader, brotli, http3, earlyHints },
    };
  } catch (err) {
    return { configured: true, zoneId, error: (err as Error).message };
  }
}
