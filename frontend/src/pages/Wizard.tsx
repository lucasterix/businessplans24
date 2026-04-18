import { lazy, Suspense, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../wizard/schema';
import { StepView } from '../wizard/StepView';
import { usePlanStore } from '../store/usePlanStore';
import { createPlan } from '../api/client';

const FinancePlanner = lazy(() => import('../wizard/FinancePlanner'));

export default function Wizard() {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const navigate = useNavigate();
  const { planId: routePlanId } = useParams();

  useEffect(() => {
    if (routePlanId && routePlanId !== store.planId) {
      store.setPlanId(routePlanId);
    }
  }, [routePlanId, store]);

  useEffect(() => {
    if (!store.planId && !routePlanId) {
      createPlan({ language: i18n.language.slice(0, 2) })
        .then((id) => {
          store.setPlanId(id);
          navigate(`/wizard/${id}`, { replace: true });
        })
        .catch((err) => console.warn('[wizard] createPlan failed, continuing local', err));
    }
  }, [store, routePlanId, i18n.language, navigate]);

  const section = SECTIONS[store.currentSectionIndex];
  const step = section?.steps[store.currentStepIndex];
  if (!section || !step) return null;

  const totalSteps = SECTIONS.reduce((acc, s) => acc + s.steps.length, 0);
  const currentFlatIndex =
    SECTIONS.slice(0, store.currentSectionIndex).reduce((a, s) => a + s.steps.length, 0) +
    store.currentStepIndex +
    1;

  const isLastStepOfSection = store.currentStepIndex === section.steps.length - 1;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onBack = () => {
    if (store.currentStepIndex === 0 && store.currentSectionIndex === 0) return;
    if (store.currentStepIndex === 0) {
      const prev = SECTIONS[store.currentSectionIndex - 1];
      store.setPosition(store.currentSectionIndex - 1, prev.steps.length - 1);
    } else {
      store.setPosition(store.currentSectionIndex, store.currentStepIndex - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFinancePlanStep = section.id === 'finance' && step.id === 'plan';

  return (
    <div className="wizard-layout">
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

      {isFinancePlanStep ? (
        <Suspense fallback={<div className="loading-fallback" />}>
          <FinancePlanner onNext={onNext} onBack={onBack} />
        </Suspense>
      ) : (
        <StepView
          section={section}
          step={step}
          isLastStepOfSection={isLastStepOfSection}
          isLastSection={isLastSection}
          onNext={onNext}
          onBack={onBack}
        />
      )}
    </div>
  );
}
