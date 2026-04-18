import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../wizard/schema';
import { StepView } from '../wizard/StepView';
import LivePreview from '../components/LivePreview';
import { usePlanStore } from '../store/usePlanStore';
import { createPlan } from '../api/client';

const FinancePlanner = lazy(() => import('../wizard/FinancePlanner'));

export default function Home() {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const navigate = useNavigate();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
        <h1>{t('landing.hero_title')}</h1>
        <p>{t('landing.hero_sub')}</p>
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
        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/pricing" className="btn btn-ghost">{t('landing.cta_pricing')}</Link>
        </p>
      </section>

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
    </>
  );
}
