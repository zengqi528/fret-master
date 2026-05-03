// ─── Music Theory Engine ───────────────────────────────────────
// Standard guitar tuning, note data, frequency calculation

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard tuning: string index 0 = 6th string (low E), index 5 = 1st string (high E)
export const STANDARD_TUNING = [
  { string: 6, name: 'E', midi: 40 },  // Low E
  { string: 5, name: 'A', midi: 45 },
  { string: 4, name: 'D', midi: 50 },
  { string: 3, name: 'G', midi: 55 },
  { string: 2, name: 'B', midi: 59 },
  { string: 1, name: 'E', midi: 64 },  // High E
];

/**
 * Get the note at a specific string/fret position
 * @param {number} stringIdx - 0-5 (0=low E, 5=high E)
 * @param {number} fret - 0-24
 */
export function getNoteAt(stringIdx, fret) {
  const open = STANDARD_TUNING[stringIdx];
  const midi = open.midi + fret;
  return {
    name: NOTES[midi % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    string: stringIdx,
    fret,
  };
}

/** Convert MIDI note number to frequency (Hz) */
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Find all fretboard positions for a given note name
 * @param {string} noteName - e.g. 'A', 'C#'
 * @param {number} minFret
 * @param {number} maxFret
 */
export function findNotePositions(noteName, minFret = 0, maxFret = 12) {
  const positions = [];
  for (let s = 0; s < 6; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const note = getNoteAt(s, f);
      if (note.name === noteName) {
        positions.push(note);
      }
    }
  }
  return positions;
}

/** Get a random note within the given fret range */
export function getRandomPosition(minFret = 0, maxFret = 12) {
  const s = Math.floor(Math.random() * 6);
  const f = minFret + Math.floor(Math.random() * (maxFret - minFret + 1));
  return getNoteAt(s, f);
}

/**
 * Get a random note, optionally constrained to a specific string.
 * @param {number} minFret
 * @param {number} maxFret
 * @param {number|null} stringFilter - 0-5 to limit to one string, null = any string
 */
export function getRandomPositionFiltered(minFret = 0, maxFret = 12, stringFilter = null) {
  const s = stringFilter !== null ? stringFilter : Math.floor(Math.random() * 6);
  const f = minFret + Math.floor(Math.random() * (maxFret - minFret + 1));
  return getNoteAt(s, f);
}

/** Get a random note name from the 12 chromatic notes */
export function getRandomNoteName() {
  return NOTES[Math.floor(Math.random() * 12)];
}

/** Generate N wrong note names (excluding the correct one) */
export function getWrongNotes(correctName, count = 3) {
  const pool = NOTES.filter(n => n !== correctName);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* ─── Scales ────────────────────────────────────────────────── */

/** Scale definitions: name → array of semitone intervals from root */
export const SCALES = {
  'Major':              [0, 2, 4, 5, 7, 9, 11],
  'Natural Minor':      [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major':   [0, 2, 4, 7, 9],
  'Pentatonic Minor':   [0, 3, 5, 7, 10],
  'Blues':              [0, 3, 5, 6, 7, 10],
  'Dorian':            [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian':        [0, 2, 4, 5, 7, 9, 10],
  'Harmonic Minor':    [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor':     [0, 2, 3, 5, 7, 9, 11],
  'Chromatic':         [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

/** Interval labels for each semitone distance from root */
export const INTERVAL_LABELS = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];

/**
 * Get all fretboard positions belonging to a scale
 * @param {string} rootName - e.g. 'C', 'G#'
 * @param {string} scaleName - key from SCALES
 * @param {number} minFret
 * @param {number} maxFret
 * @returns {{ string, fret, name, midi, interval, intervalLabel }[]}
 */
export function getScalePositions(rootName, scaleName, minFret = 0, maxFret = 12) {
  const scale = SCALES[scaleName];
  if (!scale) return [];
  const rootIdx = NOTES.indexOf(rootName);
  if (rootIdx < 0) return [];

  const scaleNoteIndices = scale.map(s => (rootIdx + s) % 12);
  const positions = [];

  for (let s = 0; s < 6; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const note = getNoteAt(s, f);
      const noteIdx = NOTES.indexOf(note.name);
      const scalePos = scaleNoteIndices.indexOf(noteIdx);
      if (scalePos >= 0) {
        positions.push({
          ...note,
          interval: scale[scalePos],
          intervalLabel: INTERVAL_LABELS[scale[scalePos]],
          isRoot: scalePos === 0,
        });
      }
    }
  }
  return positions;
}

/* ─── Intervals ─────────────────────────────────────────────── */

export const INTERVALS = [
  { semitones: 1,  short: 'm2',  name: 'Minor 2nd',   example: 'Jaws Theme' },
  { semitones: 2,  short: 'M2',  name: 'Major 2nd',   example: 'Happy Birthday' },
  { semitones: 3,  short: 'm3',  name: 'Minor 3rd',   example: 'Greensleeves' },
  { semitones: 4,  short: 'M3',  name: 'Major 3rd',   example: 'When the Saints' },
  { semitones: 5,  short: 'P4',  name: 'Perfect 4th',  example: 'Here Comes the Bride' },
  { semitones: 6,  short: 'TT',  name: 'Tritone',      example: 'The Simpsons' },
  { semitones: 7,  short: 'P5',  name: 'Perfect 5th',  example: 'Star Wars' },
  { semitones: 8,  short: 'm6',  name: 'Minor 6th',    example: 'The Entertainer' },
  { semitones: 9,  short: 'M6',  name: 'Major 6th',    example: 'My Bonnie' },
  { semitones: 10, short: 'm7',  name: 'Minor 7th',    example: 'Somewhere (West Side)' },
  { semitones: 11, short: 'M7',  name: 'Major 7th',    example: 'Take On Me' },
  { semitones: 12, short: 'P8',  name: 'Octave',       example: 'Somewhere Over the Rainbow' },
];

/* ─── Chords ────────────────────────────────────────────────── */

/** Common guitar chord voicings.
 *  frets[i] = fret number for string i (0=low E, 5=high E), -1 = muted */
export const CHORDS = [
  // Open major chords
  { name: 'C',     category: 'Major',  frets: [-1, 3, 2, 0, 1, 0] },
  { name: 'D',     category: 'Major',  frets: [-1, -1, 0, 2, 3, 2] },
  { name: 'E',     category: 'Major',  frets: [0, 2, 2, 1, 0, 0] },
  { name: 'F',     category: 'Major',  frets: [1, 3, 3, 2, 1, 1] },
  { name: 'G',     category: 'Major',  frets: [3, 2, 0, 0, 0, 3] },
  { name: 'A',     category: 'Major',  frets: [-1, 0, 2, 2, 2, 0] },

  // Minor chords
  { name: 'Am',    category: 'Minor',  frets: [-1, 0, 2, 2, 1, 0] },
  { name: 'Dm',    category: 'Minor',  frets: [-1, -1, 0, 2, 3, 1] },
  { name: 'Em',    category: 'Minor',  frets: [0, 2, 2, 0, 0, 0] },
  { name: 'Bm',    category: 'Minor',  frets: [-1, 2, 4, 4, 3, 2] },

  // 7th chords
  { name: 'A7',    category: '7th',    frets: [-1, 0, 2, 0, 2, 0] },
  { name: 'B7',    category: '7th',    frets: [-1, 2, 1, 2, 0, 2] },
  { name: 'C7',    category: '7th',    frets: [-1, 3, 2, 3, 1, 0] },
  { name: 'D7',    category: '7th',    frets: [-1, -1, 0, 2, 1, 2] },
  { name: 'E7',    category: '7th',    frets: [0, 2, 0, 1, 0, 0] },
  { name: 'G7',    category: '7th',    frets: [3, 2, 0, 0, 0, 1] },

  // Extended / other
  { name: 'Am7',   category: 'Other',  frets: [-1, 0, 2, 0, 1, 0] },
  { name: 'Cmaj7', category: 'Other',  frets: [-1, 3, 2, 0, 0, 0] },
  { name: 'Dsus2', category: 'Other',  frets: [-1, -1, 0, 2, 3, 0] },
  { name: 'Asus4', category: 'Other',  frets: [-1, 0, 2, 2, 3, 0] },
];
