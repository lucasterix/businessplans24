export default function Privacy() {
  return (
    <div className="legal-page">
      <h1>Datenschutzerklärung</h1>
      <p>
        Wir nehmen den Schutz deiner persönlichen Daten sehr ernst und behandeln sie vertraulich sowie gemäß der EU-Datenschutz-Grundverordnung (DSGVO) und dieser Datenschutzerklärung.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Lucas Schmutz, Hans-Böckler-Straße 2c, 37079 Göttingen, Deutschland.<br />
        E-Mail: <a href="mailto:info@businessplans24.com">info@businessplans24.com</a>
      </p>

      <h2>2. Welche Daten wir erheben</h2>
      <ul>
        <li>
          <strong>Registrierung/Konto:</strong> E-Mail-Adresse, verschlüsseltes Passwort, ggf. Land und Sprache.
        </li>
        <li>
          <strong>Businessplan-Inhalte:</strong> die von dir eingegebenen Antworten und Zahlen sowie die von Plani (unserem Schreibassistenten, technisch betrieben mit Claude von Anthropic, PBC) erzeugten Texte. Wir speichern diese, um deinen Plan über Sitzungen hinweg verfügbar zu machen.
        </li>
        <li>
          <strong>Zahlungen:</strong> Abwicklung über Stripe; wir speichern lediglich Transaktions-ID, Betrag, Währung und Status. Kartendaten sehen wir nicht.
        </li>
        <li>
          <strong>Log-Daten:</strong> IP-Adresse (verkürzt gespeichert), Zeitstempel, angefragte URL, Browser — zur Abwehr von Missbrauch, 14 Tage.
        </li>
      </ul>

      <h2>3. Rechtsgrundlagen</h2>
      <p>
        Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) für Account und Plan, Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) für Missbrauchsabwehr und Logs, Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für optionale Newsletter.
      </p>

      <h2>4. Auftragsverarbeiter</h2>
      <ul>
        <li>Hetzner Online GmbH, Deutschland — Hosting (Frankfurt).</li>
        <li>Anthropic PBC, USA — Generierung der Businessplan-Texte. Datenübermittlung auf Basis der EU-Standardvertragsklauseln.</li>
        <li>Stripe Payments Europe Ltd., Irland — Zahlungsabwicklung.</li>
        <li>Google Ireland Ltd. — E-Mail-Versand über Google Workspace (info@businessplans24.com).</li>
      </ul>

      <h2>5. Speicherdauer</h2>
      <p>
        Pläne: solange dein Konto besteht, oder bei anonymen Plänen 90 Tage.<br />
        Kontodaten: bis zur Löschung deines Kontos.<br />
        Steuerrelevante Belege: 10 Jahre gem. AO.
      </p>

      <h2>6. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Nimm einfach Kontakt mit uns auf. Beschwerden kannst du bei der zuständigen Landesdatenschutzbehörde einreichen.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Wir setzen ausschließlich technisch notwendige Session-Cookies (zur Anmeldung) und lokalen Browser-Speicher (Local Storage) für deinen Plan-Entwurf. Keine Tracker, keine Werbe-Cookies, kein Google Analytics.
      </p>
    </div>
  );
}
