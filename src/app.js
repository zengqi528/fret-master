// ─── Application Router ──────────────────────────────────────
// Thin coordinator: screen routing + shared context injection
// All screen logic lives in src/screens/*.js

import * as homeScreen from './screens/home.js';
import * as gameScreen from './screens/game.js';
import * as resultsScreen from './screens/results.js';
import * as statsScreen from './screens/stats.js';
import * as scalesScreen from './screens/scales.js';
import * as chordsScreen from './screens/chords.js';

/* ──────────────────── Shared State ──────────────────── */
const app = document.getElementById('app');

/* ──────────────────── Utility ──────────────────── */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const frac = Math.floor((ms % 1000) / 100);
  return `${s}.${frac}s`;
}

/* ──────────────────── Context Object ──────────────────── */
// Injected into every screen's render() so screens don't import app.js
const ctx = {
  app,
  $,
  $$,
  formatTime,
  showScreen,
};

/* ──────────────────── Screen Router ──────────────────── */
function showScreen(name, data = {}) {
  app.classList.remove('screen-enter');
  void app.offsetWidth;
  app.classList.add('screen-enter');

  switch (name) {
    case 'home':    homeScreen.render(ctx); break;
    case 'game':    gameScreen.render(ctx, data.mode); break;
    case 'results': resultsScreen.render(ctx, data); break;
    case 'stats':   statsScreen.render(ctx); break;
    case 'scales':  scalesScreen.render(ctx); break;
    case 'chords':  chordsScreen.render(ctx); break;
  }
}

/* ──────────────────── Bootstrap ──────────────────── */
export function init() {
  showScreen('home');
}
