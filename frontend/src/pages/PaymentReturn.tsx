import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

interface VerifyResult {
  ok: boolean;
  amount?: number;
  currency?: string;
  email?: string;
  mock?: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a Google Ads conversion event. Idempotent per session_id via a
 * sessionStorage flag so reloads of the success page don't double-count.
 * Also sets user_data for Enhanced Conversions (Google hashes client-side).
 */
function fireGoogleConversion(sessionId: string, amount: number, currency: string, email?: string) {
  const KEY = `bp24_gads_fired_${sessionId}`;
  if (sessionStorage.getItem(KEY)) return;

  const adsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  const adsLabel = import.meta.env.VITE_GOOGLE_ADS_LABEL;
  if (!adsId || !adsLabel || !window.gtag) return;

  // Enhanced Conversions: pass customer email; gtag.js will normalise + hash
  // it in-browser before transmitting. No plaintext PII leaves the client.
  if (email) {
    try {
      window.gtag('set', 'user_data', { email });
    } catch { /* ignore */ }
  }

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${adsLabel}`,
    value: amount / 100,
    currency: currency.toUpperCase(),
    transaction_id: sessionId,
  });

  // Meta Pixel: purchase event parallel
  if (window.fbq) {
    try {
      window.fbq('track', 'Purchase', {
        value: amount / 100,
        currency: currency.toUpperCase(),
      });
    } catch { /* ignore */ }
  }

  sessionStorage.setItem(KEY, '1');
}

export default function PaymentReturn() {
  const { t } = useTranslation();
  const { state } = useParams();
  const [params] = useSearchParams();
  const planId = params.get('plan');
  const sessionId = params.get('session_id');

  const [verified, setVerified] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (state !== 'success' || !sessionId) return;
    setLoading(true);
    api
      .get<VerifyResult>(`/checkout/verify/${sessionId}`)
      .then((r) => setVerified(r.data))
      .catch(() => setVerified({ ok: false }))
      .finally(() => setLoading(false));
  }, [state, sessionId]);

  // Fire ad-platform conversion events exactly once per verified purchase
  useEffect(() => {
    if (firedRef.current) return;
    if (!verified?.ok || !sessionId) return;
    if (typeof verified.amount !== 'number' || !verified.currency) return;
    fireGoogleConversion(sessionId, verified.amount, verified.currency, verified.email);
    firedRef.current = true;
  }, [verified, sessionId]);

  if (state === 'cancel') {
    return (
      <div className="payment-return">
        <h1>Zahlung abgebrochen</h1>
        <p className="muted">Die Zahlung wurde nicht durchgeführt. Dein Plan ist unverändert.</p>
        {planId && <Link to={`/preview/${planId}`} className="btn btn-primary">{t('wizard.back')}</Link>}
      </div>
    );
  }

  if (state === 'mock') {
    return (
      <div className="payment-return">
        <h1>Test-Modus</h1>
        <p className="muted">
          Stripe ist nicht konfiguriert — in Produktion würdest du hier zu Stripe Checkout weitergeleitet.
        </p>
        {planId && <Link to={`/preview/${planId}`} className="btn btn-primary">{t('wizard.back')}</Link>}
      </div>
    );
  }

  if (loading) return <div className="loading-fallback">{t('common.loading')}</div>;

  if (verified?.ok === false) {
    return (
      <div className="payment-return">
        <h1>Zahlung nicht bestätigt</h1>
        <p className="muted">Die Zahlung konnte nicht verifiziert werden.</p>
        {planId && <Link to={`/preview/${planId}`} className="btn btn-ghost">{t('wizard.back')}</Link>}
      </div>
    );
  }

  return (
    <div className="payment-return">
      <h1>Danke für deinen Kauf 🎉</h1>
      {verified?.amount && verified?.currency && (
        <p className="muted">
          {(verified.amount / 100).toFixed(2)} {verified.currency.toUpperCase()} wurden erfolgreich abgebucht.
        </p>
      )}
      <p>Die saubere PDF-Version ist ab sofort freigeschaltet.</p>
      {planId && (
        <a href={`/api/export/${planId}/pdf`} className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">
          {t('preview.download_pdf')}
        </a>
      )}
      {planId && <Link to={`/preview/${planId}`} className="btn btn-ghost">Zurück zur Vorschau</Link>}
    </div>
  );
}
