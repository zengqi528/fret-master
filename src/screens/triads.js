// ─── Triad Trainer Screen ─────────────────────────────────────────
import { Fretboard } from '../core/fretboard.js';
import { NOTES, TRIAD_TYPES, TRIAD_STRING_GROUPS, INVERSIONS, getTriadPositions, getNoteAt, midiToFreq } from '../core/music.js';
import { playNote } from '../core/audio.js';
import { t } from '../core/i18n.js';

let fretboard = null;
let state = {
  root: 'C',
  type: 'Major',
  stringGroup: 0, // index in TRIAD_STRING_GROUPS
  inversion: 'Root'
};

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;

  app.innerHTML = `
    <div class="screen triads-screen">
      <div class="stats-header">
        <button class="back-btn" id="triadsBack">←</button>
        <h2>${t('triad_trainer') || 'Triad Trainer'}</h2>
      </div>

      <div class="controls-panel">
        <div class="control-group scroll-x">
          <label>${t('root') || 'Root'}</label>
          <div class="picker">
            ${NOTES.map(n => `<button class="picker-btn root-btn ${n === state.root ? 'active' : ''}" data-val="${n}">${n}</button>`).join('')}
          </div>
        </div>

        <div class="control-group scroll-x">
          <label>${t('type') || 'Type'}</label>
          <div class="picker">
            ${TRIAD_TYPES.map(type => `<button class="picker-btn type-btn ${type.name === state.type ? 'active' : ''}" data-val="${type.name}">${t(type.name.toLowerCase()) || type.name}</button>`).join('')}
          </div>
        </div>

        <div class="control-group scroll-x">
          <label>${t('strings') || 'Strings'}</label>
          <div class="picker">
            ${TRIAD_STRING_GROUPS.map((g, i) => `<button class="picker-btn string-btn ${i === state.stringGroup ? 'active' : ''}" data-val="${i}">${g.label}</button>`).join('')}
          </div>
        </div>

        <div class="control-group scroll-x">
          <label>${t('inversion') || 'Inversion'}</label>
          <div class="picker">
            ${INVERSIONS.map(inv => `<button class="picker-btn inv-btn ${inv === state.inversion ? 'active' : ''}" data-val="${inv}">${t(inv.toLowerCase().replace(' ', '_')) || inv}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="fretboard-wrap" id="triadsFretboard"></div>
      
      <div class="legend">
        <span class="legend-item"><span class="dot root-color"></span> Root</span>
        <span class="legend-item"><span class="dot third-color"></span> 3rd</span>
        <span class="legend-item"><span class="dot fifth-color"></span> 5th</span>
      </div>
    </div>
  `;

  fretboard = new Fretboard($('#triadsFretboard', app), {
    numFrets: 15,
    height: isLandscape() ? 280 : 200,
  });

  fretboard.onFretClick = (s, f) => {
    const note = getNoteAt(s, f);
    playNote(midiToFreq(note.midi));
  };

  const bindPicker = (selector, stateKey, parser = String) => {
    $$(selector, app).forEach(btn => {
      btn.addEventListener('click', () => {
        $$(selector, app).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state[stateKey] = parser(btn.dataset.val);
        updateDisplay();
      });
    });
  };

  bindPicker('.root-btn', 'root');
  bindPicker('.type-btn', 'type');
  bindPicker('.string-btn', 'stringGroup', parseInt);
  bindPicker('.inv-btn', 'inversion');

  $('#triadsBack', app).addEventListener('click', () => showScreen('home'));

  updateDisplay();

  function updateDisplay() {
    if (!fretboard) return;
    fretboard.clearHighlights();

    const rootIdx = NOTES.indexOf(state.root);
    const sg = TRIAD_STRING_GROUPS[state.stringGroup].strings;
    const voicings = getTriadPositions(rootIdx, state.type, sg, state.inversion, 15);

    voicings.forEach(voicing => {
      voicing.positions.forEach(p => {
        let color = '#00d4aa'; // fallback
        if (p.isRoot) color = '#ffd700';
        else if (p.intervalLabel.includes('3')) color = '#4dabf7'; // blue for 3rd
        else if (p.intervalLabel.includes('5')) color = '#69db7c'; // green for 5th
        
        fretboard.highlightWithLabel(p.string, p.fret, p.intervalLabel, color);
      });
    });
  }
}
