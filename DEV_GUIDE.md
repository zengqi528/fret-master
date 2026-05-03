# Fret Master — Developer Guide

> **For AI agents**: This is the primary reference for understanding the codebase and making changes.

## Architecture Overview

```
src/
├── main.js              # Entry point (SW registration, iOS prompt, boot)
├── app.js               # Thin router (~62 lines) — screen dispatch + shared context
├── style.css            # All styles (~1850 lines)
├── core/                # Engine layer (stateless, reusable)
│   ├── audio.js         # Web Audio synthesis (Karplus-Strong) (~126 lines)
│   ├── fretboard.js     # SVG fretboard rendering engine (~460 lines)
│   ├── i18n.js          # Chinese/English localization (~147 lines)
│   ├── metronome.js     # BPM-based metronome (~64 lines)
│   ├── music.js         # Theory data + enharmonic engine (~326 lines)
│   └── storage.js       # localStorage persistence + SRS (~294 lines)
└── screens/             # UI screens (each exports render(ctx))
    ├── home.js          # Landing page, settings panel, metronome (~286 lines)
    ├── game.js          # Game loop + all 8 game modes (~478 lines)
    ├── results.js       # Post-game score display (~53 lines)
    ├── stats.js         # Progress, heatmap, data mgmt (~110 lines)
    ├── scales.js        # Scale explorer (~92 lines)
    ├── chords.js        # Chord library (~84 lines)
    ├── circle.js        # Circle of Fifths (~123 lines)
    └── caged.js         # CAGED system visualizer (~105 lines)
```

## app.js — The Router

A thin coordinator (62 lines). Creates a shared `ctx` object and dispatches to screen modules:

```js
const ctx = { app, $, $$, formatTime, showScreen };

function showScreen(name, data = {}) {
  switch (name) {
    case 'home':    homeScreen.render(ctx);          break;
    case 'game':    gameScreen.render(ctx, data.mode); break;
    case 'results': resultsScreen.render(ctx, data);   break;
    case 'stats':   statsScreen.render(ctx);           break;
    case 'scales':  scalesScreen.render(ctx);          break;
    case 'chords':  chordsScreen.render(ctx);          break;
    case 'circle':  circleScreen.render(ctx);          break;
    case 'caged':   cagedScreen.render(ctx);           break;
  }
}
```

Each screen module receives `ctx` and manages its own `innerHTML` + event binding.
Screens never import `app.js` — all shared APIs come via `ctx`.

## Game Loop (game.js)

1. `render(ctx, mode)` → creates `gameState` (includes `pref` from accidentalPref setting), renders fretboard, calls `nextQuestion()`
2. `nextQuestion()` → dispatches to `setupFindNote()`, `setupNameNote()`, etc.
3. Each setup function configures the prompt, choices, and either `fretboard.onFretClick` or button listeners
4. Answer handlers: `handleAnswer()` (fretboard click), `handleNameAnswer()` (button click), `handleIntervalAnswer()`, `handleChordAnswer()`
5. After delay → `nextQuestion()` loops, or `endGame()` when done

### ⚠️ Critical: Enharmonic-Safe Comparisons

All note matching in game modes uses `noteIdx` (integer 0-11), **never** string name comparison:

```js
// ✅ CORRECT — enharmonic-safe
const isCorrect = note.noteIdx === targetIdx;

// ❌ WRONG — breaks when user switches ♯/♭ preference
const isCorrect = note.name === noteName;
```

## music.js — Theory Engine (Key Module)

### Enharmonic System

The system has two note arrays and a key-context lookup:

```js
NOTES      = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
NOTES_FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
```

- `resolveNoteName(noteIdx, pref, keyContext)` — the central resolver:
  - If `keyContext` is provided (e.g., `'Db'`), returns theory-correct spelling from `KEY_NOTE_NAMES`
  - Otherwise, returns ♯ or ♭ spelling based on `pref`

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `NOTES` | `string[]` | 12 sharp note names |
| `NOTES_FLAT` | `string[]` | 12 flat note names |
| `KEY_NOTE_NAMES` | `object` | 18 key → 12-note-name mappings for theory correctness |
| `resolveNoteName(idx, pref, key)` | `function` | Central note name resolver |
| `STANDARD_TUNING` | `object[]` | 6 strings with name, MIDI, string number |
| `getNoteAt(string, fret, pref)` | `function` | Returns `{ name, sharpName, flatName, noteIdx, octave, midi, string, fret }` |
| `midiToFreq(midi)` | `function` | MIDI to Hz conversion |
| `findNotePositions(name, min, max, pref)` | `function` | All fretboard positions of a note |
| `getRandomPosition(min, max, pref)` | `function` | Random position object |
| `getRandomPositionFiltered(min, max, string, pref)` | `function` | Random position with string constraint |
| `getRandomNoteName(pref)` | `function` | Random note name respecting ♯/♭ pref |
| `getWrongNotes(correct, count, pref)` | `function` | Distractor note names |
| `SCALES` | `object` | 10 scale definitions (semitone offset arrays) |
| `INTERVAL_LABELS` | `string[]` | `['R', '♭2', '2', '♭3', '3', ...]` |
| `getScalePositions(root, scale, min, max)` | `function` | All positions for a scale on the fretboard |
| `INTERVALS` | `object[]` | 12 interval definitions with short name, full name, example song |
| `CHORDS` | `object[]` | 20 chord voicings with fret arrays and categories |
| `CAGED_SHAPES` | `object[]` | 5 CAGED chord shape definitions |
| `getCAGEDPositions(root, maxFret)` | `function` | All CAGED positions for a root |
| `CIRCLE_OF_FIFTHS` | `object[]` | 12 keys with sharps/flats/relative minor data |

## audio.js — Web Audio Synthesis

- `playNote(freq, duration)` — Karplus-Strong plucked string synthesis
- `playCorrect()` / `playWrong()` — UI feedback sounds
- `unlockAudio()` — called on first user interaction to unlock AudioContext on iOS Safari
- `_setupAutoUnlock()` — global touch listener that plays a silent buffer

## fretboard.js — SVG Rendering Engine

Key methods:
- `highlight(string, fret, color, pulse)` — add a colored dot
- `highlightWithLabel(string, fret, label, color)` — dot + text label
- `showCorrect(s, f)` / `showWrong(s, f)` — animated feedback with ripple
- `showAllPositions(noteName, minFret, maxFret)` — reveal all positions of a note
- `clearHighlights()` — remove all overlay elements
- `setViewRange(minFret, maxFret)` — dynamically scales SVG viewBox + dims out-of-bounds
- `setInteractive(bool)` — enable/disable click hit zones
- `highlightActiveString(idx)` — dims all strings except the selected one
- `onFretClick = (stringIdx, fret) => {}` — callback for fret taps

Fret positions use 85% real guitar proportional spacing + 15% linear blend so high frets stay tappable.

## storage.js — Persistence Layer

All data in `localStorage` under key `fret-master`:

```js
{
  settings: {
    minFret: 0,
    maxFret: 12,
    questionCount: 20,
    practiceString: null,       // null = all, 0-5 = specific string
    accidentalPref: 'sharp',   // 'sharp' | 'flat'
    intervalDirection: 'ascending', // 'ascending' | 'descending' | 'random'
    lang: 'en',                // 'en' | 'zh'
  },
  records: {
    'find-note': { bestTime, bestScore, totalPlayed, totalCorrect },
    'name-note': { ... },
    'speed-run': { ... },
    'ear-training': { ... },
    'interval-training': { ... },
    'chord-quiz': { ... },
  },
  heatmap: [6 strings][25 frets] → { correct, total },
  srs: {                       // SM-2 spaced repetition data
    'S0F5': { interval, ease, nextReview, correct, total },
    // key format: S{stringIdx}F{fret}
  },
  streak: { current, best },
  totalSessions: number,
  achievements: ['first-steps', ...],
  practiceHistory: ['2026-05-01', '2026-05-02', ...],
  dailyCompleted: 20260502,    // YYYYMMDD seed
  dailyScore: 8,
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `getSettings()` / `saveSettings(obj)` | Read/write settings |
| `recordAnswer(string, fret, correct)` | Updates heatmap + streak |
| `recordSRS(string, fret, correct)` | SM-2 spaced repetition update |
| `recordSession(mode, correct, total, time)` | Returns `{ isNewBestTime, isNewBestScore, newBadges }` |
| `getWeakPositions(min, max, count)` | Uses SRS data to find due/weak positions |
| `getDailySeed()` / `getDailyStatus()` / `recordDaily(score)` | Daily challenge tracking |
| `exportData()` / `importData(json)` | JSON backup/restore |
| `recordPracticeDay()` / `getPracticeHistory(days)` | 7-day calendar |
| `getAchievements()` | Evaluates 13 badge conditions |

## i18n.js — Internationalization

- `setLang('en' | 'zh')` / `getLang()` — get/set language
- `t(key)` — get localized string by key
- `modeLabels()` — returns mode name mapping

All UI text should go through `t(key)` for bilingual support. When adding new strings, add to both `STRINGS.en` and `STRINGS.zh` objects.

## Adding a New Game Mode

1. **game.js**: Add `case 'new-mode': setupNewMode(); break;` in `nextQuestion()` switch
2. **game.js**: Write `setupNewMode()` function — configure prompt, choices, `fretboard.onFretClick`
3. **game.js**: Write answer handler if needed (or reuse `handleAnswer()`)
4. **home.js**: Add mode card HTML in `render()`, add corresponding `data-mode` attribute
5. **i18n.js**: Add `newMode` / `newModeDesc` keys in both `en` and `zh`
6. **storage.js**: Add default record entry `'new-mode': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 }` in `getDefault()`
7. **style.css**: Add any mode-specific styles

> ⚠️ Always pass `pref` to `getNoteAt()`, `getRandomPosition*()`, `getWrongNotes()` etc. Always compare using `noteIdx`, never string names.

## Adding a New Scale/Chord

- **Scales**: Add entry to `SCALES` object in `music.js` (array of semitone offsets from root)
- **Chords**: Add entry to `CHORDS` array in `music.js` with `{ name, category, frets: [6 values, -1 = muted] }`

## Adding a New Tool Screen

1. **Create** `src/screens/newtool.js` with `export function render(ctx) { ... }`
2. **app.js**: Import and add case in `showScreen()`
3. **home.js**: Add tool card in the tool-cards grid
4. **i18n.js**: Add tool name translations

## PWA / Service Worker

`public/sw.js` uses a cache-first strategy. When you update the app:
1. Increment the cache version string in `sw.js`
2. The old cache is automatically purged on next visit

## Deployment

**Automated (Recommended)**:
```powershell
.\deploy.ps1 "feat: description"
```
This script runs: `git add -A` → `git commit` → `git push` → `vercel deploy` → `vercel alias fret-master-app.vercel.app`

**Manual**:
```bash
npm run build
git add -A && git commit -m "feat: description" && git push
# Vercel auto-deploys from GitHub, or run: vercel --prod
```

Vercel config: Framework = Vite, Build = `npm run build`, Output = `dist`
Live URL: **https://fret-master-app.vercel.app/**

## iOS-Specific Notes

- **Fullscreen**: Only achievable via Add to Home Screen (standalone mode). The app detects iOS Safari and shows an install prompt.
- **Audio unlock**: iOS Safari requires user gesture before playing audio. `audio.js` handles this with `_setupAutoUnlock()`.
- **Viewport**: Uses `100dvh` (dynamic viewport height) to adapt to Safari's collapsible address bar.
- **Landscape**: `getFretboardHeight()` in `game.js` dynamically sizes the fretboard based on `window.innerHeight` to prevent overflow when iOS toolbars are visible.
