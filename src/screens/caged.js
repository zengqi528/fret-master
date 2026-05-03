// ─── CAGED System Screen ──────────────────────────────────────
// Visualize CAGED chord shapes on the fretboard for any root note

import { Fretboard } from '../core/fretboard.js';
import { NOTES, CAGED_SHAPES, getCAGEDPositions, getNoteAt, midiToFreq } from '../core/music.js';
import { playNote } from '../core/audio.js';

let fretboard = null;
let cagedState = { root: 'C', activeShapes: [true, true, true, true, true] };

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches
    && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;

  app.innerHTML = `
    <div class="screen caged-screen">
      <div class="stats-header">
        <button class="back-btn" id="cagedBack">←</button>
        <h2>CAGED System</h2>
      </div>

      <div class="caged-controls">
        <div class="scale-control-group">
          <label>Root</label>
          <div class="root-picker">
            ${NOTES.map(n => `
              <button class="root-btn ${n === cagedState.root ? 'active' : ''}" data-note="${n}">${n}</button>
            `).join('')}
          </div>
        </div>

        <div class="caged-shape-toggles">
          ${CAGED_SHAPES.map((s, i) => `
            <button class="caged-toggle ${cagedState.activeShapes[i] ? 'active' : ''}"
              data-shape="${i}" style="--shape-color: ${s.color}">
              <span class="caged-letter">${s.name.charAt(0)}</span>
              <span class="caged-label">${s.name}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="caged-legend" id="cagedLegend"></div>

      <div class="fretboard-wrap" id="cagedFretboard"></div>
    </div>
  `;

  fretboard = new Fretboard($('#cagedFretboard', app), {
    numFrets: 14,
    height: isLandscape() ? 280 : 200,
  });

  // Click on fretboard to play note
  fretboard.onFretClick = (s, f) => {
    const note = getNoteAt(s, f);
    playNote(midiToFreq(note.midi));
    const dot = fretboard.highlightWithLabel(s, f, note.name, '#fff');
    setTimeout(() => { dot.classList.add('fade-out'); }, 400);
    setTimeout(() => dot.remove(), 700);
  };

  // Root picker
  $$('.root-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.root-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cagedState.root = btn.dataset.note;
      updateDisplay();
    });
  });

  // Shape toggles
  $$('.caged-toggle', app).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.shape);
      cagedState.activeShapes[idx] = !cagedState.activeShapes[idx];
      btn.classList.toggle('active');
      updateDisplay();
    });
  });

  $('#cagedBack', app).addEventListener('click', () => showScreen('home'));

  updateDisplay();

  function updateDisplay() {
    if (!fretboard) return;
    fretboard.clearHighlights();

    const allShapes = getCAGEDPositions(cagedState.root, 14);
    let visibleCount = 0;

    allShapes.forEach(({ shape, positions }, i) => {
      // Find which CAGED index this shape corresponds to
      const cagedIdx = CAGED_SHAPES.indexOf(shape);
      if (cagedIdx < 0 || !cagedState.activeShapes[cagedIdx]) return;

      visibleCount++;
      positions.forEach(p => {
        const isRoot = p.interval === 'R';
        const color = isRoot ? '#ffd700' : p.color;
        fretboard.highlightWithLabel(p.string, p.fret, p.interval, color);
      });
    });

    // Legend
    const legend = $('#cagedLegend', app);
    if (legend) {
      const activeNames = CAGED_SHAPES
        .filter((_, i) => cagedState.activeShapes[i])
        .map(s => `<span style="color:${s.color};font-weight:700">${s.name}</span>`);
      legend.innerHTML = `
        <div class="caged-legend-text">
          ${cagedState.root} Major — ${activeNames.length > 0 ? activeNames.join(' · ') : 'No shapes selected'}
          <span class="caged-hint">R = Root · Gold = Root notes</span>
        </div>
      `;
    }
  }
}
