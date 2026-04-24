import type { LanguageCode, TranslationMap } from './types';

export const SUPPORTED_LANGUAGES: Array<{ code: LanguageCode; label: string }> = [
  { code: 'zh', label: 'Chinese' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export function getTranslation(
  translations: TranslationMap | undefined,
  language: LanguageCode,
  fallbackLanguage: LanguageCode = 'zh',
): string {
  return translations?.[language] ?? translations?.[fallbackLanguage] ?? '';
}
