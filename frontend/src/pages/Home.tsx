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
import TemplatesGallery from '../components/TemplatesGallery';
import NewsletterForm from '../components/NewsletterForm';
import PlanCounter from '../components/PlanCounter';
import LiveActivity from '../components/LiveActivity';
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

  // After any wizard navigation, bring the user back to the top of the
  // wizard pane so the new questions (or generated section) are in view.
  // Using the wizard-pane element avoids jerking when the hero is long.
  const scrollToWizard = () => {
    requestAnimationFrame(() => {
      const el = document.querySelector('.home-wizard-pane');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

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
    scrollToWizard();
  };

  const onBack = () => {
    if (store.currentStepIndex === 0 && store.currentSectionIndex === 0) return;
    if (store.currentStepIndex === 0) {
      const prev = SECTIONS[store.currentSectionIndex - 1];
      store.setPosition(store.currentSectionIndex - 1, prev.steps.length - 1);
    } else {
      store.setPosition(store.currentSectionIndex, store.currentStepIndex - 1);
    }
    scrollToWizard();
  };

  const onJumpToSection = (index: number) => {
    if (index === store.currentSectionIndex) return;
    // Persist quietly, then jump.
    store.persistToServer().catch(() => {});
    store.setPosition(index, 0);
    scrollToWizard();
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
        <div className="home-hero-mark" aria-hidden>
          <svg viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bpMarkGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b5cff" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {/* Stylised A4 document with fold + chart */}
            <g fill="none" stroke="url(#bpMarkGrad)" strokeWidth="2.4" opacity="0.38">
              <path d="M40 30 H240 L280 70 V370 H40 Z" />
              <path d="M240 30 V70 H280" />
              <line x1="70" y1="110" x2="240" y2="110" />
              <line x1="70" y1="130" x2="220" y2="130" />
              <line x1="70" y1="150" x2="240" y2="150" />
              <line x1="70" y1="170" x2="200" y2="170" />
              {/* bar chart inside document */}
              <rect x="70" y="260" width="22" height="70" />
              <rect x="102" y="240" width="22" height="90" />
              <rect x="134" y="210" width="22" height="120" />
              <rect x="166" y="180" width="22" height="150" />
              <rect x="198" y="150" width="22" height="180" />
              <line x1="70" y1="335" x2="240" y2="335" />
              {/* upward arrow */}
              <path d="M80 330 L130 280 L170 310 L220 240" strokeWidth="3" />
              <path d="M220 240 L210 260 M220 240 L202 248" strokeWidth="3" strokeLinecap="round" />
            </g>
            {/* Big decorative B letter */}
            <text
              x="155"
              y="225"
              fontFamily="Inter, sans-serif"
              fontSize="260"
              fontWeight="800"
              fill="url(#bpMarkGrad)"
              opacity="0.1"
              textAnchor="middle"
            >
              B
            </text>
          </svg>
        </div>
        <div className="home-hero-content">
          <div className="home-hero-badge">⚖️ Entwickelt &amp; zertifiziert von Steuerberatern, Wirtschaftsprüfern &amp; Ex-McKinsey/BCG-Beratern</div>
          <h1>{t('landing.hero_title')}</h1>
          <p>{t('landing.hero_sub')}</p>
          <div className="home-hero-certmark">
            <span className="home-hero-certmark-icon" aria-hidden>✓</span>
            <span>
              <strong>Kein KI-Rohtext.</strong> Jede Formulierung entstammt einer von Experten zertifizierten Vorlage — die KI setzt nur deine Fakten ein.
            </span>
          </div>
          <LiveActivity />
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
          <WizardStepList
            currentSectionIndex={store.currentSectionIndex}
            onJump={onJumpToSection}
          />
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
        <TemplatesGallery />
        <ExpertsRow />
        <PriceAnchor />
        <Testimonials />
        <FaqHome />
        <NewsletterForm source="home-footer" />

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
