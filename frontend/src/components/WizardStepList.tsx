import { useTranslation } from 'react-i18next';
import { SECTIONS } from '../wizard/schema';
import { usePlanStore } from '../store/usePlanStore';

interface Props {
  currentSectionIndex: number;
}

export default function WizardStepList({ currentSectionIndex }: Props) {
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
              <span className="wizard-steplist-marker">
                {state === 'done' ? '✓' : i + 1}
              </span>
              <span className="wizard-steplist-label">{t(s.titleKey)}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
