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

  return (
    <div className="live-preview">
      <h3>{t('preview.title', { defaultValue: 'Vorschau' })}</h3>
      <h2>{(flatAnswers.company_name as string) || t('app.name')}</h2>

      <div className="preview-doc">
        {order.map((section) => {
          const hasText = !!texts[section.id];
          const isActive = activeSectionId === section.id;
          const state = hasText ? 'done' : isActive ? 'active' : 'pending';
          const stateClass = state === 'done' ? 'is-done' : state === 'active' ? 'is-active' : '';

          return (
            <div key={section.id} className="preview-section">
              <h4>
                {t(section.titleKey)}
                <span className={`preview-section-state ${stateClass}`}>
                  {state === 'done' ? '✓ fertig' : state === 'active' ? 'aktiv' : 'offen'}
                </span>
              </h4>

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
                <div className="preview-text">
                  {texts[section.id]
                    .split(/\n{2,}/)
                    .slice(0, 6)
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
            </div>
          );
        })}
      </div>
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
    <div className="preview-facts">
      {present.map(([label, value]) => (
        <div key={label}>
          <span className="preview-fact-label">{label}:</span>
          <span>{friendlyValue(value)}</span>
        </div>
      ))}
    </div>
  );
}
