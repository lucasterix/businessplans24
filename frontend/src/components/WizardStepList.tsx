import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../wizard/schema';
import { usePlanStore } from '../store/usePlanStore';

interface Props {
  currentSectionIndex: number;
  onJump?: (index: number) => void;
}

export default function WizardStepList({ currentSectionIndex, onJump }: Props) {
  const { t } = useTranslation();
  const texts = usePlanStore((s) => s.texts);

  return (
    <nav className="wizard-steplist" aria-label="Fortschritt">
      <div className="wizard-steplist-title">Sektionen</div>
      <ol>
        {SECTIONS.map((s, i) => {
          const state =
            texts[s.id]
              ? 'done'
              : i === currentSectionIndex
                ? 'active'
                : i < currentSectionIndex
                  ? 'skipped'
                  : 'upcoming';
          return (
            <li key={s.id} className={`wizard-steplist-item is-${state}`}>
              <button
                type="button"
                className="wizard-steplist-button"
                onClick={() => onJump?.(i)}
                aria-current={state === 'active' ? 'step' : undefined}
                title={`Zur Sektion „${t(s.titleKey)}" springen`}
              >
                <span className="wizard-steplist-marker">
                  {state === 'done' ? '✓' : i + 1}
                </span>
                <span className="wizard-steplist-label">{t(s.titleKey)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
