// c:\Users\z\.gemini\antigravity\fret-master\src\core\drums.js

let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

let noiseBuffer = null;
function getNoiseBuffer() {
  const ctx = getCtx();
  if (!noiseBuffer) {
    const bufferSize = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

export function playKick(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  oscGain.gain.setValueAtTime(1, t);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer();
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
  noiseSource.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.02);
}

export function playSnare(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t);
  oscGain.gain.setValueAtTime(0.5, t);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 3500;
  noiseFilter.Q.value = 1;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.1);
}

export function playHiHatClosed(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;
  
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 8000;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.03);
}

export function playHiHatOpen(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;
  
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 8000;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.8, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(t);
  noiseSource.stop(t + 0.2);
}

export function playRimshot(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, t);
  
  oscGain.gain.setValueAtTime(1, t);
  oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
  
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

export function playCowbell(time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;
  
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(560, t);
  osc2.frequency.setValueAtTime(845, t);
  
  gain.gain.setValueAtTime(0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + 0.15);
  osc2.stop(t + 0.15);
}

export function playClick(accent = false, time) {
  const ctx = getCtx();
  const t = time !== undefined ? time : ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 1200 : 800, t);
  osc.frequency.exponentialRampToValueAtTime(accent ? 600 : 400, t + 0.03);

  gain.gain.setValueAtTime(accent ? 0.3 : 0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}
