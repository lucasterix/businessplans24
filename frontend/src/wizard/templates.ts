/**
 * Pre-filled templates for one-click wizard start. Each template seeds
 * the plan store's `answers` map with realistic starter content for a
 * common business type — user then edits from there instead of empty.
 */

import type { Answers } from '../store/usePlanStore';

export interface Template {
  id: string;
  icon: string;
  name: string;
  description: string;
  answers: Answers;
}

export const TEMPLATES: Template[] = [
  {
    id: 'gastro',
    icon: '☕',
    name: 'Café / Gastronomie',
    description: 'Kaffee, Bäckerei, kleines Bistro — mit typischer Wareneinsatz-Kalkulation',
    answers: {
      idea_core: {
        company_name: 'Mein Café',
        business_model: 'gastro',
        one_liner: 'Ein Tagescafé mit regionalem Kaffee und hausgemachtem Kuchen.',
        products: 'Kaffeespezialitäten (2,80–4,50 €), Kuchen und Gebäck aus eigener Herstellung (3,50–5,50 €), Frühstück (6,50–11,90 €), Tagesgericht mittags (9,50 €).',
        customer_value: 'Qualität, Ruhe und Persönlichkeit — der Ort zum Arbeiten, Lesen oder Verabreden jenseits der Ketten.',
      },
      market: {
        market_size: 'Gastronomie-Umsatz in Deutschland ca. 90 Mrd. € pro Jahr, davon ein wachsender Anteil Spezialitäten-Cafés.',
        competitors: 'Nationale Ketten (Starbucks, Espresso House), Bäckereien mit Sitzplätzen, unabhängige Cafés in der Umgebung.',
        usp: 'Regional gerösteter Kaffee, alle Süßwaren hausgemacht, Co-Working-freundliches Wlan und Tische.',
      },
    },
  },
  {
    id: 'saas',
    icon: '💻',
    name: 'SaaS / Software',
    description: 'Webbasiertes Produkt mit Abonnement-Modell',
    answers: {
      idea_core: {
        company_name: 'Mein SaaS',
        business_model: 'saas',
        one_liner: 'Ein webbasiertes Tool, das Selbstständigen die Buchhaltung erleichtert.',
        products: 'SaaS-Abo: Starter 19 €/Monat (1 Nutzer), Team 49 €/Monat (5 Nutzer), Business 149 €/Monat (unbegrenzt). 14-Tage-Testphase.',
        customer_value: 'Weniger Zeit für Papierkram, keine verpassten Fristen, automatische Belegerkennung per Foto.',
      },
      market: {
        market_size: 'DACH-Markt für Buchhaltungs-Software ca. 2 Mrd. € jährlich, zweistellig wachsend durch digitale Selbstständige.',
        competitors: 'DATEV Unternehmen online, Lexware, sevDesk, Billomat.',
        usp: 'Ausschließlich für Freiberufler und Kleinunternehmer — keine Überfrachtung, klare Oberfläche, niedriger Einstiegspreis.',
      },
    },
  },
  {
    id: 'consulting',
    icon: '🎓',
    name: 'Beratung / Coaching',
    description: 'Einzel- oder Kleinberatung mit Stundensatz',
    answers: {
      idea_core: {
        company_name: 'Meine Beratung',
        business_model: 'consulting',
        one_liner: 'Strategie- und Prozess-Beratung für mittelständische Unternehmen in der Region.',
        products: 'Halbtagesworkshop (1.800 €), Beratungstag (2.500 €), Projekt-Retainer ab 8.000 €/Monat, punktuelle Beratung zum Stundensatz von 150 €.',
        customer_value: 'Externe Perspektive, Best-Practices aus unterschiedlichen Branchen, konkrete Umsetzungsbegleitung statt PowerPoint-Folien.',
      },
      market: {
        market_size: 'Beratungsmarkt in Deutschland ca. 40 Mrd. € p.a., mit starker Nachfrage im Mittelstandssegment unterhalb der Top-Kanzleien.',
        competitors: 'Unabhängige Einzelberater, lokale Beratungsboutiquen, größere Häuser (Struktur Management Partner, Dr. Wieselhuber).',
        usp: 'Kleiner Auftragsradius, persönliche Ansprache, Honorare im unteren Marktviertel bei Top-Qualität.',
      },
    },
  },
  {
    id: 'ecommerce',
    icon: '🛒',
    name: 'Online-Shop / D2C',
    description: 'E-Commerce-Marke mit Versand',
    answers: {
      idea_core: {
        company_name: 'Mein Shop',
        business_model: 'ecommerce',
        one_liner: 'Eine D2C-Marke für nachhaltige Alltagsprodukte mit direkter Beziehung zur Zielgruppe.',
        products: 'Eigenes Produkt-Sortiment 12–89 €, Durchschnittsbestellwert 54 €. Fulfillment über externen 3PL, eigene Marke mit starkem Design.',
        customer_value: 'Hochwertige Produkte ohne Zwischenhandel, transparente Lieferkette, direkter Kontakt zur Marke über Social Media.',
      },
      market: {
        market_size: 'E-Commerce-Markt DACH ca. 100 Mrd. € p.a., D2C-Segment zweistellig wachsend.',
        competitors: 'Amazon, große Retailer, etablierte D2C-Marken der Kategorie.',
        usp: 'Klare Nische, starke Markengeschichte, Kontrolle über das Produkt von Anfang bis Kunde.',
      },
    },
  },
  {
    id: 'handwerk',
    icon: '🔧',
    name: 'Handwerk',
    description: 'Klassisches Handwerk mit Werkstatt oder mobil',
    answers: {
      idea_core: {
        company_name: 'Mein Handwerksbetrieb',
        business_model: 'craft',
        one_liner: 'Ein Handwerksbetrieb mit Fokus auf hochwertige Ausführung und kurze Reaktionszeiten.',
        products: 'Kleinaufträge 300–1.500 €, Sanierungs- und Renovierungsprojekte 3.000–15.000 €, Wartungsverträge mit jährlicher Grundgebühr.',
        customer_value: 'Zuverlässigkeit, saubere Arbeit, verlässliche Termine — Eigenschaften, die im überlasteten Handwerk nicht selbstverständlich sind.',
      },
      market: {
        market_size: 'Handwerk in Deutschland ca. 700 Mrd. € Umsatz, chronischer Fachkräftemangel schafft Nachfrage-Überhang.',
        competitors: 'Etablierte Kollegenbetriebe in der Region, Plattformlösungen (MyHammer, Check24).',
        usp: 'Meisterqualität, transparente Angebote, digitale Kommunikation (schnelle Rückmeldungen, Foto-Dokumentation der Arbeiten).',
      },
    },
  },
];
