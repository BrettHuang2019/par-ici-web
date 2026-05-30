import { create } from 'zustand';
import type { SentenceKey, SentenceProgress, SentenceStatus } from '../lib/types';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'par-ici/progress/v1';
type ProgressData = Record<SentenceKey, SentenceProgress>;

export function sentenceKey(ep: number, piste: number, sentenceId: number): SentenceKey {
  return `ep${ep}_p${piste}_s${sentenceId}`;
}

type ProgressStore = {
  data: ProgressData;
  setStatus: (key: SentenceKey, status: SentenceStatus) => void;
  setRevealed: (key: SentenceKey, revealed: boolean) => void;
  setPassAll: (keys: SentenceKey[]) => void;
  getProgress: (key: SentenceKey) => SentenceProgress;
};

export const useProgressStore = create<ProgressStore>((set, get) => {
  const commit = (data: ProgressData) => {
    saveJSON(STORAGE_KEY, data);
    set({ data });
  };

  return {
    data: loadJSON<ProgressData>(STORAGE_KEY, {}),

    setStatus: (key, status) =>
      commit({ ...get().data, [key]: { ...get().getProgress(key), status } }),

    setRevealed: (key, revealed) =>
      commit({ ...get().data, [key]: { ...get().getProgress(key), revealed } }),

    setPassAll: (keys) => {
      const updates: ProgressData = {};
      for (const k of keys) updates[k] = { status: 'pass', revealed: true };
      commit({ ...get().data, ...updates });
    },

    getProgress: (key) => get().data[key] ?? { status: 'none', revealed: false },
  };
});
