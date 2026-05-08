import { useEffect, useRef } from 'react';
import type { Word, Chunk } from '../lib/types';

type WordState = 'hidden' | 'revealed' | 'red';

type Props = {
  word: Word;
  wordIdx: number;
  chunk: Chunk;
  isActive: boolean;
  globalRevealed: boolean;
  wordState: WordState;
  onStateChange: (wordIdx: number, newState: WordState) => void;
  onChunkClick: (chunk: Chunk) => void;
  ep: number;
  piste: number;
  sentenceId: number;
};

const CHAR_WIDTH = 12;
const MIN_WIDTH = 28;
const DOUBLE_CLICK_DELAY_MS = 220;

export function WordSlot({
  word, wordIdx, chunk, isActive, globalRevealed,
  wordState, onStateChange, onChunkClick,
}: Props) {
  const clickTimeoutRef = useRef<number | null>(null);

  const effectiveState: WordState = globalRevealed && wordState === 'hidden' ? 'revealed' : wordState;
  const width = Math.max(MIN_WIDTH, word.text.length * CHAR_WIDTH);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = window.setTimeout(() => {
      onChunkClick(chunk);
      clickTimeoutRef.current = null;
    }, DOUBLE_CLICK_DELAY_MS);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (effectiveState === 'hidden') {
      onStateChange(wordIdx, 'revealed');
    } else if (effectiveState === 'revealed') {
      onStateChange(wordIdx, 'red');
    } else {
      onStateChange(wordIdx, 'revealed');
    }
  };

  const activeClass = isActive ? 'ring-2 ring-blue-400 bg-blue-900/40' : '';

  const stateClass =
    effectiveState === 'red'
      ? 'border-red-500 bg-red-900/30 text-red-300'
      : effectiveState === 'revealed'
      ? 'border-gray-500 bg-gray-700 text-white'
      : 'border-gray-600 bg-gray-800 text-transparent';

  return (
    <span
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`inline-flex items-center justify-center rounded border cursor-pointer select-none
        text-sm font-mono px-1 py-0.5 transition-all ${stateClass} ${activeClass}`}
      style={{ minWidth: width, height: 32 }}
      title={effectiveState !== 'hidden' ? word.text : ''}
    >
      {effectiveState !== 'hidden' ? word.text : ' '.repeat(Math.max(1, word.text.length))}
    </span>
  );
}
