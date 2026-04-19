import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

const KEY = 'bp24-consent';

type Consent = 'essential' | 'all' | null;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function loadPixels() {
  const fbPixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (fbPixelId && !window.fbq) {
    /* eslint-disable */
    // @ts-nocheck
    (function (f: any, b: any, e: any, v: any) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      const t = b.createElement(e); t.async = true; t.src = v;
      const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq!('init', fbPixelId);
    window.fbq!('track', 'PageView');
  }
  const gaId = import.meta.env.VITE_GOOGLE_ADS_ID;
  if (gaId && !window.gtag) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) { window.dataLayer!.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const loc = useLocalizedPath();

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as Consent;
    if (stored) {
      setConsent(stored);
      if (stored === 'all') loadPixels();
    }
  }, []);

  const save = (c: Consent) => {
    localStorage.setItem(KEY, c ?? '');
    setConsent(c);
    if (c === 'all') loadPixels();
  };

  if (consent) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <div className="cookie-content">
        <p>
          Wir nutzen technisch notwendige Cookies für Login & Wizard-Speicherung. Mit deinem Einverständnis aktivieren wir zusätzlich Marketing-Cookies (Meta, Google Ads), damit wir dir hilfreiche Werbung zeigen können.
          {' '}
          <Link to={loc('privacy')}>Mehr erfahren</Link>.
        </p>
        <div className="cookie-actions">
          <button className="btn btn-ghost" onClick={() => save('essential')}>Nur notwendige</button>
          <button className="btn btn-primary" onClick={() => save('all')}>Alle akzeptieren</button>
        </div>
      </div>
    </div>
  );
}
