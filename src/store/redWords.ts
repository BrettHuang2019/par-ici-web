import { create } from 'zustand';
import type { RedWordEntry } from '../lib/types';
import { normalizeWord } from '../lib/timing';

const STORAGE_KEY = 'par-ici/red-words/v1';

function load(): Record<string, RedWordEntry> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data: Record<string, RedWordEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type RedWordsStore = {
  data: Record<string, RedWordEntry>;
  isRed: (wordText: string, ep: number, piste: number, sentenceId: number) => boolean;
  addRed: (wordText: string, ep: number, piste: number, sentenceId: number, wordIdx: number) => void;
  removeRed: (wordText: string, ep: number, piste: number, sentenceId: number) => void;
  clearSentenceReds: (ep: number, piste: number, sentenceId: number) => void;
  getRedKeysForSentence: (ep: number, piste: number, sentenceId: number) => string[];
};

export const useRedWordsStore = create<RedWordsStore>((set, get) => ({
  data: load(),

  isRed: (wordText, ep, piste, sentenceId) => {
    const norm = normalizeWord(wordText);
    return get().data[norm]?.refs.some(
      r => r.ep === ep && r.piste === piste && r.sentenceId === sentenceId
    ) ?? false;
  },

  addRed: (wordText, ep, piste, sentenceId, wordIdx) => {
    const norm = normalizeWord(wordText);
    const cur = get().data;
    const entry = cur[norm] ?? { word: wordText, refs: [] };
    const alreadyHasRef = entry.refs.some(
      r => r.ep === ep && r.piste === piste && r.sentenceId === sentenceId && r.wordIdx === wordIdx
    );
    if (alreadyHasRef) return;
    const next = {
      ...cur,
      [norm]: { word: wordText, refs: [...entry.refs, { ep, piste, sentenceId, wordIdx }] },
    };
    save(next);
    set({ data: next });
  },

  removeRed: (wordText, ep, piste, sentenceId) => {
    const norm = normalizeWord(wordText);
    const cur = get().data;
    const entry = cur[norm];
    if (!entry) return;

    const remaining = entry.refs.filter(
      r => !(r.ep === ep && r.piste === piste && r.sentenceId === sentenceId)
    );
    const next = { ...cur };
    if (remaining.length > 0) {
      next[norm] = { ...entry, refs: remaining };
    } else {
      delete next[norm];
    }
    save(next);
    set({ data: next });
  },

  clearSentenceReds: (ep, piste, sentenceId) => {
    const cur = get().data;
    const next: Record<string, RedWordEntry> = {};
    for (const [norm, entry] of Object.entries(cur)) {
      const remaining = entry.refs.filter(
        r => !(r.ep === ep && r.piste === piste && r.sentenceId === sentenceId)
      );
      if (remaining.length > 0) {
        next[norm] = { ...entry, refs: remaining };
      }
    }
    save(next);
    set({ data: next });
  },

  getRedKeysForSentence: (ep, piste, sentenceId) => {
    const cur = get().data;
    return Object.keys(cur).filter(norm =>
      cur[norm].refs.some(r => r.ep === ep && r.piste === piste && r.sentenceId === sentenceId)
    );
  },
}));
