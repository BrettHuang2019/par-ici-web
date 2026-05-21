import { create } from 'zustand';
import type { SentenceKey } from '../lib/types';

const STORAGE_KEY = 'par-ici/practice-queue/v1';

type PracticeQueueData = {
  practicedAt: Record<SentenceKey, number>;
};

function load(): PracticeQueueData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"practicedAt":{}}');
  } catch {
    return { practicedAt: {} };
  }
}

function save(data: PracticeQueueData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type PracticeQueueStore = {
  data: PracticeQueueData;
  markPracticed: (key: SentenceKey) => void;
  prune: (validKeys: SentenceKey[]) => void;
};

export const usePracticeQueueStore = create<PracticeQueueStore>((set, get) => ({
  data: load(),

  markPracticed: (key) => {
    const next = {
      practicedAt: {
        ...get().data.practicedAt,
        [key]: Date.now(),
      },
    };
    save(next);
    set({ data: next });
  },

  prune: (validKeys) => {
    const current = get().data.practicedAt;
    const valid = new Set(validKeys);
    const practicedAt = Object.fromEntries(
      Object.entries(current).filter(([key]) => valid.has(key))
    );
    if (Object.keys(practicedAt).length === Object.keys(current).length) return;
    const next = { practicedAt };
    save(next);
    set({ data: next });
  },
}));
