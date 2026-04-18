import { useEffect, useState } from 'react';
import { admin, type AdminUser } from '../api';

export default function AdminUsers() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  useEffect(() => { admin.users().then(setRows); }, []);
  return (
    <div className="admin-page">
      <header>
        <h1>Nutzer</h1>
      </header>
      <table className="data-table">
        <thead>
          <tr>
            <th>E-Mail</th>
            <th>Land</th>
            <th>Sprache</th>
            <th>Rolle</th>
            <th>Abo</th>
            <th>Angemeldet</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.country || '–'}</td>
              <td>{u.language || '–'}</td>
              <td>{u.role === 'admin' ? <span className="badge badge-success">Admin</span> : 'User'}</td>
              <td>
                {u.subscription_tier && u.subscription_expires_at && u.subscription_expires_at > Date.now()
                  ? <span className="badge">{u.subscription_tier}</span>
                  : '–'}
              </td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
