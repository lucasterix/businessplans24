import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/client';
import { useAuth } from '../../store/useAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.user?.role !== 'admin') {
        setErr('Kein Admin-Konto.');
        return;
      }
      setAuth(res.token, res.user);
      navigate('/admin');
    } catch {
      setErr('Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form onSubmit={onSubmit} className="admin-login-card">
        <h1>Admin-Zugang</h1>
        <p className="muted">Businessplan24 Backoffice</p>
        <label className="field">
          <span className="field-label">E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="field">
          <span className="field-label">Passwort</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {err && <p className="error-text">{err}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
