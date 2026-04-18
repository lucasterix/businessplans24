import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="landing">
      <section className="hero">
        <h1>{t('landing.hero_title')}</h1>
        <p className="hero-sub">{t('landing.hero_sub')}</p>
        <div className="hero-ctas">
          <Link to="/wizard" className="btn btn-primary btn-lg">{t('landing.cta_start')}</Link>
          <Link to="/pricing" className="btn btn-ghost btn-lg">{t('landing.cta_pricing')}</Link>
        </div>
      </section>

      <section className="features">
        <h2>{t('landing.features_title')}</h2>
        <div className="feature-grid">
          {(['f1', 'f2', 'f3', 'f4'] as const).map((k) => (
            <article key={k} className="feature-card">
              <h3>{t(`landing.${k}_title`)}</h3>
              <p>{t(`landing.${k}_desc`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <h2>{t('landing.how_title')}</h2>
        <ol className="how-list">
          <li>{t('landing.how1')}</li>
          <li>{t('landing.how2')}</li>
          <li>{t('landing.how3')}</li>
          <li>{t('landing.how4')}</li>
        </ol>
      </section>
    </div>
  );
}
