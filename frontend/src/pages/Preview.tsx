import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPricing, getPlan, startCheckout, type Plan, type PricingResponse } from '../api/client';
import { usePlanStore } from '../store/usePlanStore';

export default function Preview() {
  const { t, i18n } = useTranslation();
  const { planId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const store = usePlanStore();

  useEffect(() => {
    if (!planId) return;
    getPlan(planId).then(setPlan).catch((err) => {
      console.warn('[preview] falling back to local store', err);
      const fake: Plan = {
        id: planId,
        title: null,
        language: store.language,
        country: store.country,
        answers: store.answers as unknown as Record<string, unknown>,
        texts: store.texts,
        finance: store.finance,
        status: 'draft',
        paid: false,
      };
      setPlan(fake);
    });
    fetchPricing(store.country || undefined).then(setPricing).catch(() => {});
  }, [planId, store]);

  const unlock = async (type: 'one_time' | 'subscription') => {
    if (!planId) return;
    setLoading(true);
    try {
      const { sessionUrl } = await startCheckout({
        planId,
        type,
        country: store.country || pricing?.country,
      });
      window.location.href = sessionUrl;
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return <div className="loading-fallback" />;

  const sections: Array<{ key: string; title: string }> = [
    { key: 'executive_summary', title: t('sections.executive_summary.title') },
    { key: 'business_idea', title: t('sections.business_idea.title') },
    { key: 'customers', title: t('sections.customers.title') },
    { key: 'company', title: t('sections.company.title') },
    { key: 'finance', title: t('sections.finance.title') },
    { key: 'appendix', title: t('sections.appendix.title') },
  ];

  return (
    <div className="preview-layout">
      <aside className="preview-cta-rail">
        <h2>{t('preview.title')}</h2>
        <p className="muted">{t('preview.watermark_note')}</p>
        {pricing && (
          <div className="preview-cta-card">
            <button
              className="btn btn-primary btn-lg"
              disabled={loading}
              onClick={() => unlock('one_time')}
            >
              {t('preview.unlock_onetime', {
                price: pricing.oneTime,
                currency: pricing.currency,
              })}
            </button>
            <button
              className="btn btn-ghost"
              disabled={loading}
              onClick={() => unlock('subscription')}
            >
              {t('preview.unlock_subscription', {
                price: pricing.yearly,
                currency: pricing.currency,
              })}
            </button>
          </div>
        )}
        <a
          className="btn btn-ghost"
          href={`/api/export/${plan.id}/pdf`}
          target="_blank"
          rel="noreferrer"
        >
          {t('preview.download_pdf')}
        </a>
        <Link to={`/wizard/${plan.id}`} className="btn btn-ghost">
          {t('wizard.back')}
        </Link>
      </aside>

      <article className="preview-document" lang={i18n.language.slice(0, 2)}>
        {sections.map((s) => (
          <section key={s.key} className="preview-section">
            <h3>{s.title}</h3>
            {plan.texts[s.key] ? (
              plan.texts[s.key].split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="muted">—</p>
            )}
          </section>
        ))}
        <div className="preview-watermark" aria-hidden="true">PREVIEW</div>
      </article>
    </div>
  );
}
