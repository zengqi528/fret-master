// ─── Results Screen ───────────────────────────────────────────
// Post-game score display with grade, stats, badges

import * as store from '../core/storage.js';
import { getXPInfo } from '../core/storage.js';
import { t } from '../core/i18n.js';

export function render(ctx, data) {
  const { app, $, formatTime, showScreen } = ctx;
  const pct = Math.round((data.correct / data.total) * 100);
  const grade = pct >= 95 ? 'S' : pct >= 85 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D';
  const gradeColors = { S: '#ffd700', A: '#00e676', B: '#00d4aa', C: '#ffa726', D: '#ff5252' };
  const emoji = pct >= 95 ? '🏆' : pct >= 85 ? '🌟' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📖';

  const xpInfo = getXPInfo();
  const xpGained = data.xpGained || 0;

  let recText = '';
  if (pct >= 95) recText = t('recHigh');
  else if (pct >= 70) recText = t('recMid');
  else recText = t('recLow');

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

      <div class="xp-gain-display" style="text-align: center; margin: 1rem 0; font-size: 1.5rem; color: #ffd700; animation: riseUp 1.5s ease-out forwards;">
        +${xpGained} XP
        <div style="font-size: 0.9rem; color: #aaa; margin-top: 5px;">Level ${xpInfo.level}: ${xpInfo.levelName}</div>
      </div>

      <div class="recommendation-section" style="text-align: center; margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
        <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1rem; color: var(--primary-color, #00e676);">${t('recommendation')}</h3>
        <p style="margin: 0; color: #ddd;">${recText}</p>
      </div>

      ${badgeHtml ? `<div class="new-badges">${badgeHtml}</div>` : ''}

      <div class="results-actions">
        <button class="btn-primary" id="playAgain">${t('playAgain')}</button>
        <button class="btn-secondary" id="backHome">${t('backToMenu')}</button>
      </div>
    </div>
  `;

  // Inject keyframes for animation if not present
  if (!document.getElementById('riseUpStyle')) {
    const style = document.createElement('style');
    style.id = 'riseUpStyle';
    style.innerHTML = `
      @keyframes riseUp {
        0% { opacity: 0; transform: translateY(20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0.8; transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }

  $('#playAgain', app).addEventListener('click', () => {
    showScreen('game', { mode: data.mode });
  });
  $('#backHome', app).addEventListener('click', () => showScreen('home'));
}
