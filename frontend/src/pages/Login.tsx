import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, registerUser } from '../api/client';
import { useAuth } from '../store/useAuth';

export default function Login() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/account';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? loginUser : registerUser;
      const res = await fn({ email, password, language: i18n.language.slice(0, 2) });
      setAuth(res.token, res.user);
      navigate(next);
    } catch (e2: unknown) {
      const msg = (e2 as { response?: { data?: { error?: string } } }).response?.data?.error;
      if (msg === 'email_taken') setErr(t('auth.email_taken'));
      else setErr(t('auth.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <form onSubmit={submit} className="auth-form">
        <h1>{t(mode === 'login' ? 'auth.login_title' : 'auth.register_title')}</h1>
        <label className="field">
          <span className="field-label">{t('auth.email')}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span className="field-label">{t('auth.password')}</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {err && <p className="error-text">{err}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? t('common.loading') : t(mode === 'login' ? 'auth.submit_login' : 'auth.submit_register')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {t(mode === 'login' ? 'auth.switch_to_register' : 'auth.switch_to_login')}
        </button>
      </form>
    </div>
  );
}
