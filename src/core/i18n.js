// ─── Internationalization ─────────────────────────────────────
// Chinese / English language toggle with persistent preference

const STRINGS = {
  en: {
    // Home
    tagline: 'Master the fretboard, one note at a time',
    bestStreak: '🔥 Best streak',
    settings: 'Settings',
    fretRange: 'Fret Range',
    string: 'String',
    questions: 'Questions',
    intervals: 'Intervals',
    all: 'All',
    progress: '📊 Progress',

    // Mode cards
    findNote: 'Find Note',
    findNoteDesc: 'See a note name, tap its position on the fretboard',
    nameNote: 'Name Note',
    nameNoteDesc: 'See a highlighted position, choose the correct note name',
    earTraining: 'Ear Training',
    earTrainingDesc: 'Hear a note played, find it on the fretboard by ear',
    intervalTraining: 'Interval Training',
    intervalTrainingDesc: 'Hear two notes, identify the interval between them',
    speedRun: 'Speed Run',
    speedRunDesc: 'Find 20 notes as fast as possible — race the clock!',
    weakSpots: 'Weak Spots',
    weakSpotsDesc: 'Practice your weakest positions based on heatmap data',
    dailyChallenge: 'Daily Challenge',
    dailyChallengeDesc: '10 fixed questions per day — beat yesterday!',
    chordQuiz: 'Chord Quiz',
    chordQuizDesc: 'Hear a chord strummed, identify its name',

    // Tools
    scaleExplorer: 'Scale Explorer',
    chordLibrary: 'Chord Library',

    // Game
    find: 'Find',
    whatNote: 'What note is this?',
    listenFind: 'Listen and find',
    whatInterval: 'What interval?',
    whatChord: 'What chord?',
    play: '🔊 Play',
    daily: '📅 Daily',

    // Results
    correct: 'Correct',
    accuracy: 'Accuracy',
    time: 'Time',
    newBestTime: '🎉 New Best Time!',
    newBestScore: '⭐ New Best Score!',
    currentStreak: '🔥 Current streak',
    playAgain: 'Play Again',
    backToMenu: 'Back to Menu',

    // Stats
    bestStreakLabel: '🔥 Best Streak',
    sessions: '🎮 Sessions',
    achievements: 'Achievements',
    gameRecords: 'Game Records',
    heatmap: 'Fretboard Heatmap',
    dataManagement: 'Data Management',
    exportData: '📤 Export Data',
    importData: '📥 Import Data',
    importSuccess: 'Data imported successfully! Refreshing...',
    importFail: 'Import failed',

    // Metronome
    metronome: '🎵 Metronome',
  },
  zh: {
    tagline: '一个音一个音，征服指板',
    bestStreak: '🔥 最佳连胜',
    settings: '设置',
    fretRange: '品格范围',
    string: '弦',
    questions: '题数',
    intervals: '音程方向',
    all: '全部',
    progress: '📊 进度',

    findNote: '找音符',
    findNoteDesc: '看到音名，在指板上点击正确位置',
    nameNote: '识音符',
    nameNoteDesc: '看到高亮位置，选择正确的音名',
    earTraining: '听音训练',
    earTrainingDesc: '听到一个音，在指板上找到它',
    intervalTraining: '音程训练',
    intervalTrainingDesc: '听两个音，识别它们之间的音程',
    speedRun: '极速模式',
    speedRunDesc: '尽可能快地找到20个音——挑战速度！',
    weakSpots: '薄弱环节',
    weakSpotsDesc: '根据热力图数据练习最弱的位置',
    dailyChallenge: '每日挑战',
    dailyChallengeDesc: '每天10题固定练习——超越昨天！',
    chordQuiz: '和弦听辨',
    chordQuizDesc: '听一个和弦的弹奏，识别和弦名称',

    scaleExplorer: '音阶探索',
    chordLibrary: '和弦库',

    find: '找',
    whatNote: '这是什么音？',
    listenFind: '听音找位置',
    whatInterval: '什么音程？',
    whatChord: '什么和弦？',
    play: '🔊 播放',
    daily: '📅 每日',

    correct: '正确',
    accuracy: '准确率',
    time: '用时',
    newBestTime: '🎉 最快纪录！',
    newBestScore: '⭐ 最高分！',
    currentStreak: '🔥 当前连胜',
    playAgain: '再来一局',
    backToMenu: '返回主页',

    bestStreakLabel: '🔥 最佳连胜',
    sessions: '🎮 练习次数',
    achievements: '成就',
    gameRecords: '游戏记录',
    heatmap: '指板热力图',
    dataManagement: '数据管理',
    exportData: '📤 导出数据',
    importData: '📥 导入数据',
    importSuccess: '数据导入成功！刷新中...',
    importFail: '导入失败',

    metronome: '🎵 节拍器',
  },
};

let currentLang = 'en';

export function setLang(lang) {
  currentLang = lang;
}

export function getLang() {
  return currentLang;
}

/** Get a localized string by key */
export function t(key) {
  return (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.en[key] || key;
}

/** Get mode label mapping */
export function modeLabels() {
  return {
    'find-note': t('findNote'),
    'name-note': t('nameNote'),
    'ear-training': t('earTraining'),
    'interval-training': t('intervalTraining'),
    'speed-run': t('speedRun'),
    'weak-practice': t('weakSpots'),
    'daily-challenge': t('dailyChallenge'),
    'chord-quiz': t('chordQuiz'),
  };
}
