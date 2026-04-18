import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/useAuth';
import { listPlans } from '../api/client';

type PlanRow = {
  id: string;
  title: string | null;
  language: string;
  status: string;
  paid: number;
  updated_at: number;
};

export default function Account() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanRow[]>([]);

  useEffect(() => {
    if (!user) return;
    listPlans().then((p) => setPlans(p as PlanRow[])).catch(() => {});
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const subActive =
    user.subscription?.expiresAt && user.subscription.expiresAt > Date.now();

  return (
    <div className="account-layout">
      <header>
        <h1>{t('account.title')}</h1>
        <p className="muted">{user.email}</p>
        {subActive ? (
          <p className="pill pill-success">
            {t('account.subscription_active', {
              date: new Date(user.subscription!.expiresAt!).toLocaleDateString(i18n.language.slice(0, 2)),
            })}
          </p>
        ) : (
          <p className="muted">{t('account.no_subscription')}</p>
        )}
      </header>
      <section>
        <div className="account-section-head">
          <h2>{t('account.plans_title')}</h2>
          <Link to="/wizard" className="btn btn-primary">{t('account.new_plan')}</Link>
        </div>
        <ul className="plan-list">
          {plans.map((p) => (
            <li key={p.id}>
              <Link to={`/preview/${p.id}`}>
                {p.title || '(Entwurf)'} — {new Date(p.updated_at).toLocaleDateString(i18n.language.slice(0, 2))}
                {p.paid ? ' · ✓' : ''}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
