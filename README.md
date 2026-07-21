# 🎸 Fret Master 2.0

A professional guitar fretboard training PWA — master the fretboard, one note at a time.

**Live:** https://fret-master-app.vercel.app/

## ✨ Features

### 🗺️ Learning Journey (NEW)

A guided 7-stage progression from beginner to fretboard master:
1. 🌱 **Open Position** — Natural notes, frets 0-4
2. 🌿 **5th Position** — Expand to frets 5-7
3. 🌳 **Upper Frets** — Master frets 8-12
4. 🎯 **Full Neck** — All notes, full fretboard
5. ⚡ **Speed Challenge** — Time pressure training
6. 👂 **Ear Training** — Find notes by ear
7. 🎼 **Theory Mastery** — Chord + interval mastery

Each stage unlocks after earning 2+ stars (★★) in the previous one.

### 🎮 Game Modes (9)

| Mode | Description |
|------|-------------|
| 🎯 **Find Note** | See a note name, tap its position on the fretboard |
| 🏷️ **Name Note** | See a highlighted position, choose the correct note name |
| 👂 **Ear Training** | Hear a note played, find it on the fretboard by ear |
| 🎵 **Interval Training** | Progressive unlocking: P5/P4 → 3rds → 2nds/7ths → all 12 |
| 🎹 **Chord Quiz** | Hear a chord strummed, identify its name |
| 🔄 **Octave Navigator** | Find ALL octave positions of a note (multi-tap) |
| ⚡ **Speed Run** | Find 20 notes as fast as possible — race the clock |
| 💡 **Weak Spots** | Auto-targets your weakest positions using SRS data |
| 📅 **Daily Challenge** | 10 deterministic questions per day — beat yesterday! |

**Game Enhancements:**
- 💡 **Hint System** — after 5 seconds, a hint button highlights the correct string
- 📈 **Progressive Intervals** — 5 difficulty levels that auto-unlock
- 🏆 **XP & Levels** — earn XP per session, 20 levels from Beginner to Fretboard God

### 🥁 Drum Machine (NEW)

Professional rhythm practice tool with Web Audio synthesized sounds:
- **50 rhythm patterns** across 12 genres: Rock (7), Pop (4), Blues (4), Funk (4), Jazz (3), Latin (5), Metal (3), Country (3), Reggae (3), R&B/Hip-Hop (3), 6/8 (3), Odd Time (2) + 6 Basic
- **6 time signatures**: 4/4, 3/4, 6/8, 5/4, 7/8, 12/8
- **Swing control**: 0-66% adjustable
- **3 sound types**: Drum Kit / Click / Hi-Hat
- **Speed Trainer**: auto-increment BPM by configurable amount (per bars or seconds)
- **Tap Tempo**: tap to set BPM
- **Count-in**: optional 1-bar count-in
- **Visual beat indicators**: animated dots that pulse on each beat

### 🛠️ Tools (8)

| Tool | Description |
|------|-------------|
| 🥁 **Drum Machine** | Full-featured rhythm trainer with 16 patterns |
| 🎼 **Scale Explorer** | 12 roots × 12+ scales with interval labels |
| 🎶 **Chord Library** | 20 common chords, arpeggiated playback |
| 🔗 **CAGED System** | 5 chord shapes visualized across the fretboard |
| ⭕ **Circle of Fifths** | Interactive SVG with key signatures and playback |
| 🔺 **Triad Trainer** | 4 string groups × 3 inversions × 4 qualities (48 voicings) |
| 🎹 **Arpeggio Explorer** | Maj7 / min7 / Dom7 / m7♭5 / dim7 / aug |
| 🌈 **Mode Explorer** | 7 modes with characteristic notes, mood info, and compare |

### 🎵 Music Theory Engine

- **Enharmonic Naming System** — context-aware ♯/♭ note spelling
- **SRS (Spaced Repetition)** — SM-2 algorithm tracks each position
- **3NPS Patterns** — 7 three-notes-per-string patterns for all modes
- **Triad System** — all voicings across 4 adjacent string groups
- **Mode Metadata** — characteristic notes, parent scales, mood descriptions

### 📊 Progress Tracking

- **XP Level System** — 20 levels with progress bar
- **Fretboard Heatmap** — visualize accuracy by string × fret position
- **7-Day Trend Chart** — daily accuracy visualization
- **Achievement System** — 13 badges from 🎸 First Steps to 🚀 Hyperdrive
- **Streak Tracking** — current and best streak
- **Per-mode Records** — best time and accuracy for each game mode
- **Session History** — last 90 sessions tracked
- **Smart Recommendations** — post-game suggestions based on score

### 📱 PWA Features

- ✅ Installable (Add to Home Screen) — includes iOS install prompt
- ✅ Offline capable (Service Worker)
- ✅ Zero external dependencies (all audio synthesized via Web Audio API)
- ✅ Mobile-first responsive design with dynamic viewport (`100dvh`)
- ✅ Landscape mode with auto-fitting fretboard height
- ✅ Chinese / English bilingual UI (`i18n.js`)

## 📱 How to Use on Phone

1. Open **https://fret-master-app.vercel.app/** in your phone browser
2. **iOS**: Tap Share → "Add to Home Screen" (enables true fullscreen, no Safari bars)
3. **Android**: Tap ⋮ menu → "Install App"
4. The app icon appears on your home screen — works offline after first load!

> 💡 On iPhone, the app will show a one-time prompt guiding you to add it to the home screen for the best fullscreen experience.

## 🏗️ Tech Stack

- **Vite** — build tooling
- **Vanilla JS** — zero framework, pure ES modules
- **SVG** — fretboard rendered as scalable vector graphics with realistic proportions
- **Web Audio API** — Karplus-Strong string synthesis + drum synthesis (no audio files)
- **localStorage** — all data persists locally on device
- **Service Worker** — offline-first PWA architecture

## 🚀 Development

```bash
# Install
npm install

# Dev server (hot reload)
npm run dev

# Production build
npm run build

# Preview production
npm run preview

# Deploy to Vercel (commits, pushes, and aliases the domain)
.\deploy.ps1 "commit message"
```

## 📁 Project Structure

```
fret-master/
├── index.html              # Entry point + PWA meta tags + iOS install prompt
├── package.json
├── deploy.ps1              # Automated deploy: git push → Vercel → domain alias
├── public/
│   ├── manifest.json       # PWA manifest (name, icons, theme)
│   └── sw.js               # Service Worker for offline caching
└── src/
    ├── main.js             # Bootstrap (SW registration, rotation prompt, iOS prompt)
    ├── app.js              # Screen router — dispatches to 13 screen modules
    ├── style.css           # Complete design system + all screen styles (~2700 lines)
    ├── core/               # Engine layer (stateless, reusable)
    │   ├── music.js        # Music theory: notes, scales, modes, triads, arpeggios, CAGED
    │   ├── audio.js        # Web Audio: Karplus-Strong synthesis, SFX
    │   ├── drums.js        # Web Audio: drum synthesis (kick/snare/HH/rim/cowbell)
    │   ├── rhythm.js       # Look-ahead audio scheduler + 16 pattern library + speed trainer
    │   ├── fretboard.js    # SVG fretboard engine (render, highlight, interact)
    │   ├── storage.js      # localStorage: heatmap, SRS, records, XP, journey, achievements
    │   ├── i18n.js         # Chinese/English internationalization (300+ strings)
    │   └── metronome.js    # Legacy metronome (replaced by rhythm.js)
    └── screens/            # UI screens (each exports render(ctx))
        ├── home.js         # Landing page, XP badge, journey banner, tools grid
        ├── game.js         # Game loop + all 9 game modes + hint system
        ├── results.js      # Post-game score, XP display, recommendations
        ├── stats.js        # Progress, heatmap, XP level, 7-day trend
        ├── scales.js       # Scale explorer
        ├── chords.js       # Chord library
        ├── circle.js       # Circle of Fifths tool
        ├── caged.js        # CAGED system visualizer
        ├── drummer.js      # Standalone drum machine
        ├── triads.js       # Triad trainer
        ├── arpeggios.js    # Arpeggio explorer
        ├── modes.js        # Mode explorer with compare
        └── journey.js      # 7-stage learning path
```

## 📄 License

MIT
