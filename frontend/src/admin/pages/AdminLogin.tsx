import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/client';
import { useAuth } from '../../store/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();

  // Global caps-lock detector: hint the user before they even click submit.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', handler);
    };
  }, []);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.user?.role !== 'admin') {
        setErr('Dieser Account hat keine Admin-Rechte.');
        return;
      }
      setAuth(res.token, res.user);
      navigate('/admin');
    } catch {
      setErr('Login fehlgeschlagen. Prüfe E-Mail und Passwort.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <aside className="admin-login-aside" aria-hidden>
          <Link to="/" className="admin-login-brand">
            <span className="admin-login-brandmark">B24</span>
            <span className="admin-login-brandtext">
              <strong>Businessplans24</strong>
              <span>Backoffice</span>
            </span>
          </Link>
          <h2>Operator-Zugang</h2>
          <p>
            Verwaltung von Nutzern, Zahlungen, Plänen und Ads-Kampagnen.
            Zugriff nur für berechtigte Konten.
          </p>
          <ul className="admin-login-notes">
            <li><span aria-hidden>🔒</span> Session per JWT, 7-Tage-Ablauf</li>
            <li><span aria-hidden>🇩🇪</span> DSGVO-konform, Daten in Frankfurt</li>
            <li><span aria-hidden>🛡</span> Rate-Limit + fail2ban auf SSH</li>
          </ul>
          <Link to="/" className="admin-login-backlink">← Zurück zur Website</Link>
        </aside>

        <form onSubmit={onSubmit} className="admin-login-card" autoComplete="on" noValidate>
          <h1 className="admin-login-title">Anmelden</h1>
          <p className="admin-login-subtitle">Melde dich mit deinem Admin-Konto an.</p>

          <label className="field">
            <span className="field-label">E-Mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              placeholder="du@businessplans24.com"
            />
          </label>

          <label className="field">
            <span className="field-label">
              Passwort
              {capsLock && <span className="admin-login-caps" aria-live="polite">⚠ CAPS LOCK aktiv</span>}
            </span>
            <div className="admin-login-pw">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="admin-login-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Passwort ausblenden' : 'Passwort einblenden'}
                tabIndex={-1}
              >
                {showPw ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </label>

          {err && (
            <div className="admin-login-error" role="alert">
              <span aria-hidden>⚠</span>
              <span>{err}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="admin-login-spinner" aria-hidden>
                <span /><span /><span />
              </span>
            ) : (
              'Anmelden'
            )}
          </button>

          <p className="admin-login-footnote muted">
            Passwort vergessen? Schreib an <a href="mailto:it@businessplans24.com">it@businessplans24.com</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
