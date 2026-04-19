import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
 * Dynamically maintains per-page SEO tags:
 *   - <html lang> reflects current i18n language
 *   - canonical URL
 *   - hreflang alternates for bilingual pages (de + en + x-default)
 *   - og:locale
 *
 * For single-language pages (e.g. the German-market SEO landings), pass
 * `singleLanguage="de"` to skip the EN alternate.
 */
export default function DocHead({ title, description, ogLocale = 'auto', singleLanguage }: Props) {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language.slice(0, 2);
  const href = ORIGIN + location.pathname;

  useEffect(() => {
    document.documentElement.lang = singleLanguage || lang;
    if (title) document.title = title;
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description });
    }

    upsertMeta('link[rel="canonical"]', { rel: 'canonical', href });

    document.head.querySelectorAll('link[rel="alternate"][data-hreflang]').forEach((n) => n.remove());

    const add = (code: string) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      link.setAttribute('href', href);
      link.setAttribute('data-hreflang', '1');
      document.head.appendChild(link);
    };

    if (singleLanguage) {
      add(singleLanguage);
    } else {
      add('de');
      add('en');
      add('x-default');
    }

    const finalOgLocale =
      ogLocale === 'auto' ? (singleLanguage === 'en' ? 'en_US' : lang === 'en' ? 'en_US' : 'de_DE') : ogLocale;
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: finalOgLocale });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: href });
    if (title) upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    if (description) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  }, [lang, href, title, description, ogLocale, singleLanguage]);

  return null;
}
