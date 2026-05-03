// ─── Results Screen ───────────────────────────────────────────
// Post-game score display with grade, stats, badges

import * as store from '../core/storage.js';
import { t } from '../core/i18n.js';

export function render(ctx, data) {
  const { app, $, formatTime, showScreen } = ctx;
  const pct = Math.round((data.correct / data.total) * 100);
  const grade = pct >= 95 ? 'S' : pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D';
  const gradeColors = { S: '#ffd700', A: '#00e676', B: '#00d4aa', C: '#ffa726', D: '#ff5252' };
  const emoji = pct >= 95 ? '🏆' : pct >= 85 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📖';

  const badgeHtml = data.newBadges && data.newBadges.length > 0
    ? data.newBadges.map(b => `
        <div class="new-badge-toast">
          <span class="badge-icon-lg">${b.icon}</span>
          <div><strong>${b.name}</strong><br><small>${b.desc}</small></div>
        </div>
      `).join('')
    : '';

  app.innerHTML = `
    <div class="screen results-screen">
      <div class="results-card">
        <div class="results-emoji">${emoji}</div>
        <div class="results-grade" style="color: ${gradeColors[grade]}">${grade}</div>
        ${data.isNewBestTime ? `<div class="new-record">${t('newBestTime')}</div>` : ''}
        ${data.isNewBestScore ? `<div class="new-record">${t('newBestScore')}</div>` : ''}

        <div class="results-stats">
          <div class="stat">
            <div class="stat-val">${data.correct}/${data.total}</div>
            <div class="stat-label">${t('correct')}</div>
          </div>
          <div class="stat">
            <div class="stat-val">${pct}%</div>
            <div class="stat-label">${t('accuracy')}</div>
          </div>
          <div class="stat">
            <div class="stat-val">${formatTime(data.time)}</div>
            <div class="stat-label">${t('time')}</div>
          </div>
        </div>

        <div class="results-streak">${t('currentStreak')}: ${store.getStreak().current}</div>
      </div>

      ${badgeHtml ? `<div class="new-badges">${badgeHtml}</div>` : ''}

      <div class="results-actions">
        <button class="btn-primary" id="playAgain">${t('playAgain')}</button>
        <button class="btn-secondary" id="backHome">${t('backToMenu')}</button>
      </div>
    </div>
  `;

  $('#playAgain', app).addEventListener('click', () => {
    showScreen('game', { mode: data.mode });
  });
  $('#backHome', app).addEventListener('click', () => showScreen('home'));
}
