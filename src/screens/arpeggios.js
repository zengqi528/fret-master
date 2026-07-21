// ─── Arpeggio Explorer Screen ───────────────────────────────────
import { Fretboard } from '../core/fretboard.js';
import { NOTES, ARPEGGIO_TYPES, getArpeggioPositions, getNoteAt, midiToFreq } from '../core/music.js';
import { playNote } from '../core/audio.js';
import { t } from '../core/i18n.js';

let fretboard = null;
let state = {
  root: 'C',
  type: 'Maj7'
};

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;

  app.innerHTML = `
    <div class="screen arpeggios-screen">
      <div class="stats-header">
        <button class="back-btn" id="arpBack">←</button>
        <h2>${t('arpeggio_explorer') || 'Arpeggio Explorer'}</h2>
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
            ${ARPEGGIO_TYPES.map(type => `<button class="picker-btn type-btn ${type.short === state.type ? 'active' : ''}" data-val="${type.short}">${type.short}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="fretboard-wrap" id="arpFretboard"></div>
      
      <div class="legend" id="arpLegend"></div>
    </div>
  `;

  fretboard = new Fretboard($('#arpFretboard', app), {
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

  bindPicker('.root-btn', 'root');
  bindPicker('.type-btn', 'type');

  $('#arpBack', app).addEventListener('click', () => showScreen('home'));

  updateDisplay();

  function updateDisplay() {
    if (!fretboard) return;
    fretboard.clearHighlights();

    const rootIdx = NOTES.indexOf(state.root);
    const positions = getArpeggioPositions(rootIdx, state.type, 0, 15);

    // Color palette for intervals
    const getColor = (label) => {
      if (label === 'R') return '#ffd700'; // gold
      if (label.includes('3')) return '#4dabf7'; // blue
      if (label.includes('5')) return '#69db7c'; // green
      if (label.includes('7')) return '#da77f2'; // purple
      return '#00d4aa';
    };

    const uniqueLabels = new Set();

    positions.forEach(p => {
      const color = getColor(p.intervalLabel);
      uniqueLabels.add(p.intervalLabel);
      fretboard.highlightWithLabel(p.string, p.fret, p.intervalLabel, color);
    });

    const legendEl = $('#arpLegend', app);
    if (legendEl) {
      // Sort labels logically if possible, or just array from set
      const order = ['R', '3', '♭3', '5', '♭5', '#5', '7', '♭7', '𝄫7'];
      const sortedLabels = Array.from(uniqueLabels).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      
      legendEl.innerHTML = sortedLabels.map(l => `
        <span class="legend-item">
          <span class="dot" style="background: ${getColor(l)}"></span> ${l}
        </span>
      `).join('');
    }
  }
}
