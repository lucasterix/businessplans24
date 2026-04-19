import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Section, Step } from './schema';
import { FieldRenderer } from './fields/FieldRenderer';
import { generateSectionStreamed } from '../api/client';
import { usePlanStore } from '../store/usePlanStore';
import { toast } from '../store/useToasts';

interface Props {
  section: Section;
  step: Step;
  isLastStepOfSection: boolean;
  isLastSection: boolean;
  onNext: () => void;
  onBack: () => void;
}

function isEmpty(v: unknown): boolean {
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'string') return v.trim() === '';
  return v === undefined || v === null;
}

export function StepView({ section, step, isLastStepOfSection, isLastSection, onNext, onBack }: Props) {
  const { t, i18n } = useTranslation();
  const store = usePlanStore();
  const stepAnswers = store.answers[step.id] || {};
  const [generating, setGenerating] = useState(false);
  const [localText, setLocalText] = useState<string | undefined>(store.texts[section.id]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const invalidFields = step.fields.filter((f) => f.required && isEmpty(stepAnswers[f.id]));
  const missingRequired = invalidFields.length > 0;

  const handleGenerate = async () => {
    if (missingRequired) {
      setTriedSubmit(true);
      return;
    }
    setGenerating(true);
    abortRef.current = new AbortController();
    setLocalText('');
    try {
      const sectionAnswers = section.steps.reduce<Record<string, unknown>>((acc, s) => {
        const a = store.answers[s.id] || {};
        return { ...acc, ...a };
      }, {});
      const planContext = section.id === 'executive_summary' ? { texts: store.texts } : undefined;
      let streamed = '';
      await generateSectionStreamed(
        {
          section: section.id,
          answers: sectionAnswers,
          language: i18n.language.slice(0, 2),
          planContext,
        },
        (chunk) => {
          streamed += chunk;
          setLocalText(streamed);
        },
        abortRef.current.signal
      );
      store.setText(section.id, streamed.trim());
      store.persistToServer().catch(() => {});
    } catch (err: unknown) {
      const msg = (err as Error).message || '';
      if (msg.includes('429') || msg.includes('rate_limited')) {
        toast.error('Rate-Limit erreicht. Bitte in einer Minute erneut versuchen.');
      } else if (msg.includes('AbortError')) {
        // cancelled by user or navigation
      } else {
        toast.error('Generierung fehlgeschlagen.', {
          action: { label: 'Erneut', onClick: () => void handleGenerate() },
        });
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleTextEdit = (v: string) => {
    setLocalText(v);
    store.setText(section.id, v);
  };

  const handleNext = () => {
    if (missingRequired) {
      setTriedSubmit(true);
      toast.error(t('wizard.required_missing'));
      return;
    }
    onNext();
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
          {step.fields.map((f) => {
            const showError =
              f.required && isEmpty(stepAnswers[f.id]) && (touched[f.id] || triedSubmit);
            return (
              <div key={f.id} className={showError ? 'field-wrap field-wrap--error' : 'field-wrap'}>
                <FieldRenderer
                  field={f}
                  value={stepAnswers[f.id]}
                  onChange={(v) => {
                    store.setAnswer(step.id, f.id, v);
                    setTouched((t) => ({ ...t, [f.id]: true }));
                  }}
                />
                {showError && <p className="field-error">Bitte ausfüllen</p>}
              </div>
            );
          })}
        </div>
      )}

      {isLastStepOfSection && (
        <div className="wizard-generate-block">
          {localText != null && (localText.length > 0 || generating) ? (
            <>
              <div className="wizard-generated-head">
                <h3>{t(section.titleKey)}</h3>
                {!generating && (
                  <button className="btn btn-ghost btn-sm" onClick={handleGenerate}>
                    {t('wizard.regenerate')}
                  </button>
                )}
                {generating && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => abortRef.current?.abort()}
                  >
                    Abbrechen
                  </button>
                )}
              </div>
              <p className="muted tiny">{t('wizard.generated_hint')}</p>
              <textarea
                className={`generated-text ${generating ? 'is-streaming' : ''}`}
                rows={10}
                value={localText}
                readOnly={generating}
                onChange={(e) => handleTextEdit(e.target.value)}
              />
              {generating && (
                <div className="streaming-bar" aria-hidden>
                  <span /><span /><span />
                </div>
              )}
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
                {t('wizard.generate')}
              </button>
              {missingRequired && triedSubmit && (
                <p className="error-text">{t('wizard.required_missing')}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>{t('wizard.back')}</button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={isLastStepOfSection && !localText}
        >
          {isLastSection && isLastStepOfSection ? t('wizard.finish') : t('wizard.next')}
        </button>
      </div>
    </div>
  );
}
