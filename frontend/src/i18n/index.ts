import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['de', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const PLANNED_LANGUAGES = [
  'de', 'en', 'fr', 'it', 'es', 'pt', 'nl', 'pl', 'cs', 'sk',
  'hu', 'ro', 'bg', 'hr', 'sl', 'da', 'sv', 'no', 'fi', 'el',
  'et', 'lv', 'lt',
] as const;

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    ns: ['common'],
    defaultNS: 'common',
    load: 'languageOnly',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
