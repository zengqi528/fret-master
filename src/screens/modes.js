// ─── Mode Explorer Screen ─────────────────────────────────────────
import { Fretboard } from '../core/fretboard.js';
import { NOTES, SCALES, MODE_INFO, getScalePositions, getNoteAt, midiToFreq } from '../core/music.js';
import { playNote } from '../core/audio.js';
import { t } from '../core/i18n.js';

let fretboard = null;
let state = {
  parentKey: 'C',
  mode: 'Ionian',
  compareMode: null // parallel mode to compare
};

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;
  const modes = Object.keys(MODE_INFO);

  app.innerHTML = `
    <div class="screen modes-screen">
      <div class="stats-header">
        <button class="back-btn" id="modesBack">←</button>
        <h2>${t('mode_explorer') || 'Mode Explorer'}</h2>
      </div>

      <div class="controls-panel">
        <div class="control-group scroll-x">
          <label>${t('parent_key') || 'Parent Key'}</label>
          <div class="picker">
            ${NOTES.map(n => `<button class="picker-btn parent-btn ${n === state.parentKey ? 'active' : ''}" data-val="${n}">${n}</button>`).join('')}
          </div>
        </div>

        <div class="control-group scroll-x">
          <label>${t('mode') || 'Mode'}</label>
          <div class="picker">
            ${modes.map(m => `<button class="picker-btn mode-btn ${m === state.mode ? 'active' : ''}" data-val="${m}">${m}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="mode-info-card" id="modeInfo"></div>

      <div class="action-bar">
        <button class="action-btn" id="playBtn">▶ Play Scale</button>
        <button class="action-btn" id="compareBtn">A/B Compare (Hold)</button>
      </div>

      <div class="fretboard-wrap" id="modesFretboard"></div>
      
      <div class="legend">
        <span class="legend-item"><span class="dot root-color"></span> Root</span>
        <span class="legend-item"><span class="dot char-color"></span> Characteristic Note</span>
        <span class="legend-item"><span class="dot scale-color"></span> Scale Tone</span>
      </div>
    </div>
  `;

  fretboard = new Fretboard($('#modesFretboard', app), {
    numFrets: 15,
    height: isLandscape() ? 280 : 200,
  });

  fretboard.onFretClick = (s, f) => {
    const note = getNoteAt(s, f);
    playNote(midiToFreq(note.midi));
  };

  const bindPicker = (selector, stateKey) => {
    $$(selector, app).forEach(btn => {
      btn.addEventListener('click', () => {
        $$(selector, app).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state[stateKey] = btn.dataset.val;
        updateDisplay();
      });
    });
  };

  bindPicker('.parent-btn', 'parentKey');
  bindPicker('.mode-btn', 'mode');

  $('#modesBack', app).addEventListener('click', () => showScreen('home'));

  // Compare functionality (Parallel major/minor comparison)
  const compareBtn = $('#compareBtn', app);
  const startCompare = () => {
    state.isComparing = true;
    updateDisplay();
  };
  const stopCompare = () => {
    state.isComparing = false;
    updateDisplay();
  };
  compareBtn.addEventListener('mousedown', startCompare);
  compareBtn.addEventListener('touchstart', startCompare, {passive: true});
  window.addEventListener('mouseup', stopCompare);
  window.addEventListener('touchend', stopCompare);

  // Play Scale
  $('#playBtn', app).addEventListener('click', () => {
    const rootName = getModeRootName();
    const positions = getScalePositions(rootName, state.mode, 0, 5).sort((a, b) => a.midi - b.midi);
    // filter to one octave
    const rootMidi = positions.find(p => p.isRoot).midi;
    const scaleNotes = positions.filter(p => p.midi >= rootMidi && p.midi < rootMidi + 13);
    // remove duplicates
    const uniqueMidi = [];
    const seq = [];
    for (const p of scaleNotes) {
      if (!uniqueMidi.includes(p.midi)) {
        uniqueMidi.push(p.midi);
        seq.push(p);
      }
    }
    
    let delay = 0;
    seq.forEach(p => {
      setTimeout(() => {
        playNote(midiToFreq(p.midi));
        const dot = fretboard.highlight(p.string, p.fret, '#ffd700');
        setTimeout(() => dot?.remove(), 400);
      }, delay);
      delay += 300;
    });
  });

  updateDisplay();

  function getModeRootName() {
    const parentIdx = NOTES.indexOf(state.parentKey);
    const modeObj = MODE_INFO[state.mode];
    const offset = SCALES['Major'][modeObj.degree - 1];
    return NOTES[(parentIdx + offset) % 12];
  }

  function updateDisplay() {
    if (!fretboard) return;
    fretboard.clearHighlights();

    let currentMode = state.mode;
    let rootName = getModeRootName();

    if (state.isComparing) {
      // Compare to parallel Ionian if it's a minor mode, or Aeolian if it's major
      // Or simply to parallel Ionian always to see the differences
      currentMode = 'Ionian';
    }

    const modeObj = MODE_INFO[currentMode];
    const infoEl = $('#modeInfo', app);

    if (!state.isComparing && infoEl) {
      infoEl.innerHTML = `
        <div class="mode-title">${rootName} ${state.mode}</div>
        <div class="mode-desc">${modeObj.mood}</div>
        <div class="mode-char">Characteristic Note: <strong>${modeObj.charLabel}</strong></div>
        <div class="mode-parent">Parent Key: ${state.parentKey} Major (Degree ${modeObj.degree})</div>
      `;
    } else if (state.isComparing && infoEl) {
      infoEl.innerHTML = `<div class="mode-title compare-title">Comparing to Parallel ${rootName} Ionian</div>`;
    }

    const positions = getScalePositions(rootName, currentMode, 0, 15);

    positions.forEach(p => {
      let color = '#00d4aa'; // scale tone
      if (p.isRoot) color = '#ffd700'; // root
      else if (p.interval === modeObj.characteristic) color = '#da77f2'; // characteristic magenta
      
      fretboard.highlightWithLabel(p.string, p.fret, p.intervalLabel, color);
    });
  }
}
