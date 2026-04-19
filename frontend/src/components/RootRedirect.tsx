import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '../i18n/supportedLanguages';

export default function RootRedirect() {
  const { i18n } = useTranslation();
  const detected = i18n.language.slice(0, 2);
  const target = isSupportedLanguage(detected) ? detected : DEFAULT_LANGUAGE;
  return <Navigate to={`/${target}`} replace />;
}
