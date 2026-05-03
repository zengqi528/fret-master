# Fret Master — Developer Guide

## Architecture Overview

```
src/
├── main.js              # Entry point (SW registration, boot)
├── app.js               # Thin router (~46 lines) — screen dispatch + shared context
├── style.css            # All styles
├── core/                # Engine layer (stateless, reusable)
│   ├── audio.js         # Web Audio synthesis (Karplus-Strong)
│   ├── fretboard.js     # SVG fretboard rendering engine
│   ├── metronome.js     # BPM-based metronome
│   ├── music.js         # Theory data (notes, scales, intervals, chords)
│   └── storage.js       # localStorage persistence
└── screens/             # UI screens (each exports render(ctx))
    ├── home.js          # Landing page, settings, metronome (~233 lines)
    ├── game.js          # Game loop + all 7 game modes (~389 lines)
    ├── results.js       # Post-game score display (~52 lines)
    ├── stats.js         # Progress, heatmap, data mgmt (~113 lines)
    ├── scales.js        # Scale explorer (~92 lines)
    └── chords.js        # Chord library (~84 lines)
```

### app.js — The Router

A thin coordinator (46 lines). Creates a shared `ctx` object and dispatches to screen modules:

```js
const ctx = { app, $, $$, formatTime, showScreen };

function showScreen(name, data = {}) {
  switch (name) {
    case 'home':    homeScreen.render(ctx);        break;
    case 'game':    gameScreen.render(ctx, data.mode); break;
    case 'results': resultsScreen.render(ctx, data);   break;
    // ...
  }
}
```

Each screen module receives `ctx` and manages its own `innerHTML` + event binding.
Screens never import `app.js` — all shared APIs come via `ctx`.

### Game Loop

1. `startGame(mode)` → creates `gameState`, renders fretboard, calls `nextQuestion()`
2. `nextQuestion()` → dispatches to `setupFindNote()`, `setupNameNote()`, etc.
3. Each setup function configures the prompt, choices, and either `fretboard.onFretClick` or button listeners
4. Answer handlers: `handleAnswer()` (fretboard click), `handleNameAnswer()` (button click), `handleIntervalAnswer()`
5. After delay → `nextQuestion()` loops, or `endGame()` when done

### fretboard.js — SVG Rendering Engine

Key methods:
- `highlight(string, fret, color, pulse)` — add a colored dot
- `highlightWithLabel(string, fret, label, color)` — dot + text label
- `showCorrect(s, f)` / `showWrong(s, f)` — animated feedback
- `showAllPositions(noteName, minFret, maxFret)` — reveal all positions of a note
- `clearHighlights()` — remove all overlay elements
- `setViewRange(minFret, maxFret)` — dynamically scales SVG viewBox and dims out-of-bounds frets
- `setInteractive(bool)` — enable/disable click hit zones
- `onFretClick = (stringIdx, fret) => {}` — callback for fret taps

### music.js — Theory Engine

Exports:
- `NOTES` — `['C','C#','D',...]` (12 notes)
- `TUNING` — `[40,45,50,55,59,64]` (standard MIDI)
- `getNoteAt(string, fret)` → `{ name, midi }`
- `getRandomPosition(minFret, maxFret)` → random position object
- `getRandomNoteName()` → random note name
- `getWrongNotes(correct, count)` → array of wrong note names
- `findNotePositions(name, min, max)` → all positions of a note
- `midiToFreq(midi)` → frequency in Hz
- `SCALES` — object with 10 scale definitions (semitone arrays)
- `getScalePositions(root, scale, min, max)` → array of position objects
- `INTERVALS` — 12 interval definitions with short name, full name, example song
- `CHORDS` — 20 chord voicings with fret arrays and categories

### audio.js — Web Audio Synthesis

- `playNote(freq, duration)` — Karplus-Strong plucked string synthesis
- `playCorrect()` / `playWrong()` — UI feedback sounds
- `_setupAutoUnlock()` — global touch listener that plays a silent buffer to permanently unlock `AudioContext` on iOS Safari

### storage.js — Persistence Layer

All data in `localStorage` under key `fretmaster_data`:

```js
{
  heatmap: [6 strings][25 frets] → { correct, total },
  records: { 'find-note': { bestTime, bestScore, totalPlayed, totalCorrect }, ... },
  streak: { current, best },
  totalSessions: number,
  achievements: ['first-steps', ...],
  dailyCompleted: 20260502,  // YYYYMMDD seed
  dailyScore: 8,
}
```

Key functions:
- `recordAnswer(string, fret, correct)` — updates heatmap + streak
- `recordSession(mode, correct, total, time)` → `{ isNewBestTime, isNewBestScore, newBadges }`
- `getWeakPositions(min, max, count)` — sorted by lowest accuracy
- `getDailyStatus()` → `{ seed, completed, score }`
- `checkAchievements()` — evaluates 13 badge conditions

## Adding a New Game Mode

1. **app.js**: Add mode card HTML in `renderHome()`
2. **app.js**: Add case in `startGame()` → `modeLabels`
3. **app.js**: Add case in `nextQuestion()` switch
4. **app.js**: Write `setupNewMode()` function
5. **app.js**: Write answer handler if needed
6. **storage.js**: Add default record entry in `getDefault()`
7. **style.css**: Add any mode-specific styles

## Adding a New Scale/Chord

- **Scales**: Add entry to `SCALES` object in `music.js` (array of semitone offsets)
- **Chords**: Add entry to `CHORDS` array in `music.js` with `{ name, category, frets: [6 values] }`

## PWA / Service Worker

`public/sw.js` uses a cache-first strategy. When you update the app:
1. Increment the cache version in `sw.js`
2. The old cache is automatically purged on next visit

## Deployment

For manual deployment:
```bash
git add -A
git commit -m "feat: description"
git push origin master
# Vercel auto-deploys from GitHub
```

**Automated Deployment (Recommended)**:
Use the PowerShell script to automatically commit, push, deploy to Vercel production, and set the domain alias:
```powershell
.\deploy.ps1 "your commit message here"
```

Vercel config: Framework = Vite, Build = `npm run build`, Output = `dist`
