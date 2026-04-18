import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanCounter from '../components/PlanCounter';
import TrustRow from '../components/TrustRow';
import Testimonials from '../components/Testimonials';
import FaqHome from '../components/FaqHome';

interface Variant {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  bullets: string[];
}

export const VARIANTS: Record<string, Variant> = {
  gastronomie: {
    slug: 'gastronomie',
    metaTitle: 'Businessplan Gastronomie — Vorlage für Café, Restaurant, Bar | Businessplan24',
    metaDescription:
      'Businessplan für die Gastronomie in 30 Minuten: Standort, Zielgruppe, Personalplanung, Wareneinsatz, Liquiditätsplan. Für Sparkasse, KfW, IHK.',
    h1: 'Businessplan für die Gastronomie — in 30 Minuten',
    lead: 'Café, Restaurant, Bar oder Imbiss: Businessplan24 führt dich durch Standortanalyse, Speisekarten-Kalkulation, Personalstruktur und Gaststättenrecht. Am Ende steht ein Plan, den jede Sparkasse und IHK akzeptiert.',
    bullets: [
      'Spezifische Fragen für Gastronomie: Wareneinsatz-Quote, Öffnungszeiten, Bonhöhe',
      'Liquiditätsplan mit typischer Saisonalität',
      'Risiken automatisch in Worten: Personal, Energie, Gäste-Schwund',
      'KfW-Startgeld und Gründungszuschuss abgedeckt',
    ],
  },
  kfw: {
    slug: 'kfw',
    metaTitle: 'Businessplan für KfW-Startgeld & KfW-ERP — in 30 Minuten | Businessplan24',
    metaDescription:
      'KfW-tauglicher Businessplan für Startgeld, ERP-Gründerkredit und Universell-Darlehen. Gliederung nach KfW-Merkblatt, Finanzplan mit Liquidität und Rentabilität.',
    h1: 'KfW-tauglicher Businessplan — in 30 Minuten',
    lead: 'Die KfW verlangt eine klare Gliederung: Geschäftsidee, Markt, Finanzen, Kapitalbedarf. Businessplan24 folgt exakt diesem Schema. Deine Hausbank reicht den Antrag ein — du lieferst das Papier.',
    bullets: [
      'Gliederung nach KfW-Merkblatt (Startgeld bis 125.000 €)',
      'Kapitalbedarfsplan, Umsatzvorschau, Liquiditätsplan',
      'Finanzierungsstruktur mit Eigenkapital, Darlehen, Förderung',
      'Rentabilitätsrechnung über 3 Jahre',
    ],
  },
  arbeitsagentur: {
    slug: 'arbeitsagentur',
    metaTitle: 'Businessplan für den Gründungszuschuss der Arbeitsagentur | Businessplan24',
    metaDescription:
      'Businessplan für den Gründungszuschuss nach § 93 SGB III. Vollständige Tragfähigkeitsbescheinigung-geeignete Gliederung, Finanzplan und Lebenslauf-Struktur.',
    h1: 'Gründungszuschuss-Businessplan — für die Arbeitsagentur',
    lead: 'Wer Arbeitslosengeld I bezieht, kann beim Wechsel in die Selbstständigkeit den Gründungszuschuss beantragen. Businessplan24 erstellt den Plan in der Form, die deine Berater:in und die Fachkundige Stelle erwarten.',
    bullets: [
      'Gliederung gemäß § 93 SGB III',
      'Finanzplan passend zur Tragfähigkeitsbescheinigung',
      'Automatisch Lebenslauf-Abschnitt für Gründer:innen',
      'Kleingewerbe, Freiberuflichkeit und GmbH abgedeckt',
    ],
  },
  ecommerce: {
    slug: 'ecommerce',
    metaTitle: 'Businessplan E-Commerce & Online-Shop in 30 Minuten | Businessplan24',
    metaDescription:
      'Businessplan für Online-Shops, Amazon FBA und D2C-Marken. CAC, LTV, Lagerhaltung, Fulfillment und Marketing-Mix automatisch strukturiert.',
    h1: 'Businessplan für E-Commerce — in 30 Minuten',
    lead: 'Online-Shop, Amazon-FBA oder D2C-Marke: Businessplan24 bringt die KPIs, die Banken und Investoren sehen wollen — CAC, LTV, Retourenquote, Lagerbindung — in eine klare Story.',
    bullets: [
      'Spezifische Kennzahlen: CAC, LTV, Retourenquote, Contribution Margin',
      'Marketing-Mix: SEO, Meta-Ads, Influencer, Google-Shopping',
      'Lieferantenstruktur, Fulfillment-Optionen, Lager-Kapitalbindung',
      'Rentabilität inkl. Werbebudget und Skalierung',
    ],
  },
  beratung: {
    slug: 'beratung',
    metaTitle: 'Businessplan für Beratung, Coaching & Dienstleistung | Businessplan24',
    metaDescription:
      'Businessplan für Beratung, Coaching, Agenturen und Dienstleister: Stundensätze, Auslastung, Akquise-Strategie, Skalierung.',
    h1: 'Businessplan für Beratung & Coaching — in 30 Minuten',
    lead: 'Als Berater:in, Coach oder Agentur-Gründer:in ist der Plan einfacher als man denkt — wenn die richtigen Fragen gestellt werden. Businessplan24 führt dich durch Positionierung, Stundensätze, Auslastungsplanung und Akquise.',
    bullets: [
      'Stundensatz-Kalkulation mit Auslastungsszenarien',
      'Akquise-Strategie: Content, Netzwerk, Partnerschaften',
      'Skalierung: vom Einzelkämpfer zur Agentur',
      'Einzelunternehmen, Freiberuflichkeit und GmbH abgedeckt',
    ],
  },
};

interface Props {
  variantKey: string;
}

export default function SeoLanding({ variantKey }: Props) {
  const v = VARIANTS[variantKey];

  useEffect(() => {
    if (!v) return;
    document.title = v.metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', v.metaDescription);
  }, [v]);

  if (!v) return null;

  return (
    <div>
      <section className="home-hero">
        <div className="home-hero-badge">Speziell für {v.h1.split('—')[0].trim()}</div>
        <h1>{v.h1}</h1>
        <p>{v.lead}</p>
        <PlanCounter />
        <TrustRow />
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-lg">Jetzt starten — kostenlos</Link>
          <Link to="/beispiel" className="btn btn-ghost btn-lg">Beispiel ansehen</Link>
        </div>
      </section>

      <section className="seo-bullets">
        <h2>Was du bekommst</h2>
        <ul>
          {v.bullets.map((b) => (
            <li key={b}>✓ {b}</li>
          ))}
        </ul>
      </section>

      <div className="home-shell">
        <Testimonials />
        <FaqHome />

        <section className="home-final-cta">
          <h2>Bereit anzufangen?</h2>
          <p className="muted">In 30 Minuten hast du den Plan. Keine Abo-Falle.</p>
          <div className="home-final-ctas">
            <Link to="/" className="btn btn-primary btn-lg">Plan jetzt starten</Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">Preise ansehen</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
