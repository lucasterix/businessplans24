import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useCountUp } from '../hooks/useCountUp';

export default function PlanCounter() {
  const [count, setCount] = useState<number | null>(null);
  const animated = useCountUp(count, 1600, count != null ? Math.max(0, count - 300) : 0);
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
      <strong>{animated.toLocaleString('de-DE')}+</strong>
      <span>Businesspläne bisher erstellt</span>
    </div>
  );
}
