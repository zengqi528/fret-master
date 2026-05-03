// ─── Metronome Engine ──────────────────────────────────────────
// Precise Web Audio-based metronome with visual pulse callback

let audioCtx = null;
let timer = null;
let isRunning = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Play a single metronome click
 * @param {boolean} accent - true for downbeat (louder, higher pitch)
 */
function tick(accent = false) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 1200 : 800, now);
  osc.frequency.exponentialRampToValueAtTime(accent ? 600 : 400, now + 0.03);

  gain.gain.setValueAtTime(accent ? 0.3 : 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}

/**
 * Start the metronome
 * @param {number} bpm - Beats per minute (40-240)
 * @param {number} beatsPerMeasure - e.g. 4 for 4/4 time
 * @param {function} onBeat - callback(beatIndex, isAccent) for visual pulse
 */
export function start(bpm, beatsPerMeasure = 4, onBeat = null) {
  stop();
  isRunning = true;
  let beat = 0;
  const interval = 60000 / bpm;

  const doTick = () => {
    if (!isRunning) return;
    const accent = beat % beatsPerMeasure === 0;
    tick(accent);
    if (onBeat) onBeat(beat, accent);
    beat++;
    timer = setTimeout(doTick, interval);
  };

  doTick();
}

/** Stop the metronome */
export function stop() {
  isRunning = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

/** Check if metronome is running */
export function running() {
  return isRunning;
}
