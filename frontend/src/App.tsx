import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/useAuth';
import CookieBanner from './components/CookieBanner';

const Home = lazy(() => import('./pages/Home'));
const Wizard = lazy(() => import('./pages/Wizard'));
const Preview = lazy(() => import('./pages/Preview'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/Profile'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));
const Imprint = lazy(() => import('./pages/Imprint'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Founder = lazy(() => import('./pages/Founder'));
const Example = lazy(() => import('./pages/Example'));
const Partner = lazy(() => import('./pages/Partner'));
const SeoLanding = lazy(() => import('./pages/SeoLanding'));

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminPayments = lazy(() => import('./admin/pages/AdminPayments'));
const AdminPlans = lazy(() => import('./admin/pages/AdminPlans'));
const AdminAds = lazy(() => import('./admin/pages/AdminAds'));
const AdminKeywords = lazy(() => import('./admin/pages/AdminKeywords'));
const RequireAdmin = lazy(() => import('./admin/RequireAdmin'));

function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <span className="logo-mark">B24</span>
        <span className="logo-name">{t('app.name')}</span>
      </Link>
      <nav className="site-nav">
        <Link to="/beispiel" className="nav-hide-sm">Beispiel</Link>
        <Link to="/pricing" className="nav-hide-sm">{t('nav.pricing')}</Link>
        {user ? (
          <>
            <Link to="/account" className="nav-hide-sm">{t('nav.account')}</Link>
            <button className="btn btn-ghost btn-sm" onClick={logout}>{t('nav.logout')}</button>
          </>
        ) : (
          <Link to="/login" className="nav-hide-sm">{t('nav.login')}</Link>
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
      </nav>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Businessplan24</span>
      <Link to="/founder">Gründer</Link>
      <Link to="/partner">Partner</Link>
      <Link to="/beispiel">Beispiel</Link>
      <Link to="/imprint">{t('footer.imprint')}</Link>
      <Link to="/privacy">{t('footer.privacy')}</Link>
      <Link to="/terms">{t('footer.terms')}</Link>
    </footer>
  );
}

function PublicShell() {
  return (
    <>
      <Header />
      <main className="site-main">
        <Suspense fallback={<div className="loading-fallback" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/wizard/:planId" element={<Wizard />} />
            <Route path="/preview/:planId" element={<Preview />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/founder" element={<Founder />} />
            <Route path="/beispiel" element={<Example />} />
            <Route path="/example" element={<Example />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/businessplan-gastronomie" element={<SeoLanding variantKey="gastronomie" />} />
            <Route path="/businessplan-kfw" element={<SeoLanding variantKey="kfw" />} />
            <Route path="/businessplan-arbeitsagentur" element={<SeoLanding variantKey="arbeitsagentur" />} />
            <Route path="/businessplan-ecommerce" element={<SeoLanding variantKey="ecommerce" />} />
            <Route path="/businessplan-beratung" element={<SeoLanding variantKey="beratung" />} />
            <Route path="/payment/:state" element={<PaymentReturn />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="loading-fallback" />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/plans" element={<AdminPlans />} />
            <Route path="/admin/ads" element={<AdminAds />} />
            <Route path="/admin/ads/keywords" element={<AdminKeywords />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return <PublicShell />;
}
