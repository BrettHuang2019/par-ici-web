# Par Ici PWA — Prototype Plan

## Scope
- Prototype only. EP04 pistes 19–22 (audio + `final.json` already in `par-ici/`).
- Hosted on local network via Vite dev server (`--host`).
- Streaming audio, no offline cache. PWA manifest for installable only.

## Stack
- **Vite + React 18 + TypeScript**
- **Zustand** — state (playback, toggles, progress)
- **LocalStorage** — persistence (red words, pass/fail, revealed)
- **vite-plugin-pwa** — installable manifest. No asset offline cache.
- **React Router** — 3 routes
- **Tailwind CSS** — speed

## Project layout
```
/public
  /audio/FLS2_EP04_P19.mp3 ... P22.mp3
  /data/FLS2_EP04_P19.final.json ... P22.final.json
  /data/manifest.json           # lists episodes/pistes
  icon-192.png, icon-512.png
/src
  /routes
    Home.tsx
    Player.tsx
    Practice.tsx
  /components
    SentenceRow.tsx
    ChunkBox.tsx
    WordSlot.tsx
    AudioBar.tsx
    LessonCard.tsx
  /store
    progress.ts       # pass/fail + revealed per sentence
    redWords.ts       # global red word set + source refs
    player.ts         # audio state, current time
  /lib
    audio.ts          # HTMLAudioElement wrapper + rAF ticker
    timing.ts         # find active word/chunk by t
    types.ts
/index.html
/vite.config.ts       # PWA plugin, host: true
```

## Data model
```ts
type Word = { text: string; start: number; end: number };
type Chunk = { text: string; zh: string; start: number; end: number };
type Sentence = {
  id: number; text: string; zh: string;
  start: number; end: number;
  words: Word[]; chunks: Chunk[];
};
type Piste = { episode: number; piste: number; title: string; audio: string; data: string };
type Manifest = { episodes: { id: number; pistes: Piste[] }[] };
```

## Storage schema (LocalStorage, JSON)

Key `par-ici/progress/v1`:
```ts
{
  [sentenceKey: `ep${E}_p${P}_s${id}`]: {
    status: 'none' | 'pass' | 'fail';
    revealed: boolean;   // true if pass OR user hit reveal
  }
}
```

Key `par-ici/red-words/v1`:
```ts
{
  [wordNorm: string]: {   // lowercased, punctuation stripped
    word: string;
    refs: Array<{ ep: number; piste: number; sentenceId: number; wordIdx: number }>
  }
}
```
Red words global. `refs` track every occurrence seen as red.

## Routes
1. `/` Home — episodes → pistes. LessonCard color:
   - **green**: every sentence `status='pass'` AND no red word anywhere in piste
   - **grey**: nothing touched
   - **yellow**: otherwise (in progress, has red, or has fail)
2. `/player/:ep/:piste` — audio + sentence list
3. `/practice` — sentences with ≥1 red word OR `status='fail'` across all pistes. Passing there drops sentence from list and clears its red words.

## Player page
- Top: AudioBar (play/pause, seek, time, global zh toggle)
- Body: scrollable SentenceRow list. Active sentence auto-scrolls into view.
- SentenceRow:
  - Buttons: `[✓ pass]` `[✗ fail]` (3-state toggle), `[Reveal]`, per-line zh toggle
  - Body: `ChunkBox[]` containing `WordSlot[]`

## Karaoke slot logic
- WordSlot default: empty box, width proportional to word length.
- Active slot (currentTime in `[word.start, word.end]`): highlight.
- After reveal: show text inside slot, still clickable.
- Click WordSlot → seek to enclosing `chunk.start`, continue playing.
- Click ChunkBox background → replay chunk.
- Double-click word state machine per word: `hidden → chunk-revealed → red`
  - 1st dblclick on hidden: reveal enclosing chunk's words
  - 2nd dblclick on revealed: mark red (persist)
  - dblclick on red: toggle off
- Pass button: `revealed=true` for all words, `status='pass'`
- Fail button: `status='fail'`, does not auto-reveal (fail with all-known words allowed)

## Audio engine
- Single `<audio>` per Player page.
- `requestAnimationFrame` loop while playing → update `currentTime` in store.
- `timing.ts` binary search for active word/chunk/sentence.
- Chunk replay: seek to `chunk.start`. No auto-pause at `chunk.end` by default.

## PWA config
- `manifest.webmanifest`: name, short_name, icons, `display=standalone`, `start_url=/`.
- SW: `registerType='autoUpdate'`, precache app shell only. Exclude `/audio/**` and `/data/**` → streaming + fresh JSON.
- Dev: `vite --host` for LAN. HTTPS only needed for install prompt off-localhost — accept LAN limitation for prototype.

## Milestones
1. **Scaffold** — Vite app, routing, `manifest.json` for EP04, Home shows grey pistes.
2. **Player shell** — audio element, AudioBar, plain sentence list.
3. **Karaoke** — WordSlot timing highlight + ChunkBox grouping + click replay.
4. **Interactions** — Reveal, pass/fail 3-state, zh toggle per-line + global.
5. **Red words** — dblclick state machine + persistence.
6. **Home colors** — derive from progress + red words.
7. **Practice page** — aggregate red+fail sentences; pass removes and clears red.
8. **PWA** — manifest + SW (no asset cache for audio/data), installable.
9. **Polish** — mobile touch (tap vs dblclick timing), auto-scroll active sentence.

## Decisions locked
- Scope: prototype, EP04 only.
- Host: local network (Vite `--host`).
- Red words: global, but persist full refs (ep/piste/sentence/wordIdx).
- Double-click: 2 stages (1st reveal chunk, 2nd mark red). 3rd toggles off.
- Pass/fail: 3-state toggle on sentence.
- Pass auto-reveals all words.
- Practice sources: red words OR failed sentences. Pass in practice clears red + removes.
- Audio: streaming only. No offline cache.
- Chunk box click: replays chunk (same as word click).
