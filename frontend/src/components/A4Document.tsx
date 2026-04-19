import { Fragment, type ReactNode } from 'react';

export interface A4Section {
  key: string;
  title: string;
  body?: string;
  facts?: Array<[string, string]>;
  placeholder?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  date: string;
  sections: A4Section[];
  watermark?: boolean;
  toolbar?: ReactNode;
  compact?: boolean;
  logoDataUrl?: string | null;
  coverStyle?: 'classic' | 'modern' | 'minimal';
  footerText?: string;
  showCoverDate?: boolean;
  showToc?: boolean;
  /** NEW: running header with logo + company name on content pages */
  showHeader?: boolean;
  /** NEW: 'simple' = "1", 'xOfY' = "Seite 1 von 7", 'hidden' = none */
  pageNumFormat?: 'simple' | 'xOfY' | 'hidden';
  /** NEW: insert a blank separator page between sections */
  blankBetween?: boolean;
  /** NEW: render the appendix body in two columns */
  appendixTwoCol?: boolean;
  /** NEW: colored vertical stripe on the left of content pages */
  sectionStripe?: boolean;
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
  footerText,
  showCoverDate = true,
  showToc = true,
  showHeader = false,
  pageNumFormat = 'xOfY',
  blankBetween = false,
  appendixTwoCol = false,
  sectionStripe = true,
}: Props) {
  const classes = ['a4-stack'];
  if (compact) classes.push('is-compact');
  classes.push(`cover-style-${coverStyle}`);
  if (sectionStripe) classes.push('has-stripe');

  // total page count = 1 cover + 1 per section + 1 blank per (section-1) if blankBetween
  const totalPages = 1 + sections.length + (blankBetween ? Math.max(0, sections.length - 1) : 0);

  const Header = () =>
    showHeader ? (
      <div className="a4-running-header">
        {logoDataUrl && <img src={logoDataUrl} alt="" className="a4-header-logo" />}
        <span className="a4-header-title">{title}</span>
      </div>
    ) : null;

  let pageCursor = 2; // cover is 1

  return (
    <div className={classes.join(' ')}>
      {toolbar}

      {/* Cover page */}
      <section className="a4-page a4-cover">
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

          {showToc && (
            <div className="a4-cover-toc">
              <p className="a4-toc-label">Inhalt</p>
              <ol>
                {sections.map((s, i) => (
                  <li key={s.key}>
                    <span className="a4-toc-num">{NUMS[i] || String(i + 1).padStart(2, '0')}</span>
                    <span>{s.title}</span>
                    {s.body && <span className="a4-toc-done">✓</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        {footerText && <div className="a4-running-footer">{footerText}</div>}
        {watermark && <div className="a4-watermark" aria-hidden>VORSCHAU</div>}
        {pageNumFormat !== 'hidden' && (
          <div className="a4-page-num">{pageLabel(pageNumFormat, 1, totalPages)}</div>
        )}
      </section>

      {/* Content pages */}
      {sections.map((section, i) => {
        const isAppendix = section.key === 'appendix';
        const bodyClass = isAppendix && appendixTwoCol ? 'a4-body a4-body-twocol' : 'a4-body';
        const pageN = pageCursor;
        pageCursor++;

        const blankPage = blankBetween && i < sections.length - 1 ? (
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
