import { usePlanStore } from '../store/usePlanStore';

interface Props {
  onContinue: () => void;
  onReset: () => void;
}

export default function DraftRecovery({ onContinue, onReset }: Props) {
  const store = usePlanStore();
  const sectionCount = Object.values(store.answers).reduce(
    (acc, a) => acc + Object.keys(a).length,
    0
  );
  if (sectionCount === 0) return null;

  const textCount = Object.keys(store.texts).length;

  return (
    <div className="draft-banner" role="status">
      <div className="draft-banner-text">
        <strong>Weiter wo du aufgehört hast?</strong>
        <span>
          {sectionCount} Antwort{sectionCount === 1 ? '' : 'en'}
          {textCount > 0 && ` · ${textCount} Sektion${textCount === 1 ? '' : 'en'} generiert`}
        </span>
      </div>
      <div className="draft-banner-actions">
        <button className="btn btn-ghost btn-sm" onClick={onReset}>Neu starten</button>
        <button className="btn btn-primary btn-sm" onClick={onContinue}>Weiter</button>
      </div>
    </div>
  );
}
