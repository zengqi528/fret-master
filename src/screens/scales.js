// ─── Scale Explorer Screen ────────────────────────────────────
// Interactive scale visualization on fretboard

import { Fretboard } from '../core/fretboard.js';
import { getNoteAt, midiToFreq, NOTES, SCALES, getScalePositions } from '../core/music.js';
import { playNote } from '../core/audio.js';

let fretboard = null;
let scaleState = { root: 'C', scale: 'Major' };

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches
    && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;
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

  fretboard = new Fretboard($('#scaleFretboard', app), {
    numFrets: 12,
    height: isLandscape() ? 280 : 200,
  });

  fretboard.onFretClick = (s, f) => {
    const note = getNoteAt(s, f);
    playNote(midiToFreq(note.midi));
    const dot = fretboard.highlightWithLabel(s, f, note.name, '#00d4aa');
    setTimeout(() => { dot.classList.add('fade-out'); }, 400);
    setTimeout(() => dot.remove(), 700);
  };

  $$('.root-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.root-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scaleState.root = btn.dataset.note;
      updateDisplay();
    });
  });

  $$('.scale-type-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.scale-type-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      scaleState.scale = btn.dataset.scale;
      updateDisplay();
    });
  });

  $('#scaleBack', app).addEventListener('click', () => showScreen('home'));

  updateDisplay();

  function updateDisplay() {
    if (!fretboard) return;
    fretboard.clearHighlights();

    const positions = getScalePositions(scaleState.root, scaleState.scale, 0, 12);
    const scale = SCALES[scaleState.scale];

    positions.forEach(p => {
      const color = p.isRoot ? '#ffd700' : '#00d4aa';
      fretboard.highlightWithLabel(p.string, p.fret, p.intervalLabel, color);
    });

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
}
