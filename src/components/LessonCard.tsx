import { Link } from 'react-router-dom';
import type { PisteInfo, Sentence, SentenceProgress, SentenceKey, RedWordEntry } from '../lib/types';
import { useProgressStore, sentenceKey } from '../store/progress';
import { useRedWordsStore } from '../store/redWords';

type Props = {
  piste: PisteInfo;
  sentences: Sentence[] | null;
};

type LessonStats = {
  total: number;
  passed: number;
  hasActivity: boolean;
  passRate: number;
};

function getLessonStats(
  piste: PisteInfo,
  sentences: Sentence[] | null,
  progressData: Record<SentenceKey, SentenceProgress>,
  redWordData: Record<string, RedWordEntry>
): LessonStats {
  if (!sentences || sentences.length === 0) {
    return { total: 0, passed: 0, hasActivity: false, passRate: 0 };
  }

  let passed = 0;
  let hasActivity = false;

  for (const s of sentences) {
    const key = sentenceKey(piste.episode, piste.piste, s.id);
    const prog = progressData[key] ?? { status: 'none', revealed: false };
    if (prog.status !== 'none' || prog.revealed) hasActivity = true;
    if (prog.status === 'pass') passed += 1;
    const hasRed = Object.values(redWordData).some(entry =>
      entry.refs.some(
        ref => ref.ep === piste.episode && ref.piste === piste.piste && ref.sentenceId === s.id
      )
    );
    if (hasRed) hasActivity = true;
  }

  return {
    total: sentences.length,
    passed,
    hasActivity,
    passRate: passed / sentences.length,
  };
}

const greyClasses = 'border-gray-700 bg-gray-900 text-gray-200';
const activeBaseClasses = 'text-yellow-50';

function passHue(passRate: number): number {
  const clampedRate = Math.min(Math.max(passRate, 0), 1);
  if (clampedRate <= 0.95) {
    return 48 + (66 - 48) * (clampedRate / 0.95);
  }

  return 66 + (142 - 66) * ((clampedRate - 0.95) / 0.05);
}

function compactTitle(title: string, pisteNumber: number): string {
  const exactPrefix = new RegExp(`^piste\\s*${pisteNumber}\\s*[-:—]?\\s*`, 'i');
  const genericPrefix = /^piste\s*\d+\s*[-:—]?\s*/i;
  return title.replace(exactPrefix, '').replace(genericPrefix, '').trim();
}

export function LessonCard({ piste, sentences }: Props) {
  const progressData = useProgressStore(s => s.data);
  const redWordData = useRedWordsStore(s => s.data);
  const stats = getLessonStats(piste, sentences, progressData, redWordData);
  const progressPercent = stats.passRate * 100;
  const hue = passHue(stats.passRate);
  const activeStyle = stats.hasActivity
    ? {
        borderColor: `hsl(${hue} 88% 54% / 0.62)`,
        backgroundColor: `hsl(${hue} 76% 17% / 0.66)`,
        color: `hsl(${hue} 78% 90%)`,
      }
    : undefined;
  const fillStyle = {
    width: `${progressPercent}%`,
    backgroundColor: stats.hasActivity ? `hsl(${hue} 88% 58%)` : undefined,
  };
  const title = compactTitle(piste.title, piste.piste);

  return (
    <Link
      to={`/player/${piste.episode}/${piste.piste}`}
      className={`relative flex aspect-square min-h-12 flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 transition-all hover:-translate-y-0.5 hover:brightness-110 ${stats.hasActivity ? activeBaseClasses : greyClasses}`}
      style={activeStyle}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-black/25"
      />
      <div
        className={`absolute bottom-0 left-0 h-0.5 transition-all ${stats.hasActivity ? '' : 'bg-gray-400/70'}`}
        style={fillStyle}
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[9px] font-medium uppercase tracking-[0.18em] opacity-70">
            Piste {piste.piste}
          </div>
          <div className="text-[9px] font-semibold opacity-75">
            {stats.passed}/{stats.total || '--'}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold leading-tight">{title}</div>
          <div className="mt-0.5 text-[9px] opacity-70">
            {Math.round(progressPercent)}% pass
          </div>
        </div>
      </div>
    </Link>
  );
}
