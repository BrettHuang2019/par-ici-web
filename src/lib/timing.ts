import type { Sentence, Chunk, Word } from './types';

export function findActiveSentence(sentences: Sentence[], t: number): number {
  for (let i = 0; i < sentences.length; i++) {
    if (t >= sentences[i].start && t <= sentences[i].end) return i;
    if (i > 0 && t > sentences[i - 1].end && t < sentences[i].start) return i - 1;
  }
  return sentences.length - 1;
}

export function findActiveWord(words: Word[], t: number): number {
  for (let i = 0; i < words.length; i++) {
    if (t >= words[i].start && t <= words[i].end) return i;
  }
  return -1;
}

export function findChunkForWord(chunks: Chunk[], wordStart: number): Chunk | null {
  for (const chunk of chunks) {
    if (wordStart >= chunk.start && wordStart <= chunk.end) return chunk;
  }
  return null;
}

export function findActiveChunk(chunks: Chunk[], t: number): number {
  for (let i = 0; i < chunks.length; i++) {
    if (t >= chunks[i].start && t <= chunks[i].end) return i;
  }
  return -1;
}

export function normalizeWord(text: string): string {
  return text.toLowerCase().replace(/[^a-zàâäéèêëîïôùûüÿœæç']/gi, '');
}
