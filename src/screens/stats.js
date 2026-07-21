// ─── Stats Screen ─────────────────────────────────────────────
// Progress tracking, heatmap, achievements, data management

import * as store from '../core/storage.js';
import { getXPInfo, getSessionHistory } from '../core/storage.js';
import { t, modeLabels as getModeLabels } from '../core/i18n.js';

export function render(ctx) {
  const { app, $, formatTime, showScreen } = ctx;
  const records = store.getRecords();
  const heatmap = store.getHeatmapData();
  const streak = store.getStreak();
  const achievements = store.getAchievements();

  const xpInfo = getXPInfo();
  const xpPct = Math.min(100, Math.max(0, xpInfo.progress * 100));

  const history = getSessionHistory(7);
  let chartHtml = '<div class="trend-chart" style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; margin-top: 15px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">';
  
  history.forEach(day => {
    const d = new Date(day.date);
    const dateLabel = d.getDate(); // e.g. "12"
    const pct = day.accuracy;
    const height = pct !== null ? pct : 0;
    const color = pct !== null ? (pct >= 90 ? '#00e676' : pct >= 70 ? '#66bb6a' : pct >= 50 ? '#ffa726' : '#ff5252') : '#333';
    
    chartHtml += `
      <div class="trend-bar-container" style="display: flex; flex-direction: column; align-items: center; width: 12%; height: 100%; justify-content: flex-end; position: relative;">
        ${pct !== null ? `<span style="font-size: 0.7rem; color: #aaa; margin-bottom: 4px;">${pct}%</span>` : ''}
        <div class="trend-bar" style="width: 100%; height: ${Math.max(4, height)}%; background: ${color}; border-radius: 4px 4px 0 0; opacity: ${pct !== null ? 1 : 0.2};"></div>
        <span style="position: absolute; bottom: -20px; font-size: 0.75rem; color: #888;">${d.getMonth()+1}/${dateLabel}</span>
      </div>
    `;
  });
  chartHtml += '</div>';

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

      <div class="stats-section xp-section" style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
        <div style="font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">${t('xpLevel')} ${xpInfo.level}: <span style="color: #ffd700;">${xpInfo.levelName}</span></div>
        <div class="xp-bar-bg" style="background: rgba(255,255,255,0.1); height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 0.5rem;">
          <div class="xp-bar-fill" style="background: #00e676; height: 100%; width: ${xpPct}%; transition: width 1s ease-out;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #aaa;">
          <span>${xpInfo.xp} XP</span>
          <span>${xpInfo.nextLevelXP} XP</span>
        </div>
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
        <h3>${t('weeklyTrend')}</h3>
        ${chartHtml}
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
