// ─── SVG Fretboard Renderer ────────────────────────────────────
// Realistic guitar fretboard — true-to-life proportions

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

    // Layout — wider aspect ratio like a real fretboard
    // Height is configurable: taller = more string spacing (better for touch)
    this.W = 1400;
    this.H = opts.height || 200;
    const vPad = Math.round(this.H * 0.09);
    this.pad = { l: 10, r: 16, t: vPad, b: vPad };
    this.nutW = 8;

    this.boardW = this.W - this.pad.l - this.pad.r - this.nutW;
    this.boardH = this.H - this.pad.t - this.pad.b;

    // Real guitar fret positions: each fret at L*(1 - 1/2^(n/12))
    // Use 85% real + 15% linear blend so high frets stay usable on screen
    this.fretX = this._calcFretX();

    // String Y positions — slight variation like a real guitar
    // Low E (string 0) at bottom, high e (string 5) at top
    this.stringY = this._calcStringY();

    this.onFretClick = null;
    this._highlights = [];
    this._build();
  }

  /* ── Fret positions: mostly real proportions ── */
  _calcFretX() {
    const pos = [0];
    for (let f = 1; f <= this.numFrets; f++) {
      // True guitar fret position
      const real = this.boardW * (1 - 1 / Math.pow(2, f / 12));
      // Small linear blend to keep high frets tappable
      const lin = (f / this.numFrets) * this.boardW;
      pos.push(real * 0.85 + lin * 0.15);
    }
    return pos;
  }

  /* ── String Y positions ── */
  _calcStringY() {
    const ys = [];
    // Strings 0-5 (low E to high e)
    // Real guitar: strings are roughly evenly spaced at the saddle
    // but the outer strings have a bit more edge margin
    const usableH = this.boardH - 16; // edge margin top+bottom
    const topEdge = this.pad.t + 8;
    for (let s = 0; s < 6; s++) {
      // stringIdx 0 = low E (bottom), 5 = high e (top)
      ys.push(topEdge + usableH - (s / 5) * usableH);
    }
    return ys;
  }

  /* ── X/Y for a string/fret ── */
  posX(fret) {
    const nutEnd = this.pad.l + this.nutW;
    if (fret === 0) return this.pad.l + this.nutW * 0.5;
    const left = nutEnd + (fret > 1 ? this.fretX[fret - 1] : 0);
    const right = nutEnd + this.fretX[fret];
    return (left + right) / 2;
  }

  posY(stringIdx) {
    return this.stringY[stringIdx];
  }

  /* ── Build entire SVG ── */
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

    // Dim mask layer — used by setViewRange to fade out-of-range zones
    this.dimGroup = el('g', { class: 'dim-layer' });
    svg.appendChild(this.dimGroup);

    this.hlGroup = el('g', { class: 'hl-layer' });
    svg.appendChild(this.hlGroup);

    this.container.appendChild(svg);
  }

  /* ── Defs: gradients & filters ── */
  _defs(svg) {
    const defs = el('defs');

    // Rosewood fretboard gradient
    const wood = el('linearGradient', { id: 'fb-wood', x1: '0', y1: '0', x2: '0', y2: '1' });
    [
      [0, '#3a2518'], [0.15, '#2e1d12'], [0.35, '#2a1910'],
      [0.5, '#2d1c12'], [0.65, '#281710'], [0.85, '#2e1d12'], [1, '#3a2518'],
    ].forEach(([o, c]) => {
      wood.appendChild(el('stop', { offset: o, 'stop-color': c }));
    });
    defs.appendChild(wood);

    // Fret wire metallic gradient
    const fretG = el('linearGradient', { id: 'fb-fretMetal', x1: '0', y1: '0', x2: '1', y2: '0' });
    [
      [0, '#888'], [0.2, '#bbb'], [0.45, '#e8e8e8'],
      [0.55, '#fff'], [0.8, '#ccc'], [1, '#888'],
    ].forEach(([o, c]) => {
      fretG.appendChild(el('stop', { offset: o, 'stop-color': c }));
    });
    defs.appendChild(fretG);

    // Glow filter
    const glow = el('filter', { id: 'fb-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    const blur = el('feGaussianBlur', { stdDeviation: '3', result: 'blur' });
    const merge = el('feMerge');
    merge.appendChild(el('feMergeNode', { in: 'blur' }));
    merge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
    glow.appendChild(blur);
    glow.appendChild(merge);
    defs.appendChild(glow);

    svg.appendChild(defs);
  }

  /* ── Fretboard body ── */
  _board(svg) {
    const x = this.pad.l;
    const y = this.pad.t;
    const w = this.boardW + this.nutW;
    const h = this.boardH;

    // Main rosewood board
    svg.appendChild(el('rect', {
      x, y, width: w, height: h,
      rx: 2, fill: 'url(#fb-wood)',
    }));

    // Wood grain — subtle horizontal lines
    for (let i = 0; i < 20; i++) {
      const gy = y + 4 + Math.random() * (h - 8);
      const opacity = 0.03 + Math.random() * 0.06;
      svg.appendChild(el('line', {
        x1: x, y1: gy,
        x2: x + w, y2: gy + (Math.random() - 0.5) * 4,
        stroke: '#000', 'stroke-width': 0.3 + Math.random() * 0.8,
        opacity,
      }));
    }

    // Slight edge shadow at top and bottom
    svg.appendChild(el('rect', {
      x, y, width: w, height: 3,
      fill: 'rgba(0,0,0,0.15)',
    }));
    svg.appendChild(el('rect', {
      x, y: y + h - 3, width: w, height: 3,
      fill: 'rgba(0,0,0,0.15)',
    }));
  }

  /* ── Nut (bone/ivory bar at fret 0) ── */
  _nut(svg) {
    const x = this.pad.l;
    const y = this.pad.t;
    const h = this.boardH;

    // Main nut
    svg.appendChild(el('rect', {
      x, y, width: this.nutW, height: h,
      fill: '#e8dcc4', rx: 1,
    }));
    // Nut highlight (left edge glint)
    svg.appendChild(el('rect', {
      x, y, width: 1.5, height: h,
      fill: 'rgba(255,255,255,0.3)',
    }));
    // Shadow right of nut
    svg.appendChild(el('rect', {
      x: x + this.nutW, y, width: 3, height: h,
      fill: 'rgba(0,0,0,0.25)',
    }));
  }

  /* ── Fret wires ── */
  _frets(svg) {
    for (let f = 1; f <= this.numFrets; f++) {
      const x = this.pad.l + this.nutW + this.fretX[f];
      // Fret crown width: slightly narrower toward body (realistic)
      const w = 2.5;
      svg.appendChild(el('rect', {
        x: x - w / 2, y: this.pad.t - 1,
        width: w, height: this.boardH + 2,
        fill: 'url(#fb-fretMetal)', rx: 0.5,
      }));
    }
  }

  /* ── Inlay dots — ONLY dots, no numbers ── */
  _inlays(svg) {
    const singles = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubles = [12, 24];
    const midY = this.pad.t + this.boardH / 2;
    const dotR = 4;
    const dotColor = '#c8b898';
    const dotOpacity = 0.55;

    singles.forEach(f => {
      if (f > this.numFrets) return;
      const cx = this._fretCenterX(f);
      svg.appendChild(el('circle', {
        cx, cy: midY, r: dotR,
        fill: dotColor, opacity: dotOpacity,
      }));
    });

    doubles.forEach(f => {
      if (f > this.numFrets) return;
      const cx = this._fretCenterX(f);
      const offset = this.boardH * 0.24;
      svg.appendChild(el('circle', {
        cx, cy: midY - offset, r: dotR,
        fill: dotColor, opacity: dotOpacity,
      }));
      svg.appendChild(el('circle', {
        cx, cy: midY + offset, r: dotR,
        fill: dotColor, opacity: dotOpacity,
      }));
    });
  }

  _fretCenterX(fret) {
    const nutEnd = this.pad.l + this.nutW;
    const left = nutEnd + (fret > 1 ? this.fretX[fret - 1] : 0);
    const right = nutEnd + this.fretX[fret];
    return (left + right) / 2;
  }

  /* ── Strings — realistic gauge differences ── */
  _strings(svg) {
    // Real string gauges (relative): .046 .036 .026 .017 .013 .010
    // Mapped to visual widths
    const gauges = [3.2, 2.5, 1.8, 1.1, 0.85, 0.65];
    // Wound strings (0-2) are brass/bronze, plain (3-5) are steel
    const woundColor = '#a09070';
    const plainColor = '#c8c0b0';

    for (let s = 0; s < 6; s++) {
      const y = this.stringY[s];
      const isWound = s < 3;
      const color = isWound ? woundColor : plainColor;
      const w = gauges[s];

      // String shadow
      svg.appendChild(el('line', {
        x1: this.pad.l, y1: y + 1,
        x2: this.pad.l + this.nutW + this.boardW, y2: y + 1,
        stroke: 'rgba(0,0,0,0.35)', 'stroke-width': w + 0.5,
      }));

      // Main string
      svg.appendChild(el('line', {
        x1: this.pad.l, y1: y,
        x2: this.pad.l + this.nutW + this.boardW, y2: y,
        stroke: color, 'stroke-width': w,
        class: `string string-${s}`,
      }));

      // Wound string texture (subtle dashes for wound strings)
      if (isWound && w > 1.5) {
        svg.appendChild(el('line', {
          x1: this.pad.l + this.nutW, y1: y - w * 0.15,
          x2: this.pad.l + this.nutW + this.boardW, y2: y - w * 0.15,
          stroke: 'rgba(255,255,255,0.08)', 'stroke-width': w * 0.3,
          'stroke-dasharray': '1 2',
        }));
      }
    }
  }

  /* ── Invisible interactive hit areas ── */
  _hitAreas(svg) {
    const g = el('g', { class: 'hit-areas' });

    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= this.numFrets; f++) {
        const cx = this.posX(f);
        const cy = this.posY(s);
        // Hit target size — large enough for finger taps
        const hitR = Math.min((this.boardH / 5) * 0.44, 16);

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

  /* ── Focus viewBox on a fret range ── */
  setViewRange(minFret, maxFret) {
    // Clear previous dim masks
    this.dimGroup.innerHTML = '';

    const nutEnd = this.pad.l + this.nutW;
    const fullRange = (minFret === 0 && maxFret >= this.numFrets);

    if (fullRange) {
      // Reset to full view
      this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
      return;
    }

    // Calculate X boundaries for the visible range
    let xLeft;
    if (minFret === 0) {
      xLeft = 0;
    } else {
      xLeft = nutEnd + (this.fretX[minFret - 1] || 0) - 8;
    }

    let xRight;
    if (maxFret >= this.numFrets) {
      xRight = this.W;
    } else {
      xRight = nutEnd + this.fretX[maxFret] + 8;
    }

    // Add padding
    xLeft = Math.max(0, xLeft - 4);
    xRight = Math.min(this.W, xRight + 4);

    const vbW = xRight - xLeft;
    this.svg.setAttribute('viewBox', `${xLeft} 0 ${vbW} ${this.H}`);

    // Dim mask: darken areas outside the range
    if (minFret > 0) {
      const dimRight = nutEnd + (this.fretX[minFret - 1] || 0);
      this.dimGroup.appendChild(el('rect', {
        x: 0, y: 0, width: dimRight, height: this.H,
        fill: 'rgba(0, 0, 0, 0.55)',
        class: 'range-dim',
        'pointer-events': 'none',
      }));
    }

    if (maxFret < this.numFrets) {
      const dimLeft = nutEnd + this.fretX[maxFret];
      this.dimGroup.appendChild(el('rect', {
        x: dimLeft, y: 0,
        width: this.W - dimLeft, height: this.H,
        fill: 'rgba(0, 0, 0, 0.55)',
        class: 'range-dim',
        'pointer-events': 'none',
      }));
    }
  }

  /**
   * Visually highlight a single string by dimming all other strings.
   * @param {number|null} stringIdx - 0-5 to highlight one string, null to clear
   */
  highlightActiveString(stringIdx) {
    // Remove previous string highlights
    this.svg.querySelectorAll('.string-dim').forEach(e => e.remove());

    if (stringIdx === null) return;

    for (let s = 0; s < 6; s++) {
      if (s === stringIdx) continue;
      const y = this.stringY[s];
      const bandH = this.boardH / 6;
      const rect = el('rect', {
        x: 0,
        y: y - bandH / 2,
        width: this.W,
        height: bandH,
        fill: 'rgba(0, 0, 0, 0.35)',
        class: 'string-dim',
        'pointer-events': 'none',
      });
      this.dimGroup.appendChild(rect);
    }

    // Add glow line on active string
    const ay = this.stringY[stringIdx];
    const glow = el('line', {
      x1: this.pad.l, y1: ay,
      x2: this.pad.l + this.nutW + this.boardW, y2: ay,
      stroke: 'rgba(0, 212, 170, 0.2)',
      'stroke-width': 8,
      class: 'string-dim',
      'pointer-events': 'none',
    });
    this.dimGroup.appendChild(glow);
  }

  /* ── Highlight circle at a position ── */
  highlight(stringIdx, fret, color = '#00d4aa', pulse = false) {
    const cx = this.posX(fret);
    const cy = this.posY(stringIdx);
    const g = el('g', { class: `hl-dot${pulse ? ' pulse' : ''}` });

    g.appendChild(el('circle', {
      cx, cy, r: 12,
      fill: color, opacity: 0.25, filter: 'url(#fb-glow)',
    }));
    g.appendChild(el('circle', {
      cx, cy, r: 9,
      fill: color, opacity: 0.9,
    }));

    this.hlGroup.appendChild(g);
    this._highlights.push(g);
    return g;
  }

  /* ── Highlight with label ── */
  highlightWithLabel(stringIdx, fret, label, color = '#00d4aa', pulse = false) {
    const cx = this.posX(fret);
    const cy = this.posY(stringIdx);
    const g = el('g', { class: `hl-dot${pulse ? ' pulse' : ''}` });

    g.appendChild(el('circle', {
      cx, cy, r: 12,
      fill: color, opacity: 0.2, filter: 'url(#fb-glow)',
    }));
    g.appendChild(el('circle', {
      cx, cy, r: 10,
      fill: color, opacity: 0.9,
    }));

    const txt = el('text', {
      x: cx, y: cy + 1,
      fill: '#fff',
      'font-size': '9',
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

  showCorrect(stringIdx, fret) {
    const dot = this.highlightWithLabel(stringIdx, fret, '✓', '#00e676');
    dot.classList.add('pop-in');
    setTimeout(() => dot.classList.add('fade-out'), 400);
    setTimeout(() => dot.remove(), 700);
  }

  showWrong(stringIdx, fret) {
    const dot = this.highlightWithLabel(stringIdx, fret, '✗', '#ff5252');
    dot.classList.add('shake');
    setTimeout(() => dot.classList.add('fade-out'), 500);
    setTimeout(() => dot.remove(), 800);
  }

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

  clearHighlights() {
    this._highlights.forEach(h => h.remove());
    this._highlights = [];
  }

  setInteractive(enabled) {
    const areas = this.svg.querySelectorAll('.hit-area');
    areas.forEach(a => {
      a.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }
}
