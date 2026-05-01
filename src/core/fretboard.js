// ─── SVG Fretboard Renderer ────────────────────────────────────
// Realistic guitar fretboard with wood texture, metal frets, and interactive hit areas

import { getNoteAt } from './music.js';

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

export class Fretboard {
  constructor(container, opts = {}) {
    this.container = container;
    this.numFrets = opts.numFrets || 12;

    // Layout constants
    this.W = 1200;
    this.H = 260;
    this.pad = { l: 55, r: 20, t: 28, b: 28 };
    this.nutW = 6;
    this.boardW = this.W - this.pad.l - this.pad.r;
    this.boardH = this.H - this.pad.t - this.pad.b;
    this.strSpacing = this.boardH / 5; // 6 strings → 5 gaps

    this.fretX = this._calcFretX();
    this.onFretClick = null; // callback(stringIdx, fret)

    this._highlights = [];
    this._build();
  }

  /* ── fret positions: blend of real scale + linear for playability ── */
  _calcFretX() {
    const pos = [0];
    for (let f = 1; f <= this.numFrets; f++) {
      const real = this.boardW * (1 - 1 / Math.pow(2, f / 12));
      const lin = (f / this.numFrets) * this.boardW;
      pos.push(real * 0.6 + lin * 0.4);
    }
    return pos;
  }

  /* ── absolute X/Y for a string/fret intersection ── */
  posX(fret) {
    if (fret === 0) return this.pad.l;
    const left = this.pad.l + this.nutW + this.fretX[fret - 1];
    const right = this.pad.l + this.nutW + this.fretX[fret];
    return (left + right) / 2;
  }
  posY(stringIdx) {
    // stringIdx 0 = low E (bottom), 5 = high E (top)
    return this.pad.t + (5 - stringIdx) * this.strSpacing;
  }

  /* ── build entire SVG ── */
  _build() {
    this.container.innerHTML = '';
    const svg = el('svg', {
      viewBox: `0 0 ${this.W} ${this.H}`,
      class: 'fretboard-svg',
      preserveAspectRatio: 'xMidYMid meet',
    });
    this.svg = svg;

    this._defs(svg);
    this._board(svg);
    this._nut(svg);
    this._frets(svg);
    this._inlays(svg);
    this._strings(svg);
    this._hitAreas(svg);

    // Highlight layer on top
    this.hlGroup = el('g', { class: 'hl-layer' });
    svg.appendChild(this.hlGroup);

    this.container.appendChild(svg);
  }

  /* ── SVG defs: gradients & filters ── */
  _defs(svg) {
    const defs = el('defs');

    // Wood gradient
    const wood = el('linearGradient', { id: 'wood', x1: '0', y1: '0', x2: '0', y2: '1' });
    [
      [0, '#4a3728'], [0.3, '#3d2e1f'], [0.5, '#352818'],
      [0.7, '#3a2c1c'], [1, '#2e2214'],
    ].forEach(([o, c]) => {
      const s = el('stop', { offset: o, 'stop-color': c });
      wood.appendChild(s);
    });
    defs.appendChild(wood);

    // Fret wire gradient (metallic)
    const fretG = el('linearGradient', { id: 'fretMetal', x1: '0', y1: '0', x2: '1', y2: '0' });
    [
      [0, '#999'], [0.3, '#ddd'], [0.5, '#fff'], [0.7, '#ddd'], [1, '#999'],
    ].forEach(([o, c]) => {
      const s = el('stop', { offset: o, 'stop-color': c });
      fretG.appendChild(s);
    });
    defs.appendChild(fretG);

    // Glow filter for highlights
    const glow = el('filter', { id: 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    const blur = el('feGaussianBlur', { stdDeviation: '3', result: 'blur' });
    const merge = el('feMerge');
    const m1 = el('feMergeNode', { in: 'blur' });
    const m2 = el('feMergeNode', { in: 'SourceGraphic' });
    merge.appendChild(m1);
    merge.appendChild(m2);
    glow.appendChild(blur);
    glow.appendChild(merge);
    defs.appendChild(glow);

    svg.appendChild(defs);
  }

  /* ── fretboard body ── */
  _board(svg) {
    // Main board
    svg.appendChild(el('rect', {
      x: this.pad.l, y: this.pad.t,
      width: this.boardW + this.nutW, height: this.boardH,
      rx: 3, fill: 'url(#wood)',
    }));
    // Subtle wood grain lines
    for (let i = 0; i < 15; i++) {
      const y = this.pad.t + Math.random() * this.boardH;
      svg.appendChild(el('line', {
        x1: this.pad.l, y1: y,
        x2: this.pad.l + this.boardW + this.nutW, y2: y + (Math.random() - 0.5) * 8,
        stroke: 'rgba(0,0,0,0.08)', 'stroke-width': 0.5 + Math.random(),
      }));
    }
  }

  /* ── nut (bone white bar at fret 0) ── */
  _nut(svg) {
    svg.appendChild(el('rect', {
      x: this.pad.l, y: this.pad.t,
      width: this.nutW, height: this.boardH,
      fill: '#e8dcc8', rx: 1,
    }));
    // Shadow
    svg.appendChild(el('rect', {
      x: this.pad.l + this.nutW, y: this.pad.t,
      width: 2, height: this.boardH,
      fill: 'rgba(0,0,0,0.3)',
    }));
  }

  /* ── fret wires ── */
  _frets(svg) {
    for (let f = 1; f <= this.numFrets; f++) {
      const x = this.pad.l + this.nutW + this.fretX[f];
      svg.appendChild(el('rect', {
        x: x - 1.5, y: this.pad.t - 1,
        width: 3, height: this.boardH + 2,
        fill: 'url(#fretMetal)', rx: 0.5,
      }));
    }
  }

  /* ── inlay dots (no numbers, like a real guitar) ── */
  _inlays(svg) {
    const singleDots = [3, 5, 7, 9];
    const doubleDot = 12;
    const cy = this.pad.t + this.boardH / 2;

    singleDots.forEach(f => {
      if (f > this.numFrets) return;
      const cx = this._fretCenterX(f);
      svg.appendChild(el('circle', {
        cx, cy, r: 5,
        fill: '#c8b89a', opacity: 0.6,
      }));
    });

    if (this.numFrets >= doubleDot) {
      const cx = this._fretCenterX(doubleDot);
      const off = this.boardH * 0.22;
      svg.appendChild(el('circle', { cx, cy: cy - off, r: 4.5, fill: '#c8b89a', opacity: 0.6 }));
      svg.appendChild(el('circle', { cx, cy: cy + off, r: 4.5, fill: '#c8b89a', opacity: 0.6 }));
    }
  }

  _fretCenterX(fret) {
    const left = this.pad.l + this.nutW + (fret > 1 ? this.fretX[fret - 1] : 0);
    const right = this.pad.l + this.nutW + this.fretX[fret];
    return (left + right) / 2;
  }

  /* ── strings (varying thickness) ── */
  _strings(svg) {
    const widths = [2.8, 2.2, 1.7, 1.2, 0.9, 0.7]; // string 6→1
    const colors = [
      '#a08860', '#b09870', '#c0a878', '#c8b080', '#d0b888', '#d8c090',
    ];

    for (let s = 0; s < 6; s++) {
      const y = this.posY(s);
      // String shadow
      svg.appendChild(el('line', {
        x1: this.pad.l, y1: y + 1,
        x2: this.pad.l + this.boardW + this.nutW, y2: y + 1,
        stroke: 'rgba(0,0,0,0.3)', 'stroke-width': widths[s] + 1,
      }));
      // String
      svg.appendChild(el('line', {
        x1: this.pad.l, y1: y,
        x2: this.pad.l + this.boardW + this.nutW, y2: y,
        stroke: colors[s], 'stroke-width': widths[s],
        class: `string string-${s}`,
      }));
    }
  }

  /* ── invisible interactive hit areas ── */
  _hitAreas(svg) {
    const g = el('g', { class: 'hit-areas' });

    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= this.numFrets; f++) {
        const cx = this.posX(f);
        const cy = this.posY(s);
        const hitR = Math.min(this.strSpacing * 0.45, 20);

        const circle = el('circle', {
          cx, cy, r: hitR,
          fill: 'transparent',
          class: 'hit-area',
          'data-string': s,
          'data-fret': f,
          cursor: 'pointer',
        });

        circle.addEventListener('click', () => {
          if (this.onFretClick) this.onFretClick(s, f);
        });
        circle.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (this.onFretClick) this.onFretClick(s, f);
        }, { passive: false });

        g.appendChild(circle);
      }
    }
    svg.appendChild(g);
  }

  /* ── Public: show a highlight circle at a position ── */
  highlight(stringIdx, fret, color = '#00d4aa', pulse = false) {
    const cx = this.posX(fret);
    const cy = this.posY(stringIdx);

    const g = el('g', { class: `hl-dot${pulse ? ' pulse' : ''}` });
    // Glow background
    g.appendChild(el('circle', {
      cx, cy, r: 14,
      fill: color, opacity: 0.3, filter: 'url(#glow)',
    }));
    // Solid dot
    g.appendChild(el('circle', {
      cx, cy, r: 10,
      fill: color, opacity: 0.9,
    }));

    this.hlGroup.appendChild(g);
    this._highlights.push(g);
    return g;
  }

  /* ── highlight with note name label ── */
  highlightWithLabel(stringIdx, fret, label, color = '#00d4aa', pulse = false) {
    const cx = this.posX(fret);
    const cy = this.posY(stringIdx);

    const g = el('g', { class: `hl-dot${pulse ? ' pulse' : ''}` });
    g.appendChild(el('circle', {
      cx, cy, r: 14,
      fill: color, opacity: 0.25, filter: 'url(#glow)',
    }));
    g.appendChild(el('circle', {
      cx, cy, r: 11,
      fill: color, opacity: 0.9,
    }));

    const txt = el('text', {
      x: cx, y: cy + 1,
      fill: '#fff',
      'font-size': '10',
      'font-family': 'JetBrains Mono, monospace',
      'font-weight': '700',
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'pointer-events': 'none',
    });
    txt.textContent = label;
    g.appendChild(txt);

    this.hlGroup.appendChild(g);
    this._highlights.push(g);
    return g;
  }

  /* ── show correct feedback at position ── */
  showCorrect(stringIdx, fret) {
    const dot = this.highlightWithLabel(stringIdx, fret, '✓', '#00e676');
    dot.classList.add('pop-in');
    setTimeout(() => dot.classList.add('fade-out'), 400);
    setTimeout(() => dot.remove(), 700);
  }

  /* ── show wrong feedback at position ── */
  showWrong(stringIdx, fret) {
    const dot = this.highlightWithLabel(stringIdx, fret, '✗', '#ff5252');
    dot.classList.add('shake');
    setTimeout(() => dot.classList.add('fade-out'), 500);
    setTimeout(() => dot.remove(), 800);
  }

  /* ── show all correct positions for a note ── */
  showAllPositions(noteName, minFret = 0, maxFret = 12) {
    const positions = [];
    for (let s = 0; s < 6; s++) {
      for (let f = minFret; f <= maxFret; f++) {
        const note = getNoteAt(s, f);
        if (note.name === noteName) {
          positions.push(
            this.highlightWithLabel(s, f, noteName, 'rgba(0,212,170,0.7)')
          );
        }
      }
    }
    return positions;
  }

  /* ── clear all highlights ── */
  clearHighlights() {
    this._highlights.forEach(h => h.remove());
    this._highlights = [];
  }

  /* ── disable/enable interaction ── */
  setInteractive(enabled) {
    const areas = this.svg.querySelectorAll('.hit-area');
    areas.forEach(a => {
      a.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }
}
