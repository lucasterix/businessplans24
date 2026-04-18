import { useEffect, useState } from 'react';
import { admin, type AdminPlan } from '../api';

export default function AdminPlans() {
  const [rows, setRows] = useState<AdminPlan[]>([]);
  useEffect(() => { admin.plans().then(setRows); }, []);
  return (
    <div className="admin-page">
      <header><h1>Pläne</h1></header>
      <table className="data-table">
        <thead>
          <tr>
            <th>Zuletzt geändert</th>
            <th>Titel</th>
            <th>E-Mail</th>
            <th>Sprache</th>
            <th>Status</th>
            <th>Bezahlt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.updated_at).toLocaleString()}</td>
              <td>{p.title || '(Entwurf)'}</td>
              <td>{p.email || '–'}</td>
              <td>{p.language}</td>
              <td>{p.status}</td>
              <td>{p.paid ? '✓' : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
