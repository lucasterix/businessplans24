import { useEffect, useState } from 'react';

export interface FaqItem {
  q: string;
  a: string;
}

const QA: FaqItem[] = [
  {
    q: 'Akzeptieren Banken und die Arbeitsagentur den Plan?',
    a: 'Ja. Die Gliederung folgt dem Standard, den Sparkassen, KfW und die Agentur für Arbeit seit Jahren verlangen: Executive Summary, Geschäftsidee, Kunden, Unternehmen, Finanzen (mit Umsatz-, Kosten- und Liquiditätsplan) und Anhang. Die Vorlagen wurden gemeinsam mit Steuerberatern und Wirtschaftsprüfern entwickelt und werden regelmäßig gegen reale Bank-Anforderungen abgeglichen.',
  },
  {
    q: 'Wer hat die Methodik entwickelt?',
    a: 'Ein Team aus aktiven Steuerberatern, Wirtschaftsprüfern und ehemaligen Strategie-Beratern von McKinsey und BCG. Jede Sektions-Vorlage durchläuft ein Review durch praktizierende Berater, bevor sie freigeschaltet wird.',
  },
  {
    q: 'Wie schreibt man einen Businessplan?',
    a: 'In sechs Schritten: (1) Executive Summary mit dem Pitch, (2) Geschäftsidee — was, für wen, Marktumfeld, (3) Kunden — Zielgruppe, Vertrieb, Bindung, (4) Unternehmen — Gründer, Team, Standort, Rechtsform, Risiken, (5) Finanzen — Umsatz-, Kosten-, Liquiditäts- und Kapitalbedarfsplan, (6) Anhang mit Lebensläufen und Verträgen. Businessplan24 führt dich durch jeden Schritt.',
  },
  {
    q: 'Was gehört in einen Businessplan?',
    a: 'Die sechs Pflichtbestandteile (Summary, Geschäftsidee, Kunden, Unternehmen, Finanzen, Anhang) plus Markt- und Wettbewerbsanalyse, SWOT und ein konkreter Zeitplan. Für KfW und Arbeitsagentur kommen Lebensläufe der Gründer und eine schriftliche Tragfähigkeits-Einschätzung dazu.',
  },
  {
    q: 'Wie lang sollte ein Businessplan sein?',
    a: 'Zwischen 15 und 30 Seiten, je nach Vorhaben. KfW empfiehlt 20–25 Seiten Fließtext plus Anhang. Kürzer wirkt unvorbereitet, länger erschlägt den Leser. Die Executive Summary sollte maximal eine Seite haben.',
  },
  {
    q: 'Brauche ich überhaupt einen Businessplan?',
    a: 'Ja — fast immer. Banken, KfW, Beteiligungsgesellschaften und die Agentur für Arbeit verlangen einen. Aber auch ohne externen Zweck hilft er: er zwingt dich, Umsätze, Kosten und Risiken sauber durchzudenken. Gründer mit geschriebenem Plan scheitern statistisch seltener.',
  },
  {
    q: 'Wie berechne ich den Kapitalbedarf?',
    a: 'Kapitalbedarf = Investitionen (Ausstattung, Einrichtung, Vorfinanzierung) + Gründungskosten + Liquiditätsreserve (3–6 Monate private Fixkosten + Betriebsausgaben, bevor Umsatz da ist). Businessplan24 rechnet das im Wizard automatisch mit.',
  },
  {
    q: 'Was ist der Unterschied zwischen Businessplan und Geschäftsplan?',
    a: 'Keiner — die Begriffe werden synonym verwendet. „Businessplan" ist der international gebräuchliche Ausdruck, „Geschäftsplan" die wörtliche deutsche Übersetzung. Beides meint dasselbe Dokument.',
  },
  {
    q: 'Ist meine Idee bei euch sicher? Was passiert mit meinen Daten?',
    a: 'Alle Daten liegen auf einem Server in Frankfurt (Hetzner), die Verbindung ist SSL-verschlüsselt. Die Textverarbeitung läuft über Anthropic nach EU-Standardvertragsklauseln — deine Eingaben werden nicht zum Training verwendet. Du kannst dein Konto und alle Pläne jederzeit vollständig löschen.',
  },
  {
    q: 'Sind die Texte wirklich professionell?',
    a: 'Ja. Jeder Abschnitt basiert auf Vorlagen, die mit erfahrenen Unternehmensberatern entwickelt wurden — nicht auf generischen Phrasen. Du liest jeden Text und passt ihn in eigenen Worten an. Das Ergebnis klingt nach dir, nur professioneller formuliert.',
  },
  {
    q: 'Wie lange dauert es wirklich?',
    a: 'Wenn du deine Zahlen grob im Kopf hast: 25–35 Minuten bis zur fertigen Vorschau. Dein Fortschritt wird automatisch gespeichert — du kannst jederzeit pausieren.',
  },
  {
    q: 'Was, wenn ich mit dem Ergebnis nicht zufrieden bin?',
    a: 'Du zahlst erst, bevor du die saubere Version ohne Wasserzeichen herunterlädst. Innerhalb von 14 Tagen ab Kauf hast du das Widerrufsrecht (sofern du das Recht beim Download nicht ausdrücklich verwirkt hast).',
  },
  {
    q: 'Einzelplan oder Jahresabo — was passt für wen?',
    a: 'Einzelplan für Gründer mit einer konkreten Idee. Jahresabo für Berater, Steuerkanzleien, Inkubatoren und Seriengründer: unbegrenzt viele Pläne, gespeicherte Entwürfe, priorisierter Support. Rechnet sich ab dem zweiten Plan.',
  },
  {
    q: 'Gibt es persönliche Unterstützung?',
    a: 'Ja. Gegen einen einmaligen Aufschlag von 99 € liest und kommentiert Lucas Schmutz deinen fertigen Plan innerhalb von 3 Werktagen persönlich. Ideal, wenn du vor einem Bank-Termin auf Nummer sicher gehen willst.',
  },
];

export default function FaqHome() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Inject FAQPage JSON-LD so Google can show rich snippets for these
  // questions directly in search results.
  useEffect(() => {
    const id = 'bp24-faq-schema';
    if (document.getElementById(id)) return;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: QA.map((x) => ({
        '@type': 'Question',
        name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.a },
      })),
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  return (
    <section className="faq-section" id="faq">
      <h2>Häufige Fragen</h2>
      <div className="faq-list">
        {QA.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <details
              key={i}
              open={isOpen}
              onClick={(e) => {
                // Intercept native toggle so controlled state drives
                // everything. Without this, React's re-render fires a
                // "close" onToggle on the previously-open details and
                // races the new details' "open" update.
                e.preventDefault();
                setOpenIndex(isOpen ? null : i);
              }}
            >
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
