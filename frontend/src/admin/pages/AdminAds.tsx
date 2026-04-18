import { useEffect, useState } from 'react';
import { admin, type CampaignLocal, type CampaignRemote } from '../api';

const EU_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'DE', name: 'Deutschland' }, { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' }, { code: 'FR', name: 'Frankreich' },
  { code: 'IT', name: 'Italien' }, { code: 'ES', name: 'Spanien' },
  { code: 'NL', name: 'Niederlande' }, { code: 'BE', name: 'Belgien' },
  { code: 'PL', name: 'Polen' }, { code: 'CZ', name: 'Tschechien' },
  { code: 'SK', name: 'Slowakei' }, { code: 'HU', name: 'Ungarn' },
  { code: 'RO', name: 'Rumänien' }, { code: 'PT', name: 'Portugal' },
  { code: 'SE', name: 'Schweden' }, { code: 'NO', name: 'Norwegen' },
  { code: 'DK', name: 'Dänemark' }, { code: 'FI', name: 'Finnland' },
  { code: 'GR', name: 'Griechenland' }, { code: 'IE', name: 'Irland' },
];

export default function AdminAds() {
  const [remote, setRemote] = useState<CampaignRemote[]>([]);
  const [local, setLocal] = useState<CampaignLocal[]>([]);
  const [mock, setMock] = useState(false);
  const [form, setForm] = useState({
    name: '', country: 'DE', region: '', maxCpcEur: 1.5, dailyBudgetEur: 20, status: 'paused' as 'enabled' | 'paused',
  });
  const [saving, setSaving] = useState(false);

  const load = () => admin.adsCampaigns().then((d) => {
    setRemote(d.remote);
    setLocal(d.local);
    setMock(d.mock);
  });

  useEffect(() => { load(); }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await admin.createCampaign({
        name: form.name,
        country: form.country,
        region: form.region || null,
        maxCpcEur: Number(form.maxCpcEur),
        dailyBudgetEur: Number(form.dailyBudgetEur),
        status: form.status,
      });
      setForm({ ...form, name: '' });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: CampaignLocal) => {
    await admin.setCampaignStatus(c.id, c.status !== 'enabled');
    await load();
  };

  return (
    <div className="admin-page">
      <header>
        <h1>Google Ads · Kampagnen</h1>
        {mock && <span className="badge badge-warn">Mock-Modus — keine Google-Ads-Credentials gesetzt</span>}
      </header>

      <section className="panel">
        <h2>Performance (letzte 30 Tage)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Kampagne</th>
              <th>Status</th>
              <th>Impressions</th>
              <th>Klicks</th>
              <th>Conversions</th>
              <th>Kosten</th>
              <th>CPC</th>
            </tr>
          </thead>
          <tbody>
            {remote.map((c) => (
              <tr key={c.googleCampaignId}>
                <td>{c.name}</td>
                <td><span className={`badge ${c.status === 'ENABLED' ? 'badge-success' : ''}`}>{c.status}</span></td>
                <td>{c.impressions.toLocaleString()}</td>
                <td>{c.clicks.toLocaleString()}</td>
                <td>{c.conversions.toFixed(1)}</td>
                <td>{(c.costMicros / 1_000_000).toFixed(2)} €</td>
                <td>
                  {c.clicks > 0
                    ? (c.costMicros / 1_000_000 / c.clicks).toFixed(2) + ' €'
                    : '–'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Meine Kampagnen-Einstellungen</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Land</th>
              <th>Region</th>
              <th>Max. CPC</th>
              <th>Tagesbudget</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.country}</td>
                <td>{c.region || '–'}</td>
                <td>{(c.max_cpc_micros / 1_000_000).toFixed(2)} €</td>
                <td>{(c.daily_budget_micros / 1_000_000).toFixed(2)} €</td>
                <td><span className={`badge ${c.status === 'enabled' ? 'badge-success' : ''}`}>{c.status}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(c)}>
                    {c.status === 'enabled' ? 'Pausieren' : 'Starten'}
                  </button>
                </td>
              </tr>
            ))}
            {local.length === 0 && (
              <tr><td colSpan={7} className="muted">Noch keine Kampagnen angelegt.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Neue Kampagne</h2>
        <form onSubmit={onCreate} className="admin-form">
          <label className="field">
            <span className="field-label">Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <div className="admin-form-row">
            <label className="field">
              <span className="field-label">Land</span>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                {EU_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Region (optional)</span>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="z.B. Bayern" />
            </label>
          </div>
          <div className="admin-form-row">
            <label className="field">
              <span className="field-label">Max. CPC (€)</span>
              <input type="number" step="0.01" value={form.maxCpcEur} onChange={(e) => setForm({ ...form, maxCpcEur: Number(e.target.value) })} />
            </label>
            <label className="field">
              <span className="field-label">Tagesbudget (€)</span>
              <input type="number" step="0.01" value={form.dailyBudgetEur} onChange={(e) => setForm({ ...form, dailyBudgetEur: Number(e.target.value) })} />
            </label>
            <label className="field">
              <span className="field-label">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'enabled' | 'paused' })}>
                <option value="paused">Pausiert</option>
                <option value="enabled">Aktiv</option>
              </select>
            </label>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Kampagne anlegen'}
          </button>
        </form>
      </section>
    </div>
  );
}
