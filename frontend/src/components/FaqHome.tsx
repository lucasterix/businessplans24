import { useState } from 'react';

const QA = [
  {
    q: 'Akzeptieren Banken und die Arbeitsagentur den Plan?',
    a: 'Ja. Die Gliederung folgt dem Standard, den Sparkassen, KfW und die Agentur für Arbeit seit Jahren verlangen: Executive Summary, Geschäftsidee, Kunden, Unternehmen, Finanzen (mit Umsatz-, Kosten- und Liquiditätsplan) und Anhang. Die Vorlagen wurden gemeinsam mit Steuerberatern und Wirtschaftsprüfern entwickelt und werden regelmäßig gegen reale Bank-Anforderungen abgeglichen.',
  },
  {
    q: 'Wer hat die Methodik entwickelt?',
    a: 'Ein Team aus aktiven Steuerberatern, Wirtschaftsprüfern und ehemaligen Strategie-Beratern von McKinsey und BCG. Jede Sektions-Vorlage durchläuft ein Review durch praktizierende Berater, bevor sie freigeschaltet wird.',
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
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq-section">
      <h2>Häufige Fragen</h2>
      <div className="faq-list">
        {QA.map((item, i) => {
          const isOpen = open === i;
          return (
            <details key={i} open={isOpen} onToggle={(e) => setOpen(e.currentTarget.open ? i : null)}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
