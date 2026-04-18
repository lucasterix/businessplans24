import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Zusammenfassung / Executive Summary',
    body: `Die Nordlicht Café GmbH eröffnet im Frühjahr in Göttingen ein Tagescafé mit Fokus auf regional produziertem Kaffee, hausgemachten Backwaren und einem Co-Working-Bereich. Zielgruppe sind Studierende, Remote-Arbeitende und Gäste über 30, die Wert auf Qualität und eine ruhige Atmosphäre legen. Wir rechnen im ersten Jahr mit einem Umsatz von 218 000 €, einer Rohmarge von 66 % und erreichen ab Monat 8 den Break-Even.

Der Kapitalbedarf liegt bei 74 000 €, davon stemmen die Gründerinnen 20 000 € Eigenkapital, 54 000 € werden über ein KfW-Startgelderdarlehen finanziert. Der vorliegende Plan dokumentiert Markt, Betrieb, Team und Finanzen bis zum Ende von Jahr 3.`,
  },
  {
    title: 'Geschäftsidee',
    body: `Unsere Gäste sollen bei uns einen Kaffee trinken, den sie sich in Ruhe leisten. Wir rösten nicht selbst, arbeiten aber exklusiv mit der Göttinger Rösterei Kaffeegarten zusammen, die hohe Transparenz in der Lieferkette bietet. Das Kuchen- und Frühstücksangebot stammt zu 100 % aus eigener Herstellung.

Der integrierte Co-Working-Bereich (12 Plätze) adressiert eine Marktlücke: im Zentrum gibt es kein ruhiges Café, in dem man mehrere Stunden mit Laptop arbeiten kann, ohne sich unerwünscht zu fühlen. Gäste zahlen dort einen Mindestverzehr von 6 € pro zwei Stunden, was die Auslastung steuert.`,
  },
  {
    title: 'Kunden',
    body: `Zielgruppe 1 — Studierende und Doktorand:innen (Hauptgruppe, ca. 55 % des Umsatzes). Preissensibel, aber hochfrequent: ein bis zwei Besuche pro Woche, durchschnittlicher Bon 6,80 €. Akquise über Social Media (Instagram, TikTok) und Kooperationen mit Fachschaften.

Zielgruppe 2 — Remote-Arbeitende (ca. 30 % des Umsatzes). Weniger preissensibel, längere Aufenthalte, höherer Bon (12,40 €). Wir erreichen sie über LinkedIn-Content und lokale Co-Working-Communities.

Zielgruppe 3 — Spaziergangsgäste ab 30 (ca. 15 %). Wochenend-orientiert, suchen Qualität und Atmosphäre. Wir adressieren sie über regionale Presse und Google-Maps-Bewertungen.

Kundenbindung erfolgt über ein digitales Stempelsystem (jeder 10. Kaffee gratis), monatliche Veranstaltungen und persönliche Kommunikation.`,
  },
  {
    title: 'Unternehmen',
    body: `Die Gründerinnen sind Sarah Bücker (Betriebswirtin, 8 Jahre Erfahrung in der Systemgastronomie) und Laura Weißler (Konditormeisterin, 6 Jahre Berufspraxis in Frankfurter Hotelgastronomie). Ihre Profile ergänzen sich in operativem Betrieb und Produktentwicklung.

Zum Start werden zwei Mitarbeitende (je 20 Wochenstunden) eingestellt, ab Monat 9 eine weitere Vollkraft. Standort ist die Theaterstraße 15, 350 m zur Universität, 5 Minuten zum Hauptbahnhof. Mietvertrag über 10 Jahre, 24 € pro m² kalt, 120 m² Fläche inkl. Theke und Küche.

Rechtsform GmbH mit 25 000 € Stammkapital. Wichtigste Risiken: Personalfluktuation (Gegenmaßnahme: überdurchschnittliche Bezahlung), Energiepreise (Gegenmaßnahme: 3-Jahres-Festpreis mit Grünstromanbieter) und Konjunkturabschwung (Gegenmaßnahme: Liquiditätsreserve von 8 000 €).`,
  },
  {
    title: 'Finanzen',
    body: `Der Umsatz steigt von 218 000 € in Jahr 1 auf 312 000 € in Jahr 3. Wareneinsatz liegt stabil bei 34 %. Personalkosten wachsen von 64 000 € auf 108 000 €. Betriebskosten (Miete, Energie, Marketing) liegen bei 42 000 € in Jahr 1.

Im ersten Jahr erwirtschaften wir einen operativen Verlust von 9 400 €, in Jahr 2 einen Gewinn von 14 200 €, in Jahr 3 28 600 €. Die Eigenkapitalrendite in Jahr 3 liegt bei 71 %.

Der Kapitalbedarf verteilt sich auf Einbau und Ausstattung (54 000 €), Warenlager und Anfangsbestand (8 000 €) sowie eine Liquiditätsreserve (12 000 €). Die Finanzierung: 20 000 € Eigenkapital und ein KfW-Startgelddarlehen über 54 000 € (10 Jahre Laufzeit, 2 tilgungsfreie Jahre, 4,01 % Zins).`,
  },
  {
    title: 'Anhang',
    body: `Detaillierte Monatsplanung Jahre 1–3, Liquiditätsplan, Mietvertragskopie, Lebensläufe der Gründerinnen, Genehmigungsplan Gaststättenrecht.`,
  },
];

export default function Example() {
  return (
    <div className="example-layout">
      <section className="example-hero">
        <span className="example-badge">So sieht ein fertiger Plan aus</span>
        <h1>Beispiel: Nordlicht Café GmbH</h1>
        <p className="muted">
          Vorschau eines realen Plans, wie du ihn in 30 Minuten mit Businessplan24 erstellen kannst.
          Du kannst ihn scrollen, lesen, vergleichen. Keine Registrierung nötig.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Eigenen Plan starten</Link>
          <Link to="/pricing" className="btn btn-ghost">Preise ansehen</Link>
        </div>
      </section>

      <article className="example-doc">
        <header className="example-doc-header">
          <h2>Nordlicht Café GmbH</h2>
          <p className="muted">Businessplan · Göttingen · April 2026</p>
        </header>
        {SECTIONS.map((s) => (
          <section key={s.title} className="example-section">
            <h3>{s.title}</h3>
            {s.body.split(/\n{2,}/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </article>

      <section className="example-cta">
        <h2>Bereit, deinen eigenen zu schreiben?</h2>
        <p className="muted">Dein Plan steht in 30 Minuten. 49 € einmalig.</p>
        <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>Jetzt starten</Link>
      </section>
    </div>
  );
}
