import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import DocHead from '../components/DocHead';

interface SharedPlan {
  id: string;
  title: string | null;
  language: string;
  texts: Record<string, string>;
}

const SECTIONS = [
  { key: 'executive_summary', title: 'Zusammenfassung' },
  { key: 'business_idea', title: 'Geschäftsidee' },
  { key: 'customers', title: 'Kunden' },
  { key: 'company', title: 'Unternehmen' },
  { key: 'finance', title: 'Finanzen' },
  { key: 'appendix', title: 'Anhang' },
];

export default function SharedPreview() {
  const { token } = useParams();
  const [plan, setPlan] = useState<SharedPlan | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<SharedPlan>(`/share/${token}`)
      .then((r) => setPlan(r.data))
      .catch(() => setErr('Dieser Link ist nicht mehr gültig oder wurde widerrufen.'));
  }, [token]);

  if (err) {
    return (
      <div className="shared-error">
        <DocHead title="Plan nicht verfügbar | Businessplan24" singleLanguage="de" />
        <h1>Dieser Plan ist nicht (mehr) verfügbar</h1>
        <p className="muted">{err}</p>
      </div>
    );
  }

  if (!plan) return <div className="loading-fallback" />;

  const today = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="shared-preview-layout">
      <DocHead title={`${plan.title || 'Businessplan'} · geteilte Vorschau`} singleLanguage="de" />
      <header className="shared-preview-header">
        <div className="shared-preview-meta">Geteilte Vorschau · nur lesen</div>
        <a href="https://businessplans24.com" className="btn btn-ghost btn-sm">Selbst erstellen →</a>
      </header>
      <article className="preview-document">
        <header className="preview-document-cover">
          <p className="preview-document-eyebrow">Businessplan</p>
          <h1 className="preview-document-title">{plan.title || 'Businessplan'}</h1>
          <p className="preview-document-date">Stand: {today}</p>
          <div className="preview-document-divider" />
        </header>
        {SECTIONS.map((s, i) => (
          <section key={s.key} className="preview-section">
            <div className="preview-section-head">
              <span className="preview-section-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
            </div>
            {plan.texts[s.key] ? (
              plan.texts[s.key].split(/\n{2,}/).map((p, idx) => <p key={idx}>{p.trim()}</p>)
            ) : (
              <p className="muted">— Abschnitt noch nicht ausgefüllt —</p>
            )}
          </section>
        ))}
        <footer className="preview-document-footer">
          <span>{plan.title || 'Businessplan'} · {today}</span>
          <span>Erstellt mit Businessplan24</span>
        </footer>
      </article>
    </div>
  );
}
