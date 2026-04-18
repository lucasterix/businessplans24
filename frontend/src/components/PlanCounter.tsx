import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function PlanCounter() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    api
      .get<{ plansCreated: number }>('/public/stats')
      .then((r) => setCount(r.data.plansCreated))
      .catch(() => setCount(null));
  }, []);
  if (count == null) return null;
  return (
    <div className="plan-counter">
      <span className="plan-counter-dot" />
      <strong>{count.toLocaleString('de-DE')}+</strong>
      <span>Businesspläne bisher erstellt</span>
    </div>
  );
}
