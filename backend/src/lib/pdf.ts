import puppeteer from 'puppeteer';

interface RenderInput {
  title: string;
  language: string;
  texts: Record<string, string>;
  finance: Record<string, unknown>;
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

function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

function buildHtml(input: RenderInput): string {
  const lang = input.language.slice(0, 2);
  const titles = SECTION_TITLES[lang] || SECTION_TITLES.en;
  const order: Array<keyof typeof titles> = [
    'executive_summary',
    'business_idea',
    'customers',
    'company',
    'finance',
    'appendix',
  ];
  const sections = order
    .filter((k) => input.texts[k])
    .map(
      (k) => `
      <section>
        <h2>${htmlEscape(titles[k])}</h2>
        ${input.texts[k]
          .split(/\n{2,}/)
          .map((p) => `<p>${htmlEscape(p.trim()).replace(/\n/g, '<br/>')}</p>`)
          .join('')}
      </section>`
    )
    .join('');

  const watermarkCss = input.watermarked
    ? `
    body::before {
      content: 'PREVIEW';
      position: fixed;
      top: 40%;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 120pt;
      color: rgba(200, 0, 0, 0.12);
      font-weight: 800;
      transform: rotate(-30deg);
      z-index: 9999;
      pointer-events: none;
    }
    `
    : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${htmlEscape(input.title)}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0b1120; line-height: 1.55; }
  h1 { font-size: 28pt; margin: 0 0 8pt; }
  h2 { font-size: 18pt; margin-top: 20pt; border-bottom: 1pt solid #e5e7eb; padding-bottom: 4pt; }
  p { font-size: 11pt; margin: 8pt 0; text-align: justify; }
  .cover { text-align: center; padding-top: 30vh; page-break-after: always; }
  .cover h1 { font-size: 40pt; }
  .cover p { font-size: 14pt; color: #475569; }
  ${watermarkCss}
</style>
</head>
<body>
  <div class="cover">
    <h1>${htmlEscape(input.title)}</h1>
    <p>${lang === 'de' ? 'Businessplan' : 'Business Plan'} · ${new Date().toLocaleDateString(lang)}</p>
  </div>
  ${sections}
</body>
</html>`;
}

export async function renderPlanPdf(input: RenderInput): Promise<Buffer> {
  const html = buildHtml(input);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
