// ─── Application Router ──────────────────────────────────────
// Thin coordinator: screen routing + shared context injection
// All screen logic lives in src/screens/*.js

import * as homeScreen from './screens/home.js';
import * as gameScreen from './screens/game.js';
import * as resultsScreen from './screens/results.js';
import * as statsScreen from './screens/stats.js';
import * as scalesScreen from './screens/scales.js';
import * as chordsScreen from './screens/chords.js';
import * as circleScreen from './screens/circle.js';
import * as cagedScreen from './screens/caged.js';
import * as drummerScreen from './screens/drummer.js';
import * as triadsScreen from './screens/triads.js';
import * as arpeggiosScreen from './screens/arpeggios.js';
import * as modesScreen from './screens/modes.js';
import * as journeyScreen from './screens/journey.js';
import { setLang } from './core/i18n.js';
import * as store from './core/storage.js';

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

  // Auto-dismiss rotation prompt so it never blocks screen interaction
  const rotatePrompt = document.getElementById('rotatePrompt');
  if (rotatePrompt && rotatePrompt.classList.contains('dismissed')) {
    // Keep it dismissed — user already chose to continue
  }

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

/* ──────────────────── Bootstrap ──────────────────── */
export function init() {
  const settings = store.getSettings();
  if (settings.lang) setLang(settings.lang);
  showScreen('home');
}

