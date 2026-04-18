import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PriceAnchor() {
  const { t } = useTranslation();
  const rows = [
    { label: 'Unternehmensberatung', price: '1.200 – 2.500 €', time: '3–5 Wochen', color: 'danger' },
    { label: 'MBA-Businessplan-Kurs', price: '400 – 800 €', time: '2–4 Wochen', color: 'muted' },
    { label: 'Excel-Vorlage + Selbststudium', price: '0 – 30 €', time: 'Wochenende bis Monate', color: 'muted' },
    { label: 'Businessplan24', price: '49 €', time: '30 Minuten', color: 'good', highlight: true },
  ];
  return (
    <section className="anchor-section">
      <h2>Was kostet ein Businessplan sonst?</h2>
      <p className="muted anchor-sub">
        Damit du einschätzen kannst, was 49 € wirklich bedeuten.
      </p>
      <div className="anchor-table">
        {rows.map((r) => (
          <div key={r.label} className={`anchor-row ${r.highlight ? 'is-highlight' : ''}`}>
            <div className="anchor-label">{r.label}</div>
            <div className={`anchor-price anchor-price-${r.color}`}>{r.price}</div>
            <div className="anchor-time">{r.time}</div>
          </div>
        ))}
      </div>
      <p className="anchor-cta">
        <Link to="/pricing" className="btn btn-ghost">
          {t('landing.cta_pricing')}
        </Link>
      </p>
    </section>
  );
}
