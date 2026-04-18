import { useState } from 'react';
import { admin, type KeywordIdea } from '../api';

const COUNTRIES = [
  'DE', 'AT', 'CH', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'CZ', 'SK', 'HU',
  'RO', 'PT', 'SE', 'NO', 'DK', 'FI', 'GR', 'IE', 'GB',
];

function badgeFor(r: 'run' | 'borderline' | 'avoid') {
  if (r === 'run') return <span className="badge badge-success">Läuft</span>;
  if (r === 'borderline') return <span className="badge badge-warn">Grenzwertig</span>;
  return <span className="badge badge-danger">Meiden</span>;
}

export default function AdminKeywords() {
  const [seed, setSeed] = useState('businessplan, finanzplan, gründung');
  const [country, setCountry] = useState('DE');
  const [ideas, setIdeas] = useState<KeywordIdea[]>([]);
  const [priceEur, setPriceEur] = useState(0);
  const [mock, setMock] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const d = await admin.keywordIdeas({
        seedKeywords: seed.split(',').map((s) => s.trim()).filter(Boolean),
        country,
      });
      setIdeas(d.ideas);
      setPriceEur(d.priceEur);
      setMock(d.mock);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...ideas].sort(
    (a, b) => b.analysis.expectedProfitPerClick - a.analysis.expectedProfitPerClick
  );

  return (
    <div className="admin-page">
      <header>
        <h1>Keyword-Analyse</h1>
        <p className="muted">
          Für jedes Keyword: durchschnittliche CPC × angenommene Conversion-Rate (2 %) vs. Plan-Preis im jeweiligen Land.
        </p>
        {mock && <span className="badge badge-warn">Mock-Modus — keine Google-Ads-Credentials gesetzt</span>}
      </header>

      <section className="panel">
        <form
          onSubmit={(e) => { e.preventDefault(); run(); }}
          className="admin-form"
        >
          <label className="field">
            <span className="field-label">Seed-Keywords (kommagetrennt)</span>
            <input value={seed} onChange={(e) => setSeed(e.target.value)} />
          </label>
          <div className="admin-form-row">
            <label className="field">
              <span className="field-label">Land</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Analysiere…' : 'Keywords analysieren'}
            </button>
          </div>
        </form>
      </section>

      {sorted.length > 0 && (
        <section className="panel">
          <h2>
            Ergebnis für {country} · Plan-Preis {priceEur} €
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Suchen/Monat</th>
                <th>Wettbewerb</th>
                <th>Ø CPC</th>
                <th>Rev/Click (2 %)</th>
                <th>Profit/Click</th>
                <th>Empfehlung</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((k) => {
                const rev = k.analysis.conversionValueEur * k.analysis.assumedConversionRate;
                return (
                  <tr key={k.keyword}>
                    <td>{k.keyword}</td>
                    <td>{k.avgMonthlySearches.toLocaleString()}</td>
                    <td>{k.competition}</td>
                    <td>{k.analysis.avgCpcEur.toFixed(2)} €</td>
                    <td>{rev.toFixed(2)} €</td>
                    <td>
                      <span className={k.analysis.expectedProfitPerClick > 0 ? 'text-good' : 'text-bad'}>
                        {k.analysis.expectedProfitPerClick.toFixed(2)} €
                      </span>
                    </td>
                    <td>{badgeFor(k.analysis.recommendation)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
