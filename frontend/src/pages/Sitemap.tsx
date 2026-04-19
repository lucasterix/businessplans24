import { Link } from 'react-router-dom';
import DocHead from '../components/DocHead';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

export default function Sitemap() {
  const loc = useLocalizedPath();
  return (
    <div className="legal-page">
      <DocHead
        title="Sitemap — alle Seiten von Businessplan24"
        description="Übersicht aller Seiten auf Businessplan24: Wizard, Preise, Beispielplan, SEO-Landingpages für KfW, Gründungszuschuss, Gastronomie, E-Commerce, Beratung."
      />
      <h1>Sitemap</h1>
      <p className="muted">Alle öffentlichen Seiten im Überblick.</p>

      <h2>Hauptbereiche</h2>
      <ul>
        <li><Link to={loc('')}>Startseite — Businessplan erstellen in 30 Minuten</Link></li>
        <li><Link to={loc('pricing')}>Preise — 49 € einmalig oder 99 € Jahresabo</Link></li>
        <li><Link to={loc('example')}>Beispiel-Businessplan — Nordlicht Café</Link></li>
        <li><Link to={loc('founder')}>Gründer — über Lucas Schmutz</Link></li>
        <li><Link to={loc('partner')}>Partnerprogramm — 20 % Provision</Link></li>
      </ul>

      <h2>Businessplan für spezifische Anwendungsfälle</h2>
      <ul>
        <li><Link to="/de/businessplan-kfw">Businessplan für KfW-Startgeld und ERP-Gründerkredit</Link></li>
        <li><Link to="/de/businessplan-arbeitsagentur">Businessplan für den Gründungszuschuss der Arbeitsagentur</Link></li>
        <li><Link to="/de/businessplan-gastronomie">Businessplan für Gastronomie (Café, Restaurant, Bar)</Link></li>
        <li><Link to="/de/businessplan-ecommerce">Businessplan für E-Commerce und Online-Shops</Link></li>
        <li><Link to="/de/businessplan-beratung">Businessplan für Beratung, Coaching und Agenturen</Link></li>
      </ul>

      <h2>Konto</h2>
      <ul>
        <li><Link to="/login">Anmelden</Link></li>
        <li><Link to="/account">Mein Konto</Link></li>
        <li><Link to="/profile">Profil &amp; Passwort ändern</Link></li>
      </ul>

      <h2>Rechtliches</h2>
      <ul>
        <li><Link to={loc('imprint')}>Impressum</Link></li>
        <li><Link to={loc('privacy')}>Datenschutzerklärung</Link></li>
        <li><Link to={loc('terms')}>Allgemeine Geschäftsbedingungen</Link></li>
      </ul>

      <h2>Maschinenlesbar</h2>
      <ul>
        <li><a href="/sitemap.xml" target="_blank" rel="noreferrer">XML-Sitemap (für Google)</a></li>
        <li><a href="/robots.txt" target="_blank" rel="noreferrer">robots.txt</a></li>
      </ul>
    </div>
  );
}
