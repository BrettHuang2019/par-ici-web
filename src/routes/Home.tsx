import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LanguageCode, ManifestData, Sentence } from '../lib/types';
import { LessonCard } from '../components/LessonCard';
import { usePlayerStore } from '../store/player';
import { SUPPORTED_LANGUAGES } from '../lib/translations';

export function Home() {
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [pisteData, setPisteData] = useState<Record<string, Sentence[]>>({});
  const { translationLanguage, setTranslationLanguage } = usePlayerStore();

  useEffect(() => {
    fetch('/data/manifest.json')
      .then(r => r.json())
      .then((m: ManifestData) => {
        setManifest(m);
        // load all piste data for color computation
        const fetches = m.episodes.flatMap(ep =>
          ep.pistes.map(p =>
            fetch(p.data)
              .then(r => r.json())
              .then((d: { sentences: Sentence[] }) => ({ key: `${p.episode}_${p.piste}`, sentences: d.sentences }))
          )
        );
        Promise.all(fetches).then(results => {
          const map: Record<string, Sentence[]> = {};
          for (const { key, sentences } of results) map[key] = sentences;
          setPisteData(map);
        });
      });
  }, []);

  if (!manifest) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <h1 className="text-2xl font-bold">Par Ici</h1>
        <div className="flex items-center gap-2">
          <select
            value={translationLanguage}
            onChange={(event) => setTranslationLanguage(event.target.value as LanguageCode)}
            className="h-8 rounded border border-gray-700 bg-gray-900 px-2 text-sm text-gray-100"
            title="Translation language"
            aria-label="Translation language"
          >
            {SUPPORTED_LANGUAGES.map(language => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
          <Link
            to="/practice"
            className="px-3 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-sm font-medium"
          >
            Practice
          </Link>
        </div>
      </div>
      {manifest.episodes.map(ep => (
        <div key={ep.id} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Épisode {ep.id}
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {ep.pistes.map(p => (
              <LessonCard
                key={`${p.episode}_${p.piste}`}
                piste={p}
                sentences={pisteData[`${p.episode}_${p.piste}`] ?? null}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
