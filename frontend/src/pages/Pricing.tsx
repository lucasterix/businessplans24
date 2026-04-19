import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPricing, type PricingResponse } from '../api/client';
import { Link } from 'react-router-dom';
import DocHead from '../components/DocHead';

export default function Pricing() {
  const { t } = useTranslation();
  const [pricing, setPricing] = useState<PricingResponse | null>(null);

  useEffect(() => {
    fetchPricing().then(setPricing).catch(() => {});
  }, []);

  return (
    <div className="pricing-layout">
      <DocHead
        title="Preise — Businessplan24"
        description="Fairer Preis für deinen Businessplan: 49 € einmalig oder 99 €/Jahr unbegrenzt. Länderspezifisch, keine Abo-Falle."
      />
      <h1>{t('pricing.title')}</h1>
      {pricing && (
        <p className="muted">{t('pricing.detected', { country: pricing.country })}</p>
      )}
      <div className="pricing-grid">
        <article className="price-card">
          <h2>{t('pricing.one_time')}</h2>
          <p className="price-amount">
            {pricing ? `${pricing.oneTime} ${pricing.currency}` : '—'}
          </p>
          <p className="muted">{t('pricing.one_time_desc')}</p>
          <Link to="/" className="btn btn-primary">{t('pricing.select_onetime')}</Link>
        </article>
        <article className="price-card price-card--highlight">
          <h2>{t('pricing.subscription')}</h2>
          <p className="price-amount">
            {pricing ? `${pricing.yearly} ${pricing.currency}` : '—'}
            <span className="price-period"> / Jahr</span>
          </p>
          <p className="muted">{t('pricing.sub_desc')}</p>
          <ul className="price-features">
            {(t('pricing.sub_features', { returnObjects: true }) as string[]).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <Link to="/login?next=/" className="btn btn-primary">{t('pricing.select_sub')}</Link>
        </article>
      </div>

      <section className="pricing-upsell">
        <div className="pricing-upsell-card">
          <div>
            <span className="badge">Premium</span>
            <h3>Persönliches Plan-Review</h3>
            <p className="muted">
              Ich lese deinen fertigen Plan, gebe konkrete Verbesserungen,
              prüfe die Zahlen und schicke dir innerhalb von 3 Werktagen einen
              detaillierten Kommentar. Für Gründer, die sicher gehen wollen.
            </p>
          </div>
          <div className="pricing-upsell-price">
            <span className="price-amount">+99 €</span>
            <Link to="/account" className="btn btn-ghost">Plan erstellen & dann buchen</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
