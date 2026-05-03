// ─── Main Application ──────────────────────────────────────────
// Screen management, game loop, UI rendering

import { Fretboard } from './core/fretboard.js';
import {
  getNoteAt, getRandomPosition, getRandomPositionFiltered, getRandomNoteName,
  getWrongNotes, findNotePositions, midiToFreq, NOTES, SCALES,
  getScalePositions, INTERVALS, CHORDS, STANDARD_TUNING,
} from './core/music.js';
import { playNote, playCorrect, playWrong, unlockAudio } from './core/audio.js';
import * as metronome from './core/metronome.js';
import * as store from './core/storage.js';

/* ──────────────────── State ──────────────────── */
let currentScreen = 'home';
let fretboard = null;
let gameState = null;

const app = document.getElementById('app');

/* ──────────────────── Utility ──────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const frac = Math.floor((ms % 1000) / 100);
  return `${s}.${frac}s`;
}

/* ──────────────────── Screen Router ──────────────────── */
function showScreen(name, data = {}) {
  currentScreen = name;
  app.classList.remove('screen-enter');
  void app.offsetWidth;
  app.classList.add('screen-enter');

  switch (name) {
    case 'home': renderHome(); break;
    case 'game': startGame(data.mode); break;
    case 'results': renderResults(data); break;
    case 'stats': renderStats(); break;
    case 'scales': renderScaleExplorer(); break;
    case 'chords': renderChordExplorer(); break;
  }
}

/* ──────────────────── HOME SCREEN ──────────────────── */
function renderHome() {
  metronome.stop();
  const settings = store.getSettings();
  const streak = store.getStreak();
  const achievements = store.getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const calendar = store.getPracticeHistory(7);

  app.innerHTML = `
    <div class="screen home-screen">
      <header class="home-header">
        <div class="logo">
          <span class="logo-icon">🎸</span>
          <h1>Fret Master</h1>
        </div>
        <p class="tagline">Master the fretboard, one note at a time</p>
        ${streak.best > 0 ? `<div class="streak-badge">🔥 Best streak: ${streak.best}</div>` : ''}
        <div class="practice-calendar">
          ${calendar.map(d => `<div class="cal-day ${d.practiced ? 'practiced' : ''}"><span class="cal-label">${d.dayName}</span><span class="cal-dot">${d.practiced ? '●' : '○'}</span></div>`).join('')}
        </div>
      </header>

      <div class="mode-cards">
        <button class="mode-card" data-mode="find-note">
          <div class="mode-icon">🎯</div>
          <div class="mode-info">
            <h3>Find Note</h3>
            <p>See a note name, tap its position on the fretboard</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="name-note">
          <div class="mode-icon">🏷️</div>
          <div class="mode-info">
            <h3>Name Note</h3>
            <p>See a highlighted position, choose the correct note name</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="ear-training">
          <div class="mode-icon">👂</div>
          <div class="mode-info">
            <h3>Ear Training</h3>
            <p>Hear a note played, find it on the fretboard by ear</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="interval-training">
          <div class="mode-icon">🎵</div>
          <div class="mode-info">
            <h3>Interval Training</h3>
            <p>Hear two notes, identify the interval between them</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="speed-run">
          <div class="mode-icon">⚡</div>
          <div class="mode-info">
            <h3>Speed Run</h3>
            <p>Find 20 notes as fast as possible — race the clock!</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="weak-practice">
          <div class="mode-icon">💡</div>
          <div class="mode-info">
            <h3>Weak Spots</h3>
            <p>Practice your weakest positions based on heatmap data</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card daily-card" data-mode="daily-challenge" id="dailyCard">
          <div class="mode-icon">📅</div>
          <div class="mode-info">
            <h3>Daily Challenge</h3>
            <p>10 fixed questions per day — beat yesterday!</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>
      </div>

      <div class="tool-cards">
        <button class="tool-card" id="scaleExplorerBtn">
          <span class="tool-icon">🎼</span>
          <span>Scale Explorer</span>
        </button>
        <button class="tool-card" id="chordExplorerBtn">
          <span class="tool-icon">🎶</span>
          <span>Chord Library</span>
        </button>
      </div>

      <div class="settings-panel">
        <h4>Settings</h4>
        <div class="setting-row">
          <label>Fret Range</label>
          <div class="fret-range">
            <input type="number" id="minFret" value="${settings.minFret}" min="0" max="24" />
            <span>—</span>
            <input type="number" id="maxFret" value="${settings.maxFret}" min="0" max="24" />
          </div>
        </div>
        <div class="setting-row">
          <label>String</label>
          <div class="string-filter-btns" id="stringFilterBtns">
            <button class="sf-btn ${settings.practiceString === null ? 'active' : ''}" data-string="all">All</button>
            ${[0,1,2,3,4,5].map(s => {
              const label = STANDARD_TUNING[s].string + '弦';
              return `<button class="sf-btn ${settings.practiceString === s ? 'active' : ''}" data-string="${s}">${label}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="setting-row">
          <label>Questions</label>
          <div class="question-btns">
            ${[10, 20, 40].map(n => `
              <button class="q-btn ${settings.questionCount === n ? 'active' : ''}" data-count="${n}">${n}</button>
            `).join('')}
          </div>
        </div>
        <div class="setting-row">
          <label>Intervals</label>
          <div class="interval-dir-btns">
            ${[
              { val: 'ascending', label: '↑ Up' },
              { val: 'descending', label: '↓ Down' },
              { val: 'random', label: '↕ Mix' },
            ].map(d => `
              <button class="sf-btn ${(settings.intervalDirection || 'ascending') === d.val ? 'active' : ''}" data-dir="${d.val}">${d.label}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="metronome-bar" id="metronomeBar">
        <button class="metro-toggle" id="metroToggle">🎵 Metronome</button>
        <div class="metro-controls" id="metroControls" style="display:none">
          <button class="metro-play" id="metroPlay">▶</button>
          <input type="range" id="metroBpm" min="40" max="240" value="${settings.metronomeBpm || 80}" />
          <span class="metro-bpm-val" id="metroBpmVal">${settings.metronomeBpm || 80}</span>
          <span class="metro-bpm-label">BPM</span>
          <div class="metro-pulse" id="metroPulse"></div>
        </div>
      </div>

      <div class="home-footer-links">
        <button class="stats-link" id="statsBtn">📊 Progress</button>
        <button class="stats-link" id="achieveBtn">🏆 ${unlockedCount}/${achievements.length}</button>
      </div>
    </div>
  `;

  // Event listeners
  $$('.mode-card', app).forEach(card => {
    card.addEventListener('click', () => {
      unlockAudio();
      saveCurrentSettings();
      showScreen('game', { mode: card.dataset.mode });
    });
  });

  $$('.q-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.q-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $$('#stringFilterBtns .sf-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#stringFilterBtns .sf-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $$('.interval-dir-btns .sf-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.interval-dir-btns .sf-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('#statsBtn', app).addEventListener('click', () => showScreen('stats'));
  $('#achieveBtn', app).addEventListener('click', () => showScreen('stats'));
  $('#scaleExplorerBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('scales');
  });
  $('#chordExplorerBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('chords');
  });

  // Metronome
  $('#metroToggle', app).addEventListener('click', () => {
    const ctrl = $('#metroControls', app);
    ctrl.style.display = ctrl.style.display === 'none' ? 'flex' : 'none';
  });
  const bpmSlider = $('#metroBpm', app);
  const bpmVal = $('#metroBpmVal', app);
  bpmSlider.addEventListener('input', () => {
    bpmVal.textContent = bpmSlider.value;
  });
  $('#metroPlay', app).addEventListener('click', () => {
    unlockAudio();
    const btn = $('#metroPlay', app);
    const pulse = $('#metroPulse', app);
    if (metronome.running()) {
      metronome.stop();
      btn.textContent = '▶';
      pulse.classList.remove('beating');
    } else {
      const bpm = parseInt(bpmSlider.value);
      store.saveSettings({ metronomeBpm: bpm });
      metronome.start(bpm, 4, (beat, accent) => {
        pulse.classList.remove('beating');
        void pulse.offsetWidth;
        pulse.classList.add('beating');
      });
      btn.textContent = '⏸';
    }
  });
}

function saveCurrentSettings() {
  const minFret = parseInt($('#minFret', app)?.value ?? 0);
  const maxFret = parseInt($('#maxFret', app)?.value ?? 12);
  const activeBtn = $('.q-btn.active', app);
  const questionCount = activeBtn ? parseInt(activeBtn.dataset.count) : 20;
  const activeStringBtn = $('#stringFilterBtns .sf-btn.active', app);
  const practiceString = activeStringBtn && activeStringBtn.dataset.string !== 'all'
    ? parseInt(activeStringBtn.dataset.string)
    : null;
  const activeDirBtn = $('.interval-dir-btns .sf-btn.active', app);
  const intervalDirection = activeDirBtn ? activeDirBtn.dataset.dir : 'ascending';
  store.saveSettings({ minFret, maxFret, questionCount, practiceString, intervalDirection });
}

/* ──────────────────── GAME SCREEN ──────────────────── */
function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches
    && window.innerHeight < 500;
}

function getFretboardHeight() {
  return isLandscape() ? 280 : 200;
}

function startGame(mode) {
  const settings = store.getSettings();

  gameState = {
    mode,
    questionIdx: 0,
    totalQuestions: mode === 'speed-run' ? 20 : mode === 'daily-challenge' ? 10 : settings.questionCount,
    correct: 0,
    wrong: 0,
    startTime: Date.now(),
    minFret: settings.minFret,
    maxFret: settings.maxFret,
    practiceString: settings.practiceString,  // null = all, 0-5 = specific string
    intervalDirection: settings.intervalDirection || 'ascending',
    currentQuestion: null,
    answered: false,
  };

  const modeLabels = {
    'find-note': 'Find Note',
    'name-note': 'Name Note',
    'ear-training': 'Ear Training',
    'interval-training': 'Interval Training',
    'speed-run': 'Speed Run',
    'weak-practice': 'Weak Spots',
    'daily-challenge': 'Daily Challenge',
  };

  app.innerHTML = `
    <div class="screen game-screen">
      <div class="game-top-bar">
        <button class="back-btn" id="gameBack">✕</button>
        <div class="game-mode-label">${modeLabels[mode]}</div>
        <div class="game-prompt" id="gamePrompt"></div>
        <div class="game-counter" id="gameCounter">1 / ${gameState.totalQuestions}</div>
        <div class="game-timer" id="gameTimer">0.0s</div>
      </div>

      <div class="fretboard-wrap" id="fretboardWrap"></div>

      <div class="game-choices" id="gameChoices"></div>
    </div>
  `;

  // Always render extra frets beyond maxFret so zoom/dim masks work correctly
  const renderFrets = Math.min(Math.max(gameState.maxFret + 3, 15), 24);
  fretboard = new Fretboard($('#fretboardWrap', app), {
    numFrets: renderFrets,
    height: getFretboardHeight(),
  });

  // Zoom fretboard to the selected practice range
  fretboard.setViewRange(gameState.minFret, gameState.maxFret);

  // Highlight active string if practising a single string
  if (gameState.practiceString !== null) {
    fretboard.highlightActiveString(gameState.practiceString);
  }

  gameState.timerInterval = setInterval(updateTimer, 100);

  $('#gameBack', app).addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    showScreen('home');
  });

  nextQuestion();
}

function updateTimer() {
  const el = $('#gameTimer');
  if (el) el.textContent = formatTime(Date.now() - gameState.startTime);
}

function nextQuestion() {
  if (gameState.questionIdx >= gameState.totalQuestions) {
    endGame();
    return;
  }

  gameState.questionIdx++;
  gameState.answered = false;
  $('#gameCounter').textContent = `${gameState.questionIdx} / ${gameState.totalQuestions}`;
  fretboard.clearHighlights();
  fretboard.setInteractive(true);

  switch (gameState.mode) {
    case 'find-note':
    case 'speed-run':
      setupFindNote(); break;
    case 'name-note':
      setupNameNote(); break;
    case 'ear-training':
      setupEarTraining(); break;
    case 'interval-training':
      setupIntervalTraining(); break;
    case 'weak-practice':
      setupWeakPractice(); break;
    case 'daily-challenge':
      setupDailyChallenge(); break;
  }
}

/* ── Find Note: show note name, user taps fretboard ── */
function setupFindNote() {
  // If practising a single string, pick a note that exists on that string in range
  let noteName;
  if (gameState.practiceString !== null) {
    const pos = getRandomPositionFiltered(gameState.minFret, gameState.maxFret, gameState.practiceString);
    noteName = pos.name;
  } else {
    noteName = getRandomNoteName();
  }
  gameState.currentQuestion = { noteName };

  const stringHint = gameState.practiceString !== null
    ? `<span class="prompt-hint">${STANDARD_TUNING[gameState.practiceString].string}弦</span>` : '';
  $('#gamePrompt').innerHTML = `
    <div class="prompt-find">
      <span class="prompt-label">Find</span>
      <span class="prompt-note">${noteName}</span>
      ${stringHint}
    </div>
  `;
  $('#gameChoices').innerHTML = '';

  fretboard.onFretClick = (s, f) => {
    if (gameState.answered) return;
    const note = getNoteAt(s, f);
    // When practising a specific string, only that string counts
    const stringOk = gameState.practiceString !== null ? s === gameState.practiceString : true;
    const isCorrect = note.name === noteName &&
      f >= gameState.minFret && f <= gameState.maxFret && stringOk;
    handleAnswer(isCorrect, s, f, noteName);
  };
}

/* ── Name Note: highlight position, user picks from buttons ── */
function setupNameNote() {
  const pos = getRandomPositionFiltered(gameState.minFret, gameState.maxFret, gameState.practiceString);
  const wrongNotes = getWrongNotes(pos.name, 3);
  const choices = [pos.name, ...wrongNotes].sort(() => Math.random() - 0.5);
  gameState.currentQuestion = { position: pos, correctName: pos.name };

  fretboard.highlight(pos.string, pos.fret, '#00d4aa', true);
  playNote(midiToFreq(pos.midi));

  fretboard.onFretClick = null;
  fretboard.setInteractive(false);

  $('#gamePrompt').innerHTML = `
    <div class="prompt-name">
      <span class="prompt-label">What note is this?</span>
    </div>
  `;

  $('#gameChoices').innerHTML = choices.map(n => `
    <button class="choice-btn" data-note="${n}">${n}</button>
  `).join('');

  $$('.choice-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameState.answered) return;
      const isCorrect = btn.dataset.note === pos.name;
      handleNameAnswer(isCorrect, btn, pos);
    });
  });
}

/* ── Ear Training: play note audio only, user taps fretboard ── */
function setupEarTraining() {
  const pos = getRandomPositionFiltered(gameState.minFret, gameState.maxFret, gameState.practiceString);
  gameState.currentQuestion = { position: pos, noteName: pos.name };

  // No visual hint — only audio
  fretboard.onFretClick = null;
  fretboard.setInteractive(false);

  $('#gamePrompt').innerHTML = `
    <div class="prompt-ear">
      <span class="prompt-label">Listen and find</span>
      <button class="replay-btn" id="replayBtn">🔊 Play</button>
    </div>
  `;
  $('#gameChoices').innerHTML = '';

  // Play the note
  const freq = midiToFreq(pos.midi);
  setTimeout(() => playNote(freq), 200);

  // Replay button
  $('#replayBtn', app).addEventListener('click', () => {
    playNote(freq);
  });

  // Enable fretboard after a short delay (force listening first)
  setTimeout(() => {
    fretboard.setInteractive(true);
    fretboard.onFretClick = (s, f) => {
      if (gameState.answered) return;
      const note = getNoteAt(s, f);
      // When practising a specific string, only that string counts
      const stringOk = gameState.practiceString !== null ? s === gameState.practiceString : true;
      const isCorrect = note.name === pos.name &&
        f >= gameState.minFret && f <= gameState.maxFret && stringOk;
      handleAnswer(isCorrect, s, f, pos.name);
    };
  }, 600);
}

/* ── Interval Training: hear two notes, pick the interval ── */
function setupIntervalTraining() {
  const rootMidi = 40 + Math.floor(Math.random() * 24);
  const correct = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

  // Determine direction: ascending, descending, or random
  const dirSetting = gameState.intervalDirection || 'ascending';
  let direction;
  if (dirSetting === 'random') {
    direction = Math.random() < 0.5 ? 'ascending' : 'descending';
  } else {
    direction = dirSetting;
  }
  const secondMidi = direction === 'descending'
    ? rootMidi - correct.semitones
    : rootMidi + correct.semitones;
  gameState.currentQuestion = { rootMidi, secondMidi, correct, direction };

  fretboard.onFretClick = null;
  fretboard.setInteractive(false);

  const wrongs = INTERVALS.filter(i => i.semitones !== correct.semitones)
    .sort(() => Math.random() - 0.5).slice(0, 3);
  const choices = [correct, ...wrongs].sort(() => Math.random() - 0.5);

  const dirIcon = direction === 'descending' ? '↓' : '↑';
  $('#gamePrompt').innerHTML = `
    <div class="prompt-ear">
      <span class="prompt-label">What interval? ${dirIcon}</span>
      <button class="replay-btn" id="replayBtn">🔊 Play</button>
    </div>
  `;

  $('#gameChoices').innerHTML = choices.map(c => `
    <button class="choice-btn interval-choice" data-semi="${c.semitones}">
      <span class="iv-short">${c.short}</span>
      <span class="iv-name">${c.name}</span>
    </button>
  `).join('');

  const playBoth = () => {
    playNote(midiToFreq(rootMidi));
    setTimeout(() => playNote(midiToFreq(secondMidi)), 500);
  };
  setTimeout(playBoth, 200);
  $('#replayBtn', app).addEventListener('click', playBoth);

  $$('.choice-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameState.answered) return;
      const picked = parseInt(btn.dataset.semi);
      const isCorrect = picked === correct.semitones;
      handleIntervalAnswer(isCorrect, btn, correct);
    });
  });
}

function handleIntervalAnswer(isCorrect, btnEl, correctInterval) {
  gameState.answered = true;

  $$('.choice-btn', app).forEach(b => {
    if (parseInt(b.dataset.semi) === correctInterval.semitones) b.classList.add('correct');
    else b.classList.add('disabled');
  });

  if (isCorrect) {
    gameState.correct++;
    playCorrect();
  } else {
    gameState.wrong++;
    playWrong();
    btnEl.classList.add('wrong');
  }

  setTimeout(nextQuestion, isCorrect ? 600 : 1500);
}

/* ── Weak Practice: focus on lowest accuracy positions ── */
function setupWeakPractice() {
  if (!gameState.weakQueue) {
    gameState.weakQueue = store.getWeakPositions(
      gameState.minFret, gameState.maxFret, gameState.totalQuestions
    );
  }
  const idx = gameState.questionIdx - 1;
  const wp = gameState.weakQueue[idx % gameState.weakQueue.length];
  const note = getNoteAt(wp.string, wp.fret);
  gameState.currentQuestion = { noteName: note.name };

  const pctText = wp.total > 0 ? `(${Math.round(wp.accuracy * 100)}% acc)` : '(untested)';
  $('#gamePrompt').innerHTML = `
    <div class="prompt-find">
      <span class="prompt-label">Find</span>
      <span class="prompt-note">${note.name}</span>
      <span class="prompt-hint">${pctText}</span>
    </div>
  `;
  $('#gameChoices').innerHTML = '';

  fretboard.onFretClick = (s, f) => {
    if (gameState.answered) return;
    const clicked = getNoteAt(s, f);
    const isCorrect = clicked.name === note.name &&
      f >= gameState.minFret && f <= gameState.maxFret;
    handleAnswer(isCorrect, s, f, note.name);
  };
}

/* ── Daily Challenge: deterministic 10 questions per day ── */
function setupDailyChallenge() {
  if (!gameState.dailyRng) {
    const seed = store.getDailySeed();
    // Simple seeded PRNG (mulberry32)
    let state = seed;
    gameState.dailyRng = () => {
      state |= 0; state = state + 0x6D2B79F5 | 0;
      let t = Math.imul(state ^ state >>> 15, 1 | state);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rng = gameState.dailyRng;
  const noteName = NOTES[Math.floor(rng() * NOTES.length)];
  gameState.currentQuestion = { noteName };

  $('#gamePrompt').innerHTML = `
    <div class="prompt-find">
      <span class="prompt-label">Find</span>
      <span class="prompt-note">${noteName}</span>
      <span class="prompt-hint">📅 Daily</span>
    </div>
  `;
  $('#gameChoices').innerHTML = '';

  fretboard.onFretClick = (s, f) => {
    if (gameState.answered) return;
    const clicked = getNoteAt(s, f);
    const isCorrect = clicked.name === noteName &&
      f >= gameState.minFret && f <= gameState.maxFret;
    handleAnswer(isCorrect, s, f, noteName);
  };
}

function handleAnswer(isCorrect, stringIdx, fret, correctNoteName) {
  gameState.answered = true;
  fretboard.setInteractive(false);
  store.recordAnswer(stringIdx, fret, isCorrect);

  if (isCorrect) {
    gameState.correct++;
    playCorrect();
    fretboard.showCorrect(stringIdx, fret);
    const note = getNoteAt(stringIdx, fret);
    setTimeout(() => playNote(midiToFreq(note.midi)), 150);
  } else {
    gameState.wrong++;
    playWrong();
    fretboard.showWrong(stringIdx, fret);
    setTimeout(() => {
      fretboard.showAllPositions(correctNoteName, gameState.minFret, gameState.maxFret);
    }, 300);
  }

  const delay = isCorrect ? 600 : 1500;
  setTimeout(nextQuestion, delay);
}

function handleNameAnswer(isCorrect, btnEl, pos) {
  gameState.answered = true;
  store.recordAnswer(pos.string, pos.fret, isCorrect);

  $$('.choice-btn', app).forEach(b => {
    if (b.dataset.note === pos.name) b.classList.add('correct');
    else b.classList.add('disabled');
  });

  if (isCorrect) {
    gameState.correct++;
    playCorrect();
    fretboard.showCorrect(pos.string, pos.fret);
  } else {
    gameState.wrong++;
    playWrong();
    btnEl.classList.add('wrong');
    fretboard.showWrong(pos.string, pos.fret);
  }

  const delay = isCorrect ? 600 : 1200;
  setTimeout(nextQuestion, delay);
}

function endGame() {
  clearInterval(gameState.timerInterval);
  metronome.stop();
  const totalTime = Date.now() - gameState.startTime;
  const { isNewBestTime, isNewBestScore, newBadges } = store.recordSession(
    gameState.mode, gameState.correct, gameState.totalQuestions, totalTime
  );

  // Record this day as practiced
  store.recordPracticeDay();

  if (gameState.mode === 'daily-challenge') {
    store.recordDaily(gameState.correct);
  }

  showScreen('results', {
    mode: gameState.mode,
    correct: gameState.correct,
    total: gameState.totalQuestions,
    time: totalTime,
    isNewBestTime,
    isNewBestScore,
    newBadges,
  });
}

/* ──────────────────── RESULTS SCREEN ──────────────────── */
function renderResults(data) {
  const pct = Math.round((data.correct / data.total) * 100);
  const grade = pct >= 95 ? 'S' : pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D';
  const gradeColors = { S: '#ffd700', A: '#00e676', B: '#00d4aa', C: '#ffa726', D: '#ff5252' };
  const emoji = pct >= 95 ? '🏆' : pct >= 85 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📖';

  const badgeHtml = data.newBadges && data.newBadges.length > 0
    ? data.newBadges.map(b => `
        <div class="new-badge-toast">
          <span class="badge-icon-lg">${b.icon}</span>
          <div><strong>${b.name}</strong><br><small>${b.desc}</small></div>
        </div>
      `).join('')
    : '';

  app.innerHTML = `
    <div class="screen results-screen">
      <div class="results-card">
        <div class="results-emoji">${emoji}</div>
        <div class="results-grade" style="color: ${gradeColors[grade]}">${grade}</div>
        ${data.isNewBestTime ? '<div class="new-record">🎉 New Best Time!</div>' : ''}
        ${data.isNewBestScore ? '<div class="new-record">⭐ New Best Score!</div>' : ''}

        <div class="results-stats">
          <div class="stat">
            <div class="stat-val">${data.correct}/${data.total}</div>
            <div class="stat-label">Correct</div>
          </div>
          <div class="stat">
            <div class="stat-val">${pct}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
          <div class="stat">
            <div class="stat-val">${formatTime(data.time)}</div>
            <div class="stat-label">Time</div>
          </div>
        </div>

        <div class="results-streak">🔥 Current streak: ${store.getStreak().current}</div>
      </div>

      ${badgeHtml ? `<div class="new-badges">${badgeHtml}</div>` : ''}

      <div class="results-actions">
        <button class="btn-primary" id="playAgain">Play Again</button>
        <button class="btn-secondary" id="backHome">Back to Menu</button>
      </div>
    </div>
  `;

  $('#playAgain', app).addEventListener('click', () => {
    showScreen('game', { mode: data.mode });
  });
  $('#backHome', app).addEventListener('click', () => showScreen('home'));
}

/* ──────────────────── STATS SCREEN ──────────────────── */
function renderStats() {
  const records = store.getRecords();
  const heatmap = store.getHeatmapData();
  const streak = store.getStreak();
  const achievements = store.getAchievements();

  let heatmapHtml = '<div class="heatmap-grid">';
  const stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
  for (let s = 5; s >= 0; s--) {
    heatmapHtml += `<div class="hm-row"><span class="hm-label">${stringLabels[5 - s]}</span>`;
    for (let f = 0; f <= 12; f++) {
      const cell = heatmap[s][f];
      const pct = cell.total > 0 ? cell.correct / cell.total : -1;
      let color;
      if (pct < 0) color = 'rgba(255,255,255,0.05)';
      else if (pct >= 0.9) color = '#00e676';
      else if (pct >= 0.7) color = '#66bb6a';
      else if (pct >= 0.5) color = '#ffa726';
      else color = '#ff5252';
      const opacity = cell.total > 0 ? Math.min(0.3 + cell.total * 0.07, 1) : 0.15;
      heatmapHtml += `<div class="hm-cell" style="background:${color};opacity:${opacity}" title="String ${6-s}, Fret ${f}: ${cell.total > 0 ? Math.round(pct*100)+'%' : 'N/A'} (${cell.total} attempts)"></div>`;
    }
    heatmapHtml += '</div>';
  }
  heatmapHtml += '<div class="hm-row hm-fret-nums"><span class="hm-label"></span>';
  for (let f = 0; f <= 12; f++) heatmapHtml += `<div class="hm-cell hm-num">${f}</div>`;
  heatmapHtml += '</div></div>';

  const modeLabel = (m) => {
    const labels = { 'find-note': '🎯 Find', 'name-note': '🏷️ Name', 'ear-training': '👂 Ear', 'interval-training': '🎵 Interval', 'speed-run': '⚡ Speed', 'weak-practice': '💡 Weak', 'daily-challenge': '📅 Daily' };
    return labels[m] || m;
  };

  app.innerHTML = `
    <div class="screen stats-screen">
      <div class="stats-header">
        <button class="back-btn" id="statsBack">←</button>
        <h2>Progress</h2>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-val">${streak.best}</div>
          <div class="stat-label">🔥 Best Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${store.getData().totalSessions}</div>
          <div class="stat-label">🎮 Sessions</div>
        </div>
      </div>

      <div class="stats-section">
        <h3>Achievements</h3>
        <div class="achievements-grid">
          ${achievements.map(a => `
            <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
              <span class="ach-icon">${a.icon}</span>
              <span class="ach-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="stats-section">
        <h3>Game Records</h3>
        <div class="records-list">
          ${Object.entries(records).map(([mode, r]) => `
            <div class="record-row">
              <span class="record-mode">${modeLabel(mode)}</span>
              <span class="record-stat">Best: ${r.bestTime ? formatTime(r.bestTime) : '—'}</span>
              <span class="record-stat">Acc: ${r.totalPlayed > 0 ? Math.round(r.totalCorrect / r.totalPlayed * 100) + '%' : '—'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="stats-section">
        <h3>Fretboard Heatmap</h3>
        <p class="heatmap-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#ff5252"></span>&lt;50%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ffa726"></span>50-70%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#66bb6a"></span>70-90%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#00e676"></span>&gt;90%</span>
        </p>
        ${heatmapHtml}
      </div>

      <div class="stats-section">
        <h3>Data Management</h3>
        <div class="data-actions">
          <button class="btn-secondary btn-sm" id="exportBtn">📤 Export Data</button>
          <button class="btn-secondary btn-sm" id="importBtn">📥 Import Data</button>
          <input type="file" id="importFile" accept=".json" style="display:none" />
        </div>
      </div>
    </div>
  `;

  $('#statsBack', app).addEventListener('click', () => showScreen('home'));

  // Data export/import
  $('#exportBtn', app).addEventListener('click', () => store.exportData());
  $('#importBtn', app).addEventListener('click', () => $('#importFile', app).click());
  $('#importFile', app).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = store.importData(reader.result);
      if (result.ok) {
        alert('Data imported successfully! Refreshing...');
        showScreen('stats');
      } else {
        alert('Import failed: ' + result.error);
      }
    };
    reader.readAsText(file);
  });
}

/* ──────────────────── SCALE EXPLORER ──────────────────── */
let scaleState = { root: 'C', scale: 'Major' };

function renderScaleExplorer() {
  const scaleNames = Object.keys(SCALES);

  app.innerHTML = `
    <div class="screen scale-screen">
      <div class="stats-header">
        <button class="back-btn" id="scaleBack">←</button>
        <h2>Scale Explorer</h2>
      </div>

      <div class="scale-controls">
        <div class="scale-control-group">
          <label>Root</label>
          <div class="root-picker">
            ${NOTES.map(n => `
              <button class="root-btn ${n === scaleState.root ? 'active' : ''}" data-note="${n}">${n}</button>
            `).join('')}
          </div>
        </div>

        <div class="scale-control-group">
          <label>Scale</label>
          <div class="scale-picker">
            ${scaleNames.map(s => `
              <button class="scale-type-btn ${s === scaleState.scale ? 'active' : ''}" data-scale="${s}">${s}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="scale-info" id="scaleInfo"></div>

      <div class="fretboard-wrap" id="scaleFretboard"></div>
    </div>
  `;

  fretboard = new Fretboard($('#scaleFretboard', app), { numFrets: 12, height: getFretboardHeight() });

  // Click on fretboard plays the note
  fretboard.onFretClick = (s, f) => {
    const note = getNoteAt(s, f);
    playNote(midiToFreq(note.midi));
    // Brief highlight
    const dot = fretboard.highlightWithLabel(s, f, note.name, '#00d4aa');
    setTimeout(() => { dot.classList.add('fade-out'); }, 400);
    setTimeout(() => dot.remove(), 700);
  };

  // Root note buttons
  $$('.root-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.root-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scaleState.root = btn.dataset.note;
      updateScaleDisplay();
    });
  });

  // Scale type buttons
  $$('.scale-type-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.scale-type-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scaleState.scale = btn.dataset.scale;
      updateScaleDisplay();
    });
  });

  $('#scaleBack', app).addEventListener('click', () => showScreen('home'));

  updateScaleDisplay();
}

function updateScaleDisplay() {
  if (!fretboard) return;
  fretboard.clearHighlights();

  const positions = getScalePositions(scaleState.root, scaleState.scale, 0, 12);
  const scale = SCALES[scaleState.scale];

  // Color coding: root = gold, other intervals = accent shades
  positions.forEach(p => {
    const color = p.isRoot ? '#ffd700' : '#00d4aa';
    fretboard.highlightWithLabel(p.string, p.fret, p.intervalLabel, color);
  });

  // Scale info text
  const noteNames = scale.map(s => NOTES[(NOTES.indexOf(scaleState.root) + s) % 12]);
  const infoEl = $('#scaleInfo', app);
  if (infoEl) {
    infoEl.innerHTML = `
      <div class="scale-notes">
        <strong>${scaleState.root} ${scaleState.scale}</strong>:
        ${noteNames.map((n, i) => `<span class="scale-note ${i === 0 ? 'root' : ''}">${n}</span>`).join(' ')}
      </div>
    `;
  }
}

/* ──────────────────── CHORD EXPLORER ──────────────────── */
let chordState = { selected: 'C' };

function renderChordExplorer() {
  const categories = [...new Set(CHORDS.map(c => c.category))];

  app.innerHTML = `
    <div class="screen chord-screen">
      <div class="stats-header">
        <button class="back-btn" id="chordBack">←</button>
        <h2>Chord Library</h2>
      </div>
      <div class="chord-categories">
        ${categories.map(cat => `
          <div class="chord-cat">
            <span class="chord-cat-label">${cat}</span>
            <div class="chord-btns">
              ${CHORDS.filter(c => c.category === cat).map(c => `
                <button class="chord-btn ${c.name === chordState.selected ? 'active' : ''}" data-chord="${c.name}">${c.name}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="chord-info" id="chordInfo"></div>
      <div class="fretboard-wrap" id="chordFretboard"></div>
    </div>
  `;

  fretboard = new Fretboard($('#chordFretboard', app), { numFrets: 12, height: getFretboardHeight() });
  fretboard.setInteractive(false);

  $$('.chord-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.chord-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chordState.selected = btn.dataset.chord;
      displayChord(chordState.selected);
    });
  });

  $('#chordBack', app).addEventListener('click', () => showScreen('home'));
  displayChord(chordState.selected);
}

function displayChord(name) {
  if (!fretboard) return;
  fretboard.clearHighlights();
  const chord = CHORDS.find(c => c.name === name);
  if (!chord) return;

  const notes = [];
  chord.frets.forEach((f, s) => {
    if (f >= 0) {
      const note = getNoteAt(s, f);
      notes.push(note.name);
      const color = s === 0 || (f > 0 && chord.frets.indexOf(f) === s) ? '#00d4aa' : '#00d4aa';
      fretboard.highlightWithLabel(s, f, note.name, f === 0 ? 'rgba(0,212,170,0.5)' : '#00d4aa');
    }
  });

  // Strum the chord
  let delay = 0;
  for (let s = 0; s < 6; s++) {
    if (chord.frets[s] >= 0) {
      const note = getNoteAt(s, chord.frets[s]);
      setTimeout(() => playNote(midiToFreq(note.midi), 0.25), delay);
      delay += 70;
    }
  }

  const unique = [...new Set(notes)];
  const muted = chord.frets.map((f, i) => f < 0 ? ['⑥','⑤','④','③','②','①'][i] : null).filter(Boolean);
  const info = $('#chordInfo', app);
  if (info) {
    info.innerHTML = `
      <strong>${name}</strong>: ${unique.join(' ')}
      ${muted.length ? `<span class="chord-muted">Muted: ${muted.join(' ')}</span>` : ''}
    `;
  }
}

/* ──────────────────── Bootstrap ──────────────────── */
export function init() {
  showScreen('home');
}
