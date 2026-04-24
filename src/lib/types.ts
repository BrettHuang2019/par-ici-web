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
export type EpisodeInfo = { id: number; pistes: PisteInfo[] };
export type ManifestData = { episodes: EpisodeInfo[] };

export type SentenceStatus = 'none' | 'pass' | 'fail';
export type SentenceKey = string; // `ep${E}_p${P}_s${id}`

export type SentenceProgress = {
  status: SentenceStatus;
  revealed: boolean;
};

export type RedWordEntry = {
  word: string;
  refs: Array<{ ep: number; piste: number; sentenceId: number; wordIdx: number }>;
};

// per-word reveal state within a session (not persisted — revealed state comes from progress store)
export type WordRevealState = 'hidden' | 'revealed' | 'red';
