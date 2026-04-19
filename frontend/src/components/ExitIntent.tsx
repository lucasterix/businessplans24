import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalizedPath } from '../i18n/useLocalizedPath';

const STORAGE_KEY = 'bp24-exit-shown';

export default function ExitIntent() {
  const [show, setShow] = useState(false);
  const loc = useLocalizedPath();

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem(STORAGE_KEY)) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, '1');
      }
    };
    document.addEventListener('mouseout', onLeave);
    const timer = setTimeout(() => sessionStorage.setItem(STORAGE_KEY, '1-timeout'), 3 * 60 * 1000);
    return () => {
      document.removeEventListener('mouseout', onLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="exit-overlay" onClick={() => setShow(false)}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-close" onClick={() => setShow(false)} aria-label="Schließen">×</button>
        <div className="exit-emoji">🎁</div>
        <h2>Warte — nimm 10 % mit</h2>
        <p>
          Mit dem Code <code className="exit-code">FIRST10</code> bekommst du 10 % auf deinen Businessplan.
          Gültig für die nächste Zahlung.
        </p>
        <div className="exit-ctas">
          <Link to={loc('pricing')} className="btn btn-primary btn-lg" onClick={() => setShow(false)}>
            Jetzt einlösen
          </Link>
          <button className="btn btn-link" onClick={() => setShow(false)}>
            Nein, danke
          </button>
        </div>
        <p className="exit-tiny">
          Kein Spam. Der Code funktioniert automatisch an der Stripe-Kasse.
        </p>
      </div>
    </div>
  );
}
