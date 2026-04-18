import { useState } from 'react';

const QA = [
  {
    q: 'Akzeptieren Banken und die Arbeitsagentur den Plan?',
    a: 'Ja. Die Gliederung folgt dem Standard, den Banken, Sparkassen, die KfW und die Agentur für Arbeit seit Jahren verlangen: Executive Summary, Geschäftsidee, Kunden, Unternehmen, Finanzen (mit Umsatz-, Kosten- und Liquiditätsplan) und Anhang. Entscheidend ist, dass die Zahlen schlüssig sind — die prüfst du selbst und passt sie bei Bedarf an.',
  },
  {
    q: 'Ist meine Idee bei euch sicher? Was passiert mit meinen Daten?',
    a: 'Alle Daten liegen auf einem Server in Frankfurt (Hetzner), die Verbindung ist SSL-verschlüsselt. Claude verarbeitet deine Antworten zur Text-Generierung nach EU-Standardvertragsklauseln — Anthropic trainiert nicht mit deinen Eingaben. Du kannst dein Konto und alle Pläne jederzeit vollständig löschen.',
  },
  {
    q: 'Schreibt die KI einfach generische Texte?',
    a: 'Nein. Claude Sonnet 4.6 arbeitet ausschließlich mit deinen Antworten und Zahlen und ist angewiesen, keine Details zu erfinden. Du liest jeden Abschnitt und kannst ihn frei bearbeiten. Das Ergebnis klingt nach dir — nur professioneller formuliert.',
  },
  {
    q: 'Wie lange dauert es wirklich?',
    a: 'Wenn du deine Zahlen grob im Kopf hast: 25–35 Minuten bis zur fertigen Vorschau. Wenn du noch Zeit brauchst, kannst du jederzeit pausieren — dein Fortschritt wird automatisch gespeichert.',
  },
  {
    q: 'Was, wenn ich mit dem Ergebnis nicht zufrieden bin?',
    a: 'Du zahlst erst, bevor du die saubere Version ohne Wasserzeichen herunterlädst. Innerhalb von 14 Tagen ab Kauf hast du das Widerrufsrecht (solange du das Recht beim Download nicht ausdrücklich verwirkt hast). Schreib uns notfalls einfach eine Mail.',
  },
  {
    q: 'Einzelplan oder Jahresabo — was passt für wen?',
    a: 'Einzelplan für Gründer mit einer konkreten Idee. Jahresabo für Berater, Steuerkanzleien, Inkubatoren und Seriengründer: unbegrenzt viele Pläne, gespeicherte Entwürfe, priorisierter Support. Rechnet sich ab dem zweiten Plan.',
  },
  {
    q: 'Ist das Wasserzeichen in der Vorschau dauerhaft?',
    a: 'Nur solange der Plan nicht bezahlt ist. Nach dem Kauf (oder mit aktivem Jahresabo) lädst du die saubere A4-PDF ohne Wasserzeichen runter.',
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
