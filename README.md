# 🎸 Fret Master

A professional guitar fretboard training PWA — master the fretboard, one note at a time.

**Live:** https://fret-master.vercel.app/

## ✨ Features

### 🎮 Game Modes (7)

| Mode | Description |
|------|-------------|
| 🎯 **Find Note** | See a note name, tap its position on the fretboard |
| 🏷️ **Name Note** | See a highlighted position, choose the correct note name |
| 👂 **Ear Training** | Hear a note played, find it on the fretboard by ear |
| 🎵 **Interval Training** | Hear two notes, identify the interval (m2–P8, 12 types) |
| ⚡ **Speed Run** | Find 20 notes as fast as possible — race the clock |
| 💡 **Weak Spots** | Auto-targets your weakest positions from heatmap data |
| 📅 **Daily Challenge** | 10 deterministic questions per day — beat yesterday! |

### 🛠️ Tools (2)

| Tool | Description |
|------|-------------|
| 🎼 **Scale Explorer** | 12 roots × 10 scales = 120 combinations, with interval labels |
| 🎶 **Chord Library** | 20 common chords (Major/Minor/7th/Other), arpeggiated playback |

### 📊 Progress Tracking

- **Fretboard Heatmap** — visualize accuracy by string × fret position
- **Achievement System** — 13 badges from 🎸 First Steps to 🚀 Hyperdrive
- **Streak Tracking** — current and best streak display
- **Per-mode Records** — best time and accuracy for each game mode

### 📱 PWA Features

- ✅ Installable (Add to Home Screen)
- ✅ Offline capable (Service Worker)
- ✅ Zero external dependencies (all audio synthesized via Web Audio API)
- ✅ Mobile-first responsive design

## 📱 How to Use on Phone

1. Open **https://fret-master.vercel.app/** in your phone browser (Safari / Chrome)
2. **iOS**: Tap Share → "Add to Home Screen"
3. **Android**: Tap ⋮ menu → "Add to Home Screen" or "Install App"
4. The app icon appears on your home screen — works offline after first load!

## 🏗️ Tech Stack

- **Vite** — build tooling
- **Vanilla JS** — zero framework, pure ES modules
- **SVG** — fretboard rendered as scalable vector graphics
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
├── index.html              # Entry point + PWA meta tags
├── package.json
├── public/
│   ├── manifest.json       # PWA manifest (name, icons, theme)
│   └── sw.js               # Service Worker for offline caching
└── src/
    ├── main.js             # Bootstrap (imports app + styles)
    ├── app.js              # Screen router, game loop, all UI rendering
    ├── style.css           # Complete design system + all screen styles
    └── core/
        ├── music.js        # Music theory: notes, scales, intervals, chords
        ├── audio.js        # Web Audio: Karplus-Strong synthesis, SFX
        ├── fretboard.js    # SVG fretboard engine (render, highlight, interact)
        └── storage.js      # localStorage: heatmap, records, achievements, daily
```

## 📄 License

MIT
