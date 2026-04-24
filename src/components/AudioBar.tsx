import React from 'react';
import { usePlayerStore } from '../store/player';
import type { AudioEngine } from '../lib/audio';

type Props = { engine: AudioEngine | null };

const ZH_MODE_LABELS = ['Translations off', 'Sentence translation', 'Sentence and chunk translations', 'Chunk translations'];
const ZH_MODE_ICONS = [
  <span aria-hidden="true" className="flex gap-0.5">
    <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-35" />
    <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-35" />
  </span>,
  <span aria-hidden="true" className="flex gap-0.5">
    <span className="block h-1.5 w-1.5 rounded-full bg-current" />
    <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-35" />
  </span>,
  <span aria-hidden="true" className="flex gap-0.5">
    <span className="block h-1.5 w-1.5 rounded-full bg-current" />
    <span className="block h-1.5 w-1.5 rounded-full bg-current" />
  </span>,
  <span aria-hidden="true" className="flex gap-0.5">
    <span className="block h-1.5 w-1.5 rounded-full bg-current opacity-35" />
    <span className="block h-1.5 w-1.5 rounded-full bg-current" />
  </span>,
];

export function AudioBar({ engine }: Props) {
  const { currentTime, duration, playing, zhMode, setPlaying, cycleZh } = usePlayerStore();

  const toggle = () => {
    if (!engine) return;
    if (playing) { engine.pause(); setPlaying(false); }
    else { engine.play(); setPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!engine) return;
    engine.seek(Number(e.target.value));
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span className="text-gray-400 text-sm w-10 flex-shrink-0">{fmt(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={seek}
          className="flex-1 accent-blue-500"
        />
        <span className="text-gray-400 text-sm w-10 flex-shrink-0 text-right">{fmt(duration)}</span>
        <button
          onClick={cycleZh}
          className={`h-8 w-8 rounded border flex items-center justify-center ${zhMode > 0 ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
          title={ZH_MODE_LABELS[zhMode]}
          aria-label={ZH_MODE_LABELS[zhMode]}
        >
          {ZH_MODE_ICONS[zhMode]}
        </button>
      </div>
    </div>
  );
}
