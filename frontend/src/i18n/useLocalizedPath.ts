import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from './supportedLanguages';

/**
 * Resolve the current language from either the :lang URL param (preferred,
 * authoritative) or the i18n.language (fallback for routes that aren't
 * language-prefixed). Always returns a supported language.
 */
export function useCurrentLanguage(): SupportedLanguage {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  if (lang && isSupportedLanguage(lang)) return lang;
  const base = i18n.language.slice(0, 2);
  if (isSupportedLanguage(base)) return base;
  return DEFAULT_LANGUAGE;
}

/**
 * Prefix a content path with the current language. Pass '' or '/' for root.
 * Usage: const loc = useLocalizedPath(); <Link to={loc('pricing')}/>
 */
export function useLocalizedPath() {
  const lang = useCurrentLanguage();
  return (path: string): string => {
    const clean = path.replace(/^\/+/, '');
    return clean ? `/${lang}/${clean}` : `/${lang}`;
  };
}
