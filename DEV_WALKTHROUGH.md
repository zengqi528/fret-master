# Fret Master — Development Walkthrough

## Build Timeline

### Phase 1: MVP (Session 1)

**Goal**: Basic fretboard training app with 3 core game modes

1. **Project Scaffold** — `npx create-vite@latest` with Vanilla JS
2. **Design System** — Dark theme CSS with custom properties, Inter + JetBrains Mono fonts
3. **Fretboard Engine** (`fretboard.js`)
   - SVG-based rendering with realistic wood grain + metal fret styling
   - 6 strings × configurable frets, with position dot markers
   - Click hit zones with hover feedback
   - `highlight()` / `showCorrect()` / `showWrong()` animation system
4. **Music Theory** (`music.js`)
   - Standard tuning MIDI values, note calculation from string+fret
   - Random position/note generators, wrong-note distractor generator
5. **Audio Engine** (`audio.js`)
   - Karplus-Strong plucked string synthesis (Web Audio API)
   - No external audio files — everything synthesized in real-time
   - Correct/wrong UI sound effects
6. **Storage** (`storage.js`)
   - localStorage persistence for heatmap, records, streak
7. **Game Modes**
   - 🎯 Find Note — see name, tap position
   - 🏷️ Name Note — see position, pick name from 4 choices
   - ⚡ Speed Run — 20 notes timed
8. **PWA Setup**
   - `manifest.json` with app name, theme color, display: standalone
   - `sw.js` with cache-first offline strategy
9. **Results Screen** — grade (S/A/B/C/D), stats, streak display
10. **Stats Screen** — heatmap visualization, per-mode records

### Phase 2: Ear Training + Scale Explorer + Achievements

**Goal**: Audio-based training and music theory tools

1. **Ear Training Mode** (`setupEarTraining()`)
   - Plays note audio only, no visual hint on fretboard
   - 🔊 Replay button for re-listening
   - 600ms delay before enabling fretboard (forces listening)
2. **Scale Explorer** (`renderScaleExplorer()`)
   - 10 scale definitions in `music.js` (Major through Chromatic)
   - `getScalePositions()` computes all fretboard positions for root+scale
   - Interactive: click any position to hear the note
   - Color coding: gold = root, green = scale degree
   - Interval labels (R, 2, ♭3, 4, 5, etc.)
3. **Achievement System** (`checkAchievements()`)
   - 13 badges with milestone conditions
   - Unlocked badges shown on results screen as toast notifications
   - Progress page shows locked (grayscale) vs unlocked (gold) badges

### Phase 3: Interval Training + Chord Library

**Goal**: More ear training depth and chord reference

1. **Interval Training** (`setupIntervalTraining()`)
   - Plays two notes 500ms apart (ascending)
   - 12 interval types with song-association examples
   - 4-choice buttons showing short name + full name
   - `handleIntervalAnswer()` — no heatmap recording (pure ear exercise)
2. **Chord Library** (`renderChordExplorer()`)
   - 20 chords defined in `CHORDS` array with fret voicings
   - 4 categories: Major, Minor, 7th, Other
   - `displayChord()` — highlights positions + arpeggiated playback (70ms per string)
   - Shows constituent notes + muted string indicators

### Phase 4: Adaptive Practice + Daily Challenge

**Goal**: Intelligent practice and daily engagement

1. **Weak Spots Mode** (`setupWeakPractice()`)
   - `getWeakPositions()` analyzes heatmap for lowest accuracy positions
   - Sorts by accuracy ascending, filters out untested positions
   - Presents as find-note questions with accuracy % hint
2. **Daily Challenge** (`setupDailyChallenge()`)
   - Date-seeded PRNG (mulberry32) for deterministic daily questions
   - Fixed 10 questions per day
   - `recordDaily()` / `getDailyStatus()` for completion tracking
   - Gold left-border on home screen card

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SVG fretboard** | Scales perfectly across mobile/tablet/desktop viewports |
| **Karplus-Strong audio** | Zero audio file dependencies, works offline, ~50 lines of code |
| **No framework** | <15KB total JS, instant load, no build complexity |
| **localStorage only** | No server needed, works on airplane, zero auth friction |
| **Screen replacement** | `innerHTML` swap is simpler than routing library, fast enough for this UI |
| **Seeded PRNG for daily** | Same questions for all users on same day without server |

## Current File Sizes

| File | Purpose | ~Lines |
|------|---------|--------|
| `app.js` | UI + game logic | ~930 |
| `style.css` | All styles | ~1200 |
| `fretboard.js` | SVG engine | ~360 |
| `music.js` | Theory data | ~180 |
| `audio.js` | Sound synthesis | ~80 |
| `storage.js` | Persistence | ~230 |

## Possible Future Features

- [ ] **Descending intervals** — option in interval training
- [ ] **Chord quiz mode** — hear chord, identify type
- [ ] **CAGED system** — visualize chord shapes across the neck
- [ ] **Metronome** — built-in practice metronome
- [ ] **Custom tunings** — Drop D, Open G, etc.
- [ ] **Export/import data** — backup progress as JSON
- [ ] **Dark/light theme toggle**
- [ ] **Leaderboard** — optional cloud sync for daily challenge rankings
- [ ] **Sound quality** — explore alternative synthesis (FM, wavetable)
- [ ] **Localization** — Chinese/English language toggle
