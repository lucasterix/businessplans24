import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './store/useAuth';
import CookieBanner from './components/CookieBanner';
import LangLayout from './components/LangLayout';
import RootRedirect from './components/RootRedirect';
import Toasts from './components/Toasts';
import Skeleton from './components/Skeleton';
import { SUPPORTED_LANGUAGES, isSupportedLanguage } from './i18n/supportedLanguages';

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
const Sitemap = lazy(() => import('./pages/Sitemap'));

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminPayments = lazy(() => import('./admin/pages/AdminPayments'));
const AdminPlans = lazy(() => import('./admin/pages/AdminPlans'));
const AdminAds = lazy(() => import('./admin/pages/AdminAds'));
const AdminKeywords = lazy(() => import('./admin/pages/AdminKeywords'));
const RequireAdmin = lazy(() => import('./admin/RequireAdmin'));

function currentLangFromPath(pathname: string): string {
  const seg = pathname.split('/')[1] || '';
  return isSupportedLanguage(seg) ? seg : 'de';
}

function LangLink({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const location = useLocation();
  const lang = currentLangFromPath(location.pathname);
  const clean = to.replace(/^\/+/, '');
  const href = clean ? `/${lang}/${clean}` : `/${lang}`;
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentLang = currentLangFromPath(location.pathname);

  const switchLanguage = (next: string) => {
    if (!isSupportedLanguage(next)) return;
    i18n.changeLanguage(next);
    const parts = location.pathname.split('/');
    if (isSupportedLanguage(parts[1])) {
      parts[1] = next;
      const rest = location.search + location.hash;
      window.location.href = parts.join('/') + rest;
    } else {
      window.location.href = `/${next}` + location.pathname + location.search + location.hash;
    }
  };

  return (
    <header className="site-header">
      <LangLink to="" className="logo">
        <span className="logo-mark">B24</span>
        <span className="logo-name">{t('app.name')}</span>
      </LangLink>
      <nav className="site-nav">
        <LangLink to="example" className="nav-hide-sm">
          {t('nav.example', { defaultValue: 'Beispiel' })}
        </LangLink>
        <LangLink to="pricing" className="nav-hide-sm">{t('nav.pricing')}</LangLink>
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
          value={currentLang}
          onChange={(e) => switchLanguage(e.target.value)}
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
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
      <LangLink to="founder">{t('nav.founder', { defaultValue: 'Gründer' })}</LangLink>
      <LangLink to="partner">{t('nav.partner', { defaultValue: 'Partner' })}</LangLink>
      <LangLink to="example">{t('nav.example', { defaultValue: 'Beispiel' })}</LangLink>
      <LangLink to="imprint">{t('footer.imprint')}</LangLink>
      <LangLink to="privacy">{t('footer.privacy')}</LangLink>
      <LangLink to="terms">{t('footer.terms')}</LangLink>
      <LangLink to="sitemap">Sitemap</LangLink>
    </footer>
  );
}

function LegacyRedirect({ to }: { to: string }) {
  return <Navigate to={`/de${to}`} replace />;
}

function LegacyExampleRedirect() {
  const params = useParams();
  void params;
  return <Navigate to="/de/example" replace />;
}

function PublicShell() {
  const location = useLocation();
  return (
    <>
      <a href="#site-main" className="skip-link">Zum Hauptinhalt springen</a>
      <Header />
      <main className="site-main" id="site-main" key={location.pathname}>
        <Suspense fallback={<Skeleton variant="page" />}>
          <Routes>
            {/* Language-prefixed content routes */}
            <Route path="/:lang" element={<LangLayout />}>
              <Route index element={<Home />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="founder" element={<Founder />} />
              <Route path="example" element={<Example />} />
              <Route path="beispiel" element={<Example />} />
              <Route path="partner" element={<Partner />} />
              <Route path="imprint" element={<Imprint />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="businessplan-gastronomie" element={<SeoLanding variantKey="gastronomie" />} />
              <Route path="businessplan-kfw" element={<SeoLanding variantKey="kfw" />} />
              <Route path="businessplan-arbeitsagentur" element={<SeoLanding variantKey="arbeitsagentur" />} />
              <Route path="businessplan-ecommerce" element={<SeoLanding variantKey="ecommerce" />} />
              <Route path="businessplan-beratung" element={<SeoLanding variantKey="beratung" />} />
              <Route path="sitemap" element={<Sitemap />} />
            </Route>

            {/* Sitemap without lang prefix also works (common SEO expectation) */}
            <Route path="/sitemap" element={<Sitemap />} />

            {/* Application routes — language-agnostic (inherit user setting) */}
            <Route path="/wizard" element={<Wizard />} />
            <Route path="/wizard/:planId" element={<Wizard />} />
            <Route path="/preview/:planId" element={<Preview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment/:state" element={<PaymentReturn />} />

            {/* Root → detected language */}
            <Route path="/" element={<RootRedirect />} />

            {/* Legacy unprefixed content routes → 301 to /de/... */}
            <Route path="/pricing" element={<LegacyRedirect to="/pricing" />} />
            <Route path="/founder" element={<LegacyRedirect to="/founder" />} />
            <Route path="/beispiel" element={<LegacyExampleRedirect />} />
            <Route path="/example" element={<LegacyRedirect to="/example" />} />
            <Route path="/partner" element={<LegacyRedirect to="/partner" />} />
            <Route path="/imprint" element={<LegacyRedirect to="/imprint" />} />
            <Route path="/privacy" element={<LegacyRedirect to="/privacy" />} />
            <Route path="/terms" element={<LegacyRedirect to="/terms" />} />
            <Route path="/businessplan-gastronomie" element={<LegacyRedirect to="/businessplan-gastronomie" />} />
            <Route path="/businessplan-kfw" element={<LegacyRedirect to="/businessplan-kfw" />} />
            <Route path="/businessplan-arbeitsagentur" element={<LegacyRedirect to="/businessplan-arbeitsagentur" />} />
            <Route path="/businessplan-ecommerce" element={<LegacyRedirect to="/businessplan-ecommerce" />} />
            <Route path="/businessplan-beratung" element={<LegacyRedirect to="/businessplan-beratung" />} />

            <Route path="*" element={<Navigate to="/de" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
      <Toasts />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Suspense fallback={<Skeleton variant="page" />}>
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
