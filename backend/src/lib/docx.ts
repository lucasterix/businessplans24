import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageOrientation,
  LevelFormat,
  PageBreak,
  Footer,
  Header as DocxHeader,
} from 'docx';

interface RenderInput {
  title: string;
  language: string;
  texts: Record<string, string>;
  watermarked: boolean;
}

const SECTION_TITLES: Record<string, Record<string, string>> = {
  de: {
    executive_summary: 'Zusammenfassung',
    business_idea: 'Geschäftsidee',
    customers: 'Kunden',
    company: 'Unternehmen',
    finance: 'Finanzen',
    appendix: 'Anhang',
  },
  en: {
    executive_summary: 'Executive Summary',
    business_idea: 'Business Idea',
    customers: 'Customers',
    company: 'Company',
    finance: 'Finance',
    appendix: 'Appendix',
  },
};

const ORDER: Array<keyof typeof SECTION_TITLES.de> = [
  'executive_summary',
  'business_idea',
  'customers',
  'company',
  'finance',
  'appendix',
];

export async function renderPlanDocx(input: RenderInput): Promise<Buffer> {
  const lang = input.language.slice(0, 2);
  const titles = SECTION_TITLES[lang] || SECTION_TITLES.en;

  const children: Paragraph[] = [];

  // Cover
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 240 },
      children: [new TextRun({ text: 'BUSINESSPLAN', size: 20, bold: true, color: '8E8E93' })],
    }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: input.title, bold: true, size: 52 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [new TextRun({ text: new Date().toLocaleDateString(lang), color: '6e6e73' })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  if (input.watermarked) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: '— VORSCHAU —', bold: true, color: 'C2410C', size: 28 })],
      })
    );
  }

  // Sections
  ORDER.forEach((key, idx) => {
    const body = input.texts[key];
    if (!body) return;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: `${String(idx + 1).padStart(2, '0')}  ${titles[key]}`,
            bold: true,
            size: 32,
          }),
        ],
      })
    );
    body.split(/\n{2,}/).forEach((para) => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 160, line: 360 },
          children: [new TextRun({ text: para.trim(), size: 22 })],
        })
      );
    });
  });

  const doc = new Document({
    creator: 'Businessplan24',
    title: input.title,
    description: 'Businessplan erstellt mit Businessplan24',
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: { size: { orientation: PageOrientation.PORTRAIT } },
        },
        headers: {
          default: new DocxHeader({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: input.title, size: 18, color: '8E8E93' })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Businessplan24 · businessplans24.com', size: 16, color: '8E8E93' })],
              }),
            ],
          }),
        },
        children,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'sectionList',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START },
          ],
        },
      ],
    },
  });

  return Packer.toBuffer(doc);
}
