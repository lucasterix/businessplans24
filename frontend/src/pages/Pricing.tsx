import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchPricing, createPlan, startCheckout, type PricingResponse } from '../api/client';
import DocHead from '../components/DocHead';
import { useLocalizedPath } from '../i18n/useLocalizedPath';
import { usePlanStore } from '../store/usePlanStore';
import { toast } from '../store/useToasts';

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const loc = useLocalizedPath();
  const navigate = useNavigate();
  const store = usePlanStore();

  useEffect(() => {
    fetchPricing().then(setPricing).catch(() => {});
  }, []);

  const buyOneTime = async (promoCode?: string) => {
    const key = promoCode ? 'one_time_promo' : 'one_time';
    setLoadingKey(key);
    try {
      // Ensure we have a plan id so the payment maps to a plan. Create one if
      // the current session doesn't have one yet.
      let planId = store.planId;
      if (!planId) {
        planId = await createPlan({ language: i18n.language.slice(0, 2), country: store.country || undefined });
        store.setPlanId(planId);
      }
      const { sessionUrl } = await startCheckout({
        planId,
        type: 'one_time',
        country: store.country || pricing?.country,
        promoCode,
      });
      window.location.href = sessionUrl;
    } catch {
      toast.error('Bezahlung konnte nicht gestartet werden.');
      setLoadingKey(null);
    }
  };

  const buySubscription = async () => {
    setLoadingKey('subscription');
    try {
      let planId = store.planId;
      if (!planId) {
        planId = await createPlan({ language: i18n.language.slice(0, 2), country: store.country || undefined });
        store.setPlanId(planId);
      }
      const { sessionUrl } = await startCheckout({
        planId,
        type: 'subscription',
        country: store.country || pricing?.country,
      });
      window.location.href = sessionUrl;
    } catch {
      toast.error('Bezahlung konnte nicht gestartet werden.');
      setLoadingKey(null);
    }
  };

  const oneTimePrice = pricing ? pricing.oneTime : 49;
  const oneTimeDiscounted = Math.round(oneTimePrice * 0.9 * 100) / 100;
  const cur = pricing?.currency || 'EUR';

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

      {/* 10% Rabatt Callout */}
      <div className="pricing-promo-banner">
        <div className="pricing-promo-text">
          <span className="pricing-promo-tag">🎁 -10%</span>
          <div>
            <strong>Heute {oneTimeDiscounted.toFixed(2)} {cur} statt {oneTimePrice} {cur}</strong>
            <span className="muted"> · Code FIRST10 wird automatisch eingelöst</span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loadingKey !== null}
          onClick={() => buyOneTime('FIRST10')}
        >
          {loadingKey === 'one_time_promo' ? 'Einen Moment…' : 'Jetzt mit 10% Rabatt sichern'}
        </button>
      </div>

      <div className="pricing-grid">
        <article className="price-card">
          <h2>{t('pricing.one_time')}</h2>
          <p className="price-amount">
            {pricing ? `${pricing.oneTime} ${pricing.currency}` : '—'}
          </p>
          <p className="muted">{t('pricing.one_time_desc')}</p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loadingKey !== null}
            onClick={() => buyOneTime()}
          >
            {loadingKey === 'one_time' ? 'Einen Moment…' : t('pricing.select_onetime')}
          </button>
          <p className="muted tiny" style={{ marginTop: '0.5rem' }}>
            Nach Zahlung geht's direkt weiter zu deinem Businessplan — kein zweiter Bezahlvorgang.
          </p>
        </article>
        <article className="price-card price-card--highlight">
          <span className="price-badge">Beliebt</span>
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
          <button
            type="button"
            className="btn btn-primary"
            disabled={loadingKey !== null}
            onClick={buySubscription}
          >
            {loadingKey === 'subscription' ? 'Einen Moment…' : t('pricing.select_sub')}
          </button>
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
            <button type="button" className="btn btn-ghost" onClick={() => navigate(loc(''))}>
              Erst Plan erstellen →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
