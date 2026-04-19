// Realistic starter answers per business model. Applied on business_model
// select; only fills fields that are still empty so it never overwrites
// user input. Numbers are deliberately conservative mid-market estimates
// based on IHK/KfW benchmarks so they survive a bank's plausibility check.

import type { Period } from '../types';

export interface ModelDefaults {
  stepAnswers: Record<string, Record<string, unknown>>;
  finance: { startingCash: number; periods: Period[] };
}

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'];
const period = (label: string, revenue: number, costs: number, cashIn: number, cashOut: number): Period =>
  ({ label, revenue, costs, cashIn, cashOut });

/** Small helper: ramp revenue over the 6-month window to look realistic (growing business). */
function ramp(start: number, end: number, costs: number): Period[] {
  return MONTHS.map((m, i) => {
    const rev = Math.round(start + (end - start) * (i / 5));
    const cost = Math.round(costs * (0.95 + i * 0.015));
    return period(m, rev, cost, Math.round(rev * 0.92), Math.round(cost * 0.98));
  });
}

const GENERIC: ModelDefaults = {
  stepAnswers: {
    idea_core: {
      one_liner: 'Wir helfen unseren Kund:innen, [Problem] einfacher zu lösen.',
      products: 'Hauptleistung mit Preispunkt XX €, ergänzende Leistungen YY € und ZZ €.',
      customer_value: 'Spürbare Zeit- oder Kostenersparnis, höhere Qualität oder besserer Zugang als bisherige Alternativen.',
    },
    market: {
      market_size: 'Regionales Zielmarktsegment mit geschätzt mehreren tausend potenziellen Kund:innen pro Jahr.',
      competitors: 'Lokale Anbieter und überregionale Ketten; wir differenzieren uns durch Service, Nähe und Spezialisierung.',
      usp: 'Kombination aus persönlicher Beratung, fairen Preisen und spürbar besserer Qualität.',
    },
    target_group: {
      target_type: ['b2c_private'],
      target_description: 'Privat- und Geschäftskund:innen im Alter von 25–55 Jahren mit mittlerem Einkommen, die Qualität und Service schätzen.',
    },
    channels: { channels: ['web', 'direct', 'social'], retention: 'Regelmäßige Kommunikation, zufriedene Kund:innen empfehlen uns weiter.' },
    founders: { founders: 'Einzelgründer:in mit mehrjähriger Branchenerfahrung und kaufmännischem Hintergrund.', employees: 'Start mit einer Vollzeitkraft, ab Jahr 2 eine weitere Stelle geplant.', partners: 'Stammlieferanten, Steuerberatung, IT-Dienstleister.' },
    location_legal: { location: 'Mittelgroße Stadt mit guter ÖPNV-Anbindung.', legal_form: 'einzelunternehmen', risks: 'Konjunkturabhängigkeit, Personalgewinnung, steigende Energiekosten — adressiert durch flexible Kostenstruktur und Rücklagenbildung.' },
    capital: { capital_need: 35000, equity: 10000, financing: ['equity', 'bank_loan'], private_need: 2200 },
  },
  finance: { startingCash: 10000, periods: ramp(6000, 18000, 5500) },
};

const MODEL_DEFAULTS: Record<string, ModelDefaults> = {
  gastro: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Regional-saisonale Küche in zentraler Innenstadtlage.',
        products: 'Mittagstisch (12–18 €), Abendkarte à la carte (16–28 €), Getränke, sonntags Brunch, Catering auf Anfrage.',
        customer_value: 'Frisch zubereitete Gerichte aus regionalen Zutaten, schneller Mittagsservice, angenehmes Ambiente.',
      },
      market: {
        market_size: 'Gastro-Umsatz in Deutschland ca. 95 Mrd. €/Jahr, lokal mehrere tausend potenzielle Stammgäste im Einzugsgebiet von 3 km.',
        competitors: 'Umliegende Restaurants, Kantinen und Lieferdienste; Differenzierung durch Qualität der Zutaten und persönliche Atmosphäre.',
        usp: 'Wochenwechselnde Karte mit Zutaten von 5 regionalen Partnerbetrieben, unter 15 Min. Servicezeit beim Mittagstisch.',
      },
      target_group: { target_type: ['b2c_private', 'b2b_small'], target_description: 'Büroangestellte (30–55 J.) aus dem Stadtzentrum für Mittagstisch sowie Anwohner:innen aus dem direkten Umfeld für Abend und Wochenende.' },
      channels: { channels: ['store', 'social', 'web'], retention: 'Treueprogramm (10. Mittagessen gratis), monatlicher Newsletter mit Wochenkarte, Instagram-Präsenz.' },
      founders: { founders: 'Inhaber:in mit Kochausbildung und 8 Jahren Küchenleitung in der gehobenen Gastronomie.', employees: 'Start: 1 Koch/Köchin, 2 Servicekräfte (TZ), 1 Küchenhilfe. Nach 6 Monaten +1 Servicekraft.', partners: '5 regionale Erzeuger für Fleisch/Gemüse, 1 Getränkelieferant, Steuerkanzlei.' },
      location_legal: { location: 'Erdgeschoss-Ladenlokal, ca. 120 m² mit 45 Sitzplätzen, fußläufige Innenstadtlage.', legal_form: 'gmbh', regulations: 'Gaststättenkonzession, HACCP-Hygienekonzept, Gewerbeanmeldung, IHK-Sachkundenachweis, Brandschutzkonzept.', risks: 'Saisonale Schwankungen, steigende Wareneinsätze, Personalmangel — adressiert durch schlanke Karte, feste Lieferverträge und attraktive Arbeitsbedingungen.' },
      capital: { capital_need: 85000, equity: 25000, financing: ['equity', 'kfw', 'bank_loan'], private_need: 2800 },
    },
    finance: { startingCash: 30000, periods: ramp(18000, 42000, 22000) },
  },

  cafe: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Spezialitäten-Café mit eigener Röstung und Frühstücks-Konzept.',
        products: 'Spezialitätenkaffee (3,50–5,50 €), Frühstück (8–14 €), hausgemachte Kuchen (4–6 €), Kaffeebohnen zum Mitnehmen (12–28 €/250g).',
        customer_value: 'Qualität weit über Ketten-Niveau, ruhige Arbeitsatmosphäre mit WLAN, persönliche Beratung.',
      },
      target_group: { target_type: ['b2c_private'], target_description: 'Kaffee-Enthusiast:innen 25–45 J., Freelancer:innen und Studierende für Arbeitsumfeld, Anwohner:innen für Wochenend-Frühstück.' },
      channels: { channels: ['store', 'social', 'marketplace'], retention: 'Stempelkarte (10 + 1 gratis), Wochenend-Frühstücksreservierungen, Cupping-Events monatlich.' },
      founders: { founders: 'SCA-zertifizierter Barista mit 6 Jahren Erfahrung.', employees: '2 Baristi Teilzeit, 1 Servicekraft am Wochenende.', partners: 'Direkter Importeur aus Kolumbien/Äthiopien, lokale Bäckerei.' },
      location_legal: { location: '70–90 m², ruhige Seitenstraße mit Laufkundschaft, Außenbestuhlung möglich.', legal_form: 'ug', regulations: 'Gaststättenkonzession, HACCP, Gewerbeanmeldung.', risks: 'Abhängigkeit von Kaffeepreisen am Weltmarkt — gemildert durch kleine Lagerhaltung + mehrere Importquellen.' },
      capital: { capital_need: 55000, equity: 18000, financing: ['equity', 'bank_loan'], private_need: 2400 },
    },
    finance: { startingCash: 20000, periods: ramp(9000, 22000, 11500) },
  },

  retail: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Konzept-Store mit kuratiertem Sortiment für anspruchsvolle Privatkund:innen.',
        products: 'Kernsortiment aus 4 Produktkategorien (Preisspanne 15–250 €), ergänzt um exklusive Eigenkollektion und saisonale Specials.',
        customer_value: 'Sorgfältige Produktauswahl, persönliche Beratung, lokale und nachhaltige Marken.',
      },
      target_group: { target_type: ['b2c_private'], target_description: 'Qualitätsbewusste Kund:innen 30–60 J. mit mittlerem bis hohem Einkommen, wohnhaft im 10-km-Radius.' },
      channels: { channels: ['store', 'web', 'social'], retention: 'Kundenkarte mit Geburtstags-Rabatt, exklusive Preview-Events für Stammkund:innen.' },
      founders: { founders: 'Einzelhandelserfahrung von 10 Jahren im Filialmanagement, kaufmännische Ausbildung.', employees: '1 Verkäufer:in Vollzeit, Aushilfen nach Bedarf.', partners: '15 Marken im Kernsortiment, lokale Werbeagentur.' },
      location_legal: { location: '60–100 m² in 1B-Lage der Innenstadt oder hochwertiger Stadtteillage.', legal_form: 'einzelunternehmen', regulations: 'Gewerbeanmeldung, ggf. Handelsregister.', risks: 'Einzelhandelsrückgang durch E-Commerce — adressiert durch hybriden Store + Online-Shop und einzigartige Beratung.' },
      capital: { capital_need: 65000, equity: 20000, financing: ['equity', 'bank_loan'], private_need: 2600 },
    },
    finance: { startingCash: 25000, periods: ramp(12000, 30000, 16000) },
  },

  ecommerce: {
    stepAnswers: {
      idea_core: {
        one_liner: 'D2C-Marke mit fokussiertem Sortiment und starker Marken-Identität.',
        products: 'Produktlinie mit 6–12 SKUs, Preispunkte 25–120 €, Abo-Option für Verbrauchsprodukte.',
        customer_value: 'Kuratiertes Sortiment, transparente Herkunft, bessere Unit Economics als Marktplatz-Anbieter durch Direktvertrieb.',
      },
      target_group: { target_type: ['b2c_private'], target_description: 'Digital-affine Kund:innen 25–45 J. in DACH, die Marken-Storytelling und Qualität schätzen (LTV-Ziel: >180 €).' },
      channels: { channels: ['web', 'social', 'marketplace'], retention: 'E-Mail-Marketing (Klaviyo), Abo-Rabatt 10 %, Loyalty-Programm ab 3. Bestellung.' },
      founders: { founders: 'Gründer:in mit 5 Jahren E-Commerce-Erfahrung bei etablierter D2C-Marke.', employees: 'Ab Monat 6: 1 Customer-Service (TZ), ab Jahr 2: Marketing-Lead.', partners: 'Fulfillment-Dienstleister (pro Paket), Shopify-Agentur, Produktionspartner in Portugal/Deutschland.' },
      location_legal: { location: 'Homeoffice in Jahr 1, ab Jahr 2 kleines Büro (40 m²).', legal_form: 'ug', regulations: 'Impressumspflicht, DSGVO-Konformität, Verpackungsregister LUCID, ggf. Lebensmittel-/Kosmetik-Zulassungen.', risks: 'Plattform-Abhängigkeit (Meta Ads, Google), steigende CACs — adressiert durch E-Mail-Liste, SEO und Content-Marketing.' },
      capital: { capital_need: 45000, equity: 15000, financing: ['equity', 'investor'], private_need: 2200 },
    },
    finance: { startingCash: 18000, periods: ramp(4000, 26000, 4500) },
  },

  saas: {
    stepAnswers: {
      idea_core: {
        one_liner: 'B2B-SaaS-Lösung, die [Zielbranche] eine wiederkehrende Arbeit um 60 % verkürzt.',
        products: 'Starter-Plan 29 €/Monat (1 User), Team 79 €/Monat (5 User), Business 249 €/Monat (unbegrenzt + SSO).',
        customer_value: 'Zeitersparnis messbar in Stunden/Woche, Integration in bestehende Workflows, transparente Preisgestaltung ohne Setup-Kosten.',
      },
      target_group: { target_type: ['b2b_small', 'b2b_mid'], target_description: 'Kleine und mittlere Unternehmen mit 5–200 Mitarbeitenden, die wiederkehrende manuelle Prozesse haben.' },
      channels: { channels: ['web', 'partners', 'social'], retention: 'Product-led Growth, monatliche Product-Updates, dedizierter Customer-Success ab Team-Tier.' },
      founders: { founders: 'Technische:r Gründer:in (CTO) mit 8 Jahren SaaS-Engineering, Co-Founder:in (CEO) mit Vertriebserfahrung B2B.', employees: 'Ab Monat 4: 1 Full-Stack Developer. Ab Jahr 2: Customer Success + Marketer.', partners: 'Hosting (Hetzner), Stripe für Billing, Zapier-Integration.' },
      location_legal: { location: 'Remote-First-Team, kleines Büro in Tech-Hub als Option.', legal_form: 'gmbh', regulations: 'DSGVO, SOC2-Type-II ab Enterprise-Kund:innen geplant.', risks: 'Fachkräftemangel, lange Sales-Zyklen bei Enterprise — adressiert durch Self-Serve-Tier und Partner-Channel.' },
      capital: { capital_need: 120000, equity: 40000, financing: ['equity', 'investor', 'grant'], private_need: 3200 },
    },
    finance: { startingCash: 60000, periods: ramp(2000, 15000, 2000) },
  },

  taxi: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Zuverlässiger Taxi- und Fahrdienst mit Fokus auf Flughafentransfers und Krankenfahrten.',
        products: 'Taxifahrten im Stadtgebiet (Taxameter), Flughafentransfer-Festpreis (75–140 €), Krankenfahrten (Abrechnung mit Krankenkassen), Kurierfahrten.',
        customer_value: 'Pünktlich, barrierefrei nutzbar, 24/7 erreichbar, bargeldlos bezahlbar, vertragliche Kooperation mit örtlichen Pflegediensten.',
      },
      target_group: { target_type: ['b2c_private', 'b2b_small', 'public'], target_description: 'Stadt-/Landkreisbevölkerung, Flughafen-Reisende, Krankenkassen/Pflegedienste für genehmigte Krankenfahrten.' },
      channels: { channels: ['direct', 'partners', 'web'], retention: 'Stammkund:innen-App mit 1-Klick-Bestellung, Rahmenverträge mit 3 Pflegediensten.' },
      founders: { founders: 'Inhaber:in mit Personenbeförderungsschein, IHK-Fachkundenachweis, 6 Jahren Fahrpraxis.', employees: 'Start: Inhaber:in + 1 Festangestellte:r Fahrer:in. Ab Monat 6: +1 weitere:r Fahrer:in (Schicht).', partners: 'Taxi-Funkzentrale, Werkstatt, Krankenkassen für Rahmenverträge.' },
      location_legal: { location: 'Städtisches Einzugsgebiet mit Flughafen im 50-km-Radius, Standplatzkonzession benötigt.', legal_form: 'einzelunternehmen', regulations: 'Konzession nach Personenbeförderungsgesetz, Fachkundeprüfung IHK, P-Schein, Hauptuntersuchung im Halbjahresrhythmus.', risks: 'Konkurrenz durch Uber/Bolt, steigende Kraftstoffpreise — adressiert durch Krankenfahrten als stabiles Standbein.' },
      capital: { capital_need: 45000, equity: 10000, financing: ['equity', 'bank_loan'], private_need: 2400 },
    },
    finance: { startingCash: 12000, periods: ramp(8000, 16000, 8500) },
  },

  care: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Ambulanter Pflegedienst mit Fokus auf Grundpflege und Behandlungspflege im Stadtgebiet.',
        products: 'Grundpflege (SGB XI), Behandlungspflege (SGB V), Hauswirtschaft, Beratungsbesuche §37.3, 24h-Betreuung auf Anfrage.',
        customer_value: 'Zuverlässige Bezugspflege, feste Teams pro Tour, lückenlose Dokumentation, enge Abstimmung mit Hausärzt:innen.',
      },
      target_group: { target_type: ['b2c_private', 'public'], target_description: 'Pflegebedürftige Personen ab 65 J., pflegende Angehörige, Kranken- und Pflegekassen (AOK, TK, Barmer).' },
      channels: { channels: ['direct', 'partners'], retention: 'Rahmenverträge mit Krankenkassen, Empfehlungen durch Hausärzt:innen, jährliche Qualitätsprüfung MDK.' },
      founders: { founders: 'Pflegedienstleitung mit examinierter Pflegefachausbildung + PDL-Weiterbildung (460 Std.).', employees: 'Start: PDL + 3 Pflegefachkräfte + 2 Pflegehelfer:innen. Ab Monat 6: +2 Pflegefachkräfte.', partners: 'Versorgungsverträge mit gesetzlichen Krankenkassen, 2 Hausarztpraxen im Einzugsgebiet.' },
      location_legal: { location: 'Pflegedienstbüro 40–60 m² mit Schulungsraum und Dienstwagenparkplätzen.', legal_form: 'gmbh', regulations: 'Versorgungsvertrag §72 SGB XI, PDL-Nachweis, Qualitätsmanagement nach §113 SGB XI, MDK-Prüfungen.', risks: 'Fachkräftemangel, steigende Dokumentationspflichten — adressiert durch digitale Pflegedokumentation und attraktive Gehälter über Tarif.' },
      capital: { capital_need: 75000, equity: 20000, financing: ['equity', 'bank_loan', 'kfw'], private_need: 2800 },
    },
    finance: { startingCash: 28000, periods: ramp(25000, 68000, 26000) },
  },

  beauty: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Friseursalon mit Fokus auf moderne Damen- und Herren-Schnitte.',
        products: 'Damen-Schnitt (55–85 €), Herren-Schnitt (28–38 €), Färben/Strähnen (75–140 €), Hochsteckfrisur, Pflegeprodukte-Verkauf.',
        customer_value: 'Persönliche Beratung, hochwertige Haarpflegemarken, zeitgemäßes Studio-Ambiente, online buchbar 24/7.',
      },
      target_group: { target_type: ['b2c_private'], target_description: 'Qualitätsbewusste Kund:innen 25–55 J. im Stadteinzugsgebiet, 60 % weiblich, regelmäßige Besuche 6–10 Wochen.' },
      channels: { channels: ['web', 'social', 'store'], retention: 'Online-Buchungssystem, automatische Termin-Erinnerungen, Treue-Programm ab 5. Besuch.' },
      founders: { founders: 'Meister:in im Friseurhandwerk mit 8 Jahren Berufspraxis.', employees: 'Start: Inhaber:in + 1 Gesell:in + 1 Auszubildende:r. Nach Jahr 1: +1 Teilzeitkraft.', partners: 'Haarpflege-Marken (L\'Oréal, Kérastase), Steuerberater, Website-Dienstleister.' },
      location_legal: { location: '50–80 m² in Stadtteillage oder 1B-Lage Innenstadt, 4–6 Arbeitsplätze.', legal_form: 'einzelunternehmen', regulations: 'Meisterbrief erforderlich, Handwerksrolle, Hygienevorschriften, Gewerbeanmeldung.', risks: 'Personalgewinnung im Handwerk — adressiert durch attraktive Ausbildungsplätze und über Tarif liegendes Gehalt.' },
      capital: { capital_need: 38000, equity: 12000, financing: ['equity', 'bank_loan'], private_need: 2300 },
    },
    finance: { startingCash: 15000, periods: ramp(9000, 19500, 11000) },
  },

  consulting: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Beratung für [Zielbranche] mit Fokus auf [Spezialthema] und umsetzungsorientierten Ergebnissen.',
        products: 'Stundensatz 150 €, Tagessatz 1.200 €, Fix-Preis-Projekte 8–25 k €, Retainer-Modelle ab 2.500 €/Monat.',
        customer_value: 'Pragmatische Empfehlungen statt PowerPoint-Schlachten, messbare Resultate innerhalb von 3 Monaten, persönliche Betreuung durch erfahrene Senior-Beratung.',
      },
      target_group: { target_type: ['b2b_small', 'b2b_mid'], target_description: 'Geschäftsführer:innen und Fachbereichsleitungen mittelständischer Unternehmen (50–500 Mitarbeitende) in der DACH-Region.' },
      channels: { channels: ['direct', 'partners', 'web'], retention: 'LinkedIn-Content, Keynote-Vorträge auf Branchenevents, Empfehlungen aus dem Netzwerk, Retainer-Modelle für langfristige Kundenbindung.' },
      founders: { founders: 'Gründer:in mit 12+ Jahren Berufserfahrung bei etablierter Beratung (McKinsey/BCG/Bain/Roland Berger), MBA oder Promotion.', employees: 'Solo-Start, ab Jahr 2 Junior-Berater:in, ab Jahr 3 Ergänzung durch Associate.', partners: 'Freelance-Netzwerk für spezialisierte Projekte, Steuerberater, Website-Designer.' },
      location_legal: { location: 'Homeoffice + Co-Working für Meetings; Klient:innen-Besuche vor Ort.', legal_form: 'gmbh', risks: 'Abhängigkeit von wenigen Großkund:innen — adressiert durch gezielten Portfolio-Aufbau auf 10+ Retainer-Kund:innen.' },
      capital: { capital_need: 15000, equity: 15000, financing: ['equity'], private_need: 3500 },
    },
    finance: { startingCash: 15000, periods: ramp(6000, 24000, 6000) },
  },

  realestate: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Immobilienmakler-Büro mit Fokus auf Wohnimmobilien in [Region].',
        products: 'Vermittlung von Verkaufsimmobilien (Provision 3,57 % inkl. USt beidseitig), Vermietungen (2 Monatsmieten + USt), Wertgutachten (800–1.500 €).',
        customer_value: 'Kenntnisse des lokalen Marktes, professionelle Objektaufbereitung (360°-Touren, Drohnenaufnahmen), transparente Kommunikation.',
      },
      target_group: { target_type: ['b2c_private', 'b2b_small'], target_description: 'Eigentümer:innen und Kaufinteressent:innen von Ein-/Mehrfamilienhäusern und Eigentumswohnungen in einer Region mit mittleren Preisen.' },
      channels: { channels: ['web', 'direct', 'marketplace', 'social'], retention: 'Persönliche Empfehlungen, Content-Marketing auf ImmoScout24/Immowelt, lokale Zeitungsanzeigen, eigener YouTube-Kanal mit Objektbesichtigungen.' },
      founders: { founders: 'IHK-geprüfte:r Immobilienmakler:in mit 5 Jahren Branchenerfahrung.', employees: 'Start: Inhaber:in + 1 Assistenzkraft. Ab Jahr 2: +1 Vertriebsmitarbeiter:in auf Provisionsbasis.', partners: 'Fotograf:in, Home-Staging-Anbieter, Finanzierungsvermittler:in, Notariat.' },
      location_legal: { location: 'Kleines Büro (40–60 m²) in gut sichtbarer Stadtteillage.', legal_form: 'gmbh', regulations: 'Gewerbeerlaubnis §34c GewO, Berufshaftpflichtversicherung, Weiterbildungspflicht (20 Std./3 Jahre), Geldwäschebeauftragte:r.', risks: 'Zinsabhängigkeit des Marktes — adressiert durch Fokus auf Vermietungen und Gutachten als Gegenpol in Hochzinsphasen.' },
      capital: { capital_need: 30000, equity: 15000, financing: ['equity', 'bank_loan'], private_need: 2800 },
    },
    finance: { startingCash: 20000, periods: ramp(4000, 32000, 4000) },
  },

  craft: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Handwerksbetrieb mit Fokus auf [Gewerk] für Privat- und kleine Gewerbekund:innen.',
        products: 'Kleinaufträge (200–800 €), Renovierungen (3–12 k €), Neubau-/Umbau-Leistungen (15–60 k €), Wartungsverträge (300–1.200 €/Jahr).',
        customer_value: 'Handwerkliche Qualität, verbindliche Termine, faire Pauschalen bei Standardleistungen, Garantie nach VOB.',
      },
      target_group: { target_type: ['b2c_private', 'b2b_small'], target_description: 'Hausbesitzer:innen und Wohnungseigentümer:innen sowie kleine Gewerbebetriebe im 25-km-Radius.' },
      channels: { channels: ['direct', 'web', 'partners'], retention: 'Empfehlungen, Wartungsverträge, Kooperationen mit Architekt:innen und Hausverwaltungen.' },
      founders: { founders: 'Handwerksmeister:in mit 10+ Jahren Gesellenerfahrung.', employees: 'Start: Meister:in + 2 Gesellen + 1 Auszubildende:r. Ab Jahr 2 zusätzliche Gesellen nach Auftragslage.', partners: 'Fachgroßhandel, Baustoffzentrum, 2 Subunternehmer (Elektrik/Sanitär).' },
      location_legal: { location: 'Werkstatt mit Lager (80–120 m²) in Gewerbegebiet mit Anschluss ans Stadtzentrum.', legal_form: 'einzelunternehmen', regulations: 'Handwerksrolle, Meisterbrief, Gewerbeanmeldung, Unfallversicherung BG Bau.', risks: 'Bauflaute bei steigenden Zinsen — Gegensteuerung durch Renovierungs- und Wartungsgeschäft.' },
      capital: { capital_need: 60000, equity: 20000, financing: ['equity', 'bank_loan', 'kfw'], private_need: 2900 },
    },
    finance: { startingCash: 22000, periods: ramp(14000, 34000, 14500) },
  },

  fitness: {
    stepAnswers: {
      idea_core: {
        one_liner: 'Boutique-Fitnessstudio mit Kurskonzept statt klassischer Geräte-Abo-Kette.',
        products: 'Mitgliedschaft 69–89 €/Monat (Small Group Training + unbegrenzt Kurse), 10er-Karte 240 €, Personal Training 85 €/Std.',
        customer_value: 'Kleine Gruppen (max. 12), persönliche Betreuung, messbare Ergebnisse mit InBody-Analyse, flexible Kursbuchung per App.',
      },
      target_group: { target_type: ['b2c_private'], target_description: 'Kund:innen 30–55 J. mit mittlerem Einkommen, die persönliche Atmosphäre gegenüber Discount-Ketten bevorzugen.' },
      channels: { channels: ['web', 'social', 'direct'], retention: 'Probetraining-Konversion, monatliche Member-Events, 6-/12-Monats-Verträge mit Rabatt.' },
      founders: { founders: 'Lizenzierte:r Trainer:in (A-Lizenz + Functional Training) mit 6 Jahren Erfahrung.', employees: 'Inhaber:in + 2 Trainer:innen (TZ). Ab Monat 6 zusätzliche Spezialtrainer:innen auf Honorarbasis.', partners: 'Physiotherapie-Praxis nebenan, Ernährungsberatung, Sportartikel-Einzelhandel.' },
      location_legal: { location: '180–280 m² in belebter Stadtteillage mit Parkplätzen.', legal_form: 'ug', regulations: 'Gewerbeanmeldung, Musik-GEMA-Lizenz, Betriebshaftpflicht.', risks: 'Hohe Mietkosten, saisonale Schwankungen — adressiert durch Jahresverträge und gemeinsame Kooperations-Angebote.' },
      capital: { capital_need: 65000, equity: 20000, financing: ['equity', 'bank_loan'], private_need: 2700 },
    },
    finance: { startingCash: 25000, periods: ramp(7000, 22000, 8500) },
  },
};

export function getModelDefaults(modelId: string | undefined): ModelDefaults {
  if (!modelId) return GENERIC;
  return MODEL_DEFAULTS[modelId] || GENERIC;
}

export const MODELS_WITH_DEFAULTS = Object.keys(MODEL_DEFAULTS);
