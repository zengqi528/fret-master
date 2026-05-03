// ─── Home Screen ──────────────────────────────────────────────
// Landing page with mode cards, settings panel, metronome

import { STANDARD_TUNING } from '../core/music.js';
import { unlockAudio } from '../core/audio.js';
import * as metronome from '../core/metronome.js';
import * as store from '../core/storage.js';
import { t, setLang, getLang } from '../core/i18n.js';

export function render(ctx) {
  metronome.stop();
  const { app, $, $$, showScreen } = ctx;
  const settings = store.getSettings();
  const streak = store.getStreak();
  const achievements = store.getAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const calendar = store.getPracticeHistory(7);

  // Sync i18n with saved preference
  if (settings.lang) setLang(settings.lang);
  const lang = getLang();

  app.innerHTML = `
    <div class="screen home-screen">
      <header class="home-header">
        <div class="logo-row">
          <div class="logo">
            <span class="logo-icon">🎸</span>
            <h1>Fret Master</h1>
          </div>
          <button class="lang-toggle" id="langToggle">${lang === 'en' ? '中文' : 'EN'}</button>
        </div>
        <p class="tagline">${t('tagline')}</p>
        ${streak.best > 0 ? `<div class="streak-badge">${t('bestStreak')}: ${streak.best}</div>` : ''}
        <div class="practice-calendar">
          ${calendar.map(d => `<div class="cal-day ${d.practiced ? 'practiced' : ''}"><span class="cal-label">${d.dayName}</span><span class="cal-dot">${d.practiced ? '●' : '○'}</span></div>`).join('')}
        </div>
      </header>

      <div class="mode-cards">
        <button class="mode-card" data-mode="find-note">
          <div class="mode-icon">🎯</div>
          <div class="mode-info">
            <h3>${t('findNote')}</h3>
            <p>${t('findNoteDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="name-note">
          <div class="mode-icon">🏷️</div>
          <div class="mode-info">
            <h3>${t('nameNote')}</h3>
            <p>${t('nameNoteDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="ear-training">
          <div class="mode-icon">👂</div>
          <div class="mode-info">
            <h3>${t('earTraining')}</h3>
            <p>${t('earTrainingDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="interval-training">
          <div class="mode-icon">🎵</div>
          <div class="mode-info">
            <h3>${t('intervalTraining')}</h3>
            <p>${t('intervalTrainingDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="chord-quiz">
          <div class="mode-icon">🎸</div>
          <div class="mode-info">
            <h3>${t('chordQuiz')}</h3>
            <p>${t('chordQuizDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="speed-run">
          <div class="mode-icon">⚡</div>
          <div class="mode-info">
            <h3>${t('speedRun')}</h3>
            <p>${t('speedRunDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card" data-mode="weak-practice">
          <div class="mode-icon">💡</div>
          <div class="mode-info">
            <h3>${t('weakSpots')}</h3>
            <p>${t('weakSpotsDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>

        <button class="mode-card daily-card" data-mode="daily-challenge" id="dailyCard">
          <div class="mode-icon">📅</div>
          <div class="mode-info">
            <h3>${t('dailyChallenge')}</h3>
            <p>${t('dailyChallengeDesc')}</p>
          </div>
          <div class="mode-arrow">→</div>
        </button>
      </div>

      <div class="tool-cards">
        <button class="tool-card" id="scaleExplorerBtn">
          <span class="tool-icon">🎼</span>
          <span>${t('scaleExplorer')}</span>
        </button>
        <button class="tool-card" id="chordExplorerBtn">
          <span class="tool-icon">🎶</span>
          <span>${t('chordLibrary')}</span>
        </button>
        <button class="tool-card" id="cagedBtn">
          <span class="tool-icon">🔗</span>
          <span>CAGED</span>
        </button>
        <button class="tool-card" id="circleBtn">
          <span class="tool-icon">🔵</span>
          <span>Circle of 5ths</span>
        </button>
      </div>

      <div class="settings-panel">
        <h4>${t('settings')}</h4>
        <div class="setting-row">
          <label>${t('fretRange')}</label>
          <div class="fret-range">
            <input type="number" id="minFret" value="${settings.minFret}" min="0" max="24" />
            <span>—</span>
            <input type="number" id="maxFret" value="${settings.maxFret}" min="0" max="24" />
          </div>
        </div>
        <div class="setting-row">
          <label>${t('string')}</label>
          <div class="string-filter-btns" id="stringFilterBtns">
            <button class="sf-btn ${settings.practiceString === null ? 'active' : ''}" data-string="all">${t('all')}</button>
            ${[0,1,2,3,4,5].map(s => {
              const label = STANDARD_TUNING[s].string + '弦';
              return `<button class="sf-btn ${settings.practiceString === s ? 'active' : ''}" data-string="${s}">${label}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="setting-row">
          <label>${t('questions')}</label>
          <div class="question-btns">
            ${[10, 20, 40].map(n => `
              <button class="q-btn ${settings.questionCount === n ? 'active' : ''}" data-count="${n}">${n}</button>
            `).join('')}
          </div>
        </div>
        <div class="setting-row">
          <label>${t('intervals')}</label>
          <div class="interval-dir-btns">
            ${[
              { val: 'ascending', label: '↑ Up' },
              { val: 'descending', label: '↓ Down' },
              { val: 'random', label: '↕ Mix' },
            ].map(d => `
              <button class="sf-btn ${(settings.intervalDirection || 'ascending') === d.val ? 'active' : ''}" data-dir="${d.val}">${d.label}</button>
            `).join('')}
          </div>
        </div>
        <div class="setting-row">
          <label>${t('accidentals')}</label>
          <div class="accidental-btns" id="accidentalBtns">
            <button class="sf-btn ${(settings.accidentalPref || 'sharp') === 'sharp' ? 'active' : ''}" data-acc="sharp">♯ C# D#</button>
            <button class="sf-btn ${(settings.accidentalPref || 'sharp') === 'flat' ? 'active' : ''}" data-acc="flat">♭ D♭ E♭</button>
          </div>
        </div>      </div>

      <div class="metronome-bar" id="metronomeBar">
        <button class="metro-toggle" id="metroToggle">${t('metronome')}</button>
        <div class="metro-controls" id="metroControls" style="display:none">
          <button class="metro-play" id="metroPlay">▶</button>
          <input type="range" id="metroBpm" min="40" max="240" value="${settings.metronomeBpm || 80}" />
          <span class="metro-bpm-val" id="metroBpmVal">${settings.metronomeBpm || 80}</span>
          <span class="metro-bpm-label">BPM</span>
          <div class="metro-pulse" id="metroPulse"></div>
        </div>
      </div>

      <div class="home-footer-links">
        <button class="stats-link" id="statsBtn">${t('progress')}</button>
        <button class="stats-link" id="achieveBtn">🏆 ${unlockedCount}/${achievements.length}</button>
      </div>
    </div>
  `;

  // ── Event Listeners ──
  $$('.mode-card', app).forEach(card => {
    card.addEventListener('click', () => {
      unlockAudio();
      saveCurrentSettings(ctx);
      showScreen('game', { mode: card.dataset.mode });
    });
  });

  $$('.q-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.q-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $$('#stringFilterBtns .sf-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#stringFilterBtns .sf-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $$('.interval-dir-btns .sf-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.interval-dir-btns .sf-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Accidental toggle (♯/♭)
  $$('#accidentalBtns .sf-btn', app).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#accidentalBtns .sf-btn', app).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Language toggle
  $('#langToggle', app).addEventListener('click', () => {
    const newLang = getLang() === 'en' ? 'zh' : 'en';
    setLang(newLang);
    store.saveSettings({ lang: newLang });
    render(ctx); // Re-render immediately
  });

  $('#statsBtn', app).addEventListener('click', () => showScreen('stats'));
  $('#achieveBtn', app).addEventListener('click', () => showScreen('stats'));
  $('#scaleExplorerBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('scales');
  });
  $('#chordExplorerBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('chords');
  });
  $('#cagedBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('caged');
  });
  $('#circleBtn', app).addEventListener('click', () => {
    unlockAudio();
    showScreen('circle');
  });

  // Metronome
  $('#metroToggle', app).addEventListener('click', () => {
    const ctrl = $('#metroControls', app);
    ctrl.style.display = ctrl.style.display === 'none' ? 'flex' : 'none';
  });
  const bpmSlider = $('#metroBpm', app);
  const bpmVal = $('#metroBpmVal', app);
  bpmSlider.addEventListener('input', () => {
    bpmVal.textContent = bpmSlider.value;
  });
  $('#metroPlay', app).addEventListener('click', () => {
    unlockAudio();
    const btn = $('#metroPlay', app);
    const pulse = $('#metroPulse', app);
    if (metronome.running()) {
      metronome.stop();
      btn.textContent = '▶';
      pulse.classList.remove('beating');
    } else {
      const bpm = parseInt(bpmSlider.value);
      store.saveSettings({ metronomeBpm: bpm });
      metronome.start(bpm, 4, (beat, accent) => {
        pulse.classList.remove('beating');
        void pulse.offsetWidth;
        pulse.classList.add('beating');
      });
      btn.textContent = '⏸';
    }
  });
}

/** Read current settings from DOM and persist */
export function saveCurrentSettings(ctx) {
  const { $, app } = ctx;
  const minFret = parseInt($('#minFret', app)?.value ?? 0);
  const maxFret = parseInt($('#maxFret', app)?.value ?? 12);
  const activeBtn = $('.q-btn.active', app);
  const questionCount = activeBtn ? parseInt(activeBtn.dataset.count) : 20;
  const activeStringBtn = $('#stringFilterBtns .sf-btn.active', app);
  const practiceString = activeStringBtn && activeStringBtn.dataset.string !== 'all'
    ? parseInt(activeStringBtn.dataset.string)
    : null;
  const activeDirBtn = $('.interval-dir-btns .sf-btn.active', app);
  const intervalDirection = activeDirBtn ? activeDirBtn.dataset.dir : 'ascending';
  const activeAccBtn = $('#accidentalBtns .sf-btn.active', app);
  const accidentalPref = activeAccBtn ? activeAccBtn.dataset.acc : 'sharp';
  store.saveSettings({ minFret, maxFret, questionCount, practiceString, intervalDirection, accidentalPref });
}
