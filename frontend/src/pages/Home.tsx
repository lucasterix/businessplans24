import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../i18n/useLocalizedPath';
import { SECTIONS } from '../wizard/schema';
import { StepView } from '../wizard/StepView';
import LivePreview from '../components/LivePreview';
import TrustRow from '../components/TrustRow';
import PriceAnchor from '../components/PriceAnchor';
import Testimonials from '../components/Testimonials';
import FaqHome from '../components/FaqHome';
import ExpertsRow from '../components/ExpertsRow';
import PlanCounter from '../components/PlanCounter';
import ExitIntent from '../components/ExitIntent';
import WizardToast from '../components/WizardToast';
import DocHead from '../components/DocHead';
import DraftRecovery from '../components/DraftRecovery';
import AutosaveIndicator, { type SaveState } from '../components/AutosaveIndicator';
import WizardStepList from '../components/WizardStepList';
import ScrollToTop from '../components/ScrollToTop';
import { usePlanStore } from '../store/usePlanStore';
import { createPlan } from '../api/client';

const FinancePlanner = lazy(() => import('../wizard/FinancePlanner'));

export default function Home() {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const navigate = useNavigate();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const loc = useLocalizedPath();
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<number | undefined>();
  const [showDraft, setShowDraft] = useState(true);

  useEffect(() => {
    if (!store.planId) {
      createPlan({ language: i18n.language.slice(0, 2) })
        .then((id) => store.setPlanId(id))
        .catch((err) => console.warn('[home] createPlan failed, continuing local', err));
    }
  }, [store, i18n.language]);

  // Debounced autosave: persist 1.5s after the last change
  useEffect(() => {
    if (!store.planId) return;
    const t = setTimeout(() => {
      setSaveState('saving');
      store
        .persistToServer()
        .then(() => { setSaveState('saved'); setSavedAt(Date.now()); })
        .catch(() => setSaveState('error'));
    }, 1500);
    return () => clearTimeout(t);
  }, [store.answers, store.texts, store.finance, store.planId, store]);

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
    setSaveState('saving');
    try {
      await store.persistToServer();
      setSaveState('saved');
      setSavedAt(Date.now());
    } catch {
      setSaveState('error');
    }
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
      <DocHead
        title={t('landing.hero_title') + ' | Businessplan24'}
        description={t('landing.hero_sub')}
      />
      <section className="home-hero">
        <div className="home-hero-orbs" aria-hidden />
        <div className="home-hero-content">
          <div className="home-hero-badge">⚖️ Entwickelt mit Steuerberatern, Wirtschaftsprüfern &amp; Ex-McKinsey/BCG-Beratern</div>
          <h1>{t('landing.hero_title')}</h1>
          <p>{t('landing.hero_sub')}</p>
          <PlanCounter />
          <TrustRow />
        </div>
      </section>

      <div className="home-shell">
        {showDraft && (
          <DraftRecovery
            onContinue={() => setShowDraft(false)}
            onReset={() => { store.reset(); setShowDraft(false); }}
          />
        )}
        <div className="home-progress-wrap">
          <div className="wizard-progress">
            <div className="wizard-progress-bar">
              <div
                className="wizard-progress-fill"
                style={{ width: `${(currentFlatIndex / totalSteps) * 100}%` }}
              />
            </div>
            <div className="wizard-progress-meta">
              <span className="wizard-progress-label">
                {t('wizard.progress', { step: currentFlatIndex, total: totalSteps })}
              </span>
              <AutosaveIndicator state={saveState} savedAt={savedAt} />
            </div>
          </div>
        </div>

        <div className="home-split">
          <WizardStepList currentSectionIndex={store.currentSectionIndex} />
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
          {[
            { k: 'f1', icon: '🧭' },
            { k: 'f2', icon: '🤖' },
            { k: 'f3', icon: '📊' },
            { k: 'f4', icon: '📄' },
          ].map((f) => (
            <article key={f.k} className="feature-card">
              <span className="feature-icon" aria-hidden>{f.icon}</span>
              <h3>{t(`landing.${f.k}_title`)}</h3>
              <p>{t(`landing.${f.k}_desc`)}</p>
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

      <section className="home-usecase-links">
        <h2>Businessplan für deinen Anwendungsfall</h2>
        <p className="muted">Spezifische Vorlagen und Anleitungen für die häufigsten Gründungswege.</p>
        <ul className="usecase-grid">
          <li><Link to="/de/businessplan-kfw"><strong>Businessplan für KfW-Startgeld</strong><span>Bank-tauglicher Plan für das KfW-Darlehen bis 125.000 €</span></Link></li>
          <li><Link to="/de/businessplan-arbeitsagentur"><strong>Businessplan Gründungszuschuss</strong><span>Für die Arbeitsagentur (§ 93 SGB III) inkl. Tragfähigkeitsbescheinigung</span></Link></li>
          <li><Link to="/de/businessplan-gastronomie"><strong>Businessplan Gastronomie</strong><span>Café, Restaurant, Bar — mit Wareneinsatz-Kalkulation</span></Link></li>
          <li><Link to="/de/businessplan-ecommerce"><strong>Businessplan E-Commerce</strong><span>Online-Shops, D2C-Marken, Amazon FBA — mit CAC und LTV</span></Link></li>
          <li><Link to="/de/businessplan-beratung"><strong>Businessplan Beratung</strong><span>Stundensatz, Akquise, Skalierung für Coach und Agentur</span></Link></li>
          <li><Link to={loc('example')}><strong>Beispielplan ansehen</strong><span>Kompletter Businessplan eines Göttinger Cafés zum Durchlesen</span></Link></li>
        </ul>
      </section>

      <div className="home-shell">
        <ExpertsRow />
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
            <Link to={loc('pricing')} className="btn btn-ghost btn-lg">{t('landing.cta_pricing')}</Link>
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
      <ScrollToTop />
    </>
  );
}
