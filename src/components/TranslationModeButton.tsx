import { usePlayerStore } from '../store/player';

const TRANSLATION_MODE_LABELS = ['Translations off', 'Sentence translation', 'Sentence and chunk translations', 'Chunk translations'];
const TRANSLATION_MODE_ICONS = [
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

export function TranslationModeButton() {
  const { translationMode, cycleTranslationMode } = usePlayerStore();

  return (
    <button
      onClick={cycleTranslationMode}
      className={`h-8 w-8 rounded border flex items-center justify-center ${translationMode > 0 ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
      title={TRANSLATION_MODE_LABELS[translationMode]}
      aria-label={TRANSLATION_MODE_LABELS[translationMode]}
    >
      {TRANSLATION_MODE_ICONS[translationMode]}
    </button>
  );
}
