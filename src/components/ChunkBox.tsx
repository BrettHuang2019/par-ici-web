import type { Chunk, Word } from '../lib/types';
import { WordSlot } from './WordSlot';

type WordState = 'hidden' | 'revealed' | 'red';

type Props = {
  chunk: Chunk;
  chunkIdx: number;
  words: Word[];
  wordIndices: number[];
  activeWordIdx: number;
  isActiveChunk: boolean;
  globalRevealed: boolean;
  wordStates: WordState[];
  onWordStateChange: (wordIdx: number, state: WordState) => void;
  onChunkClick: (chunk: Chunk) => void;
  zhMode: number;
  ep: number;
  piste: number;
  sentenceId: number;
};

export function ChunkBox({
  chunk, words, wordIndices, activeWordIdx, isActiveChunk,
  globalRevealed, wordStates, onWordStateChange, onChunkClick,
  zhMode, ep, piste, sentenceId,
}: Props) {
  return (
    <div
      className={`inline-flex flex-col items-start border rounded-lg p-1.5 gap-1 cursor-pointer
        transition-colors ${isActiveChunk ? 'border-blue-500/60 bg-blue-950/30' : 'border-gray-700 bg-gray-800/40'}
        hover:border-gray-500`}
      onClick={(e) => { e.stopPropagation(); onChunkClick(chunk); }}
    >
      <div className="flex flex-wrap gap-1">
        {wordIndices.map((wi, localIdx) => (
          <WordSlot
            key={wi}
            word={words[wi]}
            wordIdx={wi}
            chunk={chunk}
            isActive={wi === activeWordIdx}
            globalRevealed={globalRevealed}
            wordState={wordStates[localIdx]}
            onStateChange={onWordStateChange}
            onChunkClick={onChunkClick}
            ep={ep}
            piste={piste}
            sentenceId={sentenceId}
          />
        ))}
      </div>
      {(zhMode === 2 || zhMode === 3) && (
        <span className="text-xs text-yellow-400/80 leading-tight">{chunk.zh}</span>
      )}
    </div>
  );
}
