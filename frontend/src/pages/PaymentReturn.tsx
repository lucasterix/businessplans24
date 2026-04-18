import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

export default function PaymentReturn() {
  const { t } = useTranslation();
  const { state } = useParams();
  const [params] = useSearchParams();
  const planId = params.get('plan');
  const sessionId = params.get('session_id');

  const [verified, setVerified] = useState<null | { ok: boolean; amount?: number; currency?: string }>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state !== 'success' || !sessionId) return;
    setLoading(true);
    api
      .get(`/checkout/verify/${sessionId}`)
      .then((r) => setVerified(r.data))
      .catch(() => setVerified({ ok: false }))
      .finally(() => setLoading(false));
  }, [state, sessionId]);

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
