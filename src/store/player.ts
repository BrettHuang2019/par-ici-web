import { create } from 'zustand';

type PlayerStore = {
  currentTime: number;
  duration: number;
  playing: boolean;
  zhMode: number; // 0=off, 1=sentence, 2=sentence+chunk, 3=chunk only
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setPlaying: (p: boolean) => void;
  cycleZh: () => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTime: 0,
  duration: 0,
  playing: false,
  zhMode: 0,
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setPlaying: (p) => set({ playing: p }),
  cycleZh: () => set((s) => ({ zhMode: (s.zhMode + 1) % 4 })),
}));
