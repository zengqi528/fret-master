# Fret Master — Development Walkthrough

## Build Timeline

### Phase 1: MVP (Session 1)

**Goal**: Basic fretboard training app with 3 core game modes

1. **Project Scaffold** — `npx create-vite@latest` with Vanilla JS
2. **Design System** — Dark theme CSS with custom properties, Inter + JetBrains Mono + Outfit fonts
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
2. **Scale Explorer** (`scales.js`)
   - 10 scale definitions in `music.js` (Major through Chromatic)
   - `getScalePositions()` computes all fretboard positions for root+scale
   - Interactive: click any position to hear the note
   - Color coding: gold = root, green = scale degree
   - Interval labels (R, 2, ♭3, 4, 5, etc.)
3. **Achievement System** (`storage.js`)
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
2. **Chord Library** (`chords.js`)
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

### Phase 5: Landscape UX & Pedagogical Focus

**Goal**: Professional mobile usability and focused practice

1. **Landscape UI Overhaul** (`style.css`)
   - Adaptive top-bottom architecture for 900×380 viewports
   - 4-column compact grid layout for home screen to maximize vertical space
2. **Dynamic Fretboard Focus** (`fretboard.js`)
   - `setViewRange(minFret, maxFret)` dynamically adjusts SVG `viewBox`
   - Darkens out-of-bounds frets with `dim-layer` masks
   - Enlarges the selected practice range for pedagogical clarity
3. **iOS Audio Unlock** (`audio.js`)
   - Global `touchstart/touchend/click` listener pattern
   - Injects silent buffer on first user interaction to permanently unlock Safari's `AudioContext`
4. **Deploy Automation** (`deploy.ps1`)
   - Automated git push + Vercel production deploy + domain alias binding

### Phase 6: Practice Upgrades & Core Tools

**Goal**: Professional practice features and data safety

1. **String Filter** (`home.js`, `music.js`)
   - Settings selector: All / 6弦 / 5弦 / 4弦 / 3弦 / 2弦 / 1弦
   - `getRandomPositionFiltered()` constrains questions to one string
   - Fretboard `highlightActiveString()` dims other strings visually
2. **Built-in Metronome** (`metronome.js`)
   - Web Audio tick synthesis with accented downbeats
   - BPM slider (40-240), play/pause toggle, visual pulse
3. **Practice Calendar** (`storage.js`, `home.js`)
   - 7-day dot calendar on home screen
   - `recordPracticeDay()` called on each game completion
4. **Data Export/Import** (`storage.js`, `stats.js`)
   - JSON download backup + file picker import with validation
5. **Descending Intervals** (`game.js`)
   - ↑ Up / ↓ Down / ↕ Mix direction selector
6. **Chord Quiz Mode** (`setupChordQuiz()`)
   - Hear chord strummed, identify from 4 choices
7. **Chinese/English i18n** (`i18n.js`)
   - Full bilingual support, toggle on home screen, persisted in settings

### Phase 7: Theory Visualization & Intelligent Review

**Goal**: Deep theory tools and SRS-based practice

1. **Circle of Fifths** (`circle.js`)
   - Interactive SVG circle with 12 major keys + relative minors
   - Click to select key → shows key signature, scale notes, play scale
   - Scale notes use `resolveNoteName()` for theory-correct spellings
2. **CAGED System** (`caged.js`)
   - 5 chord shapes (C/A/G/E/D) visualized on the fretboard
   - Color-coded by shape, root note selector, toggle individual shapes
   - `CAGED_SHAPES` and `getCAGEDPositions()` in `music.js`
3. **SRS (Spaced Repetition)** (`storage.js`)
   - SM-2 algorithm tracks each position (string×fret) independently
   - Fields: `interval`, `ease`, `nextReview`, `correct`, `total`
   - `recordSRS()` called after each answer
   - `getWeakPositions()` now uses SRS due-date logic

### Phase 8: Enharmonic Naming System & iOS Optimization

**Goal**: Music-theory-correct note naming and mobile UX polish

1. **Enharmonic Engine** (`music.js`)
   - `NOTES_FLAT` array alongside `NOTES` (sharp)
   - `KEY_NOTE_NAMES` — 18-key lookup table for theory-correct spellings
   - `resolveNoteName(noteIdx, pref, keyContext)` — central resolver
   - All `getNoteAt()`, `getRandomPosition*()`, `getWrongNotes()` accept `pref` parameter
   - `getNoteAt()` now returns `noteIdx`, `sharpName`, `flatName` alongside `name`
2. **♯/♭ User Preference** (`home.js`, `storage.js`)
   - Settings toggle: "♯ C# D#" vs "♭ D♭ E♭"
   - Persisted as `accidentalPref` in storage settings
   - Threaded through `gameState.pref` into all 8 game modes
3. **Enharmonic-Safe Game Logic** (`game.js`)
   - All answer comparisons use `noteIdx` (integer 0-11), never string names
   - Prevents false negatives when C# ≡ D♭
4. **iOS Fullscreen Optimization** (`index.html`, `main.js`, `style.css`)
   - Added "Add to Home Screen" install prompt for iPhone users
   - Viewport height uses `100dvh` (dynamic viewport height) for Safari
   - Fretboard height dynamically calculated based on `window.innerHeight`

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SVG fretboard** | Scales perfectly across mobile/tablet/desktop viewports |
| **Karplus-Strong audio** | Zero audio file dependencies, works offline |
| **No framework** | <20KB total JS, instant load |
| **localStorage only** | No server needed, works offline |
| **Seeded PRNG for daily** | Deterministic daily challenge without server |
| **noteIdx for comparisons** | Enharmonic-safe — C# and D♭ are the same pitch |
| **KEY_NOTE_NAMES** | Theory-correct spellings enforced per key context |
| **100dvh** | Adapts to iOS Safari's dynamic toolbar height |
| **Screen-per-file** | Each screen in its own module, thin router in app.js |

## Current File Sizes

| File | Purpose | ~Lines |
|------|---------|--------|
| `style.css` | All styles | ~1851 |
| `game.js` | Game loop + 8 modes | ~478 |
| `fretboard.js` | SVG rendering engine | ~460 |
| `music.js` | Theory + enharmonics | ~326 |
| `storage.js` | Persistence + SRS | ~294 |
| `home.js` | Home screen + settings | ~286 |
| `i18n.js` | Localization strings | ~147 |
| `audio.js` | Sound synthesis | ~126 |
| `circle.js` | Circle of Fifths | ~123 |
| `stats.js` | Progress + heatmap | ~110 |
| `caged.js` | CAGED visualizer | ~105 |
| `scales.js` | Scale explorer | ~92 |
| `chords.js` | Chord library | ~84 |
| `metronome.js` | Metronome engine | ~64 |
| `app.js` | Router | ~62 |
| `results.js` | Results screen | ~53 |
| `main.js` | Bootstrap | ~39 |

## Completed Features Checklist

- [x] Find Note mode
- [x] Name Note mode
- [x] Ear Training mode
- [x] Interval Training (ascending/descending/random)
- [x] Speed Run mode
- [x] Weak Spots mode (SRS-powered)
- [x] Daily Challenge (seeded PRNG)
- [x] Chord Quiz mode
- [x] Scale Explorer (10 scales × 12 roots)
- [x] Chord Library (20 chords, 4 categories)
- [x] Circle of Fifths (interactive SVG)
- [x] CAGED System (5 shapes, color-coded)
- [x] Achievement system (13 badges)
- [x] Fretboard heatmap
- [x] String filter (practice single string)
- [x] Built-in metronome
- [x] Practice calendar (7-day)
- [x] Data export/import
- [x] Chinese/English i18n
- [x] Enharmonic naming (♯/♭ toggle + theory-correct per key)
- [x] SRS spaced repetition
- [x] iOS fullscreen prompt
- [x] PWA offline support

## Possible Future Features

- [ ] **Custom tunings** — Drop D, Open G, DADGAD, etc.
- [ ] **Fretboard note labels** — optional overlay showing all note names
- [ ] **Practice scheduler** — "Today's workout" combining multiple modes
- [ ] **Sight-reading mode** — show staff notation, find note on fretboard
- [ ] **Triad/arpeggio training** — identify chord tones across the neck
- [ ] **Progress sharing** — export stats as image for social media
- [ ] **Dark/Light theme toggle** — currently dark-only
- [ ] **Tablet-optimized layout** — larger fretboard for iPad
