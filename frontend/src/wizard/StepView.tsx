import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Section, Step } from './schema';
import { FieldRenderer } from './fields/FieldRenderer';
import { generateSection } from '../api/client';
import { usePlanStore } from '../store/usePlanStore';

interface Props {
  section: Section;
  step: Step;
  isLastStepOfSection: boolean;
  isLastSection: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function StepView({ section, step, isLastStepOfSection, isLastSection, onNext, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const stepAnswers = store.answers[step.id] || {};
  const [generating, setGenerating] = useState(false);
  const [localText, setLocalText] = useState<string | undefined>(store.texts[section.id]);
  const [error, setError] = useState<string | null>(null);

  const missingRequired = step.fields
    .filter((f) => f.required)
    .some((f) => {
      const v = stepAnswers[f.id];
      if (Array.isArray(v)) return v.length === 0;
      if (typeof v === 'string') return v.trim() === '';
      return v === undefined || v === null;
    });

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const sectionAnswers = section.steps.reduce<Record<string, unknown>>((acc, s) => {
        const a = store.answers[s.id] || {};
        return { ...acc, ...a };
      }, {});
      const planContext = section.id === 'executive_summary' ? { texts: store.texts } : undefined;
      const text = await generateSection({
        section: section.id,
        answers: sectionAnswers,
        language: i18n.language.slice(0, 2),
        planContext,
      });
      setLocalText(text);
      store.setText(section.id, text);
      await store.persistToServer();
    } catch (err) {
      console.error(err);
      setError(t('common.error'));
    } finally {
      setGenerating(false);
    }
  };

  const handleTextEdit = (t: string) => {
    setLocalText(t);
    store.setText(section.id, t);
  };

  return (
    <div className="wizard-step">
      <div className="wizard-step-head">
        <div className="wizard-step-section">{t(section.titleKey)}</div>
        <h2>{t(step.titleKey)}</h2>
        {step.descriptionKey && <p className="muted">{t(step.descriptionKey)}</p>}
      </div>

      {step.fields.length > 0 && (
        <div className="wizard-fields">
          {step.fields.map((f) => (
            <FieldRenderer
              key={f.id}
              field={f}
              value={stepAnswers[f.id]}
              onChange={(v) => store.setAnswer(step.id, f.id, v)}
            />
          ))}
        </div>
      )}

      {isLastStepOfSection && (
        <div className="wizard-generate-block">
          {localText ? (
            <>
              <div className="wizard-generated-head">
                <h3>{t(section.titleKey)}</h3>
                <button className="btn btn-ghost" onClick={handleGenerate} disabled={generating}>
                  {generating ? t('wizard.generating') : t('wizard.regenerate')}
                </button>
              </div>
              <p className="muted tiny">{t('wizard.generated_hint')}</p>
              <textarea
                className="generated-text"
                rows={10}
                value={localText}
                onChange={(e) => handleTextEdit(e.target.value)}
              />
            </>
          ) : (
            <div className="wizard-generate-cta">
              <p className="muted">
                {section.id === 'executive_summary'
                  ? t('wizard.review_intro')
                  : t('wizard.generated_hint')}
              </p>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating || missingRequired}
              >
                {generating ? t('wizard.generating') : t('wizard.generate')}
              </button>
              {missingRequired && <p className="error-text">{t('wizard.required_missing')}</p>}
            </div>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>{t('wizard.back')}</button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={missingRequired || (isLastStepOfSection && !localText)}
        >
          {isLastSection && isLastStepOfSection ? t('wizard.finish') : t('wizard.next')}
        </button>
      </div>
    </div>
  );
}
