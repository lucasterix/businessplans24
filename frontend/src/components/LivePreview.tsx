import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../store/usePlanStore';
import { SECTIONS } from '../wizard/schema';

interface Props {
  activeSectionId?: string;
}

function friendlyValue(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function LivePreview({ activeSectionId }: Props) {
  const { t } = useTranslation();
  const answers = usePlanStore((s) => s.answers);
  const texts = usePlanStore((s) => s.texts);

  const flatAnswers: Record<string, unknown> = {};
  Object.values(answers).forEach((a) => Object.assign(flatAnswers, a));

  const sectionsOrder = ['executive_summary', 'business_idea', 'customers', 'company', 'finance', 'appendix'];
  const order = sectionsOrder
    .map((id) => SECTIONS.find((s) => s.id === id))
    .filter((s): s is (typeof SECTIONS)[number] => !!s);

  const title = (flatAnswers.company_name as string) || t('app.name');
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="live-preview">
      <div className="live-preview-toolbar">
        <h3>Vorschau</h3>
        <span className="live-preview-status">Live</span>
      </div>

      <article className="preview-paper" aria-label="Businessplan-Vorschau">
        <header className="preview-cover">
          <p className="preview-cover-eyebrow">Businessplan</p>
          <h1 className="preview-cover-title">{title}</h1>
          <p className="preview-cover-date">{today}</p>
        </header>

        {order.map((section) => {
          const hasText = !!texts[section.id];
          const isActive = activeSectionId === section.id;
          const state = hasText ? 'done' : isActive ? 'active' : 'pending';
          const stateClass = state === 'done' ? 'is-done' : state === 'active' ? 'is-active' : '';

          return (
            <section key={section.id} className={`preview-paper-section ${stateClass}`}>
              <header className="preview-paper-section-head">
                <h2>{t(section.titleKey)}</h2>
                <span className={`preview-section-state ${stateClass}`}>
                  {state === 'done' ? '✓ fertig' : state === 'active' ? 'aktiv' : 'offen'}
                </span>
              </header>

              {section.id === 'business_idea' && (
                <FactList
                  items={[
                    ['Unternehmen', flatAnswers.company_name],
                    ['Modell', flatAnswers.business_model],
                    ['Einzeiler', flatAnswers.one_liner],
                  ]}
                />
              )}
              {section.id === 'customers' && (
                <FactList
                  items={[
                    ['Zielgruppe', flatAnswers.target_description],
                    ['Vertriebswege', flatAnswers.channels],
                  ]}
                />
              )}
              {section.id === 'company' && (
                <FactList
                  items={[
                    ['Standort', flatAnswers.location],
                    ['Rechtsform', flatAnswers.legal_form],
                    ['Gründer', flatAnswers.founders],
                  ]}
                />
              )}
              {section.id === 'finance' && (
                <FactList
                  items={[
                    ['Kapitalbedarf', flatAnswers.capital_need ? `${flatAnswers.capital_need} €` : undefined],
                    ['Eigenkapital', flatAnswers.equity ? `${flatAnswers.equity} €` : undefined],
                    ['Finanzierung', flatAnswers.financing],
                  ]}
                />
              )}

              {hasText ? (
                <div className="preview-paper-text">
                  {texts[section.id]
                    .split(/\n{2,}/)
                    .slice(0, 8)
                    .map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                </div>
              ) : (
                <p className="preview-empty">
                  {isActive
                    ? 'Beantworte die Fragen links — Claude schreibt diesen Abschnitt für dich.'
                    : 'Wird im Wizard ausgefüllt.'}
                </p>
              )}
            </section>
          );
        })}

        <footer className="preview-paper-footer">
          <span>{title} · Businessplan · {today}</span>
        </footer>
      </article>
    </div>
  );
}

function FactList({ items }: { items: Array<[string, unknown]> }) {
  const present = items.filter(([, v]) => {
    const s = friendlyValue(v);
    return s.trim().length > 0;
  });
  if (present.length === 0) return null;
  return (
    <dl className="preview-facts">
      {present.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{friendlyValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
