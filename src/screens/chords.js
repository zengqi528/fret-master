// ─── Chord Explorer Screen ────────────────────────────────────
// Interactive chord library with fretboard display and strum

import { Fretboard } from '../core/fretboard.js';
import { getNoteAt, midiToFreq, CHORDS } from '../core/music.js';
import { playNote } from '../core/audio.js';

let fretboard = null;
let chordState = { selected: 'C' };

function isLandscape() {
  return window.matchMedia('(orientation: landscape)').matches
    && window.innerHeight < 500;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;
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

  fretboard = new Fretboard($('#chordFretboard', app), {
    numFrets: 12,
    height: isLandscape() ? 280 : 200,
  });
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
        fretboard.highlightWithLabel(s, f, note.name, f === 0 ? 'rgba(0,212,170,0.5)' : '#00d4aa');
      }
    });

    // Strum
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
}
