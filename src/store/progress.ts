import { create } from 'zustand';
import type { SentenceKey, SentenceProgress, SentenceStatus } from '../lib/types';

const STORAGE_KEY = 'par-ici/progress/v1';

function load(): Record<SentenceKey, SentenceProgress> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data: Record<SentenceKey, SentenceProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function sentenceKey(ep: number, piste: number, sentenceId: number): SentenceKey {
  return `ep${ep}_p${piste}_s${sentenceId}`;
}

type ProgressStore = {
  data: Record<SentenceKey, SentenceProgress>;
  setStatus: (key: SentenceKey, status: SentenceStatus) => void;
  setRevealed: (key: SentenceKey, revealed: boolean) => void;
  setPassAll: (keys: SentenceKey[]) => void;
  getProgress: (key: SentenceKey) => SentenceProgress;
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  data: load(),

  setStatus: (key, status) => {
    const next = { ...get().data, [key]: { ...get().getProgress(key), status } };
    save(next);
    set({ data: next });
  },

  setRevealed: (key, revealed) => {
    const next = { ...get().data, [key]: { ...get().getProgress(key), revealed } };
    save(next);
    set({ data: next });
  },

  setPassAll: (keys) => {
    const cur = get().data;
    const updates: Record<SentenceKey, SentenceProgress> = {};
    for (const k of keys) updates[k] = { status: 'pass', revealed: true };
    const next = { ...cur, ...updates };
    save(next);
    set({ data: next });
  },

  getProgress: (key) => get().data[key] ?? { status: 'none', revealed: false },
}));
