// ─── Circle of Fifths Screen ──────────────────────────────────
// Interactive SVG circle of fifths with key info and scale linkage

import { CIRCLE_OF_FIFTHS, NOTES, SCALES, resolveNoteName } from '../core/music.js';
import { midiToFreq } from '../core/music.js';
import { playNote } from '../core/audio.js';
import { t } from '../core/i18n.js';

let selectedIdx = 0; // C by default

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;

  app.innerHTML = `
    <div class="screen cof-screen">
      <div class="stats-header">
        <button class="back-btn" id="cofBack">←</button>
        <h2>Circle of Fifths</h2>
      </div>

      <div class="cof-container">
        <svg id="cofSvg" viewBox="0 0 400 400" class="cof-svg"></svg>
      </div>

      <div class="cof-info" id="cofInfo"></div>

      <div class="cof-actions">
        <button class="btn-secondary btn-sm" id="cofPlayScale">🎵 Play Scale</button>
        <button class="btn-secondary btn-sm" id="cofToScales">🎼 Open in Scale Explorer</button>
      </div>
    </div>
  `;

  drawCircle($('#cofSvg', app));
  updateInfo();

  $('#cofBack', app).addEventListener('click', () => showScreen('home'));

  $('#cofPlayScale', app).addEventListener('click', () => {
    const key = CIRCLE_OF_FIFTHS[selectedIdx];
    const rootIdx = NOTES.indexOf(key.note);
    const scale = SCALES['Major'];
    let delay = 0;
    scale.forEach(semi => {
      const midi = 60 + rootIdx + semi;
      setTimeout(() => playNote(midiToFreq(midi), 0.2), delay);
      delay += 200;
    });
    setTimeout(() => playNote(midiToFreq(60 + rootIdx + 12), 0.3), delay);
  });

  $('#cofToScales', app).addEventListener('click', () => {
    showScreen('scales');
  });

  function drawCircle(svg) {
    const cx = 200, cy = 200;
    const rOuter = 160, rInner = 105, rText = 135, rMinor = 80;

    let html = '';

    CIRCLE_OF_FIFTHS.forEach((key, i) => {
      const startAngle = (i - 0.5) * 30 - 90;
      const endAngle = (i + 0.5) * 30 - 90;
      const startRad = startAngle * Math.PI / 180;
      const endRad = endAngle * Math.PI / 180;

      const x1o = cx + rOuter * Math.cos(startRad);
      const y1o = cy + rOuter * Math.sin(startRad);
      const x2o = cx + rOuter * Math.cos(endRad);
      const y2o = cy + rOuter * Math.sin(endRad);
      const x1i = cx + rInner * Math.cos(startRad);
      const y1i = cy + rInner * Math.sin(startRad);
      const x2i = cx + rInner * Math.cos(endRad);
      const y2i = cy + rInner * Math.sin(endRad);

      const isSelected = i === selectedIdx;
      const fillColor = isSelected ? 'var(--accent)' : 'var(--bg-surface)';
      const textColor = isSelected ? '#fff' : 'var(--text-primary)';

      html += `<path class="cof-segment" data-idx="${i}"
        d="M${x1i},${y1i} L${x1o},${y1o} A${rOuter},${rOuter} 0 0,1 ${x2o},${y2o} L${x2i},${y2i} A${rInner},${rInner} 0 0,0 ${x1i},${y1i}"
        fill="${fillColor}" stroke="var(--border)" stroke-width="1" style="cursor:pointer"/>`;

      const angle = i * 30 - 90;
      const rad = angle * Math.PI / 180;
      const tx = cx + rText * Math.cos(rad);
      const ty = cy + rText * Math.sin(rad);
      html += `<text x="${tx}" y="${ty}" fill="${textColor}" text-anchor="middle" dominant-baseline="central"
        font-size="16" font-weight="700" style="pointer-events:none">${key.major}</text>`;

      const rInner2 = 55;
      const x1i2 = cx + rInner2 * Math.cos(startRad);
      const y1i2 = cy + rInner2 * Math.sin(startRad);
      const x2i2 = cx + rInner2 * Math.cos(endRad);
      const y2i2 = cy + rInner2 * Math.sin(endRad);

      const minorFill = isSelected ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.03)';
      html += `<path class="cof-segment" data-idx="${i}"
        d="M${x1i2},${y1i2} L${x1i},${y1i} A${rInner},${rInner} 0 0,1 ${x2i},${y2i} L${x2i2},${y2i2} A${rInner2},${rInner2} 0 0,0 ${x1i2},${y1i2}"
        fill="${minorFill}" stroke="var(--border)" stroke-width="0.5" style="cursor:pointer"/>`;

      const mx = cx + rMinor * Math.cos(rad);
      const my = cy + rMinor * Math.sin(rad);
      html += `<text x="${mx}" y="${my}" fill="var(--text-muted)" text-anchor="middle" dominant-baseline="central"
        font-size="11" style="pointer-events:none">${key.minor}</text>`;
    });

    html += `<circle cx="${cx}" cy="${cy}" r="50" fill="var(--bg-card)" stroke="var(--border)" stroke-width="1"/>`;
    html += `<text x="${cx}" y="${cy - 8}" fill="var(--text-primary)" text-anchor="middle" font-size="13" font-weight="600">Circle of</text>`;
    html += `<text x="${cx}" y="${cy + 12}" fill="var(--accent)" text-anchor="middle" font-size="14" font-weight="700">Fifths</text>`;

    svg.innerHTML = html;

    svg.querySelectorAll('.cof-segment').forEach(seg => {
      seg.addEventListener('click', () => {
        selectedIdx = parseInt(seg.dataset.idx);
        drawCircle(svg);
        updateInfo();
        const rootMidi = 60 + NOTES.indexOf(CIRCLE_OF_FIFTHS[selectedIdx].note);
        playNote(midiToFreq(rootMidi), 0.15);
      });
    });
  }

  function updateInfo() {
    const key = CIRCLE_OF_FIFTHS[selectedIdx];
    const rootIdx = NOTES.indexOf(key.note);
    // Use theory-correct note names per key context
    const scaleNotes = SCALES['Major'].map(s => resolveNoteName((rootIdx + s) % 12, 'sharp', key.major));
    const infoEl = $('#cofInfo', app);
    if (!infoEl) return;

    const sigText = key.sharps > 0
      ? `${key.sharps}♯`
      : key.flats > 0
        ? `${key.flats}♭`
        : 'No ♯/♭';

    infoEl.innerHTML = `
      <div class="cof-key-info">
        <div class="cof-key-name">${key.major} Major / ${key.minor}</div>
        <div class="cof-key-sig">${sigText}</div>
        <div class="cof-scale-notes">
          ${scaleNotes.map((n, i) => `<span class="cof-note ${i === 0 ? 'root' : ''}">${n}</span>`).join('')}
        </div>
      </div>
    `;
  }
}
