import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';

function sessionId(): string {
  const KEY = 'bp24_sid';
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

function device(): string {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/** Fire-and-forget DSGVO-safe page view beacon, triggered on every route change. */
export default function AnalyticsBeacon() {
  const location = useLocation();
  useEffect(() => {
    const consent = localStorage.getItem('bp24-consent');
    if (consent === null) return; // banner hasn't been interacted with yet
    api
      .post('/public/track', {
        path: location.pathname,
        referrer: document.referrer || undefined,
        lang: navigator.language,
        device: device(),
        session: sessionId(),
      })
      .catch(() => {});
  }, [location.pathname]);
  return null;
}
