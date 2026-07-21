// c:\Users\z\.gemini\antigravity\fret-master\src\screens\drummer.js
import * as rhythm from '../core/rhythm.js';
import { unlockAudio } from '../core/audio.js';
import * as store from '../core/storage.js';
import { t } from '../core/i18n.js';

let currentState = {
  bpm: 120,
  patternId: 'basic_44',
  swing: 0,
  soundType: 'kit',
  countIn: false,
  isPlaying: false,
  trainerEnabled: false,
  trainerStart: 80,
  trainerEnd: 140,
  trainerInc: 5,
  trainerBars: 4,
  activeCategory: 'basic'
};

let uiEls = {};

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;
  
  // Load settings
  const settings = store.getSettings();
  if (settings.drumBpm) currentState.bpm = settings.drumBpm;
  if (settings.drumPattern) currentState.patternId = settings.drumPattern;
  if (settings.drumSwing !== undefined) currentState.swing = settings.drumSwing;
  if (settings.drumSound) currentState.soundType = settings.drumSound;
  if (settings.drumCountIn !== undefined) currentState.countIn = settings.drumCountIn;

  const patterns = rhythm.getPatternsByCategory();
  // Ensure patternId exists
  let validPattern = false;
  Object.keys(patterns).forEach(cat => {
    if (patterns[cat].find(p => p.id === currentState.patternId)) {
      validPattern = true;
      currentState.activeCategory = cat;
    }
  });
  if (!validPattern) {
    currentState.activeCategory = 'basic';
    currentState.patternId = patterns.basic[0].id;
  }
  
  app.innerHTML = `
    <div class="screen drummer-screen">
      <div class="stats-header">
        <button class="back-btn" id="drummerBack">←</button>
        <h2>${t('drum_machine') || 'Drum Machine'}</h2>
      </div>
      <div class="drummer-layout">
        <!-- LEFT COLUMN: Pattern + Visualizer + Transport -->
        <div class="drummer-col-main">
          <div class="drum-card">
            <div class="drum-tabs" id="genreTabs">
              ${Object.keys(patterns).map(cat => {
                const label = cat === 'basic' ? (t('basic') || 'Basic') : (t(cat.toLowerCase().replace(/[^a-z0-9]/g, '_')) || cat);
                return `<button class="drum-tab ${currentState.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">${label}</button>`;
              }).join('')}
            </div>
            <div class="drum-select-wrap">
              <select id="drumPattern" class="drum-select">
                ${patterns[currentState.activeCategory].map(p => 
                  `<option value="${p.id}" ${p.id === currentState.patternId ? 'selected' : ''}>${t(p.id) || p.name}</option>`
                ).join('')}
              </select>
            </div>
          </div>
          <div class="beat-visualizer" id="beatVis">
            <!-- Dots injected here -->
          </div>
          <div class="transport-wrap">
            <button class="count-in-btn ${currentState.countIn ? 'active' : ''}" id="toggleCountIn">
              ${t('count_in') || 'Count-in'}
            </button>
            <button class="play-btn" id="playBtn">▶ PLAY</button>
          </div>
        </div>
        <!-- RIGHT COLUMN: Tempo + Options + Trainer -->
        <div class="drummer-col-side">
          <div class="drum-card tempo-card">
            <div class="tempo-main">
              <button class="tempo-btn" id="bpmMinus">−</button>
              <div class="bpm-display">
                <div class="bpm-val" id="bpmVal">${currentState.bpm}</div>
                <div class="bpm-label">BPM</div>
              </div>
              <button class="tempo-btn" id="bpmPlus">+</button>
              <button class="tap-btn" id="tapTempo">TAP</button>
            </div>
          </div>
          <div class="drum-card options-card">
            <div class="drum-row">
              <label>${t('swing') || 'Swing'}</label>
              <div class="swing-wrap">
                <input type="range" id="swingRange" min="0" max="66" value="${currentState.swing}">
                <span id="swingVal">${currentState.swing}%</span>
              </div>
            </div>
            <div class="drum-row">
              <label>${t('sound') || 'Sound'}</label>
              <div class="sound-toggles">
                <button class="snd-btn ${currentState.soundType === 'kit' ? 'active' : ''}" data-snd="kit">🥁</button>
                <button class="snd-btn ${currentState.soundType === 'click' ? 'active' : ''}" data-snd="click">🔔</button>
                <button class="snd-btn ${currentState.soundType === 'hihat' ? 'active' : ''}" data-snd="hihat">🎩</button>
              </div>
            </div>
          </div>
          <div class="drum-card trainer-card ${currentState.trainerEnabled ? 'active' : ''}">
            <div class="trainer-header">
              <label>${t('speed_trainer') || 'Speed Trainer'}</label>
              <button class="toggle-btn" id="toggleTrainer">${currentState.trainerEnabled ? 'ON' : 'OFF'}</button>
            </div>
            <div class="trainer-body" style="display: ${currentState.trainerEnabled ? 'block' : 'none'};">
              <div class="trainer-row">
                <span>Start: <input type="number" id="trStart" value="${currentState.trainerStart}"></span>
                <span>End: <input type="number" id="trEnd" value="${currentState.trainerEnd}"></span>
                <span>+ <input type="number" id="trInc" value="${currentState.trainerInc}"></span>
              </div>
              <div class="trainer-row mt-2">
                <span>Every <input type="number" id="trBars" value="${currentState.trainerBars}"> bars</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Caching elements
  uiEls = {
    bpmVal: $('#bpmVal', app),
    beatVis: $('#beatVis', app),
    swingVal: $('#swingVal', app),
    playBtn: $('#playBtn', app)
  };

  function updateVisualizer() {
    const p = rhythm.PATTERNS[currentState.patternId];
    const beats = p.timeSignature[0];
    let html = '';
    for (let i = 0; i < beats; i++) {
      html += `
        <div class="beat-col">
          <div class="beat-dot" id="beat-dot-${i}"></div>
          <div class="beat-num">${i + 1}</div>
        </div>
      `;
    }
    uiEls.beatVis.innerHTML = html;
  }
  
  updateVisualizer();

  function saveDrumSettings() {
    const s = store.getSettings();
    s.drumBpm = currentState.bpm;
    s.drumPattern = currentState.patternId;
    s.drumSwing = currentState.swing;
    s.drumSound = currentState.soundType;
    s.drumCountIn = currentState.countIn;
    store.saveSettings(s);
  }

  function setBpm(b) {
    currentState.bpm = Math.max(40, Math.min(300, b));
    uiEls.bpmVal.textContent = currentState.bpm;
    rhythm.setBpm(currentState.bpm);
    saveDrumSettings();
  }

  // --- Events ---
  $('#drummerBack', app).addEventListener('click', () => {
    rhythm.stop();
    showScreen('home');
  });

  $('#bpmMinus', app).addEventListener('click', () => setBpm(currentState.bpm - 1));
  $('#bpmPlus', app).addEventListener('click', () => setBpm(currentState.bpm + 1));
  
  // Long press for +/- 5
  let tempoTimer;
  ['#bpmMinus', '#bpmPlus'].forEach(sel => {
    const el = $(sel, app);
    const inc = sel === '#bpmPlus' ? 5 : -5;
    el.addEventListener('mousedown', () => {
      tempoTimer = setTimeout(() => {
        tempoTimer = setInterval(() => setBpm(currentState.bpm + inc), 100);
      }, 400);
    });
    el.addEventListener('mouseup', () => clearInterval(tempoTimer));
    el.addEventListener('mouseleave', () => clearInterval(tempoTimer));
    el.addEventListener('touchstart', () => {
      tempoTimer = setTimeout(() => {
        tempoTimer = setInterval(() => setBpm(currentState.bpm + inc), 100);
      }, 400);
    }, {passive:true});
    el.addEventListener('touchend', () => clearInterval(tempoTimer));
  });

  $('#tapTempo', app).addEventListener('click', () => {
    const b = rhythm.tapTempo();
    setBpm(b);
  });

  $('#drumPattern', app).addEventListener('change', (e) => {
    currentState.patternId = e.target.value;
    rhythm.setPattern(currentState.patternId);
    updateVisualizer();
    saveDrumSettings();
  });

  $$('.drum-tab', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.drum-tab', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentState.activeCategory = btn.dataset.cat;
      
      const select = $('#drumPattern', app);
      select.innerHTML = patterns[currentState.activeCategory].map(p => 
        `<option value="${p.id}">${t(p.id) || p.name}</option>`
      ).join('');
      
      currentState.patternId = patterns[currentState.activeCategory][0].id;
      rhythm.setPattern(currentState.patternId);
      updateVisualizer();
      saveDrumSettings();
    });
  });

  $('#swingRange', app).addEventListener('input', (e) => {
    currentState.swing = parseInt(e.target.value, 10);
    uiEls.swingVal.textContent = currentState.swing + '%';
    rhythm.setSwing(currentState.swing);
    saveDrumSettings();
  });

  $$('.snd-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.snd-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentState.soundType = btn.dataset.snd;
      rhythm.setSoundType(currentState.soundType);
      saveDrumSettings();
    });
  });

  $('#toggleCountIn', app).addEventListener('click', (e) => {
    currentState.countIn = !currentState.countIn;
    e.target.classList.toggle('active', currentState.countIn);
    saveDrumSettings();
  });

  const trainerToggle = $('#toggleTrainer', app);
  const trainerBody = $('.trainer-body', app);
  const trainerCard = $('.trainer-card', app);
  
  trainerToggle.addEventListener('click', () => {
    currentState.trainerEnabled = !currentState.trainerEnabled;
    trainerToggle.textContent = currentState.trainerEnabled ? 'ON' : 'OFF';
    trainerBody.style.display = currentState.trainerEnabled ? 'block' : 'none';
    trainerCard.classList.toggle('active', currentState.trainerEnabled);
  });

  $('#playBtn', app).addEventListener('click', () => {
    unlockAudio();
    if (currentState.isPlaying) {
      rhythm.stop();
      rhythm.stopSpeedTrainer();
      currentState.isPlaying = false;
      uiEls.playBtn.innerHTML = '▶ PLAY';
      uiEls.playBtn.classList.remove('playing');
    } else {
      if (currentState.trainerEnabled) {
        currentState.trainerStart = parseInt($('#trStart', app).value, 10);
        currentState.trainerEnd = parseInt($('#trEnd', app).value, 10);
        currentState.trainerInc = parseInt($('#trInc', app).value, 10);
        currentState.trainerBars = parseInt($('#trBars', app).value, 10);
        
        setBpm(currentState.trainerStart);
        rhythm.startSpeedTrainer({
          startBpm: currentState.trainerStart,
          endBpm: currentState.trainerEnd,
          increment: currentState.trainerInc,
          barsPerStep: currentState.trainerBars
        });
      }
      
      rhythm.start(currentState.patternId, currentState.bpm, {
        swing: currentState.swing,
        soundType: currentState.soundType,
        countIn: currentState.countIn,
        onBeat: (info) => {
          // Visual pulse
          const dots = $$('.beat-dot', app);
          dots.forEach(d => d.classList.remove('active', 'accent'));
          if (dots[info.beat]) {
            dots[info.beat].classList.add('active');
            if (info.isAccent) dots[info.beat].classList.add('accent');
            
            // Remove after short delay
            setTimeout(() => {
              if (dots[info.beat]) dots[info.beat].classList.remove('active', 'accent');
            }, 150);
          }
        },
        onBar: () => {
          // Sync BPM display if trainer updated it
          const b = rhythm.getBpm();
          if (b !== currentState.bpm) {
            currentState.bpm = b;
            uiEls.bpmVal.textContent = b;
          }
        }
      });
      currentState.isPlaying = true;
      uiEls.playBtn.innerHTML = '■ STOP';
      uiEls.playBtn.classList.add('playing');
    }
  });

  // Cleanup on unmount (assuming showScreen handles this or we just rely on rhythm engine stopping when navigated away)
  // We bound rhythm.stop() to back btn.
}
