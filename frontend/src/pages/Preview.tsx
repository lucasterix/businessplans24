import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPricing, getPlan, startCheckout, updatePlan, api, type Plan, type PricingResponse } from '../api/client';
import { usePlanStore } from '../store/usePlanStore';
import { usePreviewTheme, ACCENT_COLORS, FONT_FAMILIES, mergeSectionOrder } from '../store/usePreviewTheme';
import { useLocalizedPath } from '../i18n/useLocalizedPath';
import PreviewCustomizer from '../components/PreviewCustomizer';
import A4Document, { type A4Section } from '../components/A4Document';

export default function Preview() {
  const { t } = useTranslation();
  const { planId } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const store = usePlanStore();
  const loc = useLocalizedPath();
  const theme = usePreviewTheme();
  const loadedPlanRef = useRef<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    getPlan(planId)
      .then((p) => {
        setPlan(p);
        const settings = (p as Plan & { settings?: Record<string, unknown> }).settings;
        if (settings && loadedPlanRef.current !== planId) {
          theme.loadFromPlan(settings);
          loadedPlanRef.current = planId;
        }
      })
      .catch((err) => {
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
  }, [planId, store, theme]);

  // Persist customizer settings to the plan so the PDF export sees them.
  useEffect(() => {
    if (!planId) return;
    const t = setTimeout(() => {
      updatePlan(planId, { settings: theme.exportSettings() as Record<string, unknown> }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [
    planId,
    theme,
    theme.accent,
    theme.coverStyle,
    theme.coverDecor,
    theme.logoDataUrl,
    theme.footerText,
    theme.showCoverDate,
    theme.showToc,
    theme.showHeader,
    theme.pageNumFormat,
    theme.blankBetween,
    theme.appendixTwoCol,
    theme.sectionStripe,
    theme.sectionOrder,
    theme.hiddenSections,
  ]);

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
  const companyName = (flatAnswers.company_name as string)?.trim() || 'Dein Unternehmen';
  const subtitle = (flatAnswers.one_liner as string)?.trim();
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  const sectionsList: Array<{ key: string; title: string }> = [
    { key: 'executive_summary', title: t('sections.executive_summary.title') },
    { key: 'business_idea', title: t('sections.business_idea.title') },
    { key: 'customers', title: t('sections.customers.title') },
    { key: 'company', title: t('sections.company.title') },
    { key: 'finance', title: t('sections.finance.title') },
    { key: 'appendix', title: t('sections.appendix.title') },
  ];

  const orderedIds = mergeSectionOrder(theme.sectionOrder, sectionsList.map((s) => s.key));
  const orderedSections = orderedIds
    .map((id) => sectionsList.find((s) => s.key === id))
    .filter((s): s is (typeof sectionsList)[number] => !!s);
  const visibleSections = orderedSections.filter((s) => !theme.hiddenSections.includes(s.key));
  const sectionsDone = visibleSections.filter((s) => plan.texts[s.key]).length;

  const accentCol = ACCENT_COLORS[theme.accent];
  const fontStack = FONT_FAMILIES[theme.font].stack;
  const docStyle: React.CSSProperties = {
    '--doc-accent': accentCol.hex,
    '--doc-accent-soft': accentCol.soft,
    '--doc-font': fontStack,
  } as React.CSSProperties;

  const sections: A4Section[] = visibleSections.map((s) => ({
    key: s.key,
    title: s.title,
    body: plan.texts[s.key],
    placeholder: 'Dieser Abschnitt wurde im Wizard noch nicht generiert.',
  }));

  return (
    <div className="preview-layout">
      <aside className="preview-cta-rail">
        <div className="preview-cta-status">
          <strong>Dein Plan</strong>
          <span>{sectionsDone} von {sectionsList.length} Sektionen fertig</span>
          <div className="preview-cta-bar">
            <div style={{ width: `${(sectionsDone / sectionsList.length) * 100}%` }} />
          </div>
        </div>

        {pricing && !plan.paid && (
          <div className="preview-cta-card">
            <span className="preview-cta-eyebrow">Plan freischalten</span>
            <button
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              onClick={() => unlock('one_time')}
            >
              {t('preview.unlock_onetime', { price: pricing.oneTime, currency: pricing.currency })}
            </button>
            <p className="preview-cta-note">Einmalige Zahlung · Keine Abo-Falle</p>
            <div className="preview-cta-divider"><span>oder</span></div>
            <button
              className="btn btn-ghost btn-block"
              disabled={loading}
              onClick={() => unlock('subscription')}
            >
              {t('preview.unlock_subscription', { price: pricing.yearly, currency: pricing.currency })}
            </button>
            <p className="preview-cta-note muted">Unbegrenzte Pläne für 1 Jahr</p>
          </div>
        )}

        {plan.paid && (
          <div className="preview-cta-card preview-cta-card--paid">
            <span className="preview-cta-eyebrow">✓ Plan freigeschaltet</span>
            <a
              href={`/api/export/${plan.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-lg btn-block"
            >
              📄 {t('preview.download_pdf')}
            </a>
            <p className="preview-cta-note">Saubere Version ohne Wasserzeichen</p>
            <div className="preview-cta-divider"><span>oder</span></div>
            <Link to={loc('founder')} className="btn btn-ghost btn-block">
              Plan-Review buchen (+99 €)
            </Link>
            <p className="preview-cta-note muted">Persönliche Durchsicht in 3 Werktagen</p>
          </div>
        )}

        <div className="preview-cta-secondary">
          <a className="btn btn-ghost btn-block" href={`/api/export/${plan.id}/pdf`} target="_blank" rel="noreferrer">
            📄 PDF-Vorschau
          </a>
          <a className="btn btn-ghost btn-block" href={`/api/export/${plan.id}/docx`} target="_blank" rel="noreferrer">
            📝 Word (.docx) herunterladen
          </a>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            disabled={sharing}
            onClick={async () => {
              setSharing(true);
              try {
                const { data } = await api.post<{ token: string }>(`/share/plan/${plan.id}`);
                const url = `${window.location.origin}/share/${data.token}`;
                setShareToken(data.token);
                try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
              } catch { /* ignore */ }
              finally { setSharing(false); }
            }}
          >
            🔗 {shareToken ? 'Link kopiert — erneut kopieren' : 'Nur-Lese-Link für Bank/Berater'}
          </button>
          {shareToken && (
            <div className="preview-share-url">
              <code>{`${window.location.origin}/share/${shareToken}`}</code>
            </div>
          )}
          <Link to={loc('')} className="btn btn-ghost btn-block">
            {t('wizard.back')} zum Wizard
          </Link>
        </div>

        <PreviewCustomizer sections={sectionsList} />
      </aside>

      <div className="preview-doc-wrap" style={docStyle}>
        <A4Document
          title={companyName}
          subtitle={subtitle}
          date={today}
          sections={sections}
          watermark={!plan.paid}
          logoDataUrl={theme.logoDataUrl}
          coverStyle={theme.coverStyle}
          coverDecor={theme.coverDecor}
          footerText={theme.footerText}
          showCoverDate={theme.showCoverDate}
          showToc={theme.showToc}
          showHeader={theme.showHeader}
          pageNumFormat={theme.pageNumFormat}
          blankBetween={theme.blankBetween}
          appendixTwoCol={theme.appendixTwoCol}
          sectionStripe={theme.sectionStripe}
        />
      </div>
    </div>
  );
}
