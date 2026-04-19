import { TEMPLATES, type Template } from '../wizard/templates';
import { usePlanStore } from '../store/usePlanStore';
import { toast } from '../store/useToasts';

interface Props {
  onAfterChoose?: () => void;
}

export default function TemplatesGallery({ onAfterChoose }: Props) {
  const store = usePlanStore();

  const applyTemplate = (t: Template) => {
    store.reset();
    // Seed answers and reposition to first step
    Object.entries(t.answers).forEach(([stepId, fields]) => {
      Object.entries(fields as Record<string, unknown>).forEach(([fieldId, value]) => {
        store.setAnswer(stepId, fieldId, value);
      });
    });
    store.setPosition(0, 0);
    toast.success(`Vorlage „${t.name}" übernommen. Du kannst alles anpassen.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onAfterChoose?.();
  };

  return (
    <section className="templates-section">
      <h2>Mit Beispiel starten</h2>
      <p className="muted templates-sub">
        Wähle ein Beispiel — die Felder sind vorausgefüllt, du passt sie in deinen Worten an.
      </p>
      <div className="templates-grid">
        {TEMPLATES.map((t) => (
          <button key={t.id} type="button" className="template-card" onClick={() => applyTemplate(t)}>
            <span className="template-icon" aria-hidden>{t.icon}</span>
            <strong>{t.name}</strong>
            <span className="template-desc">{t.description}</span>
            <span className="template-cta">Diese Vorlage laden →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
