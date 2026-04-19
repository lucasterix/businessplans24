import type { ReactNode } from 'react';

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
}

const NUMS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

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
}: Props) {
  const classes = ['a4-stack'];
  if (compact) classes.push('is-compact');
  classes.push(`cover-style-${coverStyle}`);

  return (
    <div className={classes.join(' ')}>
      {toolbar}

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
        <div className="a4-page-num">1</div>
      </section>

      {sections.map((section, i) => (
        <section key={section.key} className="a4-page a4-content">
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
              <div className="a4-body">
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
          <div className="a4-page-num">{i + 2}</div>
        </section>
      ))}
    </div>
  );
}
