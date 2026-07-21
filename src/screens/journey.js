// ─── Journey Screen ──────────────────────────────────────────────
// Guided learning path with progressively unlocked stages

import * as store from '../core/storage.js';
import { getLang } from '../core/i18n.js';

const STAGES = [
  {
    id: 'open-position',
    icon: '🌱',
    title: 'Open Position',
    titleZh: '开放把位',
    description: 'Learn natural notes on frets 0-4',
    descZh: '学习0-4品的自然音',
    fretRange: [0, 4],
    questionCount: 15,
    mode: 'find-note',
    unlockCondition: null,
    starThresholds: [60, 80, 95],
    tips: [
      'Start with the open strings: E A D G B E',
      'Natural notes have no sharps or flats: C D E F G A B',
      'Focus on one string at a time',
    ],
    tipsZh: [
      '从空弦音开始：E A D G B E',
      '自然音没有升降号：C D E F G A B',  
      '一次专注于一根弦',
    ],
  },
  {
    id: 'mid-frets',
    icon: '🌿',
    title: '5th Position',
    titleZh: '五品扩展',
    description: 'Expand to frets 5-7, including sharps and flats',
    descZh: '扩展到5-7品，包含升降音',
    fretRange: [5, 7],
    questionCount: 15,
    mode: 'find-note',
    unlockCondition: { stage: 'open-position', stars: 2 },
    starThresholds: [60, 80, 95],
    tips: [
      'Fret 5 is like an open string one higher (E→A, A→D, etc.)',
      'Use octave shapes to find notes you already know',
      'Sharps/flats are always between natural notes (except B-C and E-F)',
    ],
    tipsZh: [
      '第5品相当于高一根弦的空弦（E→A, A→D 等）',
      '利用八度形状找到你已知的音符',
      '升降音总在自然音之间（除了B-C和E-F）',
    ],
  },
  {
    id: 'upper-frets',
    icon: '🌳',
    title: 'Upper Frets',
    titleZh: '高把位',
    description: 'Master frets 8-12',
    descZh: '掌握8-12品',
    fretRange: [8, 12],
    questionCount: 15,
    mode: 'find-note',
    unlockCondition: { stage: 'mid-frets', stars: 2 },
    starThresholds: [60, 80, 95],
    tips: [
      'Fret 12 = same notes as open strings (one octave higher)',
      'Fret 7 to 12 mirrors fret 0 to 5',
      'Use the dot markers as reference points',
    ],
    tipsZh: [
      '第12品 = 空弦音高八度',
      '7-12品是0-5品的镜像',
      '使用品点标记作为参考点',
    ],
  },
  {
    id: 'full-neck',
    icon: '🎯',
    title: 'Full Neck',
    titleZh: '全指板',
    description: 'All notes across the entire fretboard',
    descZh: '全指板所有音符综合训练',
    fretRange: [0, 12],
    questionCount: 20,
    mode: 'find-note',
    unlockCondition: { stage: 'upper-frets', stars: 2 },
    starThresholds: [60, 80, 95],
    tips: [
      'Connect what you learned in each zone',
      'Try to see patterns — every note repeats across strings',
      'Speed will come with practice, focus on accuracy first',
    ],
    tipsZh: [
      '连接你在每个区域学到的知识',
      '尝试看到规律——每个音在不同弦上重复出现',
      '速度会随练习提升，先专注准确率',
    ],
  },
  {
    id: 'speed-challenge',
    icon: '⚡',
    title: 'Speed Challenge',
    titleZh: '速度挑战',
    description: 'Full fretboard under time pressure',
    descZh: '全指板限时挑战',
    fretRange: [0, 12],
    questionCount: 20,
    mode: 'speed-run',
    unlockCondition: { stage: 'full-neck', stars: 2 },
    starThresholds: [50, 75, 90],
    tips: [
      "Don't overthink — trust your muscle memory",
      'If you hesitate, move to the next one',
      'Your goal is automaticity — see a note, instantly know where it is',
    ],
    tipsZh: [
      '不要过度思考——相信你的肌肉记忆',
      '如果犹豫，跳到下一个',
      '你的目标是自动化——看到音名，立刻知道位置',
    ],
  },
  {
    id: 'ear-advanced',
    icon: '👂',
    title: 'Ear Training',
    titleZh: '听力进阶',
    description: 'Find notes by ear + identify intervals',
    descZh: '听音找位置 + 音程识别',
    fretRange: [0, 12],
    questionCount: 15,
    mode: 'ear-training',
    unlockCondition: { stage: 'speed-challenge', stars: 1 },
    starThresholds: [50, 70, 85],
    tips: [
      'Listen for the pitch, then use your fretboard knowledge to locate it',
      'Start by identifying the string, then the fret',
      'Play the reference note on open strings to anchor your ear',
    ],
    tipsZh: [
      '先听音高，再用指板知识定位',
      '先确定弦，再确定品',
      '弹空弦音作为参考来校准你的耳朵',
    ],
  },
  {
    id: 'theory-mastery',
    icon: '🎼',
    title: 'Theory Mastery',
    titleZh: '乐理精通',
    description: 'Chord recognition + interval mastery',
    descZh: '和弦听辨 + 音程精通',
    fretRange: [0, 12],
    questionCount: 15,
    mode: 'chord-quiz',
    unlockCondition: { stage: 'ear-advanced', stars: 1 },
    starThresholds: [50, 70, 85],
    tips: [
      'Listen for the quality: Major sounds happy, Minor sounds sad',
      'Pay attention to the bass note — it\'s usually the root',
      'Practice comparing similar chords (Am vs A, G vs G7)',
    ],
    tipsZh: [
      '听和弦色彩：大和弦明亮，小和弦忧伤',
      '注意低音——通常就是根音',
      '练习比较相似和弦（Am vs A, G vs G7）',
    ],
  },
];

function getJourneyData() {
  const data = store.getData();
  return data.journey || {};
}

export function saveJourneyResult(stageId, score, total) {
  const data = store.getData();
  if (!data.journey) data.journey = {};
  const pct = Math.round((score / total) * 100);
  
  const stageDef = STAGES.find(s => s.id === stageId);
  let stars = 0;
  if (stageDef) {
    if (pct >= stageDef.starThresholds[2]) stars = 3;
    else if (pct >= stageDef.starThresholds[1]) stars = 2;
    else if (pct >= stageDef.starThresholds[0]) stars = 1;
  }

  const prev = data.journey[stageId] || { bestPct: 0, bestStars: 0, attempts: 0 };
  data.journey[stageId] = {
    bestPct: Math.max(prev.bestPct, pct),
    bestStars: Math.max(prev.bestStars, stars),
    attempts: prev.attempts + 1,
    lastPlayed: Date.now(),
  };
  localStorage.setItem('fret-master', JSON.stringify(data));
}

function isStageUnlocked(stage, journeyData) {
  if (!stage.unlockCondition) return true;
  const req = stage.unlockCondition;
  const reqData = journeyData[req.stage];
  return reqData && reqData.bestStars >= req.stars;
}

export function render(ctx) {
  const { app, $, $$, showScreen } = ctx;
  const lang = getLang();
  const isZh = lang === 'zh';
  const journeyData = getJourneyData();

  const titleText = isZh ? '学习之旅' : 'Learning Journey';

  let html = `
    <div class="screen journey-screen">
      <div class="journey-header">
        <button class="back-btn" id="journeyBack">←</button>
        <h2>${titleText}</h2>
      </div>
      <div class="journey-path">
  `;

  STAGES.forEach((stage, idx) => {
    const unlocked = isStageUnlocked(stage, journeyData);
    const data = journeyData[stage.id];
    const stars = data ? data.bestStars : 0;
    const title = isZh ? stage.titleZh : stage.title;
    const desc = isZh ? stage.descZh : stage.description;
    
    let starsHtml = '';
    if (unlocked) {
      starsHtml = '<span class="stage-stars">';
      for (let i = 0; i < 3; i++) {
        starsHtml += i < stars ? '⭐' : '☆';
      }
      starsHtml += '</span>';
    } else {
      starsHtml = '<span class="stage-locked">🔒</span>';
    }

    html += `
      <div class="stage-node ${unlocked ? 'unlocked' : 'locked'}" data-id="${stage.id}">
        <div class="stage-icon">${stage.icon}</div>
        <div class="stage-content">
          <div class="stage-title-row">
            <span class="stage-title">${title}</span>
            ${starsHtml}
          </div>
          <div class="stage-desc">${desc}</div>
        </div>
      </div>
    `;

    // Connector line
    if (idx < STAGES.length - 1) {
      const nextUnlocked = isStageUnlocked(STAGES[idx+1], journeyData);
      html += `<div class="stage-connector ${nextUnlocked ? 'unlocked' : 'locked'}"></div>`;
    }
  });

  html += `
      </div>
      
      <div class="journey-modal-backdrop" id="journeyModal" style="display:none;">
        <div class="journey-modal">
          <div class="modal-header">
            <h3 id="modalTitle"></h3>
            <button class="close-btn" id="modalClose">✕</button>
          </div>
          <div class="modal-body">
            <p id="modalDesc" class="modal-desc"></p>
            <div class="modal-stats" id="modalStats"></div>
            <div class="modal-tips" id="modalTips"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary" id="modalStartBtn">${isZh ? '开始练习' : 'Start Practice'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = html;

  $('#journeyBack', app).addEventListener('click', () => showScreen('home'));
  
  const modal = $('#journeyModal', app);
  const modalClose = $('#modalClose', app);
  let activeStageId = null;

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
    activeStageId = null;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      activeStageId = null;
    }
  });

  $$('.stage-node.unlocked', app).forEach(node => {
    node.addEventListener('click', () => {
      const stageId = node.dataset.id;
      const stage = STAGES.find(s => s.id === stageId);
      if (!stage) return;
      
      activeStageId = stageId;
      const data = journeyData[stage.id];
      const bestPct = data ? data.bestPct : 0;
      const title = isZh ? stage.titleZh : stage.title;
      const desc = isZh ? stage.descZh : stage.description;
      const tips = isZh ? stage.tipsZh : stage.tips;

      $('#modalTitle', app).textContent = `${stage.icon} ${title}`;
      $('#modalDesc', app).textContent = desc;
      
      let tipsHtml = `<h4>${isZh ? '提示：' : 'Tips:'}</h4><ul>`;
      tips.forEach(t => tipsHtml += `<li>${t}</li>`);
      tipsHtml += '</ul>';
      $('#modalTips', app).innerHTML = tipsHtml;

      $('#modalStats', app).innerHTML = `
        <div class="stat-box">
          <span class="stat-label">${isZh ? '最高分' : 'Best Score'}</span>
          <span class="stat-value">${bestPct}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">${isZh ? '题目数' : 'Questions'}</span>
          <span class="stat-value">${stage.questionCount}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">${isZh ? '品格范围' : 'Frets'}</span>
          <span class="stat-value">${stage.fretRange[0]} - ${stage.fretRange[1]}</span>
        </div>
      `;

      modal.style.display = 'flex';
    });
  });

  $('#modalStartBtn', app).addEventListener('click', () => {
    if (!activeStageId) return;
    const stage = STAGES.find(s => s.id === activeStageId);
    if (!stage) return;
    
    // Save to settings then launch
    store.saveSettings({ 
      ...store.getSettings(),
      minFret: stage.fretRange[0], 
      maxFret: stage.fretRange[1], 
      questionCount: stage.questionCount,
      // Pass along the stageId so game/results can attribute the score
      journeyStage: stage.id
    });
    
    showScreen('game', stage.mode);
  });
}
