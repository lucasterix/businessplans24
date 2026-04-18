import { useEffect, useState } from 'react';
import { admin, type AdminStats } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => { admin.stats().then(setStats); }, []);
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
