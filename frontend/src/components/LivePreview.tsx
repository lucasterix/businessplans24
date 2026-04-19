import { useTranslation } from 'react-i18next';
import { usePlanStore } from '../store/usePlanStore';
import { usePreviewTheme } from '../store/usePreviewTheme';
import { SECTIONS } from '../wizard/schema';
import A4Document, { type A4Section } from './A4Document';

interface Props {
  activeSectionId?: string;
}

function friendlyValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.length ? v.join(', ') : undefined;
  if (typeof v === 'object') return JSON.stringify(v);
  const s = String(v).trim();
  return s || undefined;
}

const SECTIONS_ORDER = ['executive_summary', 'business_idea', 'customers', 'company', 'finance', 'appendix'] as const;

export default function LivePreview({ activeSectionId }: Props) {
  const { t } = useTranslation();
  const answers = usePlanStore((s) => s.answers);
  const texts = usePlanStore((s) => s.texts);
  const theme = usePreviewTheme();

  const flat: Record<string, unknown> = {};
  Object.values(answers).forEach((a) => Object.assign(flat, a));

  const title = (flat.company_name as string)?.trim() || 'Dein Unternehmen';
  const subtitle = (flat.one_liner as string)?.trim();
  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  const built: Array<A4Section | null> = SECTIONS_ORDER.map((id) => {
    const section = SECTIONS.find((s) => s.id === id);
    if (!section) return null;

    const facts: Array<[string, string]> = [];
    if (id === 'business_idea') {
      const modelLabel = flat.business_model ? t(`models.${flat.business_model}`, { defaultValue: String(flat.business_model) }) : undefined;
      const v1 = friendlyValue(flat.company_name); if (v1) facts.push(['Unternehmen', v1]);
      const v2 = friendlyValue(modelLabel); if (v2) facts.push(['Modell', v2]);
      const v3 = friendlyValue(flat.one_liner); if (v3) facts.push(['Einzeiler', v3]);
    }
    if (id === 'customers') {
      const v1 = friendlyValue(flat.target_description); if (v1) facts.push(['Zielgruppe', v1]);
      const v2 = friendlyValue(flat.channels); if (v2) facts.push(['Vertriebswege', v2]);
    }
    if (id === 'company') {
      const legalLabel = flat.legal_form ? t(`legal.${flat.legal_form}`, { defaultValue: String(flat.legal_form) }) : undefined;
      const v1 = friendlyValue(flat.location); if (v1) facts.push(['Standort', v1]);
      const v2 = friendlyValue(legalLabel); if (v2) facts.push(['Rechtsform', v2]);
      const v3 = friendlyValue(flat.founders); if (v3) facts.push(['Gründer', v3]);
    }
    if (id === 'finance') {
      if (flat.capital_need) facts.push(['Kapitalbedarf', `${flat.capital_need} €`]);
      if (flat.equity) facts.push(['Eigenkapital', `${flat.equity} €`]);
      const fin = friendlyValue(flat.financing); if (fin) facts.push(['Finanzierung', fin]);
    }

    const active = activeSectionId === id;
    const placeholder = active
      ? 'Beantworte die Fragen links — der Text erscheint hier, sobald generiert.'
      : 'Wird im Wizard ausgefüllt.';

    return {
      key: id,
      title: t(section.titleKey),
      body: texts[id],
      facts: facts.length > 0 ? facts : undefined,
      placeholder,
    };
  });
  const sections: A4Section[] = built.filter((x): x is A4Section => x !== null);

  const toolbar = (
    <div className="a4-toolbar">
      <span className="a4-toolbar-label">Vorschau · aktualisiert live</span>
      <span className="a4-toolbar-status">A4</span>
    </div>
  );

  return (
    <A4Document
      title={title}
      subtitle={subtitle}
      date={today}
      sections={sections}
      watermark
      toolbar={toolbar}
      compact
      logoDataUrl={theme.logoDataUrl}
      coverStyle={theme.coverStyle}
      coverDecor={theme.coverDecor}
      footerText={theme.footerText}
      showCoverDate={theme.showCoverDate}
      showToc={theme.showToc}
      showHeader={theme.showHeader}
      pageNumFormat={theme.pageNumFormat}
      blankBetween={theme.blankBetween}
      appendixTwoCol={theme.appendixTwoCol}
      sectionStripe={theme.sectionStripe}
      sectionDividers={theme.sectionDividers}
      financeCharts={theme.financeCharts}
    />
  );
}
