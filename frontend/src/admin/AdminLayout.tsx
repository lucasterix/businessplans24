import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">B24</span>
          <span>Admin</span>
        </div>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/users">Nutzer</NavLink>
          <NavLink to="/admin/payments">Zahlungen</NavLink>
          <NavLink to="/admin/plans">Pläne</NavLink>
          <NavLink to="/admin/ads">Google Ads</NavLink>
          <NavLink to="/admin/ads/keywords">Keyword-Analyse</NavLink>
        </nav>
        <div className="admin-footer">
          <span className="admin-user">{user?.email}</span>
          <button className="btn-link" onClick={handleLogout}>Abmelden</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
