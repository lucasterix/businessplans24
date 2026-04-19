import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import DocHead from '../components/DocHead';

export default function Partner() {
  const [form, setForm] = useState({ name: '', email: '', company: '', country: 'DE', message: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ referralCode: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const { data } = await api.post('/partner/apply', form);
      setSuccess({ referralCode: data.referralCode });
    } catch {
      setErr('Bewerbung konnte nicht übermittelt werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="partner-page">
      <DocHead
        title="Partnerprogramm — 20 % Provision | Businessplan24"
        description="Für Steuerberater, IHK, Gründungsberater, Inkubatoren. 20 % Provision auf jeden vermittelten Verkauf, dauerhaft."
      />
      <section className="partner-hero">
        <h1>Partnerprogramm</h1>
        <p className="partner-lead">
          20 % Provision auf jeden Verkauf, den du vermittelst — dauerhaft.
        </p>
      </section>

      <section className="partner-grid">
        <article className="partner-card">
          <h3>Für wen</h3>
          <p>Steuerberater:innen, IHK, Gründungsberater:innen, Inkubatoren, Unternehmens-Coaches, Wirtschaftsförderungen.</p>
        </article>
        <article className="partner-card">
          <h3>Wie es funktioniert</h3>
          <p>Du bekommst einen eigenen Referral-Code. Jeder Nutzer, der darüber kauft, zahlt den normalen Preis — du bekommst 20 % Provision, automatisch via SEPA.</p>
        </article>
        <article className="partner-card">
          <h3>Abrechnung</h3>
          <p>Monatlich, rückwirkend. Mindestauszahlung 50 €. Keine Mindestlaufzeit, keine versteckten Kosten.</p>
        </article>
      </section>

      {success ? (
        <section className="partner-success">
          <h2>Danke, wir melden uns 🎉</h2>
          <p>
            Dein Referral-Code: <code>{success.referralCode}</code>
          </p>
          <p className="muted">
            Wir prüfen deine Bewerbung und melden uns innerhalb von 2 Werktagen bei dir. Bei Fragen erreichst du uns unter <a href="mailto:info@businessplans24.com">info@businessplans24.com</a>.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Zur Startseite</Link>
        </section>
      ) : (
        <section className="partner-form-wrap">
          <h2>Bewerbung</h2>
          <form onSubmit={submit} className="partner-form">
            <label className="field">
              <span className="field-label">Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">E-Mail *</span>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">Firma / Organisation</span>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">Land</span>
              <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
                <option value="NL">Niederlande</option>
                <option value="FR">Frankreich</option>
                <option value="IT">Italien</option>
                <option value="ES">Spanien</option>
                <option value="PL">Polen</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Warum passt ihr zusammen?</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="z.B. wir haben 200 Mandant:innen, die gerade gründen"
              />
            </label>
            {err && <p className="error-text">{err}</p>}
            <button className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Wird gesendet…' : 'Bewerbung absenden'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
