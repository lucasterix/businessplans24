import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import DocHead from '../components/DocHead';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

export default function Partner() {
  const loc = useLocalizedPath();
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ referralCode: string; existing: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const { data } = await api.post('/partner/signup', { email });
      setResult({ referralCode: data.referralCode, existing: !!data.existing });
    } catch {
      setErr('Code konnte nicht erstellt werden — bitte in einer Minute erneut.');
    } finally {
      setSaving(false);
    }
  };

  const refLink = result ? `https://businessplans24.com/?ref=${result.referralCode}` : '';

  const copy = async () => {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="partner-page">
      <DocHead
        title="Partnerprogramm — 20 % Provision | Businessplan24"
        description="Für Steuerberater, IHK, Gründungsberater, Inkubatoren. 20 % Provision auf jeden vermittelten Verkauf, sofort Code generieren ohne Wartezeit."
      />
      <section className="partner-hero">
        <h1>Partnerprogramm</h1>
        <p className="partner-lead">
          20 % Provision auf jeden vermittelten Verkauf — sofort loslegen, ohne Bewerbung.
        </p>
      </section>

      <section className="partner-grid">
        <article className="partner-card">
          <h3>Für wen</h3>
          <p>Steuerberater:innen, IHK, Gründungsberater:innen, Inkubatoren, Unternehmens-Coaches, Wirtschaftsförderungen, Content-Creator.</p>
        </article>
        <article className="partner-card">
          <h3>Wie es funktioniert</h3>
          <p>E-Mail eintragen, sofort eigenen Ref-Link bekommen, teilen, Provision kassieren. Kein Antrag, kein Warten.</p>
        </article>
        <article className="partner-card">
          <h3>Abrechnung</h3>
          <p>Monatlich via SEPA. Mindestauszahlung 50 €. Keine Mindestlaufzeit, keine versteckten Kosten.</p>
        </article>
      </section>

      {result ? (
        <section className="partner-success">
          <h2>Dein Ref-Link ist bereit 🎉</h2>
          {result.existing && <p className="muted">Diese E-Mail ist bereits registriert — hier ist dein bestehender Link.</p>}
          <div className="partner-code-box">
            <code className="partner-code">{refLink}</code>
            <button type="button" className="btn btn-primary" onClick={copy}>
              {copied ? 'Kopiert ✓' : 'Link kopieren'}
            </button>
          </div>
          <p className="muted">
            Dein Code: <code>{result.referralCode}</code> — jeder Kauf über diesen Link wird dir gutgeschrieben.
          </p>
          <Link to={loc('')} className="btn btn-ghost" style={{ marginTop: '1rem' }}>Zur Startseite</Link>
        </section>
      ) : (
        <section className="partner-form-wrap">
          <h2>Code jetzt erstellen</h2>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Einfach E-Mail eingeben — du bekommst sofort deinen persönlichen Ref-Link.
            Die E-Mail brauchen wir nur für die Auszahlung.
          </p>
          <form onSubmit={submit} className="partner-form partner-form--minimal">
            <label className="field">
              <span className="field-label">E-Mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="du@deinefirma.de"
              />
            </label>
            {err && <p className="error-text">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={saving || !email}>
              {saving ? 'Einen Moment…' : 'Ref-Link generieren'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
