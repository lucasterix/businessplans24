import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPricing, getPlan, startCheckout, type Plan, type PricingResponse } from '../api/client';
import { usePlanStore } from '../store/usePlanStore';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

export default function Preview() {
  const { t, i18n } = useTranslation();
  const { planId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const store = usePlanStore();
  const loc = useLocalizedPath();

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

  const flatAnswers: Record<string, unknown> = {};
  Object.values(plan.answers).forEach((a) => {
    if (a && typeof a === 'object') Object.assign(flatAnswers, a);
  });
  const companyName = (flatAnswers.company_name as string) || 'Dein Unternehmen';
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  const sections: Array<{ key: string; title: string }> = [
    { key: 'executive_summary', title: t('sections.executive_summary.title') },
    { key: 'business_idea', title: t('sections.business_idea.title') },
    { key: 'customers', title: t('sections.customers.title') },
    { key: 'company', title: t('sections.company.title') },
    { key: 'finance', title: t('sections.finance.title') },
    { key: 'appendix', title: t('sections.appendix.title') },
  ];

  const sectionsDone = sections.filter((s) => plan.texts[s.key]).length;

  return (
    <div className="preview-layout">
      <aside className="preview-cta-rail">
        <div className="preview-cta-status">
          <strong>Dein Plan</strong>
          <span>
            {sectionsDone} von {sections.length} Sektionen fertig
          </span>
          <div className="preview-cta-bar">
            <div style={{ width: `${(sectionsDone / sections.length) * 100}%` }} />
          </div>
        </div>

        {pricing && (
          <div className="preview-cta-card">
            <span className="preview-cta-eyebrow">Plan freischalten</span>
            <button
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              onClick={() => unlock('one_time')}
            >
              {t('preview.unlock_onetime', {
                price: pricing.oneTime,
                currency: pricing.currency,
              })}
            </button>
            <p className="preview-cta-note">Einmalige Zahlung · Keine Abo-Falle</p>
            <div className="preview-cta-divider"><span>oder</span></div>
            <button
              className="btn btn-ghost btn-block"
              disabled={loading}
              onClick={() => unlock('subscription')}
            >
              {t('preview.unlock_subscription', {
                price: pricing.yearly,
                currency: pricing.currency,
              })}
            </button>
            <p className="preview-cta-note muted">Unbegrenzte Pläne für 1 Jahr</p>
          </div>
        )}

        <div className="preview-cta-secondary">
          <a
            className="btn btn-ghost btn-block"
            href={`/api/export/${plan.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            📄 {t('preview.download_pdf')} (Vorschau)
          </a>
          <Link to={loc('')} className="btn btn-ghost btn-block">
            {t('wizard.back')} zum Wizard
          </Link>
        </div>
      </aside>

      <article className="preview-document" lang={i18n.language.slice(0, 2)}>
        <header className="preview-document-cover">
          <p className="preview-document-eyebrow">Businessplan</p>
          <h1 className="preview-document-title">{companyName}</h1>
          <p className="preview-document-date">Erstellt am {today}</p>
          <div className="preview-document-divider" />
          <p className="preview-document-toc-title">Inhalt</p>
          <ol className="preview-document-toc">
            {sections.map((s, i) => (
              <li key={s.key}>
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span>{s.title}</span>
                {plan.texts[s.key] && <span className="toc-done">✓</span>}
              </li>
            ))}
          </ol>
        </header>

        {sections.map((s, i) => (
          <section key={s.key} className="preview-section">
            <div className="preview-section-head">
              <span className="preview-section-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
            </div>
            {plan.texts[s.key] ? (
              plan.texts[s.key].split(/\n{2,}/).map((p, idx) => <p key={idx}>{p.trim()}</p>)
            ) : (
              <p className="muted">— Im Wizard generieren —</p>
            )}
          </section>
        ))}

        <footer className="preview-document-footer">
          <span>{companyName} · Businessplan · {today}</span>
          <span>Seite wird beim Export generiert</span>
        </footer>

        <div className="preview-watermark" aria-hidden="true">VORSCHAU</div>
      </article>
    </div>
  );
}
