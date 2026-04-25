# Par Ici Web

Prototype PWA for working through Par Ici episode 4 pistes with streaming audio, timed sentence/word playback, progress tracking, and red-word practice.

## Requirements

- Node.js: current LTS recommended
- npm: included with Node.js

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the local URL shown by Vite, typically:

```text
http://localhost:5173
```

The Vite config uses `host: true`, so the dev server is also available on your local network when Vite prints a LAN URL.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` runs TypeScript build checks and creates a production bundle
- `npm run preview` serves the production build locally
- `npm run lint` runs ESLint

## Project Structure

```text
public/
  audio/         MP3 files for pistes 19-22
  data/          timing JSON and manifest data
src/
  components/    UI components for audio, chunks, words, and lesson cards
  routes/        Home, Player, and Practice pages
  store/         Zustand state for player, progress, and red words
  lib/           audio/timing helpers and shared types
```

## Notes

- No `.env` setup is required for local development.
- Audio and JSON data are served from `public/`.
- This is configured as an installable PWA, but audio/data are intended to stream rather than be cached offline.

## More Context

See [PLAN.md](./PLAN.md) for the original prototype plan and feature scope.
