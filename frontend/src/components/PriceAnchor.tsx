import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExitIntent } from '../store/useExitIntent';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

interface Row {
  label: string;
  badge?: string;
  price: string;
  time: string;
  quality: string;
  highlight?: boolean;
}

const ROWS: Row[] = [
  {
    label: 'Unternehmensberatung',
    price: '1.200 – 2.500 €',
    time: '3 – 5 Wochen',
    quality: 'Individuell, aber abhängig vom Berater',
  },
  {
    label: 'MBA-Businessplan-Kurs',
    price: '400 – 800 €',
    time: '2 – 4 Wochen',
    quality: 'Theorie-lastig, wenig bank-tauglich',
  },
  {
    label: 'Excel-Vorlage + Selbststudium',
    price: '0 – 30 €',
    time: 'Wochenende bis Monate',
    quality: 'Nur so gut wie deine Recherche',
  },
  {
    label: 'Leer auf Berater warten',
    price: '≈ 0 €',
    time: 'endlos',
    quality: 'Gründung verzögert, Chance verpasst',
  },
  {
    label: 'Businessplan24',
    badge: 'Empfehlung',
    price: '49 €',
    time: '30 Minuten',
    quality: 'Geprüft von Steuerberatern & Wirtschaftsprüfern',
    highlight: true,
  },
];

export default function PriceAnchor() {
  const { t } = useTranslation();
  const loc = useLocalizedPath();
  const arm = useExitIntent((s) => s.arm);
  const ref = useRef<HTMLElement>(null);

  // Arm the exit-intent popup only once the user has seen the price
  // comparison. Before that, the offer has no meaning.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          arm();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [arm]);

  return (
    <section className="anchor-section" ref={ref}>
      <div className="anchor-eyebrow">Preisvergleich</div>
      <h2>Was kostet ein Businessplan sonst?</h2>
      <p className="muted anchor-sub">
        Damit du einschätzen kannst, was unsere <strong>49 €</strong> wirklich bedeuten.
      </p>

      <div className="anchor-table anchor-table-modern">
        <div className="anchor-row anchor-row-head">
          <div>Option</div>
          <div>Preis</div>
          <div>Zeit</div>
          <div>Qualität</div>
        </div>
        {ROWS.map((r) => (
          <div key={r.label} className={`anchor-row ${r.highlight ? 'is-highlight' : ''}`}>
            <div className="anchor-label">
              {r.label}
              {r.badge && <span className="anchor-badge">{r.badge}</span>}
            </div>
            <div className={`anchor-price ${r.highlight ? 'anchor-price-win' : ''}`}>{r.price}</div>
            <div className="anchor-time">{r.time}</div>
            <div className="anchor-quality">{r.quality}</div>
          </div>
        ))}
      </div>

      <div className="anchor-savings-callout">
        <div>
          <span className="anchor-saving-headline">Ersparnis gegenüber Beratung:</span>
          <span className="anchor-saving-amount">≈ 1.150 – 2.450 €</span>
        </div>
        <div>
          <span className="anchor-saving-headline">Zeitersparnis:</span>
          <span className="anchor-saving-amount">2 – 5 Wochen</span>
        </div>
      </div>

      <div className="anchor-ctas">
        <Link to={loc('')} className="btn btn-primary btn-lg">Jetzt für 49 € starten</Link>
        <Link to={loc('pricing')} className="btn btn-ghost btn-lg">{t('landing.cta_pricing')}</Link>
      </div>
    </section>
  );
}
