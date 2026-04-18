import { useEffect, useState } from 'react';
import { admin, type AdminPayment } from '../api';

export default function AdminPayments() {
  const [rows, setRows] = useState<AdminPayment[]>([]);
  useEffect(() => { admin.payments().then(setRows); }, []);
  return (
    <div className="admin-page">
      <header><h1>Zahlungen</h1></header>
      <table className="data-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>E-Mail</th>
            <th>Typ</th>
            <th>Betrag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{new Date(p.created_at).toLocaleString()}</td>
              <td>{p.email || '–'}</td>
              <td>{p.type}</td>
              <td>{(p.amount / 100).toFixed(2)} {p.currency}</td>
              <td>
                <span className={`badge ${p.status === 'paid' ? 'badge-success' : ''}`}>{p.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
