import puppeteer, { type Browser } from 'puppeteer';
import { renderFinanceChartsBlock, type FinancePayload } from './pdfCharts.js';

export interface PlanSettings {
  logoDataUrl?: string;
  coverStyle?: 'classic' | 'modern' | 'minimal' | 'bold' | 'editorial';
  coverDecor?: 'none' | 'chart' | 'wave' | 'geometric';
  footerText?: string;
  showCoverDate?: boolean;
  showToc?: boolean;
  accentHex?: string;
  showHeader?: boolean;
  pageNumFormat?: 'simple' | 'xOfY' | 'hidden';
  blankBetween?: boolean;
  appendixTwoCol?: boolean;
  sectionStripe?: boolean;
  sectionDividers?: boolean;
  financeCharts?: boolean;
  currency?: string;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

interface RenderInput {
  title: string;
  subtitle?: string;
  language: string;
  texts: Record<string, string>;
  finance: Record<string, unknown>;
  watermarked: boolean;
  facts?: Record<string, Array<[string, string]>>;
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

const TOC_LABEL: Record<string, string> = {
  de: 'Inhaltsverzeichnis',
  en: 'Table of Contents',
};
const EYEBROW_LABEL: Record<string, string> = {
  de: 'Businessplan',
  en: 'Business Plan',
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

function decorSvg(kind: PlanSettings['coverDecor']): string {
  if (kind === 'chart') {
    return `<svg viewBox="0 0 500 260" preserveAspectRatio="xMidYEnd meet">
      <g fill="none" stroke="currentColor" stroke-width="3">
        <rect x="40" y="180" width="40" height="60" fill="currentColor" opacity="0.25" stroke="none" />
        <rect x="100" y="150" width="40" height="90" fill="currentColor" opacity="0.4" stroke="none" />
        <rect x="160" y="115" width="40" height="125" fill="currentColor" opacity="0.55" stroke="none" />
        <rect x="220" y="80" width="40" height="160" fill="currentColor" opacity="0.7" stroke="none" />
        <rect x="280" y="40" width="40" height="200" fill="currentColor" opacity="0.9" stroke="none" />
        <path d="M60 170 L120 130 L180 95 L240 60 L300 25 L370 10" stroke-linecap="round" />
        <path d="M370 10 L360 30 M370 10 L345 18" stroke-linecap="round" />
      </g>
    </svg>`;
  }
  if (kind === 'wave') {
    return `<svg viewBox="0 0 500 180" preserveAspectRatio="none">
      <path d="M0,90 C120,40 220,140 350,80 C420,50 480,100 500,90 L500,180 L0,180 Z" fill="currentColor" opacity="0.15" />
      <path d="M0,120 C130,70 240,170 360,100 C430,70 480,130 500,120 L500,180 L0,180 Z" fill="currentColor" opacity="0.3" />
    </svg>`;
  }
  if (kind === 'geometric') {
    return `<svg viewBox="0 0 400 400">
      <g fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="200" cy="200" r="180" opacity="0.2" />
        <circle cx="200" cy="200" r="140" opacity="0.3" />
        <circle cx="200" cy="200" r="100" opacity="0.4" />
        <line x1="20" y1="200" x2="380" y2="200" opacity="0.25" />
        <line x1="200" y1="20" x2="200" y2="380" opacity="0.25" />
        <circle cx="200" cy="200" r="6" fill="currentColor" stroke="none" opacity="0.6" />
      </g>
    </svg>`;
  }
  return '';
}

function pageLabel(fmt: PlanSettings['pageNumFormat'], n: number, total: number, lang: string): string {
  if (fmt === 'hidden') return '';
  if (fmt === 'xOfY') return lang === 'de' ? `Seite ${n} von ${total}` : `Page ${n} of ${total}`;
  return String(n);
}

function buildHtml(input: RenderInput): string {
  const lang = input.language.slice(0, 2);
  const titles = SECTION_TITLES[lang] || SECTION_TITLES.en;
  const tocLabel = TOC_LABEL[lang] || TOC_LABEL.en;
  const eyebrow = EYEBROW_LABEL[lang] || EYEBROW_LABEL.en;

  const today = new Date().toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });

  const settings = input.settings || {};
  const accent = settings.accentHex && /^#[0-9a-f]{6}$/i.test(settings.accentHex) ? settings.accentHex : '#0b5cff';
  const coverStyle = settings.coverStyle || 'classic';
  const coverDecor = settings.coverDecor || 'chart';
  const showCoverDate = settings.showCoverDate !== false;
  const showToc = settings.showToc !== false;
  const showHeader = settings.showHeader === true;
  const pageNumFormat = settings.pageNumFormat || 'xOfY';
  const blankBetween = settings.blankBetween === true;
  const appendixTwoCol = settings.appendixTwoCol === true;
  const sectionStripe = settings.sectionStripe !== false;
  const sectionDividers = settings.sectionDividers === true;
  const financeCharts = settings.financeCharts !== false;
  const currency = (settings.currency || 'EUR').toUpperCase();
  const logoUrl = typeof settings.logoDataUrl === 'string' && settings.logoDataUrl.startsWith('data:') ? settings.logoDataUrl : '';
  const footerText = esc(settings.footerText || '');

  const defaultOrder: Array<keyof typeof titles> = [
    'executive_summary', 'business_idea', 'customers', 'company', 'finance', 'appendix',
  ];
  const requestedOrder = (settings.sectionOrder && settings.sectionOrder.length ? settings.sectionOrder : defaultOrder)
    .filter((k) => k in titles && !(settings.hiddenSections || []).includes(String(k)))
    .filter((k) => input.texts[k as string]);
  const order = (requestedOrder.length ? requestedOrder : defaultOrder.filter((k) => input.texts[k])) as Array<keyof typeof titles>;

  // Each content section takes 1 page, optionally preceded by a divider (sectionDividers)
  // or followed by a blank (blankBetween). Dividers + blank are mutually exclusive — dividers win.
  const separatorsPerSection = sectionDividers ? 1 : 0;
  const blanksBetween = !sectionDividers && blankBetween ? Math.max(0, order.length - 1) : 0;
  const totalPages = 1 + (showToc ? 1 : 0) + order.length * (1 + separatorsPerSection) + blanksBetween;

  const headerHtml = (n: number) => {
    const parts: string[] = [];
    if (showHeader) {
      const logoPart = logoUrl ? `<img src="${logoUrl}" alt="" class="hdr-logo" />` : '';
      parts.push(`<div class="running-header">${logoPart}<span class="hdr-title">${esc(input.title)}</span></div>`);
    }
    if (pageNumFormat !== 'hidden') {
      parts.push(`<div class="page-num">${esc(pageLabel(pageNumFormat, n, totalPages, lang))}</div>`);
    }
    if (footerText) parts.push(`<div class="running-footer">${footerText}</div>`);
    if (input.watermarked) parts.push(`<div class="watermark">VORSCHAU</div>`);
    return parts.join('');
  };

  // --- Cover ---
  const coverLogo = logoUrl ? `<div class="cover-logo"><img src="${logoUrl}" alt="" /></div>` : '';
  const coverSubtitle = input.subtitle ? `<p class="cover-subtitle">${esc(input.subtitle)}</p>` : '';
  const coverDate = showCoverDate ? `<p class="cover-date">${esc(today)}</p>` : '';
  const decorHtml = coverDecor !== 'none' ? `<div class="cover-decor cover-decor--${coverDecor}">${decorSvg(coverDecor)}</div>` : '';
  const coverPage = `
    <section class="page cover">
      ${decorHtml}
      <div class="inner">
        <div class="cover-head">
          ${coverLogo}
          <p class="cover-eyebrow">${eyebrow}</p>
          <h1 class="cover-title">${esc(input.title)}</h1>
          ${coverSubtitle}
          ${coverDate}
        </div>
      </div>
      ${headerHtml(1)}
    </section>`;

  // Walk the sequence once to assign page numbers for TOC entries + page refs.
  // Pages after cover(1) + optional toc(2):
  //   with dividers: [divider, content] per section
  //   with blankBetween (no dividers): [content] + blank between
  //   default: [content] per section
  const contentPageRefs: number[] = [];
  let cursor = 1 + (showToc ? 1 : 0); // last page so far
  for (let i = 0; i < order.length; i++) {
    if (sectionDividers) cursor++; // divider page
    cursor++; // content page
    contentPageRefs.push(cursor);
    if (!sectionDividers && blankBetween && i < order.length - 1) cursor++; // blank page
  }

  // --- Dedicated TOC page ---
  let tocPage = '';
  if (showToc) {
    const rows = order.map((k, i) => {
      const pageRef = contentPageRefs[i];
      return `
        <li>
          <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="toc-title">${esc(titles[k])}</span>
          <span class="toc-page">${pageRef}</span>
        </li>`;
    }).join('');
    tocPage = `
      <section class="page toc-page">
        <div class="inner">
          <header class="section-head"><h2>${esc(tocLabel)}</h2></header>
          <ol class="toc-list">${rows}</ol>
        </div>
        ${headerHtml(2)}
      </section>`;
  }

  // --- Content pages ---
  let contentPages = '';
  order.forEach((k, i) => {
    const pageN = contentPageRefs[i];

    // Optional divider page before content
    if (sectionDividers) {
      const dividerPage = pageN - 1;
      contentPages += `
        <section class="page divider-page">
          <div class="divider-inner">
            <div class="divider-num">${String(i + 1).padStart(2, '0')}</div>
            <div class="divider-rule"></div>
            <h2 class="divider-title">${esc(titles[k])}</h2>
            <p class="divider-eyebrow">${esc(lang === 'de' ? 'Kapitel' : 'Chapter')} ${i + 1} / ${order.length}</p>
          </div>
          ${footerText ? `<div class="running-footer">${footerText}</div>` : ''}
          ${pageNumFormat !== 'hidden' ? `<div class="page-num">${esc(pageLabel(pageNumFormat, dividerPage, totalPages, lang))}</div>` : ''}
        </section>`;
    }

    const facts = (input.facts?.[String(k)] || [])
      .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
      .join('');
    const factsBlock = facts ? `<dl class="facts">${facts}</dl>` : '';
    const body = (input.texts[k] || '')
      .split(/\n{2,}/)
      .map((p) => `<p>${esc(p.trim())}</p>`)
      .join('');
    const bodyClass = k === 'appendix' && appendixTwoCol ? 'body body-twocol' : 'body';
    const stripeClass = sectionStripe ? 'has-stripe' : '';

    // Inject finance charts into the Finance section when enabled + data exists
    const chartsBlock = (k === 'finance' && financeCharts)
      ? renderFinanceChartsBlock(input.finance as FinancePayload, accent, currency)
      : '';

    contentPages += `
      <section class="page content-page ${stripeClass}">
        <div class="inner">
          <header class="section-head">
            <span class="section-num">${String(i + 1).padStart(2, '0')}</span>
            <h2>${esc(titles[k])}</h2>
          </header>
          ${factsBlock}
          <div class="${bodyClass}">${body}</div>
          ${chartsBlock}
        </div>
        ${headerHtml(pageN)}
      </section>`;

    if (!sectionDividers && blankBetween && i < order.length - 1) {
      contentPages += `
        <section class="page blank-page">
          <div class="blank-inner"><span class="blank-label">— ${lang === 'de' ? 'Trennseite' : 'Separator'} —</span></div>
          ${headerHtml(pageN + 1)}
        </section>`;
    }
  });

  const watermarkCss = input.watermarked
    ? `.watermark { position: absolute; top: 45%; left: 0; right: 0; text-align: center; font-size: 120pt; color: rgba(210, 63, 63, 0.08); font-weight: 900; transform: rotate(-30deg); z-index: 10; pointer-events: none; letter-spacing: 0.1em; }`
    : `.watermark { display: none; }`;

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${esc(input.title)}</title>
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0b1120; line-height: 1.55; font-size: 11pt; }
  * { box-sizing: border-box; }
  .page { position: relative; width: 210mm; height: 297mm; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .inner { padding: 20mm; height: 100%; position: relative; z-index: 2; }

  /* Cover */
  .cover .inner { display: flex; flex-direction: column; justify-content: flex-start; text-align: center; }
  .cover-eyebrow { font-size: 10pt; letter-spacing: 0.25em; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin: 20mm 0 0; }
  .cover-title { font-size: 38pt; font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: ${accent}; margin: 10mm 0 5mm; }
  .cover-logo { margin: 0 auto 8mm; max-width: 50mm; }
  .cover-logo img { max-width: 100%; max-height: 35mm; object-fit: contain; display: block; margin: 0 auto; }
  .cover-subtitle { font-size: 14pt; color: #374151; font-style: italic; max-width: 70%; margin: 0 auto; line-height: 1.4; }
  .cover-date { font-size: 11pt; color: #6b7280; margin-top: 8mm; }

  /* Cover style: modern */
  .cover-style-modern .cover .inner { text-align: left; }
  .cover-style-modern .cover-title { font-size: 48pt; margin-top: 8mm; }
  .cover-style-modern .cover-subtitle { max-width: 100%; margin: 0; }

  /* Cover style: minimal */
  .cover-style-minimal .cover-title { font-size: 30pt; color: #0b1120; }
  .cover-style-minimal .cover-eyebrow { color: ${accent}; }

  /* Cover style: bold */
  .cover-style-bold .cover { background: linear-gradient(180deg, #fff 55%, ${accent} 55%); }
  .cover-style-bold .cover .inner { text-align: left; padding-top: 35mm; }
  .cover-style-bold .cover-title { font-size: 46pt; color: ${accent}; margin-top: 10mm; }
  .cover-style-bold .cover-subtitle { color: #fff; font-style: normal; font-weight: 500; font-size: 16pt; max-width: 80%; margin: 30mm 0 0; }
  .cover-style-bold .cover-date { color: rgba(255,255,255,0.85); margin-top: 15mm; }
  .cover-style-bold .cover-eyebrow { color: #9ca3af; }

  /* Cover style: editorial */
  .cover-style-editorial .cover::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 18%; background: ${accent}; z-index: 1; }
  .cover-style-editorial .cover .inner { padding-top: 80mm; text-align: left; position: relative; z-index: 3; }
  .cover-style-editorial .cover-eyebrow { color: #fff; position: absolute; top: 15mm; left: 20mm; font-size: 11pt; font-weight: 700; z-index: 4; }
  .cover-style-editorial .cover-title { font-size: 42pt; font-weight: 700; color: #0b1120; font-family: Georgia, 'Times New Roman', serif; }
  .cover-style-editorial .cover-subtitle { font-style: italic; color: #4b5563; border-left: 2pt solid ${accent}; padding-left: 4mm; margin-top: 10mm; max-width: 100%; }

  /* Decorative cover graphics */
  .cover-decor { position: absolute; pointer-events: none; z-index: 1; color: ${accent}; opacity: 0.85; }
  .cover-decor svg { display: block; width: 100%; height: auto; }
  .cover-decor--chart { bottom: 14%; right: 8%; width: 40%; }
  .cover-decor--wave { bottom: 0; left: 0; right: 0; width: 100%; line-height: 0; }
  .cover-decor--geometric { bottom: 10%; right: 8%; width: 28%; opacity: 0.5; }
  .cover-style-bold .cover-decor--wave { opacity: 0.35; }

  /* TOC page */
  .toc-page .section-head h2 { font-size: 26pt; color: ${accent}; }
  .toc-list { list-style: none; margin: 10mm 0 0; padding: 0; display: grid; gap: 6mm; }
  .toc-list li { display: grid; grid-template-columns: 14mm 1fr auto; align-items: baseline; gap: 5mm; font-size: 13pt; padding-bottom: 3mm; border-bottom: 1px dotted #d1d5db; }
  .toc-num { font-weight: 700; color: ${accent}; }
  .toc-title { font-weight: 500; color: #0b1120; }
  .toc-page-ref { color: #6b7280; font-weight: 600; }

  /* Content pages */
  .content-page .inner { display: flex; flex-direction: column; gap: 7mm; }
  .section-head { display: flex; align-items: baseline; gap: 5mm; padding-bottom: 5mm; border-bottom: 1px solid #e5e7eb; }
  .section-num { font-size: 9pt; font-weight: 700; letter-spacing: 0.1em; color: #fff; background: ${accent}; padding: 2mm 4mm; border-radius: 2mm; }
  .section-head h2 { font-size: 20pt; font-weight: 700; margin: 0; color: #0b1120; letter-spacing: -0.01em; }
  .facts { padding: 5mm; background: #fafafb; border-radius: 2mm; font-size: 10pt; margin: 0; }
  .facts > div { display: grid; grid-template-columns: 30% 1fr; gap: 3mm; padding: 1.5mm 0; }
  .facts dt { font-weight: 600; color: #4b5563; margin: 0; }
  .facts dd { margin: 0; color: #0b1120; }
  .body p { font-size: 11pt; line-height: 1.7; text-align: justify; hyphens: auto; margin: 0 0 3mm; }
  .body-twocol { columns: 2; column-gap: 8mm; }

  /* Left accent stripe */
  .content-page.has-stripe::before { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 6mm; background: ${accent}; z-index: 1; }

  /* Running header + page number + footer */
  .running-header { position: absolute; top: 8mm; left: 20mm; right: 20mm; display: flex; align-items: center; gap: 6mm; padding-bottom: 3mm; border-bottom: 1px solid #e5e7eb; font-size: 9pt; color: #6b7280; z-index: 3; }
  .hdr-logo { max-height: 8mm; max-width: 30mm; object-fit: contain; }
  .hdr-title { letter-spacing: 0.05em; font-weight: 500; color: #4b5563; }
  .page-num { position: absolute; bottom: 8mm; right: 20mm; font-size: 9pt; color: #9ca3af; z-index: 3; }
  .running-footer { position: absolute; bottom: 8mm; left: 20mm; right: 60mm; font-size: 8pt; color: #9ca3af; letter-spacing: 0.1em; text-transform: uppercase; z-index: 2; }

  /* Blank separator page */
  .blank-page { display: flex; align-items: center; justify-content: center; }
  .blank-inner { text-align: center; }
  .blank-label { color: #d1d5db; font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; }

  /* Section divider page (full-bleed numeral) */
  .divider-page { display: flex; align-items: center; justify-content: center; background: #fafafa; }
  .divider-inner { text-align: center; padding: 40mm 30mm; width: 100%; max-width: 160mm; }
  .divider-num { font-size: 180pt; line-height: 1; font-weight: 800; color: ${accent}; letter-spacing: -0.05em; font-variant-numeric: tabular-nums; opacity: 0.92; }
  .divider-rule { width: 40mm; height: 2pt; background: ${accent}; margin: 8mm auto 10mm; }
  .divider-title { font-size: 32pt; font-weight: 700; color: #0b1120; letter-spacing: -0.015em; margin: 0; }
  .divider-eyebrow { font-size: 10pt; letter-spacing: 0.2em; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin-top: 8mm; }

  /* Finance charts + KPIs */
  .finance-chart-block { margin-top: 6mm; display: flex; flex-direction: column; gap: 6mm; }
  .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; }
  .kpi { background: #fafafb; border-radius: 2mm; padding: 4mm 5mm; border-left: 3pt solid ${accent}; }
  .kpi-label { display: block; font-size: 8pt; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
  .kpi-value { display: block; font-size: 13pt; font-weight: 700; margin-top: 1mm; }
  .chart-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 2mm; padding: 4mm 5mm; }
  .chart-svg { width: 100%; height: auto; display: block; }

  ${watermarkCss}
</style>
</head>
<body class="cover-style-${coverStyle}">
  ${coverPage}
  ${tocPage}
  ${contentPages}
</body>
</html>`;
}

// Keep a single long-lived Chromium instance and reuse it across requests.
// Launching puppeteer costs ~2s + ~180MB per render; the shared browser cuts
// render latency to sub-second and keeps memory flat under concurrent load.
// New page per render isolates state; browser relaunches on crash.
let browserSingleton: Browser | null = null;
let browserLaunchInFlight: Promise<Browser> | null = null;
let rendersSinceLaunch = 0;
const RELAUNCH_AFTER = 200; // recycle the browser every N renders to fence leaks

async function getBrowser(): Promise<Browser> {
  if (browserSingleton && browserSingleton.connected && rendersSinceLaunch < RELAUNCH_AFTER) {
    return browserSingleton;
  }
  if (browserSingleton) {
    // Recycle: close old instance in the background, don't await
    const old = browserSingleton;
    browserSingleton = null;
    old.close().catch((err) => console.warn('[pdf] close old browser', err));
  }
  if (!browserLaunchInFlight) {
    browserLaunchInFlight = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    }).then((b) => {
      browserSingleton = b;
      rendersSinceLaunch = 0;
      b.on('disconnected', () => {
        if (browserSingleton === b) browserSingleton = null;
      });
      return b;
    }).finally(() => {
      browserLaunchInFlight = null;
    });
  }
  return browserLaunchInFlight;
}

export async function renderPlanPdf(input: RenderInput): Promise<Buffer> {
  const html = buildHtml(input);
  let browser = await getBrowser();
  let page;
  try {
    page = await browser.newPage();
  } catch (err) {
    // Browser died between getBrowser() and newPage(); force relaunch once.
    console.warn('[pdf] newPage failed, relaunching', err);
    browserSingleton = null;
    browser = await getBrowser();
    page = await browser.newPage();
  }
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    rendersSinceLaunch++;
    return Buffer.from(pdf);
  } finally {
    await page.close().catch(() => { /* ignore */ });
  }
}

// Graceful shutdown: close browser on SIGTERM/SIGINT so Docker stops cleanly.
const shutdown = async () => {
  if (browserSingleton) {
    await browserSingleton.close().catch(() => { /* ignore */ });
    browserSingleton = null;
  }
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
