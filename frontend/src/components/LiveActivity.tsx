import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface LiveResponse {
  active: number;
  windowMinutes: number;
}

export default function LiveActivity() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      api
        .get<LiveResponse>('/public/live-activity')
        .then((r) => { if (!cancelled) setActive(r.data.active); })
        .catch(() => { /* silent — it's just nice-to-have */ });
    };
    load();
    const id = setInterval(load, 45 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (active == null) return null;

  return (
    <div className="live-activity" role="status" aria-live="polite">
      <span className="live-activity-pulse" aria-hidden />
      <strong>{active}</strong>
      <span>Gründer:innen erstellen gerade ihren Businessplan</span>
    </div>
  );
}
