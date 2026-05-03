# Fret Master — Task Tracker

> **Last updated**: 2026-05-03
> **Live URL**: https://fret-master-app.vercel.app/
> **Deploy**: `.\deploy.ps1 "commit message"`

## ✅ Recently Completed

### Phase 8 (2026-05-03)
- [x] **Enharmonic naming system** — `resolveNoteName()`, `KEY_NOTE_NAMES`, `NOTES_FLAT`
- [x] **♯/♭ user preference toggle** — settings panel, persisted in `accidentalPref`
- [x] **All 8 game modes enharmonic-safe** — `noteIdx` comparison, `pref` threaded everywhere
- [x] **Circle of Fifths theory-correct** — scale notes use `resolveNoteName()` with key context
- [x] **iOS fullscreen optimization** — `100dvh`, dynamic fretboard height, install prompt

### Phase 7 (2026-05-02 – 05-03)
- [x] Circle of Fifths interactive SVG tool
- [x] CAGED system visualizer
- [x] SRS (Spaced Repetition) engine with SM-2 algorithm
- [x] Chord Quiz game mode

## 🔲 Backlog — High Priority

### UX Polish
- [ ] **SRS "Due Today" counter** — show count of due positions on home screen for motivation
- [ ] **Accidental preference UI feedback** — when toggling ♯/♭, briefly flash affected notes
- [ ] **Landscape home screen optimization** — settings panel may overflow on very small phones
- [ ] **Tablet layout** — larger fretboard and grid layout for iPad

### Theory Depth
- [ ] **CAGED quiz mode** — show a shape, ask user to identify it; or show root, ask user to play shape
- [ ] **Scale degree training** — show a scale degree (e.g., "♭3 of G"), find it on fretboard
- [ ] **Triad/arpeggio training** — identify chord tones (root/3rd/5th) across the neck

### Gamification
- [ ] **Practice scheduler** — "Today's Workout" combining 3 modes based on SRS data
- [ ] **Progress sharing** — export stats as shareable image
- [ ] **Difficulty levels** — beginner (0-5 frets) / intermediate (0-12) / advanced (0-24) presets

## 🔲 Backlog — Medium Priority

### New Modes
- [ ] **Sight-reading mode** — show standard notation on staff, find note on fretboard
- [ ] **Fretboard labeling mode** — fill-in-the-blanks: show fretboard with some notes hidden

### Theory Tools
- [ ] **Fretboard note overlay** — optional toggle to show all note names (study mode, not quiz)
- [ ] **Key signature explorer** — linked to Circle of Fifths, show which notes are ♯/♭ in a key

### Technical
- [ ] **Custom tunings** — Drop D, Open G, DADGAD, Half-step down
- [ ] **Dark/Light theme toggle** — currently dark-only
- [ ] **Haptic feedback** — `navigator.vibrate()` on correct/wrong answers (Android)

## 🔲 Backlog — Low Priority

- [ ] **Multi-language expansion** — Japanese, Korean, Spanish
- [ ] **Left-handed mode** — mirror the fretboard
- [ ] **MIDI input** — connect real guitar via MIDI for answer detection
- [ ] **Social leaderboard** — compare daily challenge scores (requires backend)

## ⚠️ Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| iOS Safari cannot go fullscreen in browser | Low | Mitigated by install prompt; works perfectly as PWA |
| `service-worker` cache may serve stale CSS after deploy | Low | Increment cache version in `sw.js` after each deploy |

## 📋 Development Rules

1. **Always pass `pref`** to `getNoteAt()`, `getRandomPosition*()`, `getWrongNotes()`, etc.
2. **Never compare note names as strings** in answer logic — always use `noteIdx` (integer 0-11)
3. **All UI strings** must go through `i18n.js` `t(key)` — add to both `en` and `zh` objects
4. **Always `npm run build`** before deploy to verify no import errors
5. **Test in both ♯ and ♭ modes** after touching any note-related code
6. **Deploy command**: `.\deploy.ps1 "commit message"` — handles git + Vercel + alias
