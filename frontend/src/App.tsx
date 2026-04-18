import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/useAuth';

const Landing = lazy(() => import('./pages/Landing'));
const Wizard = lazy(() => import('./pages/Wizard'));
const Preview = lazy(() => import('./pages/Preview'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Account = lazy(() => import('./pages/Account'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));

function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const hide = location.pathname.startsWith('/wizard');

  return (
    <header className={`site-header ${hide ? 'site-header--minimal' : ''}`}>
      <Link to="/" className="logo">
        <span className="logo-mark">B24</span>
        <span className="logo-name">{t('app.name')}</span>
      </Link>
      <nav className="site-nav">
        <Link to="/pricing">{t('nav.pricing')}</Link>
        {user ? (
          <>
            <Link to="/account">{t('nav.account')}</Link>
            <button className="btn btn-ghost" onClick={logout}>{t('nav.logout')}</button>
          </>
        ) : (
          <Link to="/login">{t('nav.login')}</Link>
        )}
        <select
          className="lang-select"
          aria-label="Language"
          value={i18n.language.slice(0, 2)}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
        >
          <option value="de">DE</option>
          <option value="en">EN</option>
        </select>
        <Link to="/wizard" className="btn btn-primary">{t('nav.start')}</Link>
      </nav>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Businessplan24</span>
      <span>·</span>
      <Link to="/imprint">{t('footer.imprint')}</Link>
      <span>·</span>
      <Link to="/privacy">{t('footer.privacy')}</Link>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="site-main">
        <Suspense fallback={<div className="loading-fallback" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/wizard/:planId" element={<Wizard />} />
            <Route path="/preview/:planId" element={<Preview />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/payment/:state" element={<PaymentReturn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
