// ─── Game Screen ──────────────────────────────────────────────
// Game loop, question dispatch, all game mode setup functions

import { Fretboard } from '../core/fretboard.js';
import {
  getNoteAt, getRandomPosition, getRandomPositionFiltered, getRandomNoteName,
  getWrongNotes, findNotePositions, midiToFreq, NOTES, INTERVALS, STANDARD_TUNING,
} from '../core/music.js';
import { playNote, playCorrect, playWrong } from '../core/audio.js';
import * as metronome from '../core/metronome.js';
import * as store from '../core/storage.js';

let fretboard = null;
let gameState = null;
let _ctx = null;

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches
    && window.innerHeight < 500;
}

function getFretboardHeight() {
  return isLandscape() ? 280 : 200;
}

export function render(ctx, mode) {
  _ctx = ctx;
  const { app, $, formatTime, showScreen } = ctx;
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
    practiceString: settings.practiceString,
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

  const renderFrets = Math.min(Math.max(gameState.maxFret + 3, 15), 24);
  fretboard = new Fretboard($('#fretboardWrap', app), {
    numFrets: renderFrets,
    height: getFretboardHeight(),
  });

  fretboard.setViewRange(gameState.minFret, gameState.maxFret);

  if (gameState.practiceString !== null) {
    fretboard.highlightActiveString(gameState.practiceString);
  }

  gameState.timerInterval = setInterval(updateTimer, 100);

  $('#gameBack', app).addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    metronome.stop();
    showScreen('home');
  });

  nextQuestion();
}

/** Export for external access (e.g., getFretboard for other screens) */
export function getFretboard() { return fretboard; }
export function getGameState() { return gameState; }

function updateTimer() {
  const el = _ctx.$('#gameTimer');
  if (el) el.textContent = _ctx.formatTime(Date.now() - gameState.startTime);
}

function nextQuestion() {
  if (gameState.questionIdx >= gameState.totalQuestions) {
    endGame();
    return;
  }

  gameState.questionIdx++;
  gameState.answered = false;
  _ctx.$('#gameCounter').textContent = `${gameState.questionIdx} / ${gameState.totalQuestions}`;
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

/* ── Find Note ── */
function setupFindNote() {
  const { $, $$ } = _ctx;
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
    const stringOk = gameState.practiceString !== null ? s === gameState.practiceString : true;
    const isCorrect = note.name === noteName &&
      f >= gameState.minFret && f <= gameState.maxFret && stringOk;
    handleAnswer(isCorrect, s, f, noteName);
  };
}

/* ── Name Note ── */
function setupNameNote() {
  const { $, $$ } = _ctx;
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

  $$('.choice-btn', _ctx.app).forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameState.answered) return;
      const isCorrect = btn.dataset.note === pos.name;
      handleNameAnswer(isCorrect, btn, pos);
    });
  });
}

/* ── Ear Training ── */
function setupEarTraining() {
  const { $, $$ } = _ctx;
  const pos = getRandomPositionFiltered(gameState.minFret, gameState.maxFret, gameState.practiceString);
  gameState.currentQuestion = { position: pos, noteName: pos.name };

  fretboard.onFretClick = null;
  fretboard.setInteractive(false);

  $('#gamePrompt').innerHTML = `
    <div class="prompt-ear">
      <span class="prompt-label">Listen and find</span>
      <button class="replay-btn" id="replayBtn">🔊 Play</button>
    </div>
  `;
  $('#gameChoices').innerHTML = '';

  const freq = midiToFreq(pos.midi);
  setTimeout(() => playNote(freq), 200);

  $('#replayBtn', _ctx.app).addEventListener('click', () => {
    playNote(freq);
  });

  setTimeout(() => {
    fretboard.setInteractive(true);
    fretboard.onFretClick = (s, f) => {
      if (gameState.answered) return;
      const note = getNoteAt(s, f);
      const stringOk = gameState.practiceString !== null ? s === gameState.practiceString : true;
      const isCorrect = note.name === pos.name &&
        f >= gameState.minFret && f <= gameState.maxFret && stringOk;
      handleAnswer(isCorrect, s, f, pos.name);
    };
  }, 600);
}

/* ── Interval Training ── */
function setupIntervalTraining() {
  const { $, $$ } = _ctx;
  const rootMidi = 40 + Math.floor(Math.random() * 24);
  const correct = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

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
  $('#replayBtn', _ctx.app).addEventListener('click', playBoth);

  $$('.choice-btn', _ctx.app).forEach(btn => {
    btn.addEventListener('click', () => {
      if (gameState.answered) return;
      const picked = parseInt(btn.dataset.semi);
      const isCorrect = picked === correct.semitones;
      handleIntervalAnswer(isCorrect, btn, correct);
    });
  });
}

/* ── Weak Practice ── */
function setupWeakPractice() {
  const { $ } = _ctx;
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

/* ── Daily Challenge ── */
function setupDailyChallenge() {
  const { $ } = _ctx;
  if (!gameState.dailyRng) {
    const seed = store.getDailySeed();
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

/* ── Answer Handlers ── */
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
  const { $$ } = _ctx;
  gameState.answered = true;
  store.recordAnswer(pos.string, pos.fret, isCorrect);

  $$('.choice-btn', _ctx.app).forEach(b => {
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

function handleIntervalAnswer(isCorrect, btnEl, correctInterval) {
  const { $$ } = _ctx;
  gameState.answered = true;

  $$('.choice-btn', _ctx.app).forEach(b => {
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

function endGame() {
  clearInterval(gameState.timerInterval);
  metronome.stop();
  const totalTime = Date.now() - gameState.startTime;
  const { isNewBestTime, isNewBestScore, newBadges } = store.recordSession(
    gameState.mode, gameState.correct, gameState.totalQuestions, totalTime
  );

  store.recordPracticeDay();

  if (gameState.mode === 'daily-challenge') {
    store.recordDaily(gameState.correct);
  }

  _ctx.showScreen('results', {
    mode: gameState.mode,
    correct: gameState.correct,
    total: gameState.totalQuestions,
    time: totalTime,
    isNewBestTime,
    isNewBestScore,
    newBadges,
  });
}
