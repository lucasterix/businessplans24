import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PaymentReturn() {
  const { t } = useTranslation();
  const { state } = useParams();
  const [params] = useSearchParams();
  const planId = params.get('plan');

  if (state === 'cancel') {
    return (
      <div className="payment-return">
        <h1>Zahlung abgebrochen</h1>
        {planId && <Link to={`/preview/${planId}`} className="btn btn-primary">{t('wizard.back')}</Link>}
      </div>
    );
  }

  if (state === 'mock') {
    return (
      <div className="payment-return">
        <h1>Mock-Zahlung</h1>
        <p className="muted">
          Stripe ist noch nicht konfiguriert. In Produktion würdest du hier zu Stripe Checkout
          weitergeleitet.
        </p>
        {planId && <Link to={`/preview/${planId}`} className="btn btn-primary">{t('wizard.back')}</Link>}
      </div>
    );
  }

  return (
    <div className="payment-return">
      <h1>Danke!</h1>
      <p>Deine Zahlung wurde empfangen. Die saubere PDF-Version ist freigeschaltet.</p>
      {planId && (
        <a href={`/api/export/${planId}/pdf`} className="btn btn-primary" target="_blank" rel="noreferrer">
          {t('preview.download_pdf')}
        </a>
      )}
    </div>
  );
}
