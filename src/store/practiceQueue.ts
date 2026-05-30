import { create } from 'zustand';
import type { SentenceKey } from '../lib/types';
import { loadJSON, saveJSON } from '../lib/storage';

const STORAGE_KEY = 'par-ici/practice-queue/v1';

type PracticeQueueData = {
  practicedAt: Record<SentenceKey, number>;
};

type PracticeQueueStore = {
  data: PracticeQueueData;
  markPracticed: (key: SentenceKey) => void;
  prune: (validKeys: SentenceKey[]) => void;
};

export const usePracticeQueueStore = create<PracticeQueueStore>((set, get) => {
  const commit = (data: PracticeQueueData) => {
    saveJSON(STORAGE_KEY, data);
    set({ data });
  };

  return {
    data: loadJSON<PracticeQueueData>(STORAGE_KEY, { practicedAt: {} }),

    markPracticed: (key) =>
      commit({ practicedAt: { ...get().data.practicedAt, [key]: Date.now() } }),

    prune: (validKeys) => {
      const current = get().data.practicedAt;
      const valid = new Set(validKeys);
      const practicedAt = Object.fromEntries(
        Object.entries(current).filter(([key]) => valid.has(key))
      );
      if (Object.keys(practicedAt).length === Object.keys(current).length) return;
      commit({ practicedAt });
    },
  };
});
