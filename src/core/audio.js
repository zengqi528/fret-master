// ─── Web Audio Engine ──────────────────────────────────────────
// Karplus-Strong string synthesis + UI sound effects

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Play a realistic plucked-string note using Karplus-Strong synthesis
 * @param {number} frequency - Note frequency in Hz
 * @param {number} duration - Duration in seconds
 */
export function playNote(frequency, duration = 1.8) {
  const ctx = getCtx();
  const sr = ctx.sampleRate;
  const bufLen = Math.round(sr / frequency);
  const totalSamples = Math.round(sr * duration);
  const buffer = ctx.createBuffer(1, totalSamples, sr);
  const data = buffer.getChannelData(0);

  // Seed with shaped noise burst (softer attack than pure white noise)
  const noise = new Float32Array(bufLen);
  for (let i = 0; i < bufLen; i++) {
    // Blend of random noise with a sine component for tonal warmth
    noise[i] = (Math.random() * 2 - 1) * 0.8 + Math.sin(2 * Math.PI * i / bufLen) * 0.2;
  }

  // Karplus-Strong with slight damping
  const decay = 0.997;
  for (let i = 0; i < totalSamples; i++) {
    if (i < bufLen) {
      data[i] = noise[i];
    } else {
      data[i] = (data[i - bufLen] + data[i - bufLen + 1]) * 0.5 * decay;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Gentle volume envelope
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.45, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
  return source;
}

/** Short ascending chime for correct answers */
export function playCorrect() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(880, now);
  osc2.frequency.setValueAtTime(1318.5, now); // E6
  osc2.frequency.setValueAtTime(1760, now + 0.08); // A6

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.25);
  osc2.stop(now + 0.25);
}

/** Low buzz for wrong answers */
export function playWrong() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.2);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

/** Unlock audio context on first user interaction */
export function unlockAudio() {
  getCtx();
}
