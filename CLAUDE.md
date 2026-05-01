# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # dev server at localhost:3000
npm run build   # production build
```

No test suite is configured.

## Environment

Supabase is optional — the app degrades gracefully to localStorage when env vars are absent. To enable it, create `.env` in the project root:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

## Architecture

This is a Create React App (no TypeScript) pomodoro timer with optional Supabase persistence.

**Screen flow:** `App` holds a `screen` state string (`'setup'` | `'timer'`). `SetupScreen` collects session count and duration, then calls `onStart` to transition to the timer view, which renders `Timer` + `TaskList` side by side.

**Dual-storage pattern:** `useSupabaseStorage.js` exports `useTasks` and `useLoginDates`. Each hook checks `user` (from `AuthContext`) and whether `supabase` is non-null. If authenticated, it reads/writes Supabase; otherwise it falls back to `localStorage`. On sign-in, `AuthContext.migrateLocalData` automatically upserts any locally-stored tasks and login dates into Supabase and clears them from localStorage.

**Supabase tables:**
- `tasks` — columns: `id`, `user_id`, `text`, `completed`, `created_at`
- `login_dates` — columns: `user_id`, `login_date` (unique constraint on both for upsert)

**Timer logic** lives entirely in `useTimer.js`. It uses a single `setInterval` ref and drives state transitions: running → session complete (shows `BreakScreen` overlay) → next session; or final session → all complete. `Timer.jsx` wraps this hook and additionally manages a [Document Picture-in-Picture](https://developer.chrome.com/docs/web-platform/document-picture-in-picture/) window, keeping it in sync via a `useEffect` on `formattedTime` / `isRunning` state.

**Notification:** session-end plays a short 800 Hz sine wave via the Web Audio API (created fresh each call, no persistent `AudioContext`), and flashes the app background to `--color-yellow` for 300 ms.

## Design system

All styling is in [src/App.css](src/App.css) — no CSS modules or utility framework. CSS custom properties define the palette:

| Variable | Value | Usage |
|---|---|---|
| `--color-green` | `#2D4721` | Text, borders |
| `--color-plum` | `#822349` | Accent, interactive elements |
| `--color-yellow` | `#FFB640` | Flash notification |
| `--color-cream` | `#FDFBCA` | Background |

Fonts: `EB Garamond` (body + italic headings via Google Fonts). `Lunaquete` is the intended heading font but commented out — place `Lunaquete-Italic.woff2/.woff/.ttf` in `public/fonts/` and uncomment the `@font-face` block in App.css to enable it.

Interactive elements use the `.clickable` class (underline on hover, no button chrome). All overlays (break screen, stats panel, auth modal) use `position: fixed` with a `z-index` hierarchy: stats=90, break/auth=100.
