import type { ManifestData, PisteInfo, Sentence } from './types';

// Module-level caches: manifest + each piste's sentences are fetched once per
// session and shared across Home / Player / Practice (and across navigations).

type PisteData = { sentences: Sentence[] };

let manifestPromise: Promise<ManifestData> | null = null;
const pisteCache = new Map<string, Promise<PisteData>>();

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export function loadManifest(): Promise<ManifestData> {
  manifestPromise ??= fetchJSON<ManifestData>('/data/manifest.json');
  return manifestPromise;
}

export function loadPisteData(dataUrl: string): Promise<PisteData> {
  let promise = pisteCache.get(dataUrl);
  if (!promise) {
    promise = fetchJSON<PisteData>(dataUrl);
    pisteCache.set(dataUrl, promise);
  }
  return promise;
}

export type LoadedPiste = { piste: PisteInfo; sentences: Sentence[] };

// Manifest + every piste's sentences, in manifest order.
export async function loadAllPistes(): Promise<LoadedPiste[]> {
  const manifest = await loadManifest();
  const pistes = manifest.episodes.flatMap(ep => ep.pistes);
  return Promise.all(
    pistes.map(async (piste) => ({
      piste,
      sentences: (await loadPisteData(piste.data)).sentences,
    }))
  );
}
