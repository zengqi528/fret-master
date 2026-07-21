// c:\Users\z\.gemini\antigravity\fret-master\src\core\rhythm.js
import { playKick, playSnare, playHiHatClosed, playHiHatOpen, playClick, playRimshot, playCowbell } from './drums.js';

let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export const PATTERNS = {
  // --- Basic Patterns (keep these 6 exactly as-is) ---
  'basic_44': { category: 'basic', name: 'Basic 4/4', nameZh: '基础 4/4', timeSignature: [4, 4], stepsPerBeat: 1, steps: 4, kick: [1,0,0,0], snare: [0,0,0,0], hihat: [0,0,0,0], accent: [1,0,0,0], swing: 0 },
  'basic_34': { category: 'basic', name: 'Basic 3/4', nameZh: '基础 3/4', timeSignature: [3, 4], stepsPerBeat: 1, steps: 3, kick: [1,0,0], snare: [0,0,0], hihat: [0,0,0], accent: [1,0,0], swing: 0 },
  'basic_68': { category: 'basic', name: 'Basic 6/8', nameZh: '基础 6/8', timeSignature: [6, 8], stepsPerBeat: 1, steps: 6, kick: [1,0,0,0,0,0], snare: [0,0,0,0,0,0], hihat: [0,0,0,0,0,0], accent: [1,0,0,1,0,0], swing: 0 },
  '8th_notes': { category: 'basic', name: '8th Notes', nameZh: '八分音符', timeSignature: [4, 4], stepsPerBeat: 2, steps: 8, kick: [1,0,0,0,1,0,0,0], snare: [0,0,0,0,0,0,0,0], hihat: [0,1,0,1,0,1,0,1], accent: [1,0,0,0,0,0,0,0], swing: 0 },
  '16th_notes': { category: 'basic', name: '16th Notes', nameZh: '十六分音符', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'triplets': { category: 'basic', name: 'Triplets', nameZh: '三连音', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,1,0,0,1,0,0,1,0,0], swing: 0 },

  // --- Rock (7) ---
  'rock_basic': { category: 'genre', genre: 'Rock', name: 'Basic Rock', nameZh: '基础摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'rock_hard': { category: 'genre', genre: 'Rock', name: 'Hard Rock', nameZh: '硬摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], hihatOpen: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'rock_shuffle': { category: 'genre', genre: 'Rock', name: 'Shuffle Rock', nameZh: '摇摆摇滚', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,1,0,0,0,0,0,1,0,0], hihat: [1,0,1,1,0,1,1,0,1,1,0,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'rock_halftime': { category: 'genre', genre: 'Rock', name: 'Half-Time Rock', nameZh: '半拍摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'rock_driving': { category: 'genre', genre: 'Rock', name: 'Driving Rock', nameZh: '驱动摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'rock_arena': { category: 'genre', genre: 'Rock', name: 'Arena Rock', nameZh: '竞技场摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], hihatOpen: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'rock_punk': { category: 'genre', genre: 'Rock', name: 'Punk Rock', nameZh: '朋克摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },

  // --- Pop (4) ---
  'pop_basic': { category: 'genre', genre: 'Pop', name: 'Basic Pop', nameZh: '基础流行', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'pop_four': { category: 'genre', genre: 'Pop', name: 'Four-on-the-Floor', nameZh: '四四拍底鼓', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], hihatOpen: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'pop_syncopated': { category: 'genre', genre: 'Pop', name: 'Syncopated Pop', nameZh: '切分流行', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'pop_ballad': { category: 'genre', genre: 'Pop', name: 'Pop Ballad', nameZh: '流行民谣', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },

  // --- Blues (4) ---
  'blues_shuffle': { category: 'genre', genre: 'Blues', name: '12-Bar Shuffle', nameZh: '12小节摇摆', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,1,0,0,1,0,0,1,0,0], snare: [0,0,0,1,0,0,0,0,0,1,0,0], hihat: [1,0,1,1,0,1,1,0,1,1,0,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'blues_slow': { category: 'genre', genre: 'Blues', name: 'Slow Blues', nameZh: '慢布鲁斯', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,1,0,0,0,0,0,1,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'blues_chicago': { category: 'genre', genre: 'Blues', name: 'Chicago Blues', nameZh: '芝加哥布鲁斯', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,1,0,0,0,0,1,1,0,0], hihat: [1,0,1,1,0,1,1,0,1,1,0,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'blues_texas': { category: 'genre', genre: 'Blues', name: 'Texas Shuffle', nameZh: '德州摇摆', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,1,0,0,1,0,0,1,0,0], snare: [1,0,1,1,0,1,1,0,1,1,0,1], hihat: [1,0,1,1,0,1,1,0,1,1,0,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },

  // --- Funk (4) ---
  'funk_basic': { category: 'genre', genre: 'Funk', name: 'Basic Funk', nameZh: '基础放克', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0], snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'funk_jb': { category: 'genre', genre: 'Funk', name: 'Funky Drummer', nameZh: '放克鼓手', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0], snare: [0,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0], hihat: [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1], hihatOpen: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'funk_slap': { category: 'genre', genre: 'Funk', name: 'Slap Funk', nameZh: '贝斯放克', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'funk_pfunk': { category: 'genre', genre: 'Funk', name: 'P-Funk', nameZh: 'P-Funk', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0], hihatOpen: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },

  // --- Jazz (3) ---
  'jazz_swing': { category: 'genre', genre: 'Jazz', name: 'Jazz Swing', nameZh: '爵士摇摆', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,1,0,0,1,0,0,1,0,0], snare: [0,0,0,0,0,1,0,0,0,0,1,0], hihat: [0,0,0,1,0,0,0,0,0,1,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'jazz_bebop': { category: 'genre', genre: 'Jazz', name: 'Bebop', nameZh: '比波普', timeSignature: [4, 4], stepsPerBeat: 3, steps: 12, kick: [1,0,0,0,0,0,0,0,1,0,0,0], snare: [0,0,0,1,0,0,0,1,0,0,0,0], hihat: [0,0,0,1,0,0,0,0,0,1,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'jazz_waltz': { category: 'genre', genre: 'Jazz', name: 'Jazz Waltz', nameZh: '爵士华尔兹', timeSignature: [3, 4], stepsPerBeat: 3, steps: 9, kick: [1,0,0,0,0,0,0,0,0], snare: [0,0,0,0,0,1,1,0,0], hihat: [0,0,0,1,0,0,1,0,0], accent: [1,0,0,0,0,0,0,0,0], swing: 1 },

  // --- Latin (5) ---
  'latin_bossa': { category: 'genre', genre: 'Latin', name: 'Bossa Nova', nameZh: '波萨诺瓦', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [1,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'latin_samba': { category: 'genre', genre: 'Latin', name: 'Samba', nameZh: '桑巴', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], rimshot: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'latin_chacha': { category: 'genre', genre: 'Latin', name: 'Cha-Cha', nameZh: '恰恰', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'latin_salsa': { category: 'genre', genre: 'Latin', name: 'Salsa', nameZh: '萨尔萨', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0], rimshot: [1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'latin_rumba': { category: 'genre', genre: 'Latin', name: 'Afro-Cuban Rumba', nameZh: '古巴伦巴', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0], snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [1,0,0,1,0,0,0,1,0,0,1,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },

  // --- Metal (3) ---
  'metal_thrash': { category: 'genre', genre: 'Metal', name: 'Thrash', nameZh: '激流金属', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'metal_double': { category: 'genre', genre: 'Metal', name: 'Double Bass', nameZh: '双踩', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'metal_blast': { category: 'genre', genre: 'Metal', name: 'Blast Beat', nameZh: '爆裂节拍', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], snare: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },

  // --- Country (3) ---
  'country_train': { category: 'genre', genre: 'Country', name: 'Train Beat', nameZh: '火车节拍', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'country_rock': { category: 'genre', genre: 'Country', name: 'Country Rock', nameZh: '乡村摇滚', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'country_waltz': { category: 'genre', genre: 'Country', name: 'Country Waltz', nameZh: '乡村华尔兹', timeSignature: [3, 4], stepsPerBeat: 2, steps: 6, kick: [1,0,0,0,0,0], snare: [0,0,1,0,1,0], hihat: [1,0,1,0,1,0], accent: [1,0,0,0,0,0], swing: 0 },

  // --- Reggae (3) ---
  'reggae_onedrop': { category: 'genre', genre: 'Reggae', name: 'One Drop', nameZh: '单滴', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], hihatOpen: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], rimshot: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'reggae_rockers': { category: 'genre', genre: 'Reggae', name: 'Rockers', nameZh: '摇滚者', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], rimshot: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'reggae_steppers': { category: 'genre', genre: 'Reggae', name: 'Steppers', nameZh: '踏步者', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },

  // --- R&B/Hip-Hop (3) ---
  'hiphop_boombap': { category: 'genre', genre: 'R&B/Hip-Hop', name: 'Boom Bap', nameZh: 'Boom Bap', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },
  'hiphop_trap': { category: 'genre', genre: 'R&B/Hip-Hop', name: 'Trap', nameZh: '陷阱', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], hihatOpen: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'hiphop_neosoul': { category: 'genre', genre: 'R&B/Hip-Hop', name: 'Neo-Soul', nameZh: '新灵魂乐', timeSignature: [4, 4], stepsPerBeat: 4, steps: 16, kick: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], rimshot: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], swing: 1 },

  // --- 6/8 Patterns (3) ---
  'six8_ballad': { category: 'genre', genre: '6/8', name: '6/8 Ballad', nameZh: '6/8 民谣', timeSignature: [6, 8], stepsPerBeat: 1, steps: 6, kick: [1,0,0,1,0,0], snare: [0,0,0,1,0,0], hihat: [1,1,1,1,1,1], accent: [1,0,0,1,0,0], swing: 0 },
  'six8_afro': { category: 'genre', genre: '6/8', name: 'Afro 6/8', nameZh: '非洲 6/8', timeSignature: [6, 8], stepsPerBeat: 2, steps: 12, kick: [1,0,0,0,1,0,1,0,0,0,1,0], snare: [0,0,1,0,0,1,0,0,1,0,0,1], hihat: [1,0,1,0,1,1,0,1,0,1,1,0], accent: [1,0,0,0,0,0,0,0,0,0,0,0], swing: 0 },
  'six8_blues': { category: 'genre', genre: '6/8', name: '6/8 Blues', nameZh: '6/8 布鲁斯', timeSignature: [6, 8], stepsPerBeat: 1, steps: 6, kick: [1,0,0,0,0,0], snare: [0,0,0,1,0,0], hihat: [1,1,1,1,1,1], accent: [1,0,0,0,0,0], swing: 0 },

  // --- Odd Time (2) ---
  'odd_54': { category: 'genre', genre: 'Odd Time', name: '5/4 Groove', nameZh: '5/4 律动', timeSignature: [5, 4], stepsPerBeat: 2, steps: 10, kick: [1,0,0,0,1,0,0,0,0,0], snare: [0,0,1,0,0,0,1,0,0,0], hihat: [1,0,1,0,1,0,1,0,1,0], accent: [1,0,0,0,0,0,0,0,0,0], swing: 0 },
  'odd_78': { category: 'genre', genre: 'Odd Time', name: '7/8 Groove', nameZh: '7/8 律动', timeSignature: [7, 8], stepsPerBeat: 1, steps: 7, kick: [1,0,1,0,1,0,0], snare: [0,0,0,0,0,0,1], hihat: [1,1,1,1,1,1,1], rimshot: [0,1,0,1,0,0,0], accent: [1,0,0,0,0,0,0], swing: 0 }
};

export function getPatternsByCategory() {
  const result = { basic: [] };
  Object.keys(PATTERNS).forEach(id => {
    const p = { id, ...PATTERNS[id] };
    if (p.category === 'basic') {
      result.basic.push(p);
    } else {
      const g = p.genre || 'Other';
      if (!result[g]) result[g] = [];
      result[g].push(p);
    }
  });
  return result;
}

// Scheduler state
let isPlaying = false;
let currentBpm = 120;
let currentPatternId = 'basic_44';
let currentSwing = 0; // 0-66
let currentSoundType = 'kit'; // 'kit' | 'click' | 'hihat'

let currentStep = 0;
let nextNoteTime = 0;
let timerID = null;
const SCHEDULE_AHEAD = 0.1; // seconds
const LOOKAHEAD = 25; // ms

let callbacks = {
  onBeat: null,
  onBar: null
};

// Speed Trainer state
let trainerConfig = null;
let trainerLastBar = 0;
let trainerLastTime = 0;

// Count-in state
let isCountIn = false;
let countInStep = 0;
let countInBeats = 4; // changes based on time sig

// Tap tempo
let tapTimes = [];

function nextNote() {
  const pattern = PATTERNS[currentPatternId];
  const stepsPerBeat = pattern.stepsPerBeat;
  
  // Calculate seconds per step.
  const secondsPerBeat = 60.0 / currentBpm;
  let stepDuration = secondsPerBeat / stepsPerBeat;
  
  // Apply swing if 8th or 16th notes
  // Swing delays the even-numbered 8th notes (or 16th notes, depending on context).
  // For simplicity, we delay every even step relative to stepsPerBeat.
  // Actually, standard swing applies to 8th notes in 4/4.
  // Let's delay the 2nd half of the beat if stepsPerBeat == 2 or 4.
  if (currentSwing > 0 && (stepsPerBeat === 2 || stepsPerBeat === 4)) {
    const isEvenEighth = (Math.floor(currentStep / (stepsPerBeat / 2)) % 2) !== 0;
    // Delay percentage of the eighth note duration
    const eighthDur = secondsPerBeat / 2;
    const delay = eighthDur * (currentSwing / 100);
    
    // Adjust stepDuration to stretch first half, shrink second half
    if ((currentStep % (stepsPerBeat / 2)) === 0) {
        stepDuration += (delay / (stepsPerBeat / 2));
    } else {
        stepDuration -= (delay / (stepsPerBeat / 2));
    }
  }

  nextNoteTime += stepDuration;

  if (isCountIn) {
    countInStep++;
    if (countInStep >= countInBeats * stepsPerBeat) {
      isCountIn = false;
      currentStep = 0;
    }
  } else {
    currentStep++;
    if (currentStep >= pattern.steps) {
      currentStep = 0;
      handleTrainerBar();
    }
  }
}

function handleTrainerBar() {
  if (!trainerConfig) return;
  trainerLastBar++;
  
  let shouldIncrement = false;
  
  if (trainerConfig.barsPerStep && trainerConfig.barsPerStep > 0) {
    if (trainerLastBar >= trainerConfig.barsPerStep) {
      shouldIncrement = true;
      trainerLastBar = 0;
    }
  } else if (trainerConfig.secondsPerStep && trainerConfig.secondsPerStep > 0) {
    const now = Date.now();
    if (now - trainerLastTime >= trainerConfig.secondsPerStep * 1000) {
      shouldIncrement = true;
      trainerLastTime = now;
    }
  }
  
  if (shouldIncrement) {
    currentBpm += trainerConfig.increment;
    if (currentBpm >= trainerConfig.endBpm) {
      currentBpm = trainerConfig.endBpm;
      stopSpeedTrainer(); // stop trainer but keep running
    }
  }
}

function scheduleNote(stepNumber, time) {
  const pattern = PATTERNS[currentPatternId];
  
  if (isCountIn) {
    // Play a click on every beat during count in
    if (stepNumber % pattern.stepsPerBeat === 0) {
      const beatNum = stepNumber / pattern.stepsPerBeat;
      const accent = beatNum === 0; // Downbeat
      playClick(accent, time);
      
      // Dispatch beat event
      if (callbacks.onBeat) {
        requestAnimationFrame(() => callbacks.onBeat({ beat: beatNum, bar: -1, step: stepNumber, isAccent: accent, isCountIn: true }));
      }
    }
    return;
  }
  
  const p = pattern;
  const kick = p.kick && p.kick[stepNumber];
  const snare = p.snare && p.snare[stepNumber];
  const hihat = p.hihat && p.hihat[stepNumber];
  const rimshot = p.rimshot && p.rimshot[stepNumber];
  const cowbell = p.cowbell && p.cowbell[stepNumber];
  const accent = p.accent && p.accent[stepNumber];

  // Play Sounds
  if (currentSoundType === 'kit') {
    if (kick) playKick(time);
    if (snare) playSnare(time);
    if (hihat) playHiHatClosed(time);
    if (rimshot) playRimshot(time);
    if (cowbell) playCowbell(time);
  } else if (currentSoundType === 'click') {
    // Only play on beats or accents? 
    // To keep it simple, play click if there's any drum hit or if it's a beat
    if (stepNumber % pattern.stepsPerBeat === 0 || accent) {
       playClick(accent || stepNumber === 0, time);
    }
  } else if (currentSoundType === 'hihat') {
    if (stepNumber % pattern.stepsPerBeat === 0 || accent) {
      playHiHatClosed(time);
    }
  }
  
  // Dispatch callbacks on exact time (approximate via setTimeout)
  const timeUntilNote = time - getCtx().currentTime;
  setTimeout(() => {
    // Fire onBeat for visual pulse on beats
    if (stepNumber % pattern.stepsPerBeat === 0) {
      const beatNum = stepNumber / pattern.stepsPerBeat;
      if (callbacks.onBeat) {
        callbacks.onBeat({ beat: beatNum, bar: 0, step: stepNumber, isAccent: stepNumber === 0 });
      }
    }
    if (stepNumber === 0 && callbacks.onBar) {
      callbacks.onBar();
    }
  }, Math.max(0, timeUntilNote * 1000));
}

function scheduler() {
  const ctx = getCtx();
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD) {
    scheduleNote(isCountIn ? countInStep : currentStep, nextNoteTime);
    nextNote();
  }
}

export function start(patternId, bpm, options = {}) {
  stop();
  const ctx = getCtx();
  
  currentPatternId = patternId || 'basic_44';
  currentBpm = bpm || 120;
  
  currentSwing = options.swing || 0;
  currentSoundType = options.soundType || 'kit';
  isCountIn = !!options.countIn;
  
  callbacks.onBeat = options.onBeat || null;
  callbacks.onBar = options.onBar || null;

  const p = PATTERNS[currentPatternId];
  countInBeats = p.timeSignature[0];
  countInStep = 0;
  currentStep = 0;
  
  isPlaying = true;
  nextNoteTime = ctx.currentTime + 0.05; // tiny delay to prevent initial glitch
  
  timerID = setInterval(scheduler, LOOKAHEAD);
}

export function stop() {
  isPlaying = false;
  if (timerID) {
    clearInterval(timerID);
    timerID = null;
  }
}

export function isRunning() { return isPlaying; }
export function setBpm(bpm) { currentBpm = Math.max(40, Math.min(300, bpm)); }
export function setPattern(patternId) { if (PATTERNS[patternId]) currentPatternId = patternId; }
export function setSwing(percent) { currentSwing = Math.max(0, Math.min(66, percent)); }
export function setSoundType(type) { currentSoundType = type; }
export function getBpm() { return currentBpm; }

export function startSpeedTrainer(config) {
  trainerConfig = config;
  trainerLastBar = 0;
  trainerLastTime = Date.now();
}

export function stopSpeedTrainer() {
  trainerConfig = null;
}

export function tapTempo() {
  const now = Date.now();
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
    tapTimes = []; // reset if >2s between taps
  }
  tapTimes.push(now);
  if (tapTimes.length > 8) tapTimes.shift();
  
  if (tapTimes.length >= 2) {
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    let newBpm = Math.round(60000 / avg);
    newBpm = Math.max(40, Math.min(300, newBpm));
    currentBpm = newBpm;
    return newBpm;
  }
  return currentBpm;
}

export function getCurrentBeat() {
  return { step: currentStep };
}
