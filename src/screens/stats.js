// ─── Stats Screen ─────────────────────────────────────────────
// Progress tracking, heatmap, achievements, data management

import * as store from '../core/storage.js';
import { t, modeLabels as getModeLabels } from '../core/i18n.js';

export function render(ctx) {
  const { app, $, formatTime, showScreen } = ctx;
  const records = store.getRecords();
  const heatmap = store.getHeatmapData();
  const streak = store.getStreak();
  const achievements = store.getAchievements();

  let heatmapHtml = '<div class="heatmap-grid">';
  const stringLabels = ['E', 'A', 'D', 'G', 'B', 'e'];
  for (let s = 5; s >= 0; s--) {
    heatmapHtml += `<div class="hm-row"><span class="hm-label">${stringLabels[5 - s]}</span>`;
    for (let f = 0; f <= 12; f++) {
      const cell = heatmap[s][f];
      const pct = cell.total > 0 ? cell.correct / cell.total : -1;
      let color;
      if (pct < 0) color = 'rgba(255,255,255,0.05)';
      else if (pct >= 0.9) color = '#00e676';
      else if (pct >= 0.7) color = '#66bb6a';
      else if (pct >= 0.5) color = '#ffa726';
      else color = '#ff5252';
      const opacity = cell.total > 0 ? Math.min(0.3 + cell.total * 0.07, 1) : 0.15;
      heatmapHtml += `<div class="hm-cell" style="background:${color};opacity:${opacity}" title="String ${6-s}, Fret ${f}: ${cell.total > 0 ? Math.round(pct*100)+'%' : 'N/A'} (${cell.total} attempts)"></div>`;
    }
    heatmapHtml += '</div>';
  }
  heatmapHtml += '<div class="hm-row hm-fret-nums"><span class="hm-label"></span>';
  for (let f = 0; f <= 12; f++) heatmapHtml += `<div class="hm-cell hm-num">${f}</div>`;
  heatmapHtml += '</div></div>';

  const labels = getModeLabels();

  app.innerHTML = `
    <div class="screen stats-screen">
      <div class="stats-header">
        <button class="back-btn" id="statsBack">←</button>
        <h2>${t('progress')}</h2>
      </div>

      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-val">${streak.best}</div>
          <div class="stat-label">${t('bestStreakLabel')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${store.getData().totalSessions}</div>
          <div class="stat-label">${t('sessions')}</div>
        </div>
      </div>

      <div class="stats-section">
        <h3>${t('achievements')}</h3>
        <div class="achievements-grid">
          ${achievements.map(a => `
            <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
              <span class="ach-icon">${a.icon}</span>
              <span class="ach-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="stats-section">
        <h3>${t('gameRecords')}</h3>
        <div class="records-list">
          ${Object.entries(records).map(([mode, r]) => `
            <div class="record-row">
              <span class="record-mode">${labels[mode] || mode}</span>
              <span class="record-stat">Best: ${r.bestTime ? formatTime(r.bestTime) : '—'}</span>
              <span class="record-stat">Acc: ${r.totalPlayed > 0 ? Math.round(r.totalCorrect / r.totalPlayed * 100) + '%' : '—'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="stats-section">
        <h3>${t('heatmap')}</h3>
        <p class="heatmap-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#ff5252"></span>&lt;50%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#ffa726"></span>50-70%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#66bb6a"></span>70-90%</span>
          <span class="legend-item"><span class="legend-dot" style="background:#00e676"></span>&gt;90%</span>
        </p>
        ${heatmapHtml}
      </div>

      <div class="stats-section">
        <h3>${t('dataManagement')}</h3>
        <div class="data-actions">
          <button class="btn-secondary btn-sm" id="exportBtn">${t('exportData')}</button>
          <button class="btn-secondary btn-sm" id="importBtn">${t('importData')}</button>
          <input type="file" id="importFile" accept=".json" style="display:none" />
        </div>
      </div>
    </div>
  `;

  $('#statsBack', app).addEventListener('click', () => showScreen('home'));

  $('#exportBtn', app).addEventListener('click', () => store.exportData());
  $('#importBtn', app).addEventListener('click', () => $('#importFile', app).click());
  $('#importFile', app).addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = store.importData(reader.result);
      if (result.ok) {
        alert(t('importSuccess'));
        showScreen('stats');
      } else {
        alert(t('importFail') + ': ' + result.error);
      }
    };
    reader.readAsText(file);
  });
}
