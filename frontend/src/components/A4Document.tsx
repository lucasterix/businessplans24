import { Fragment, type ReactNode } from 'react';

export interface A4Section {
  key: string;
  title: string;
  body?: string;
  facts?: Array<[string, string]>;
  placeholder?: string;
}

type CoverStyleProp = 'classic' | 'modern' | 'minimal' | 'bold' | 'editorial';
type CoverDecorProp = 'none' | 'chart' | 'wave' | 'geometric';

interface Props {
  title: string;
  subtitle?: string;
  date: string;
  sections: A4Section[];
  watermark?: boolean;
  toolbar?: ReactNode;
  compact?: boolean;
  logoDataUrl?: string | null;
  coverStyle?: CoverStyleProp;
  coverDecor?: CoverDecorProp;
  footerText?: string;
  showCoverDate?: boolean;
  showToc?: boolean;
  showHeader?: boolean;
  pageNumFormat?: 'simple' | 'xOfY' | 'hidden';
  blankBetween?: boolean;
  appendixTwoCol?: boolean;
  sectionStripe?: boolean;
  sectionDividers?: boolean;
  financeCharts?: boolean;
}

const NUMS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

function pageLabel(format: 'simple' | 'xOfY' | 'hidden' | undefined, n: number, total: number): string {
  if (format === 'hidden') return '';
  if (format === 'xOfY') return `Seite ${n} von ${total}`;
  return String(n);
}

export default function A4Document({
  title,
  subtitle,
  date,
  sections,
  watermark,
  toolbar,
  compact,
  logoDataUrl,
  coverStyle = 'classic',
  coverDecor = 'chart',
  footerText,
  showCoverDate = true,
  showToc = true,
  showHeader = false,
  pageNumFormat = 'xOfY',
  blankBetween = false,
  appendixTwoCol = false,
  sectionStripe = true,
  sectionDividers = false,
  financeCharts = true,
}: Props) {
  const classes = ['a4-stack'];
  if (compact) classes.push('is-compact');
  classes.push(`cover-style-${coverStyle}`);
  if (sectionStripe) classes.push('has-stripe');

  // 1 cover + optional TOC + per section: [optional divider, content] + optional blank
  const tocPages = showToc ? 1 : 0;
  const dividersActive = sectionDividers;
  const dividerPages = dividersActive ? sections.length : 0;
  const blanks = !dividersActive && blankBetween ? Math.max(0, sections.length - 1) : 0;
  const totalPages = 1 + tocPages + dividerPages + sections.length + blanks;

  const Header = () =>
    showHeader ? (
      <div className="a4-running-header">
        {logoDataUrl && <img src={logoDataUrl} alt="" className="a4-header-logo" />}
        <span className="a4-header-title">{title}</span>
      </div>
    ) : null;

  let pageCursor = 2 + tocPages; // cover is 1, optional TOC is 2

  const decorSvg = (
    <div className={`a4-cover-decor a4-cover-decor--${coverDecor}`} aria-hidden>
      {coverDecor === 'chart' && (
        <svg viewBox="0 0 500 260" preserveAspectRatio="xMidYEnd meet">
          <g fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="40" y="180" width="40" height="60" fill="currentColor" opacity="0.25" stroke="none" />
            <rect x="100" y="150" width="40" height="90" fill="currentColor" opacity="0.4" stroke="none" />
            <rect x="160" y="115" width="40" height="125" fill="currentColor" opacity="0.55" stroke="none" />
            <rect x="220" y="80" width="40" height="160" fill="currentColor" opacity="0.7" stroke="none" />
            <rect x="280" y="40" width="40" height="200" fill="currentColor" opacity="0.9" stroke="none" />
            <path d="M60 170 L120 130 L180 95 L240 60 L300 25 L370 10" strokeLinecap="round" />
            <path d="M370 10 L360 30 M370 10 L345 18" strokeLinecap="round" />
          </g>
        </svg>
      )}
      {coverDecor === 'wave' && (
        <svg viewBox="0 0 500 180" preserveAspectRatio="none">
          <path d="M0,90 C120,40 220,140 350,80 C420,50 480,100 500,90 L500,180 L0,180 Z"
                fill="currentColor" opacity="0.15" />
          <path d="M0,120 C130,70 240,170 360,100 C430,70 480,130 500,120 L500,180 L0,180 Z"
                fill="currentColor" opacity="0.3" />
        </svg>
      )}
      {coverDecor === 'geometric' && (
        <svg viewBox="0 0 400 400">
          <g fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="200" cy="200" r="180" opacity="0.2" />
            <circle cx="200" cy="200" r="140" opacity="0.3" />
            <circle cx="200" cy="200" r="100" opacity="0.4" />
            <line x1="20" y1="200" x2="380" y2="200" opacity="0.25" />
            <line x1="200" y1="20" x2="200" y2="380" opacity="0.25" />
            <circle cx="200" cy="200" r="6" fill="currentColor" stroke="none" opacity="0.6" />
          </g>
        </svg>
      )}
    </div>
  );

  return (
    <div className={classes.join(' ')}>
      {toolbar}

      {/* Cover page */}
      <section className="a4-page a4-cover">
        {decorSvg}
        <div className="a4-inner">
          <div className="a4-cover-head">
            {logoDataUrl && (
              <div className="a4-cover-logo">
                <img src={logoDataUrl} alt="Logo" />
              </div>
            )}
            <p className="a4-eyebrow">Businessplan</p>
            <h1 className="a4-cover-title">{title}</h1>
            {subtitle && <p className="a4-cover-subtitle">{subtitle}</p>}
            {showCoverDate && <p className="a4-cover-date">{date}</p>}
          </div>
        </div>
        {footerText && <div className="a4-running-footer">{footerText}</div>}
        {watermark && <div className="a4-watermark" aria-hidden>VORSCHAU</div>}
        {pageNumFormat !== 'hidden' && (
          <div className="a4-page-num">{pageLabel(pageNumFormat, 1, totalPages)}</div>
        )}
      </section>

      {/* Dedicated TOC page */}
      {showToc && (
        <section className="a4-page a4-toc-page">
          <Header />
          <div className="a4-inner">
            <header className="a4-section-head">
              <h2>Inhaltsverzeichnis</h2>
            </header>
            <ol className="a4-toc-list">
              {sections.map((s, i) => (
                <li key={s.key}>
                  <span className="a4-toc-num">{NUMS[i] || String(i + 1).padStart(2, '0')}</span>
                  <span className="a4-toc-title">{s.title}</span>
                  <span className="a4-toc-dots" aria-hidden />
                  <span className="a4-toc-page-ref">
                    {1 + tocPages + (i * (blankBetween ? 2 : 1)) + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {footerText && <div className="a4-running-footer">{footerText}</div>}
          {watermark && <div className="a4-watermark" aria-hidden>VORSCHAU</div>}
          {pageNumFormat !== 'hidden' && (
            <div className="a4-page-num">{pageLabel(pageNumFormat, 2, totalPages)}</div>
          )}
        </section>
      )}

      {/* Content pages */}
      {sections.map((section, i) => {
        const isAppendix = section.key === 'appendix';
        const isFinance = section.key === 'finance';
        const bodyClass = isAppendix && appendixTwoCol ? 'a4-body a4-body-twocol' : 'a4-body';

        // Divider page sits before the content page when enabled
        const dividerPage = dividersActive ? (
          <section className="a4-page a4-divider">
            <div className="a4-divider-inner">
              <div className="a4-divider-num">{NUMS[i] || String(i + 1).padStart(2, '0')}</div>
              <div className="a4-divider-rule" />
              <h2 className="a4-divider-title">{section.title}</h2>
              <p className="a4-divider-eyebrow">Kapitel {i + 1} / {sections.length}</p>
            </div>
            {footerText && <div className="a4-running-footer">{footerText}</div>}
            {pageNumFormat !== 'hidden' && (
              <div className="a4-page-num">{pageLabel(pageNumFormat, pageCursor, totalPages)}</div>
            )}
          </section>
        ) : null;
        if (dividerPage) pageCursor++;

        const pageN = pageCursor;
        pageCursor++;

        const blankPage = !dividersActive && blankBetween && i < sections.length - 1 ? (
          <section className="a4-page a4-blank">
            <div className="a4-blank-inner">
              <span className="a4-blank-label">— Trennseite —</span>
            </div>
            {pageNumFormat !== 'hidden' && (
              <div className="a4-page-num">{pageLabel(pageNumFormat, pageCursor, totalPages)}</div>
            )}
          </section>
        ) : null;
        if (blankPage) pageCursor++;

        return (
          <Fragment key={section.key}>
            {dividerPage}
            <section className="a4-page a4-content">
              <Header />
              <div className="a4-inner">
                <header className="a4-section-head">
                  <span className="a4-section-num">{NUMS[i] || String(i + 1).padStart(2, '0')}</span>
                  <h2>{section.title}</h2>
                </header>

                {section.facts && section.facts.length > 0 && (
                  <dl className="a4-facts">
                    {section.facts.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.body ? (
                  <div className={bodyClass}>
                    {section.body.split(/\n{2,}/).map((para, idx) => (
                      <p key={idx}>{para.trim()}</p>
                    ))}
                  </div>
                ) : (
                  <p className="a4-placeholder">
                    {section.placeholder || 'Dieser Abschnitt wird im Wizard ausgefüllt.'}
                  </p>
                )}

                {isFinance && financeCharts && (
                  <div className="a4-charts-hint">
                    <span>📊 Finanz-Charts (Umsatz, Liquidität) erscheinen im PDF-Export</span>
                  </div>
                )}
              </div>
              {footerText && <div className="a4-running-footer">{footerText}</div>}
              {watermark && <div className="a4-watermark" aria-hidden>VORSCHAU</div>}
              {pageNumFormat !== 'hidden' && (
                <div className="a4-page-num">{pageLabel(pageNumFormat, pageN, totalPages)}</div>
              )}
            </section>
            {blankPage}
          </Fragment>
        );
      })}
    </div>
  );
}
