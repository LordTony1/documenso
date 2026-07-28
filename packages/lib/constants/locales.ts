import { z } from 'zod';

export const SUPPORTED_LANGUAGE_CODES = ['de', 'en', 'fr', 'es', 'hr', 'it', 'nl', 'pl', 'pt-BR', 'ja', 'ko', 'zh'] as const;

export type SupportedLanguageCodes = (typeof SUPPORTED_LANGUAGE_CODES)[number];

export const APP_I18N_OPTIONS = {
  supportedLangs: SUPPORTED_LANGUAGE_CODES,
  // Source language of the message ids in the code (used by Lingui extract). Must stay 'en'.
  sourceLang: 'en',
  // Fallback UI language when the request has no matching Accept-Language / cookie preference.
  defaultLanguage: 'hr',
  // Locale used for date/number formatting in generated PDFs (certificate, audit log).
  defaultLocale: 'hr-HR',
} as const;

export const ZSupportedLanguageCodeSchema = z
  .enum(SUPPORTED_LANGUAGE_CODES)
  .catch(APP_I18N_OPTIONS.defaultLanguage);
