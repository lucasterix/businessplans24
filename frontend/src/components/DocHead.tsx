import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, isSupportedLanguage } from '../i18n/supportedLanguages';

interface Props {
  title?: string;
  description?: string;
  ogLocale?: 'de_DE' | 'en_US' | 'auto';
  /** If the page only exists in one language, restrict to that. */
  singleLanguage?: 'de' | 'en';
}

const ORIGIN = 'https://businessplans24.com';

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    const tag = selector.startsWith('link') ? 'link' : 'meta';
    el = document.createElement(tag) as HTMLMetaElement | HTMLLinkElement;
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/**
 * Strip the `/:lang` prefix from the current pathname, returning the content
 * path. e.g. /de/pricing → /pricing.
 */
function stripLang(pathname: string): string {
  const parts = pathname.split('/');
  if (isSupportedLanguage(parts[1])) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

/**
 * Dynamic per-page SEO head:
 *   - <html lang> follows current i18n language
 *   - canonical = origin + current path
 *   - hreflang alternates: one per supported language pointing at
 *     /<lang>/<content-path>, plus x-default → DE
 *   - og:locale/url/title/description
 *
 * For single-language pages (e.g. DE-only SEO landings), pass
 * singleLanguage="de" — hreflang will point only to that language,
 * x-default to that same URL.
 */
export default function DocHead({ title, description, ogLocale = 'auto', singleLanguage }: Props) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = singleLanguage || (isSupportedLanguage(i18n.language.slice(0, 2)) ? i18n.language.slice(0, 2) : 'de');
  const contentPath = stripLang(location.pathname); // e.g. /pricing
  const href = ORIGIN + location.pathname;

  useEffect(() => {
    document.documentElement.lang = currentLang;
    if (title) document.title = title;
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description });
    }

    upsertMeta('link[rel="canonical"]', { rel: 'canonical', href });

    // Reset previous alternates
    document.head.querySelectorAll('link[rel="alternate"][data-hreflang]').forEach((n) => n.remove());

    const addAlt = (code: string, targetHref: string) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', targetHref);
      link.setAttribute('data-hreflang', '1');
      document.head.appendChild(link);
    };

    if (singleLanguage) {
      const targetHref = `${ORIGIN}/${singleLanguage}${contentPath === '/' ? '' : contentPath}`;
      addAlt(singleLanguage, targetHref);
      addAlt('x-default', targetHref);
    } else {
      SUPPORTED_LANGUAGES.forEach((l) => {
        addAlt(l, `${ORIGIN}/${l}${contentPath === '/' ? '' : contentPath}`);
      });
      addAlt('x-default', `${ORIGIN}/de${contentPath === '/' ? '' : contentPath}`);
    }

    const finalOgLocale =
      ogLocale === 'auto'
        ? currentLang === 'en' ? 'en_US' : 'de_DE'
        : ogLocale;
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: finalOgLocale });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: href });
    if (title) upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    if (description) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  }, [currentLang, href, contentPath, title, description, ogLocale, singleLanguage]);

  return null;
}
