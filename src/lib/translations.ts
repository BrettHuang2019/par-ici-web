import type { LanguageCode, TranslationMap, TranslationMode } from './types';

// Named modes — see TranslationMode in types.ts for the numeric meaning.
export const TranslationModes = {
  Off: 0,
  Sentence: 1,
  SentenceChunk: 2,
  Chunk: 3,
  Reveal: 4,
} as const satisfies Record<string, TranslationMode>;

export const TRANSLATION_MODE_COUNT = 5;

export const showsSentenceTranslation = (m: TranslationMode): boolean =>
  m === TranslationModes.Sentence || m === TranslationModes.SentenceChunk;

export const showsChunkTranslation = (m: TranslationMode): boolean =>
  m === TranslationModes.SentenceChunk || m === TranslationModes.Chunk;

export const revealsFrench = (m: TranslationMode): boolean => m === TranslationModes.Reveal;

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
