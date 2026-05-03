# 🎸 Fret Master

A professional guitar fretboard training PWA — master the fretboard, one note at a time.

**Live:** https://fret-master-app.vercel.app/

## ✨ Features

### 🎮 Game Modes (8)

| Mode | Description |
|------|-------------|
| 🎯 **Find Note** | See a note name, tap its position on the fretboard |
| 🏷️ **Name Note** | See a highlighted position, choose the correct note name |
| 👂 **Ear Training** | Hear a note played, find it on the fretboard by ear |
| 🎵 **Interval Training** | Hear two notes, identify the interval (m2–P8, 12 types, ↑↓↕) |
| 🎹 **Chord Quiz** | Hear a chord strummed, identify its name |
| ⚡ **Speed Run** | Find 20 notes as fast as possible — race the clock |
| 💡 **Weak Spots** | Auto-targets your weakest positions using SRS data |
| 📅 **Daily Challenge** | 10 deterministic questions per day — beat yesterday! |

### 🛠️ Tools (4)

| Tool | Description |
|------|-------------|
| 🎼 **Scale Explorer** | 12 roots × 10 scales = 120 combinations, with interval labels |
| 🎶 **Chord Library** | 20 common chords (Major/Minor/7th/Other), arpeggiated playback |
| 🔗 **CAGED System** | 5 chord shapes (C/A/G/E/D) visualized across the fretboard |
| ⭕ **Circle of Fifths** | Interactive SVG circle with key signatures, scale notes, playback |

### 🎵 Music Theory Engine

- **Enharmonic Naming System** — context-aware ♯/♭ note spelling:
  - **Theory mode**: `KEY_NOTE_NAMES` lookup table enforces correct spellings per key (e.g., D♭ Major uses D♭, not C#)
  - **User preference**: Settings toggle for ♯ or ♭ display in practice modes
  - All game modes use `noteIdx`-based comparison (enharmonic-safe, never string-matching)
- **SRS (Spaced Repetition)** — SM-2 algorithm tracks each fretboard position's review interval and difficulty

### 📊 Progress Tracking

- **Fretboard Heatmap** — visualize accuracy by string × fret position
- **Achievement System** — 13 badges from 🎸 First Steps to 🚀 Hyperdrive
- **Streak Tracking** — current and best streak display
- **Per-mode Records** — best time and accuracy for each game mode
- **7-day Practice Calendar** — daily practice streak visualization

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
- **Web Audio API** — Karplus-Strong string synthesis (no audio files)
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
    ├── app.js              # Screen router (~62 lines) — dispatches to screen modules
    ├── style.css           # Complete design system + all screen styles (~1850 lines)
    ├── core/               # Engine layer (stateless, reusable)
    │   ├── music.js        # Music theory: notes, scales, intervals, chords, CAGED, enharmonics (~326 lines)
    │   ├── audio.js        # Web Audio: Karplus-Strong synthesis, SFX (~126 lines)
    │   ├── fretboard.js    # SVG fretboard engine (render, highlight, interact) (~460 lines)
    │   ├── storage.js      # localStorage: heatmap, SRS, records, achievements, daily (~294 lines)
    │   ├── i18n.js         # Chinese/English internationalization (~147 lines)
    │   └── metronome.js    # BPM-based metronome with accented downbeats (~64 lines)
    └── screens/            # UI screens (each exports render(ctx))
        ├── home.js         # Landing page, settings panel, metronome (~286 lines)
        ├── game.js         # Game loop + all 8 game modes (~478 lines)
        ├── results.js      # Post-game score display (~53 lines)
        ├── stats.js        # Progress, heatmap, data mgmt (~110 lines)
        ├── scales.js       # Scale explorer (~92 lines)
        ├── chords.js       # Chord library (~84 lines)
        ├── circle.js       # Circle of Fifths tool (~123 lines)
        └── caged.js        # CAGED system visualizer (~105 lines)
```

## 📄 License

MIT
