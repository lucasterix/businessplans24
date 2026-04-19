import { useEffect, useState } from 'react';
import { admin, type AdminStats, type EconomicsResponse, type CloudflareSnapshot } from '../api';

function fmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} KB`;
  return `${n} B`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [econ, setEcon] = useState<EconomicsResponse | null>(null);
  const [cf, setCf] = useState<CloudflareSnapshot | null>(null);
  useEffect(() => {
    admin.stats().then(setStats);
    admin.economics().then(setEcon).catch(() => {});
    admin.cloudflare(24).then(setCf).catch(() => setCf({ configured: false, error: 'fetch_failed' }));
  }, []);
  if (!stats) return <div className="admin-loading">Lade…</div>;
  return (
    <div className="admin-page">
      <header>
        <h1>Dashboard</h1>
        <p className="muted">Live-Überblick über Nutzer, Umsatz und Aktivität.</p>
      </header>
      <div className="stat-grid">
        <StatCard label="Nutzer gesamt" value={stats.totalUsers.toLocaleString()} />
        <StatCard label="Aktive Abos" value={stats.activeSubs.toLocaleString()} />
        <StatCard label="Pläne gesamt" value={stats.totalPlans.toLocaleString()} />
        <StatCard label="Bezahlte Pläne" value={stats.paidPlans.toLocaleString()} />
      </div>

      <section className="panel">
        <h2>Umsatz (30 Tage)</h2>
        {stats.revenue30d.length === 0 ? (
          <p className="muted">Keine Zahlungen in den letzten 30 Tagen.</p>
        ) : (
          <ul className="inline-list">
            {stats.revenue30d.map((r) => (
              <li key={r.currency}>
                <span className="big">{(r.total / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="muted"> {r.currency}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Per-country economics: revenue vs. ads budget commitment */}
      <section className="panel">
        <h2>Wirtschaftlichkeit je Land (30 Tage)</h2>
        {!econ || econ.countries.length === 0 ? (
          <p className="muted">Noch keine Daten. Sobald Zahlungen oder Ads-Kampagnen laufen, erscheint hier eine Übersicht.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Land</th>
                <th>Preis (Einzelplan)</th>
                <th>Bestellungen</th>
                <th>Umsatz 30T</th>
                <th>Ads-Tagesbudget</th>
                <th>Monatsbudget hochgerechnet</th>
                <th>Break-Even*</th>
              </tr>
            </thead>
            <tbody>
              {econ.countries.map((c) => {
                const revenueEur = c.revenueByCurrency['EUR'] || 0; // naïve display: EUR-only sum. Other currencies below.
                const revenueDisplay = Object.entries(c.revenueByCurrency)
                  .map(([cur, v]) => `${v.toFixed(2)} ${cur}`)
                  .join(' · ') || '—';
                const monthBudget = c.adsDailyBudgetEur * 30;
                const breakEvenOrders = c.price.oneTime > 0 ? monthBudget / c.price.oneTime : 0;
                const isUnderwater = monthBudget > revenueEur && revenueEur > 0;
                return (
                  <tr key={c.country} className={isUnderwater ? 'row-warning' : ''}>
                    <td><strong>{c.country}</strong></td>
                    <td>{c.price.oneTime} {c.price.currency}</td>
                    <td>{c.orders}</td>
                    <td>{revenueDisplay}</td>
                    <td>
                      {c.adsDailyBudgetEur > 0
                        ? `${c.adsDailyBudgetEur.toFixed(2)} € · ${c.adsCampaigns} Kamp.`
                        : '—'}
                    </td>
                    <td>{monthBudget > 0 ? `${monthBudget.toFixed(0)} €` : '—'}</td>
                    <td>{breakEvenOrders > 0 ? `≥ ${breakEvenOrders.toFixed(1)} Pläne/Monat` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="muted tiny" style={{ marginTop: '0.5rem' }}>
          * Break-Even = wie viele Einzelplan-Verkäufe pro Monat nötig wären, um das aktuelle Ads-Tagesbudget zu decken (ohne Marge/Abo).
        </p>
      </section>

      {/* Cloudflare edge metrics */}
      <section className="panel">
        <h2>Cloudflare (24 h)</h2>
        {!cf ? (
          <p className="muted">Lade…</p>
        ) : !cf.configured ? (
          <p className="muted">
            Nicht konfiguriert. Setze <code>CLOUDFLARE_API_TOKEN</code> und <code>CLOUDFLARE_ZONE_ID</code> in der Backend-Umgebung, um Edge-Metriken zu sehen.
          </p>
        ) : cf.error ? (
          <p className="muted">Fehler: {cf.error}</p>
        ) : cf.analytics ? (
          <>
            <div className="stat-grid">
              <StatCard label="Requests" value={cf.analytics.requests.all.toLocaleString()} />
              <StatCard label="Cache-Hit-Rate" value={`${cf.analytics.requests.cachedPct} %`} />
              <StatCard label="Bandbreite" value={fmtBytes(cf.analytics.bandwidth.allBytes)} />
              <StatCard label="Bedrohungen blockiert" value={cf.analytics.threats.total.toLocaleString()} />
            </div>
            {cf.settings && (
              <p className="muted tiny" style={{ marginTop: '0.75rem' }}>
                Einstellungen: Rocket Loader <strong>{cf.settings.rocketLoader}</strong> ·
                Brotli <strong>{cf.settings.brotli}</strong> ·
                HTTP/3 <strong>{cf.settings.http3}</strong> ·
                Early Hints <strong>{cf.settings.earlyHints}</strong>
              </p>
            )}
          </>
        ) : null}
      </section>

      <section className="panel">
        <h2>Nutzer nach Land</h2>
        {stats.usersByCountry.length === 0 ? (
          <p className="muted">Noch keine Länder-Daten.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Land</th><th>Nutzer</th></tr></thead>
            <tbody>
              {stats.usersByCountry.map((u) => (
                <tr key={u.country}><td>{u.country}</td><td>{u.count}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
    </div>
  );
}
