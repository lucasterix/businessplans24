export const SUPPORTED_LANGUAGES = ['de', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

export function isSupportedLanguage(s: string): s is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(s);
}

/**
 * Whether a given route path is content that should be language-prefixed.
 * App routes (wizard, account, payment, admin) are language-agnostic.
 */
export const LOCALIZED_PATHS = [
  '',
  'pricing',
  'founder',
  'beispiel',
  'example',
  'partner',
  'imprint',
  'privacy',
  'terms',
  'businessplan-gastronomie',
  'businessplan-kfw',
  'businessplan-arbeitsagentur',
  'businessplan-ecommerce',
  'businessplan-beratung',
] as const;

/** SEO landing variants that only make sense in Germany. */
export const GERMAN_ONLY_SEO_SLUGS = [
  'businessplan-kfw',
  'businessplan-arbeitsagentur',
] as const;
