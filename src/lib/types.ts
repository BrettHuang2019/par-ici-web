export type Word = { text: string; start: number; end: number };
export type LanguageCode = string;
export type TranslationMap = Record<LanguageCode, string>;
export type Chunk = { text: string; translations: TranslationMap; start: number; end: number };
export type Sentence = {
  id: number;
  text: string;
  translations: TranslationMap;
  start: number;
  end: number;
  words: Word[];
  chunks: Chunk[];
};
export type PisteInfo = {
  episode: number;
  piste: number;
  title: string;
  audio: string;
  data: string;
};
export type EpisodeInfo = { id: number; title?: string; pistes: PisteInfo[] };
export type ManifestData = { episodes: EpisodeInfo[] };

export type SentenceStatus = 'none' | 'pass' | 'fail';
export type SentenceKey = string; // `ep${E}_p${P}_s${id}`

// 0=off, 1=sentence, 2=sentence+chunk, 3=chunk only, 4=reveal FR+sentence
export type TranslationMode = 0 | 1 | 2 | 3 | 4;

// per-word reveal state within a sentence row
export type WordState = 'hidden' | 'revealed' | 'red';

export type WordRef = { ep: number; piste: number; sentenceId: number; wordIdx: number };

export type SentenceProgress = {
  status: SentenceStatus;
  revealed: boolean;
};

export type RedWordEntry = {
  word: string;
  refs: WordRef[];
};
