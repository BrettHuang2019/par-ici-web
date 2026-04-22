import { Link } from 'react-router-dom';
import type { PisteInfo, Sentence, SentenceProgress, SentenceKey, RedWordEntry } from '../lib/types';
import { useProgressStore, sentenceKey } from '../store/progress';
import { useRedWordsStore } from '../store/redWords';

type Props = {
  piste: PisteInfo;
  sentences: Sentence[] | null;
};

type LessonColor = 'grey' | 'green' | 'yellow';

function getLessonColor(
  piste: PisteInfo,
  sentences: Sentence[] | null,
  progressData: Record<SentenceKey, SentenceProgress>,
  redWordData: Record<string, RedWordEntry>
): LessonColor {
  if (!sentences || sentences.length === 0) return 'grey';

  let anyTouched = false;
  let allPass = true;
  let anyRed = false;
  let anyFail = false;

  for (const s of sentences) {
    const key = sentenceKey(piste.episode, piste.piste, s.id);
    const prog = progressData[key] ?? { status: 'none', revealed: false };
    if (prog.status !== 'none') anyTouched = true;
    if (prog.status !== 'pass') allPass = false;
    if (prog.status === 'fail') anyFail = true;
    const hasRed = Object.values(redWordData).some(entry =>
      entry.refs.some(
        ref => ref.ep === piste.episode && ref.piste === piste.piste && ref.sentenceId === s.id
      )
    );
    if (hasRed) anyRed = true;
  }

  if (!anyTouched && !anyRed) return 'grey';
  if (allPass && !anyRed && !anyFail) return 'green';
  return 'yellow';
}

const colorClasses: Record<LessonColor, string> = {
  grey: 'border-gray-700 bg-gray-900 text-gray-200',
  green: 'border-green-500/60 bg-green-950/70 text-green-100',
  yellow: 'border-yellow-500/60 bg-yellow-950/60 text-yellow-100',
};

const fillClasses: Record<LessonColor, string> = {
  grey: 'bg-gray-400/70',
  green: 'bg-green-400',
  yellow: 'bg-yellow-400',
};

function compactTitle(title: string, pisteNumber: number): string {
  const exactPrefix = new RegExp(`^piste\\s*${pisteNumber}\\s*[-:—]?\\s*`, 'i');
  const genericPrefix = /^piste\s*\d+\s*[-:—]?\s*/i;
  return title.replace(exactPrefix, '').replace(genericPrefix, '').trim();
}

export function LessonCard({ piste, sentences }: Props) {
  const progressData = useProgressStore(s => s.data);
  const redWordData = useRedWordsStore(s => s.data);
  const color = getLessonColor(piste, sentences, progressData, redWordData);
  const totalSentences = sentences?.length ?? 0;
  const processedSentences = sentences?.filter(sentence => {
    const progress = progressData[sentenceKey(piste.episode, piste.piste, sentence.id)];
    return progress && (progress.status !== 'none' || progress.revealed);
  }).length ?? 0;
  const progressPercent = totalSentences > 0 ? (processedSentences / totalSentences) * 100 : 0;
  const title = compactTitle(piste.title, piste.piste);

  return (
    <Link
      to={`/player/${piste.episode}/${piste.piste}`}
      className={`relative flex aspect-square min-h-12 flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 transition-all hover:-translate-y-0.5 hover:brightness-110 ${colorClasses[color]}`}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-black/25"
      />
      <div
        className={`absolute bottom-0 left-0 h-0.5 transition-all ${fillClasses[color]}`}
        style={{ width: `${progressPercent}%` }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[9px] font-medium uppercase tracking-[0.18em] opacity-70">
            Piste {piste.piste}
          </div>
          <div className="text-[9px] font-semibold opacity-75">
            {processedSentences}/{totalSentences || '--'}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold leading-tight">{title}</div>
          <div className="mt-0.5 text-[9px] opacity-70">
            {Math.round(progressPercent)}% complete
          </div>
        </div>
      </div>
    </Link>
  );
}
