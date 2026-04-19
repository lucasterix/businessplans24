import puppeteer from 'puppeteer';

export interface PlanSettings {
  logoDataUrl?: string;
  coverStyle?: 'classic' | 'modern' | 'minimal';
  footerText?: string;
  showCoverDate?: boolean;
  showToc?: boolean;
  accentHex?: string;
}

interface RenderInput {
  title: string;
  subtitle?: string;
  language: string;
  texts: Record<string, string>;
  finance: Record<string, unknown>;
  watermarked: boolean;
  /** Optional extra cover facts (Gründer, Standort, …). */
  facts?: Record<string, Array<[string, string]>>;
  /** User-controlled visuals (logo, colours, footer) */
  settings?: PlanSettings;
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

function esc(s: string): string {
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

  const today = new Date().toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });

  const settings = input.settings || {};
  const accent = settings.accentHex && /^#[0-9a-f]{6}$/i.test(settings.accentHex) ? settings.accentHex : '#0b5cff';
  const coverStyle = settings.coverStyle || 'classic';
  const showCoverDate = settings.showCoverDate !== false;
  const showToc = settings.showToc !== false;
  const logoUrl = typeof settings.logoDataUrl === 'string' && settings.logoDataUrl.startsWith('data:') ? settings.logoDataUrl : '';
  const footerText = esc(settings.footerText || '');

  const coverToc = showToc
    ? order
        .filter((k) => input.texts[k])
        .map(
          (k, i) => `
      <li>
        <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
        <span>${esc(titles[k])}</span>
      </li>`
        )
        .join('')
    : '';

  const contentPages = order
    .filter((k) => input.texts[k])
    .map((k, i) => {
      const facts = (input.facts?.[k] || [])
        .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
        .join('');
      const factsBlock = facts ? `<dl class="facts">${facts}</dl>` : '';
      const body = input.texts[k]
        .split(/\n{2,}/)
        .map((p) => `<p>${esc(p.trim())}</p>`)
        .join('');
      return `
      <section class="page content-page">
        <div class="inner">
          <header class="section-head">
            <span class="section-num">${String(i + 1).padStart(2, '0')}</span>
            <h2>${esc(titles[k])}</h2>
          </header>
          ${factsBlock}
          <div class="body">${body}</div>
        </div>
        ${footerText ? `<div class="running-footer">${footerText}</div>` : ''}
      </section>`;
    })
    .join('');

  const watermarkCss = input.watermarked
    ? `
    .page::after {
      content: 'VORSCHAU';
      position: absolute;
      top: 45%;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 120pt;
      color: rgba(210, 63, 63, 0.08);
      font-weight: 900;
      transform: rotate(-30deg);
      z-index: 10;
      pointer-events: none;
      letter-spacing: 0.1em;
    }`
    : '';

  const subtitleHtml = input.subtitle
    ? `<p class="cover-subtitle">${esc(input.subtitle)}</p>`
    : '';

  const logoHtml = logoUrl
    ? `<div class="cover-logo"><img src="${logoUrl}" alt="" /></div>`
    : '';

  const coverDateHtml = showCoverDate
    ? `<p class="cover-date">${esc(today)}</p>`
    : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${esc(input.title)}</title>
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #0b1120;
    line-height: 1.55;
    font-size: 11pt;
  }
  * { box-sizing: border-box; }
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .inner { padding: 20mm; height: 100%; }

  /* Cover */
  .cover .inner {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
  }
  .cover-eyebrow {
    font-size: 10pt;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #9ca3af;
    font-weight: 600;
    margin: 20mm 0 0;
  }
  .cover-title {
    font-size: 38pt;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: ${accent};
    margin: 10mm 0 5mm;
  }
  .cover-logo {
    margin: 0 auto 8mm;
    max-width: 50mm;
  }
  .cover-logo img { max-width: 100%; max-height: 35mm; object-fit: contain; display: block; margin: 0 auto; }
  .cover-style-modern .cover .inner { text-align: left; }
  .cover-style-modern .cover-title { font-size: 48pt; margin-top: 8mm; }
  .cover-style-modern .cover-toc { max-width: 100%; }
  .cover-style-minimal .cover-title { font-size: 30pt; color: #0b1120; }
  .cover-style-minimal .cover-eyebrow { color: ${accent}; }
  .running-footer {
    position: absolute;
    bottom: 8mm;
    left: 20mm;
    right: 20mm;
    text-align: center;
    font-size: 8pt;
    color: #9ca3af;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-top: 1px solid #e5e7eb;
    padding-top: 3mm;
  }
  .cover-subtitle {
    font-size: 14pt;
    color: #374151;
    font-style: italic;
    max-width: 70%;
    margin: 0 auto;
    line-height: 1.4;
  }
  .cover-date {
    font-size: 11pt;
    color: #6b7280;
    margin-top: 8mm;
  }
  .cover-toc {
    text-align: left;
    margin: 0 auto;
    max-width: 75%;
    padding-top: 12mm;
    border-top: 1px solid #e5e7eb;
  }
  .toc-label {
    font-size: 9pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #9ca3af;
    font-weight: 600;
    margin: 0 0 8mm;
  }
  .cover-toc ol { list-style: none; margin: 0; padding: 0; }
  .cover-toc li {
    display: grid;
    grid-template-columns: 14mm 1fr;
    gap: 3mm;
    align-items: baseline;
    font-size: 13pt;
    padding-bottom: 2mm;
    margin-bottom: 3mm;
    border-bottom: 1px dotted #d1d5db;
  }
  .toc-num { font-weight: 700; color: ${accent}; }

  /* Content */
  .content-page .inner {
    display: flex;
    flex-direction: column;
    gap: 7mm;
  }
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 5mm;
    padding-bottom: 5mm;
    border-bottom: 1px solid #e5e7eb;
  }
  .section-num {
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #fff;
    background: ${accent};
    padding: 2mm 4mm;
    border-radius: 2mm;
  }
  .section-head h2 {
    font-size: 20pt;
    font-weight: 700;
    margin: 0;
    color: #0b1120;
    letter-spacing: -0.01em;
  }
  .facts {
    padding: 5mm;
    background: #fafafb;
    border-radius: 2mm;
    font-size: 10pt;
    margin: 0;
  }
  .facts > div {
    display: grid;
    grid-template-columns: 30% 1fr;
    gap: 3mm;
    padding: 1.5mm 0;
  }
  .facts dt { font-weight: 600; color: #4b5563; margin: 0; }
  .facts dd { margin: 0; color: #0b1120; }

  .body p {
    font-size: 11pt;
    line-height: 1.7;
    text-align: justify;
    hyphens: auto;
    margin: 0 0 3mm;
  }

  ${watermarkCss}
</style>
</head>
<body class="cover-style-${coverStyle}">
  <section class="page cover">
    <div class="inner">
      <div>
        ${logoHtml}
        <p class="cover-eyebrow">Businessplan</p>
        <h1 class="cover-title">${esc(input.title)}</h1>
        ${subtitleHtml}
        ${coverDateHtml}
      </div>
      ${coverToc ? `<div class="cover-toc"><p class="toc-label">Inhalt</p><ol>${coverToc}</ol></div>` : ''}
    </div>
    ${footerText ? `<div class="running-footer">${footerText}</div>` : ''}
  </section>
  ${contentPages}
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
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
