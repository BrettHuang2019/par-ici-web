import { create } from 'zustand';
import type { LanguageCode, TranslationMode } from '../lib/types';
import { TRANSLATION_MODE_COUNT } from '../lib/translations';

const TRANSLATION_LANGUAGE_KEY = 'par-ici/translation-language/v1';
const TRANSLATION_MODE_KEY = 'par-ici/translation-mode/v1';

function readTranslationLanguage(): LanguageCode {
  if (typeof localStorage === 'undefined') return 'zh';
  return localStorage.getItem(TRANSLATION_LANGUAGE_KEY) || 'zh';
}

function readTranslationMode(): TranslationMode {
  if (typeof localStorage === 'undefined') return 0;
  const value = Number(localStorage.getItem(TRANSLATION_MODE_KEY));
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : 0;
}

type PlayerStore = {
  currentTime: number;
  duration: number;
  playing: boolean;
  translationMode: TranslationMode;
  translationLanguage: LanguageCode;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaying: (p: boolean) => void;
  setTranslationLanguage: (language: LanguageCode) => void;
  cycleTranslationMode: () => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTime: 0,
  duration: 0,
  playing: false,
  translationMode: readTranslationMode(),
  translationLanguage: readTranslationLanguage(),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setPlaying: (p) => set({ playing: p }),
  setTranslationLanguage: (language) => {
    localStorage.setItem(TRANSLATION_LANGUAGE_KEY, language);
    set({ translationLanguage: language });
  },
  cycleTranslationMode: () => set((s) => {
    const translationMode = ((s.translationMode + 1) % TRANSLATION_MODE_COUNT) as TranslationMode;
    localStorage.setItem(TRANSLATION_MODE_KEY, String(translationMode));
    return { translationMode };
  }),
}));
