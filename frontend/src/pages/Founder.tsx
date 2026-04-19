import { Link } from 'react-router-dom';
import DocHead from '../components/DocHead';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

export default function Founder() {
  const loc = useLocalizedPath();
  return (
    <div className="founder-page">
      <DocHead
        title="Gründer — Lucas Schmutz von Businessplan24"
        description="Warum ich Businessplan24 gebaut habe: von UNICEF über soziale Projekte bis zur Selbstständigkeit im Health-Science-Bereich."
        singleLanguage="de"
      />
      <section className="founder-hero">
        <span className="founder-tag">Gründer</span>
        <h1>Warum ich Businessplan24 baue</h1>
        <p className="founder-lead">
          Ein Businessplan ist kein Papier für die Bank — er ist das Fundament, das entscheidet,
          ob eine Idee lebt oder scheitert. Ich habe gesehen, woran es in der Praxis hängt.
        </p>
      </section>

      <section className="founder-story">
        <h2>Von UNICEF zu Health-Science-Unternehmer</h2>
        <p>
          Meine ersten Schritte in der Verantwortung für echte Projekte habe ich bei UNICEF
          gemacht — nicht am Schreibtisch, sondern an konkreten sozialen Vorhaben quer durch
          Deutschland. Bildung, Kinder- und Jugendarbeit, regionale Initiativen: ich habe
          Projekte aufgesetzt, Finanzierungen durchgerechnet, Anträge geschrieben und gelernt,
          wie fragil gute Ideen sind, wenn die Struktur dahinter fehlt.
        </p>

        <p>
          Aus dieser Arbeit ist die Überzeugung gewachsen, dass sich Gutes und Wirtschaftlichkeit
          nicht ausschließen — im Gegenteil. Eine saubere Planung ist der respektvollste Umgang
          mit den Menschen, für die man arbeitet. Später bin ich in den Health-Science-Bereich
          gewechselt und habe mich dort selbstständig gemacht. Seitdem schreibe und prüfe ich
          regelmäßig Businesspläne — für eigene Vorhaben, für Kolleg:innen, für Freunde, die
          gegründet haben.
        </p>

        <h2>Warum ich diese Seite gebaut habe</h2>
        <p>
          Das Problem ist immer dasselbe: Die meisten Gründer:innen haben eine gute Idee und
          einen groben Plan im Kopf — aber die Übersetzung in ein vorzeigbares Dokument kostet
          Tage. Dazu kommen Beratungen ab 1.500 €, Excel-Vorlagen, die niemand versteht, und
          der stille Moment am Schreibtisch, in dem man aufgibt.
        </p>

        <p>
          Businessplan24 nimmt dir diese Hürde ab, ohne dir die inhaltliche Kontrolle zu nehmen.
          Du beantwortest konkrete Fragen, Claude formuliert daraus den Entwurf, du liest,
          korrigierst, druckst. Am Ende steht ein Plan, den eine Sparkasse, eine KfW-Stelle oder
          die Arbeitsagentur akzeptiert — in 30 Minuten statt drei Wochen.
        </p>

        <h2>Mein Versprechen</h2>
        <ul>
          <li>Keine versteckten Kosten, keine Abo-Falle.</li>
          <li>Daten auf deutschem Server, keine Werbe-Cookies.</li>
          <li>Wenn etwas nicht stimmt: schreib mir direkt, ich antworte.</li>
        </ul>

        <p className="founder-signature">
          <strong>Lucas Schmutz</strong><br />
          <a href="mailto:info@businessplans24.com">info@businessplans24.com</a>
        </p>

        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to={loc('')} className="btn btn-primary btn-lg">Jetzt kostenlos starten</Link>
        </p>
      </section>
    </div>
  );
}
