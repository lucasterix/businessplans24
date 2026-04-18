import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/useAuth';
import { api } from '../api/client';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, setAuth, logout } = useAuth();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await api.post('/auth/change-password', { oldPassword: oldPw, newPassword: newPw });
      setMsg('Passwort aktualisiert.');
      setOldPw('');
      setNewPw('');
    } catch (e2: unknown) {
      const code = (e2 as { response?: { data?: { error?: string } } }).response?.data?.error;
      setErr(code === 'invalid_old_password' ? 'Altes Passwort falsch.' : 'Fehler beim Ändern.');
    } finally {
      setSaving(false);
    }
  };

  const changeLanguage = async (lang: string) => {
    await api.patch('/auth/me', { language: lang });
    if (user) setAuth(useAuth.getState().token!, { ...user, language: lang });
    i18n.changeLanguage(lang);
  };

  const deleteAccount = async () => {
    if (!confirm('Konto wirklich unwiderruflich löschen?')) return;
    await api.delete('/auth/me');
    logout();
  };

  return (
    <div className="account-layout">
      <header>
        <h1>{t('account.title')}</h1>
        <p className="muted">{user.email}</p>
      </header>

      <section className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ color: 'var(--text)' }}>Passwort ändern</h2>
        <form onSubmit={changePassword} style={{ display: 'grid', gap: '0.75rem', maxWidth: 400 }}>
          <label className="field">
            <span className="field-label">Altes Passwort</span>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field-label">Neues Passwort</span>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} />
          </label>
          {err && <p className="error-text">{err}</p>}
          {msg && <p style={{ color: 'var(--good)', fontSize: 14 }}>{msg}</p>}
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Passwort ändern'}
          </button>
        </form>
      </section>

      <section className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ color: 'var(--text)' }}>Sprache</h2>
        <select
          value={user.language || i18n.language.slice(0, 2)}
          onChange={(e) => changeLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </section>

      <section className="panel" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
        <h2 style={{ color: 'var(--text)' }}>Konto löschen</h2>
        <p className="muted">Alle Daten und Pläne werden unwiderruflich gelöscht.</p>
        <button className="btn btn-ghost" onClick={deleteAccount} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          Konto unwiderruflich löschen
        </button>
      </section>
    </div>
  );
}
