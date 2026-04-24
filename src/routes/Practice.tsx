import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Sentence, ManifestData, Chunk } from '../lib/types';
import { useProgressStore, sentenceKey } from '../store/progress';
import { useRedWordsStore } from '../store/redWords';
import { SentenceRow } from '../components/SentenceRow';
import { AudioEngine } from '../lib/audio';
import { usePlayerStore } from '../store/player';

type PracticeSentence = {
  sentence: Sentence;
  ep: number;
  piste: number;
  audioSrc: string;
};

export function Practice() {
  const [items, setItems] = useState<PracticeSentence[]>([]);
  const [loading, setLoading] = useState(true);
  const getProgress = useProgressStore(s => s.getProgress);
  const getRedKeysForSentence = useRedWordsStore(s => s.getRedKeysForSentence);
  const { zhMode, setCurrentTime, setDuration, setPlaying } = usePlayerStore();
  const enginesRef = useRef<Map<string, AudioEngine>>(new Map());

  useEffect(() => {
    fetch('/data/manifest.json')
      .then(r => r.json())
      .then(async (m: ManifestData) => {
        const result: PracticeSentence[] = [];
        for (const ep of m.episodes) {
          for (const p of ep.pistes) {
            const d: { sentences: Sentence[] } = await fetch(p.data).then(r => r.json());
            for (const s of d.sentences) {
              const key = sentenceKey(p.episode, p.piste, s.id);
              const prog = getProgress(key);
              const hasRed = getRedKeysForSentence(p.episode, p.piste, s.id).length > 0;
              if (prog.status === 'fail' || hasRed) {
                result.push({ sentence: s, ep: p.episode, piste: p.piste, audioSrc: p.audio });
              }
            }
          }
        }
        setItems(result);
        setLoading(false);
      });
  }, [getProgress, getRedKeysForSentence]);

  useEffect(() => {
    const engines = enginesRef.current;
    return () => {
      for (const eng of engines.values()) eng.destroy();
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
    };
  }, [setCurrentTime, setDuration, setPlaying]);

  const getEngine = (audioSrc: string): AudioEngine => {
    if (!enginesRef.current.has(audioSrc)) {
      const eng = new AudioEngine(audioSrc, (t) => setCurrentTime(t));
      eng.onEnded(() => setPlaying(false));
      eng.onRangePaused(() => setPlaying(false));
      enginesRef.current.set(audioSrc, eng);
    }
    return enginesRef.current.get(audioSrc)!;
  };

  const handleChunkClick = (audioSrc: string, chunk: Chunk) => {
    for (const [src, eng] of enginesRef.current.entries()) {
      if (src !== audioSrc) eng.pause();
    }
    getEngine(audioSrc).playRange(chunk.start, chunk.end);
    setPlaying(true);
  };

  const handleSentenceClick = (audioSrc: string, start: number, end: number) => {
    for (const [src, eng] of enginesRef.current.entries()) {
      if (src !== audioSrc) eng.pause();
    }
    getEngine(audioSrc).playRange(start, end);
    setPlaying(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-400">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium border border-gray-600 transition-colors"
        >
          ← Home
        </Link>
        <span className="text-gray-500">|</span>
        <span className="text-sm font-semibold text-purple-300">Practice ({items.length})</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-4xl mb-3">🎉</div>
            <div>No sentences to practice.</div>
            <div className="text-sm mt-1">Mark words red or sentences as fail to add them here.</div>
          </div>
        ) : (
          items.map(({ sentence, ep, piste, audioSrc }) => (
            <SentenceRow
              key={`${ep}_${piste}_${sentence.id}`}
              sentence={sentence}
              isActive={false}
              ep={ep}
              piste={piste}
              onChunkClick={(chunk) => handleChunkClick(audioSrc, chunk)}
              onSentenceClick={(start, end) => handleSentenceClick(audioSrc, start, end)}
              zhMode={zhMode}
              practiceMode
            />
          ))
        )}
      </div>
    </div>
  );
}
