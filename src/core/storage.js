// ─── LocalStorage Persistence ──────────────────────────────────
// Progress tracking, settings, and records

const STORAGE_KEY = 'fret-master';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefault() {
  return {
    settings: {
      minFret: 0,
      maxFret: 12,
      questionCount: 20,
      practiceString: null,  // null = all strings, 0-5 = specific string
    },
    records: {
      // { mode: { bestTime, bestScore, totalPlayed, totalCorrect } }
      'find-note': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 },
      'name-note': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 },
      'speed-run': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 },
      'ear-training': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 },
      'interval-training': { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 },
    },
    achievements: [], // array of unlocked achievement IDs
    // Accuracy heatmap: heatmap[stringIdx][fret] = { correct, total }
    heatmap: Array.from({ length: 6 }, () =>
      Array.from({ length: 25 }, () => ({ correct: 0, total: 0 }))
    ),
    streak: { current: 0, best: 0 },
    totalSessions: 0,
  };
}

export function getData() {
  return load() || getDefault();
}

export function getSettings() {
  return getData().settings;
}

export function saveSettings(settings) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  save(data);
}

export function recordAnswer(stringIdx, fret, correct) {
  const data = getData();
  const cell = data.heatmap[stringIdx][fret];
  cell.total++;
  if (correct) cell.correct++;

  if (correct) {
    data.streak.current++;
    if (data.streak.current > data.streak.best) {
      data.streak.best = data.streak.current;
    }
  } else {
    data.streak.current = 0;
  }

  save(data);
}

export function recordSession(mode, correct, total, timeMs) {
  const data = getData();
  if (!data.records[mode]) {
    data.records[mode] = { bestTime: null, bestScore: 0, totalPlayed: 0, totalCorrect: 0 };
  }
  const rec = data.records[mode];
  rec.totalPlayed += total;
  rec.totalCorrect += correct;
  const score = Math.round((correct / total) * 100);
  if (score > rec.bestScore) rec.bestScore = score;
  if (rec.bestTime === null || timeMs < rec.bestTime) rec.bestTime = timeMs;
  data.totalSessions++;
  save(data);

  // Check for newly unlocked achievements
  const newBadges = checkAchievements(data);

  return {
    isNewBestTime: rec.bestTime === timeMs,
    isNewBestScore: rec.bestScore === score,
    newBadges,
  };
}

export function getHeatmapData() {
  return getData().heatmap;
}

export function getStreak() {
  return getData().streak;
}

export function getRecords() {
  return getData().records;
}

/** Find the weakest fretboard positions (lowest accuracy with enough data) */
export function getWeakPositions(minFret = 0, maxFret = 12, count = 20) {
  const heatmap = getHeatmapData();
  const positions = [];
  for (let s = 0; s < 6; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const cell = heatmap[s][f];
      const accuracy = cell.total > 0 ? cell.correct / cell.total : 0.5;
      positions.push({ string: s, fret: f, accuracy, total: cell.total });
    }
  }
  // Sort: lowest accuracy first, then by most attempts (prioritize real weaknesses)
  positions.sort((a, b) => {
    if (a.total === 0 && b.total === 0) return Math.random() - 0.5;
    if (a.total === 0) return 1;
    if (b.total === 0) return -1;
    return a.accuracy - b.accuracy;
  });
  return positions.slice(0, count);
}

/** Get daily challenge seed from date */
export function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Check if daily challenge was completed today */
export function getDailyStatus() {
  const data = getData();
  const seed = getDailySeed();
  return {
    seed,
    completed: data.dailyCompleted === seed,
    score: data.dailyCompleted === seed ? data.dailyScore : null,
  };
}

/** Record daily challenge completion */
export function recordDaily(score) {
  const data = getData();
  data.dailyCompleted = getDailySeed();
  data.dailyScore = score;
  save(data);
}

/* ─── Achievement System ────────────────────────────────────── */

export const ACHIEVEMENTS = [
  { id: 'first_game',     icon: '🎸', name: 'First Steps',      desc: 'Complete your first game session' },
  { id: 'streak_5',       icon: '🔥', name: 'On Fire',          desc: 'Get a 5-note streak' },
  { id: 'streak_10',      icon: '💥', name: 'Unstoppable',      desc: 'Get a 10-note streak' },
  { id: 'streak_25',      icon: '🌋', name: 'Inferno',          desc: 'Get a 25-note streak' },
  { id: 'perfect_10',     icon: '💎', name: 'Flawless',         desc: 'Score 100% on a 10+ question game' },
  { id: 'speed_under_30', icon: '⚡', name: 'Lightning',        desc: 'Complete Speed Run under 30 seconds' },
  { id: 'speed_under_20', icon: '🚀', name: 'Hyperdrive',       desc: 'Complete Speed Run under 20 seconds' },
  { id: 'sessions_10',    icon: '📅', name: 'Dedicated',        desc: 'Complete 10 game sessions' },
  { id: 'sessions_50',    icon: '🏅', name: 'Veteran',          desc: 'Complete 50 game sessions' },
  { id: 'all_modes',      icon: '🌟', name: 'Well-Rounded',     desc: 'Play all 4 game modes' },
  { id: 'ear_master',     icon: '👂', name: 'Golden Ear',       desc: 'Score 90%+ in Ear Training' },
  { id: 'notes_100',      icon: '🎵', name: 'Centurion',        desc: 'Answer 100 questions total' },
  { id: 'notes_500',      icon: '🎶', name: 'Note Collector',   desc: 'Answer 500 questions total' },
];

function checkAchievements(data) {
  if (!data.achievements) data.achievements = [];
  const unlocked = new Set(data.achievements);
  const newlyUnlocked = [];

  function grant(id) {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
    }
  }

  // Total questions across all modes
  const totalQ = Object.values(data.records).reduce((s, r) => s + r.totalPlayed, 0);

  if (data.totalSessions >= 1) grant('first_game');
  if (data.streak.best >= 5) grant('streak_5');
  if (data.streak.best >= 10) grant('streak_10');
  if (data.streak.best >= 25) grant('streak_25');
  if (data.totalSessions >= 10) grant('sessions_10');
  if (data.totalSessions >= 50) grant('sessions_50');
  if (totalQ >= 100) grant('notes_100');
  if (totalQ >= 500) grant('notes_500');

  // Perfect game (any mode with 100% on 10+ questions)
  for (const r of Object.values(data.records)) {
    if (r.bestScore >= 100 && r.totalPlayed >= 10) grant('perfect_10');
  }

  // Speed run records
  const sr = data.records['speed-run'];
  if (sr && sr.bestTime && sr.bestTime < 30000) grant('speed_under_30');
  if (sr && sr.bestTime && sr.bestTime < 20000) grant('speed_under_20');

  // All modes played
  const modesPlayed = Object.values(data.records).filter(r => r.totalPlayed > 0).length;
  if (modesPlayed >= 4) grant('all_modes');

  // Ear training mastery
  const et = data.records['ear-training'];
  if (et && et.bestScore >= 90) grant('ear_master');

  data.achievements = [...unlocked];
  save(data);
  return newlyUnlocked.map(id => ACHIEVEMENTS.find(a => a.id === id));
}

export function getAchievements() {
  const data = getData();
  const unlocked = new Set(data.achievements || []);
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.has(a.id) }));
}
