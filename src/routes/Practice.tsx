import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Sentence, ManifestData, Chunk } from '../lib/types';
import { useProgressStore, sentenceKey } from '../store/progress';
import { useRedWordsStore } from '../store/redWords';
import { SentenceRow } from '../components/SentenceRow';
import { AudioEngine } from '../lib/audio';
import { usePlayerStore } from '../store/player';
import { TranslationModeButton } from '../components/TranslationModeButton';

type LoadedPiste = {
  ep: number;
  piste: number;
  audioSrc: string;
  sentences: Sentence[];
};

const PAGE_SIZE = 20;

export function Practice() {
  const [loadedPistes, setLoadedPistes] = useState<LoadedPiste[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activePracticeKey, setActivePracticeKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const progressData = useProgressStore(s => s.data);
  const redWordsData = useRedWordsStore(s => s.data);
  const { translationMode, translationLanguage, setCurrentTime, setDuration, setPlaying } = usePlayerStore();
  const enginesRef = useRef<Map<string, AudioEngine>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const redSentenceKeys = new Set<string>();
    for (const entry of Object.values(redWordsData)) {
      for (const ref of entry.refs) {
        redSentenceKeys.add(sentenceKey(ref.ep, ref.piste, ref.sentenceId));
      }
    }

    return loadedPistes.flatMap((p) =>
      p.sentences.flatMap((s) => {
        const key = sentenceKey(p.ep, p.piste, s.id);
        const prog = progressData[key];
        const hasRed = redSentenceKeys.has(key);
        return prog?.status === 'fail' || hasRed
          ? [{ sentence: s, ep: p.ep, piste: p.piste, audioSrc: p.audioSrc }]
          : [];
      })
    );
  }, [loadedPistes, progressData, redWordsData]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(count => Math.min(Math.max(count, PAGE_SIZE), items.length || PAGE_SIZE));
  }, [items.length]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisibleCount(PAGE_SIZE);

    fetch('/data/manifest.json')
      .then(r => r.json())
      .then(async (m: ManifestData) => {
        const pistes = m.episodes.flatMap(ep => ep.pistes);
        const pisteData = await Promise.all(
          pistes.map(async (p) => ({
            piste: p,
            data: await fetch(p.data).then(r => r.json()) as { sentences: Sentence[] },
          }))
        );

        if (cancelled) return;
        setLoadedPistes(pisteData.map(({ piste: p, data }) => ({
          ep: p.episode,
          piste: p.piste,
          audioSrc: p.audio,
          sentences: data.sentences,
        })));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const engines = enginesRef.current;
    return () => {
      for (const eng of engines.values()) eng.destroy();
      setActivePracticeKey(null);
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
    };
  }, [setCurrentTime, setDuration, setPlaying]);

  const getEngine = (audioSrc: string): AudioEngine => {
    if (!enginesRef.current.has(audioSrc)) {
      const eng = new AudioEngine(audioSrc, (t) => setCurrentTime(t));
      eng.onEnded(() => {
        setActivePracticeKey(null);
        setPlaying(false);
      });
      eng.onRangePaused(() => {
        setActivePracticeKey(null);
        setPlaying(false);
      });
      enginesRef.current.set(audioSrc, eng);
    }
    return enginesRef.current.get(audioSrc)!;
  };

  const handleChunkClick = (itemKey: string, audioSrc: string, chunk: Chunk) => {
    for (const [src, eng] of enginesRef.current.entries()) {
      if (src !== audioSrc) eng.pause();
    }
    setActivePracticeKey(itemKey);
    getEngine(audioSrc).playRange(chunk.start, chunk.end);
    setPlaying(true);
  };

  const handleSentenceClick = (itemKey: string, audioSrc: string, start: number, end: number) => {
    for (const [src, eng] of enginesRef.current.entries()) {
      if (src !== audioSrc) eng.pause();
    }
    setActivePracticeKey(itemKey);
    getEngine(audioSrc).playRange(start, end);
    setPlaying(true);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || visibleCount >= items.length) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 400) {
      setVisibleCount(count => Math.min(count + PAGE_SIZE, items.length));
    }
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
        <div className="ml-auto">
          <TranslationModeButton />
        </div>
      </div>
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-4xl mb-3">🎉</div>
            <div>No sentences to practice.</div>
            <div className="text-sm mt-1">Mark words red or sentences as fail to add them here.</div>
          </div>
        ) : (
          <>
            {visibleItems.map(({ sentence, ep, piste, audioSrc }) => {
              const itemKey = sentenceKey(ep, piste, sentence.id);
              return (
                <SentenceRow
                  key={itemKey}
                  sentence={sentence}
                  isActive={itemKey === activePracticeKey}
                  ep={ep}
                  piste={piste}
                  onChunkClick={(chunk) => handleChunkClick(itemKey, audioSrc, chunk)}
                  onSentenceClick={(start, end) => handleSentenceClick(itemKey, audioSrc, start, end)}
                  translationMode={translationMode}
                  translationLanguage={translationLanguage}
                  practiceMode
                />
              );
            })}
            {visibleCount < items.length && (
              <div className="py-4 text-center text-xs text-gray-500">
                Loading more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
