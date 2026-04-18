import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../wizard/schema';
import { StepView } from '../wizard/StepView';
import LivePreview from '../components/LivePreview';
import TrustRow from '../components/TrustRow';
import PriceAnchor from '../components/PriceAnchor';
import Testimonials from '../components/Testimonials';
import FaqHome from '../components/FaqHome';
import PlanCounter from '../components/PlanCounter';
import ExitIntent from '../components/ExitIntent';
import WizardToast from '../components/WizardToast';
import { usePlanStore } from '../store/usePlanStore';
import { createPlan } from '../api/client';

const FinancePlanner = lazy(() => import('../wizard/FinancePlanner'));

export default function Home() {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const navigate = useNavigate();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    if (!store.planId) {
      createPlan({ language: i18n.language.slice(0, 2) })
        .then((id) => store.setPlanId(id))
        .catch((err) => console.warn('[home] createPlan failed, continuing local', err));
    }
  }, [store, i18n.language]);

  const section = SECTIONS[store.currentSectionIndex];
  const step = section?.steps[store.currentStepIndex];

  const totalSteps = SECTIONS.reduce((acc, s) => acc + s.steps.length, 0);
  const currentFlatIndex =
    SECTIONS.slice(0, store.currentSectionIndex).reduce((a, s) => a + s.steps.length, 0) +
    store.currentStepIndex +
    1;

  const isLastStepOfSection = section && store.currentStepIndex === section.steps.length - 1;
  const isLastSection = store.currentSectionIndex === SECTIONS.length - 1;

  const onNext = async () => {
    await store.persistToServer();
    if (isLastSection && isLastStepOfSection) {
      navigate(`/preview/${store.planId}`);
      return;
    }
    if (isLastStepOfSection) {
      const next = SECTIONS[store.currentSectionIndex + 1];
      const pct = Math.round(((currentFlatIndex) / totalSteps) * 100);
      setToast({ show: true, message: `Super! ${pct}% geschafft. Weiter mit „${next ? 'nächste Sektion' : 'Vorschau'}".` });
      store.setPosition(store.currentSectionIndex + 1, 0);
    } else {
      store.setPosition(store.currentSectionIndex, store.currentStepIndex + 1);
    }
  };

  const onBack = () => {
    if (store.currentStepIndex === 0 && store.currentSectionIndex === 0) return;
    if (store.currentStepIndex === 0) {
      const prev = SECTIONS[store.currentSectionIndex - 1];
      store.setPosition(store.currentSectionIndex - 1, prev.steps.length - 1);
    } else {
      store.setPosition(store.currentSectionIndex, store.currentStepIndex - 1);
    }
  };

  if (!section || !step) return null;

  const isFinancePlanStep = section.id === 'finance' && step.id === 'plan';

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-badge">✨ Claude Sonnet 4.6 · 30 Minuten · keine Abo-Falle</div>
        <h1>{t('landing.hero_title')}</h1>
        <p>{t('landing.hero_sub')}</p>
        <PlanCounter />
        <TrustRow />
      </section>

      <div className="home-shell">
        <div className="home-progress-wrap">
          <div className="wizard-progress">
            <div className="wizard-progress-bar">
              <div
                className="wizard-progress-fill"
                style={{ width: `${(currentFlatIndex / totalSteps) * 100}%` }}
              />
            </div>
            <span className="wizard-progress-label">
              {t('wizard.progress', { step: currentFlatIndex, total: totalSteps })}
            </span>
          </div>
        </div>

        <div className="home-split">
          <div className="home-wizard-pane">
            {isFinancePlanStep ? (
              <Suspense fallback={<div className="loading-fallback" />}>
                <FinancePlanner onNext={onNext} onBack={onBack} />
              </Suspense>
            ) : (
              <div className="wizard-step">
                <StepView
                  section={section}
                  step={step}
                  isLastStepOfSection={!!isLastStepOfSection}
                  isLastSection={isLastSection}
                  onNext={onNext}
                  onBack={onBack}
                />
              </div>
            )}
          </div>

          <aside className="home-preview-pane">
            <LivePreview activeSectionId={section.id} />
          </aside>
        </div>
      </div>

      <section className="features">
        <h2>{t('landing.features_title')}</h2>
        <div className="feature-grid">
          {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
            <article key={k} className="feature-card">
              <h3>{t(`landing.${k}_title`)}</h3>
              <p>{t(`landing.${k}_desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <h2>{t('landing.how_title')}</h2>
        <ol className="how-list">
          <li>{t('landing.how1')}</li>
          <li>{t('landing.how2')}</li>
          <li>{t('landing.how3')}</li>
          <li>{t('landing.how4')}</li>
        </ol>
      </section>

      <div className="home-shell">
        <PriceAnchor />
        <Testimonials />
        <FaqHome />

        <section className="home-final-cta">
          <h2>Bereit, deinen Plan in 30 Minuten zu haben?</h2>
          <p className="muted">
            Kein Risiko: Du beginnst jetzt. Bezahlen erst, wenn dein Plan fertig ist und du ihn ohne Wasserzeichen willst.
          </p>
          <div className="home-final-ctas">
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-primary btn-lg">
              Jetzt starten
            </a>
            <Link to="/pricing" className="btn btn-ghost btn-lg">{t('landing.cta_pricing')}</Link>
          </div>
        </section>
      </div>

      {/* Mobile preview sheet */}
      <button
        className="preview-fab"
        type="button"
        onClick={() => setMobilePreviewOpen(true)}
        aria-label="Vorschau"
      >
        📄 Vorschau
      </button>
      {mobilePreviewOpen && (
        <div className="mobile-preview-hidden" onClick={() => setMobilePreviewOpen(false)}>
          <div className="home-preview-pane" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="preview-close"
              onClick={() => setMobilePreviewOpen(false)}
              aria-label="Schließen"
            >
              ×
            </button>
            <LivePreview activeSectionId={section.id} />
          </div>
        </div>
      )}

      <WizardToast
        show={toast.show}
        message={toast.message}
        onDone={() => setToast({ show: false, message: '' })}
      />
      <ExitIntent />
    </>
  );
}
