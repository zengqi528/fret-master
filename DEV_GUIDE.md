# Fret Master — Developer Guide

> **For AI agents**: This is the primary reference for understanding the codebase and making changes.

## Architecture Overview

```
src/
├── main.js              # Entry point (SW registration, iOS prompt, boot)
├── app.js               # Thin router — screen dispatch + shared context
├── style.css            # All styles (~2700 lines)
├── core/                # Engine layer (stateless, reusable)
│   ├── audio.js         # Web Audio synthesis (Karplus-Strong) (~126 lines)
│   ├── drums.js         # Web Audio drum synthesis (Kick/Snare/HH/Rim/Cowbell) (~187 lines) [NEW]
│   ├── fretboard.js     # SVG fretboard rendering engine (~460 lines)
│   ├── i18n.js          # Chinese/English localization (~300+ lines)
│   ├── metronome.js     # LEGACY BPM-based metronome (replaced by rhythm.js)
│   ├── music.js         # Theory data + enharmonic engine + triads/arpeggios/modes (~600+ lines)
│   ├── rhythm.js        # Look-ahead audio scheduler + pattern library + speed trainer (~337 lines) [NEW]
│   └── storage.js       # localStorage persistence + SRS + XP/Level (~400+ lines)
└── screens/             # UI screens (each exports render(ctx))
    ├── home.js          # Landing page, settings, journey banner, tool grid
    ├── game.js          # Game loop + 9 game modes (incl. octave navigator)
    ├── results.js       # Post-game score + XP display + recommendations
    ├── stats.js         # Progress, heatmap, XP level, 7-day trend chart
    ├── scales.js        # Scale explorer
    ├── chords.js        # Chord library
    ├── circle.js        # Circle of Fifths
    ├── caged.js         # CAGED system visualizer
    ├── drummer.js       # Standalone drum machine tool [NEW]
    ├── triads.js        # Triad trainer (4 string groups × 3 inversions × 4 qualities) [NEW]
    ├── arpeggios.js     # Arpeggio explorer (6 types) [NEW]
    ├── modes.js         # Mode explorer with characteristic notes + compare [NEW]
    └── journey.js       # 7-stage guided learning path [NEW]
```

## app.js — The Router

A thin coordinator. Creates a shared `ctx` object and dispatches to screen modules:

```js
const ctx = { app, $, $$, formatTime, showScreen };

function showScreen(name, data = {}) {
  switch (name) {
    case 'home':      homeScreen.render(ctx); break;
    case 'game':      gameScreen.render(ctx, data.mode); break;
    case 'results':   resultsScreen.render(ctx, data); break;
    case 'stats':     statsScreen.render(ctx); break;
    case 'scales':    scalesScreen.render(ctx); break;
    case 'chords':    chordsScreen.render(ctx); break;
    case 'circle':    circleScreen.render(ctx); break;
    case 'caged':     cagedScreen.render(ctx); break;
    case 'drummer':   drummerScreen.render(ctx); break;
    case 'triads':    triadsScreen.render(ctx); break;
    case 'arpeggios': arpeggiosScreen.render(ctx); break;
    case 'modes':     modesScreen.render(ctx); break;
    case 'journey':   journeyScreen.render(ctx); break;
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

### Game Modes (9 total)

| Mode ID | Setup Function | Description |
|---------|----------------|-------------|
| `find-note` | `setupFindNote()` | See note name → tap fretboard position |
| `name-note` | `setupNameNote()` | See highlighted position → choose note name |
| `ear-training` | `setupEarTraining()` | Hear a note → find it on fretboard |
| `interval-training` | `setupIntervalTraining()` | Hear 2 notes → identify interval (progressive levels) |
| `chord-quiz` | `setupChordQuiz()` | Hear a chord → identify its name |
| `speed-run` | `setupFindNote()` | Same as find-note but timed (20 notes) |
| `weak-practice` | `setupFindNote()` | Targets SRS weak positions |
| `daily-challenge` | `setupFindNote()` | Fixed daily seed, 10 questions |
| `octave-navigator` | `setupOctaveNavigator()` | Find all octave positions of a note (multi-tap) |

### Interval Progressive Unlocking

Intervals unlock in 5 levels:
- **Level 1**: P5, P4, P8 (easiest to hear)
- **Level 2**: + M3, m3
- **Level 3**: + M2, M7
- **Level 4**: + m2, m7
- **Level 5**: + TT, M6, m6

Auto-levels-up at 80%+ accuracy after 10+ questions.

### Hint System

In `find-note`, `ear-training`, and `octave-navigator` modes:
- After 5 seconds of inactivity, a "💡 Hint" button appears
- Clicking it highlights the correct string (dims others)
- `gameState.hintUsed` flag tracks usage

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
| `KEY_NOTE_NAMES` | `object` | 18 key → 12-note-name mappings |
| `resolveNoteName(idx, pref, key)` | `function` | Central note name resolver |
| `STANDARD_TUNING` | `object[]` | 6 strings with name, MIDI, string number |
| `getNoteAt(string, fret, pref)` | `function` | Returns `{ name, sharpName, flatName, noteIdx, octave, midi, string, fret }` |
| `midiToFreq(midi)` | `function` | MIDI to Hz conversion |
| `findNotePositions(name, min, max, pref)` | `function` | All fretboard positions of a note |
| `getRandomPosition(min, max, pref)` | `function` | Random position object |
| `getRandomPositionFiltered(min, max, string, pref)` | `function` | Random position with string constraint |
| `getRandomNoteName(pref)` | `function` | Random note name respecting ♯/♭ pref |
| `getWrongNotes(correct, count, pref)` | `function` | Distractor note names |
| `SCALES` | `object` | Scale definitions (Major thru Diminished WH) |
| `INTERVAL_LABELS` | `string[]` | `['R', '♭2', '2', '♭3', '3', ...]` |
| `getScalePositions(root, scale, min, max)` | `function` | All scale positions on fretboard |
| `INTERVALS` | `object[]` | 12 interval definitions with examples |
| `CHORDS` | `object[]` | 20 chord voicings |
| `CAGED_SHAPES` / `getCAGEDPositions()` | | CAGED system data |
| `CIRCLE_OF_FIFTHS` | `object[]` | 12 keys with key data |
| `THREE_NPS_PATTERNS` | `object` | 3-notes-per-string patterns for 7 modes [NEW] |
| `TRIAD_TYPES` | `object[]` | Major/Minor/Dim/Aug triad intervals [NEW] |
| `TRIAD_STRING_GROUPS` | `object[]` | 4 adjacent string groups [NEW] |
| `INVERSIONS` | `string[]` | Root/1st/2nd [NEW] |
| `getTriadPositions()` | `function` | All triad voicings on fretboard [NEW] |
| `ARPEGGIO_TYPES` | `object[]` | 6 arpeggio types (Maj7, min7, etc.) [NEW] |
| `getArpeggioPositions()` | `function` | All arpeggio positions on fretboard [NEW] |
| `MODE_INFO` | `object` | Mode metadata (characteristic note, mood) [NEW] |

## drums.js — Drum Synthesis [NEW]

Pure Web Audio synthesis — NO audio files:

| Function | Sound | Technique |
|----------|-------|-----------|
| `playKick(time)` | Bass drum | Sine sweep 150→40Hz + noise burst |
| `playSnare(time)` | Snare | Sine 180Hz + bandpass noise 2-5kHz |
| `playHiHatClosed(time)` | Closed hi-hat | Highpass noise 6-10kHz, 30ms |
| `playHiHatOpen(time)` | Open hi-hat | Same, 200ms decay |
| `playRimshot(time)` | Rimshot | Triangle 800Hz, fast decay |
| `playCowbell(time)` | Cowbell | Two sines 560+845Hz |
| `playClick(time, accent)` | Metronome click | Sine sweep |

All functions accept optional `time` parameter for Web Audio scheduling.

## rhythm.js — Rhythm Engine [NEW]

Replaces `metronome.js` with a professional look-ahead audio scheduler.

### Scheduler Pattern

Uses `AudioContext.currentTime` + `setInterval(25ms)` with 100ms look-ahead:

```js
const SCHEDULE_AHEAD = 0.1; // seconds
const LOOKAHEAD = 25;       // ms

function scheduler() {
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleNote(nextNoteTime);
    advanceNote();
  }
}
timerID = setInterval(scheduler, LOOKAHEAD);
```

### Pattern Library (50 patterns)

**Basic (6)**: Basic 4/4, Basic 3/4, Basic 6/8, 8th Notes, 16th Notes, Triplets

**Genre (44)** organized into 12 sub-categories:

| Genre | Count | Time Signatures | Examples |
|-------|-------|-----------------|----------|
| Rock | 7 | 4/4 | Basic, Hard, Shuffle, Half-Time, Driving, Arena, Punk |
| Pop | 4 | 4/4 | Basic, Four-on-the-Floor, Syncopated, Ballad |
| Blues | 4 | 4/4 (triplet) | 12-Bar Shuffle, Slow Blues, Chicago, Texas |
| Funk | 4 | 4/4 | Basic, Funky Drummer (JB), Slap, P-Funk |
| Jazz | 3 | 4/4, 3/4 | Swing, Bebop, Jazz Waltz |
| Latin | 5 | 4/4 | Bossa Nova, Samba, Cha-Cha, Salsa, Rumba |
| Metal | 3 | 4/4 | Thrash (Skank), Double Bass, Blast Beat |
| Country | 3 | 4/4, 3/4 | Train Beat, Country Rock, Waltz |
| Reggae | 3 | 4/4 | One Drop, Rockers, Steppers |
| R&B/Hip-Hop | 3 | 4/4 | Boom Bap, Trap, Neo-Soul |
| 6/8 | 3 | 6/8 | Ballad, Afro (Bembe), Blues |
| Odd Time | 2 | 5/4, 7/8 | 5/4 Groove (3+2), 7/8 Groove (2+2+3) |

Each pattern has: `category`, `genre` (for genre patterns), `name`, `nameZh`, `timeSignature`, `stepsPerBeat`, `steps`, `kick[]`, `snare[]`, `hihat[]`, `accent[]`, `swing`. Optional: `hihatOpen[]`, `rimshot[]`.

### Key Exports

| Export | Description |
|--------|-------------|
| `PATTERNS` | All 50 pattern definitions |
| `getPatternsByCategory()` | Returns `{ basic: [...], Rock: [...], Pop: [...], Blues: [...], ... }` |
| `start(patternId, bpm, options)` | Start playback with callbacks `onBeat`, `onBar` |
| `stop()` | Stop playback |
| `isRunning()` | Playback state |
| `setBpm(bpm)` / `getBpm()` | BPM control (40-300) |
| `setPattern(patternId)` | Change pattern while playing |
| `setSwing(percent)` | Swing 0-66% |
| `setSoundType(type)` | 'kit' / 'click' / 'hihat' |
| `startSpeedTrainer(config)` | Auto-increment BPM |
| `stopSpeedTrainer()` | Stop speed trainer |
| `tapTempo()` | Calculates BPM from tap intervals |
| `getCurrentBeat()` | Current `{ beat, bar, step, isAccent }` |

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
    practiceString: null,        // null = all, 0-5 = specific string
    accidentalPref: 'sharp',    // 'sharp' | 'flat'
    intervalDirection: 'ascending', // 'ascending' | 'descending' | 'random'
    lang: 'en',                 // 'en' | 'zh'
    // Drum machine
    drumPattern: 'rock',
    drumSound: 'kit',            // 'kit' | 'click' | 'hihat'
    metronomeBpm: 80,
    swing: 0,
    countIn: true,
    speedTrainer: { enabled, startBpm, endBpm, increment, barsPerStep, secondsPerStep },
    intervalLevel: 1,            // Progressive interval unlocking (1-5)
  },
  records: {
    'find-note': { bestTime, bestScore, totalPlayed, totalCorrect },
    'name-note': { ... },
    'speed-run': { ... },
    'ear-training': { ... },
    'interval-training': { ... },
    'chord-quiz': { ... },
    'octave-navigator': { ... },
  },
  heatmap: [6 strings][25 frets] → { correct, total },
  srs: { 'S0F5': { interval, ease, nextReview, correct, total } },
  streak: { current, best },
  totalSessions: number,
  achievements: ['first-steps', ...],
  practiceHistory: ['2026-05-01', ...],
  dailyCompleted: 20260502,
  dailyScore: 8,
  // NEW in 2.0
  xp: 0,                        // Total experience points
  journey: {                     // Learning path progress
    'open-position': { bestPct, bestStars, attempts, lastPlayed },
    // ...
  },
  sessionHistory: [              // Last 90 sessions for trend charts
    { date, mode, correct, total, timeMs, score },
  ],
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `getSettings()` / `saveSettings(obj)` | Read/write settings (merges with existing) |
| `recordAnswer(string, fret, correct)` | Updates heatmap + streak |
| `recordSRS(string, fret, correct)` | SM-2 spaced repetition update |
| `recordSession(mode, correct, total, time)` | Returns `{ isNewBestTime, isNewBestScore, newBadges, xpGained }` |
| `getWeakPositions(min, max, count)` | Uses SRS data to find due/weak positions |
| `getDailySeed()` / `getDailyStatus()` / `recordDaily(score)` | Daily challenge tracking |
| `exportData()` / `importData(json)` | JSON backup/restore |
| `recordPracticeDay()` / `getPracticeHistory(days)` | 7-day calendar |
| `getAchievements()` | Evaluates 13 badge conditions |
| `getXPInfo()` | Returns `{ xp, level, levelName, progress, currentLevelXP, nextLevelXP }` [NEW] |
| `getSessionHistory(days)` | Returns daily aggregated stats for trend charts [NEW] |
| `getIntervalLevel()` / `setIntervalLevel(n)` | Progressive interval training level [NEW] |

### XP System

- **+10 XP** per correct answer
- **+5 XP** combo bonus per 3-streak
- **+50 XP** for perfect score (100%)
- 20 levels from "Beginner" to "Fretboard God"

## i18n.js — Internationalization

- `setLang('en' | 'zh')` / `getLang()` — get/set language
- `t(key)` — get localized string by key
- `modeLabels()` — returns mode name mapping (9 modes)

All UI text should go through `t(key)` for bilingual support. When adding new strings, add to both `STRINGS.en` and `STRINGS.zh` objects.

## Journey System [NEW]

7 progressive stages:
1. **Open Position** (frets 0-4) → find-note
2. **5th Position** (frets 5-7) → find-note
3. **Upper Frets** (frets 8-12) → find-note
4. **Full Neck** (frets 0-12) → find-note
5. **Speed Challenge** (full fretboard) → speed-run
6. **Ear Training** (full fretboard) → ear-training
7. **Theory Mastery** (full fretboard) → chord-quiz

Each stage requires 2+ stars in the previous stage to unlock.
Star thresholds: ≥60% = 1★, ≥80% = 2★, ≥95% = 3★.

## Adding a New Game Mode

1. **game.js**: Add `case 'new-mode': setupNewMode(); break;` in `nextQuestion()` switch
2. **game.js**: Write `setupNewMode()` function — configure prompt, choices, `fretboard.onFretClick`
3. **game.js**: Write answer handler if needed (or reuse `handleAnswer()`)
4. **home.js**: Add mode card HTML in `render()`, add corresponding `data-mode` attribute
5. **i18n.js**: Add `newMode` / `newModeDesc` keys in both `en` and `zh`
6. **storage.js**: Add default record entry in `getDefault()`
7. **style.css**: Add any mode-specific styles

> ⚠️ Always pass `pref` to `getNoteAt()`, `getRandomPosition*()`, `getWrongNotes()` etc. Always compare using `noteIdx`, never string names.

## Adding a New Tool Screen

1. **Create** `src/screens/newtool.js` with `export function render(ctx) { ... }`
2. **app.js**: Import and add case in `showScreen()`
3. **home.js**: Add tool card in the tool-cards grid
4. **i18n.js**: Add tool name translations
5. **style.css**: Add screen-specific styles

## Adding a New Rhythm Pattern

In `rhythm.js`, add to `PATTERNS` object:
```js
'my_pattern': {
  category: 'genre',          // 'basic' or 'genre'
  genre: 'Rock',              // genre subcategory (auto-grouped in UI tabs)
  name: 'My Pattern',
  nameZh: '我的节奏',
  timeSignature: [4, 4],
  stepsPerBeat: 4,            // 1=quarter, 2=eighth, 3=triplet, 4=sixteenth
  steps: 16,                  // total steps per bar = timeSignature[0] * stepsPerBeat
  kick:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
  snare:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
  hihat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  // hihatOpen: [...],        // optional — open hi-hat hits
  // rimshot: [...],          // optional — rimshot/cross-stick hits
  accent: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  swing: 0                    // 0 = straight, 1 = swing feel
}
```

> ⚠️ All arrays (kick, snare, hihat, etc.) must have exactly `steps` elements.
> The formula `timeSignature[0] * stepsPerBeat === steps` must hold.
> If you add a new genre string, also add i18n keys in both `en` and `zh` sections of `i18n.js`.

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
