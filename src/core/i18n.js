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
    accidentals: 'Accidentals',
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
    octaveNavigator: 'Octave Navigator',
    octaveNavigatorDesc: 'Find all octave positions of a note on the fretboard',

    // Tools
    scaleExplorer: 'Scale Explorer',
    chordLibrary: 'Chord Library',
    drumMachine: 'Drum Machine',
    triadTrainer: 'Triad Trainer',
    arpeggioExplorer: 'Arpeggio Explorer',
    modeExplorer: 'Mode Explorer',

    // Journey
    learningJourney: 'Learning Journey',
    learningJourneyDesc: 'Guided path from beginner to fretboard master',
    startPractice: 'Start Practice',
    locked: '🔒 Locked',
    unlockRequirement: 'Need %s stars in %s to unlock',
    stageTips: 'Tips',
    attempts: 'Attempts',
    bestScore: 'Best Score',
    stageComplete: 'Stage Complete!',

    // Game enhancements
    hint: '💡 Hint',
    hintUsed: 'Hint used — won\'t count for perfect score',
    findAllOctaves: 'Find all octave positions',
    octavesFound: '%s/%s octaves found',
    intervalLevel: 'Level %s',
    intervalLevelUp: '🎉 Level Up! New intervals unlocked',

    // Drum Machine
    drumMachineTitle: 'Drum Machine',
    patternCategory: 'Category',
    basicPatterns: 'Basic',
    genrePatterns: 'Genre',
    pattern: 'Pattern',
    timeSig: 'Time Sig',
    bpm: 'BPM',
    swing: 'Swing',
    soundType: 'Sound',
    drumKit: '🥁 Kit',
    clickSound: '🔔 Click',
    hihatSound: '🎩 HiHat',
    speedTrainer: 'Speed Trainer',
    speedStart: 'Start',
    speedEnd: 'End',
    speedIncrement: 'Step',
    everyBars: 'Every %s bars',
    everySeconds: 'Every %s sec',
    startTraining: 'Start Training',
    stopTraining: 'Stop Training',
    countIn: 'Count-in',
    tapTempo: 'TAP',
    playing: 'Playing',
    stopped: 'Stopped',
    // Genre tab labels
    rock: 'Rock',
    pop: 'Pop',
    blues: 'Blues',
    funk: 'Funk',
    jazz: 'Jazz',
    latin: 'Latin',
    metal: 'Metal',
    country: 'Country',
    reggae: 'Reggae',
    r_b_hip_hop: 'R&B/Hip-Hop',
    '6_8': '6/8',
    odd_time: 'Odd Time',

    // Triads
    triadTrainerTitle: 'Triad Trainer',
    triadType: 'Quality',
    stringGroup: 'String Group',
    inversion: 'Inversion',
    rootPosition: 'Root',
    firstInversion: '1st Inv',
    secondInversion: '2nd Inv',
    allInversions: 'All',
    major: 'Major',
    minor: 'Minor',
    diminished: 'Dim',
    augmented: 'Aug',

    // Arpeggios
    arpeggioTitle: 'Arpeggio Explorer',
    arpeggioType: 'Type',

    // Modes
    modeExplorerTitle: 'Mode Explorer',
    parentKey: 'Parent Key',
    mode: 'Mode',
    characteristicNote: 'Characteristic Note',
    mood: 'Mood / Feel',
    playScale: '▶ Play Scale',
    compareMode: 'Compare',

    // Results enhancements
    positionBreakdown: 'Position Breakdown',
    hardestNotes: 'Hardest Notes',
    improvement: 'vs. Last Time',
    recommendation: 'Recommended Next',

    // Stats enhancements
    xpLevel: 'Level',
    totalXP: 'Total XP',
    weeklyTrend: '7-Day Trend',
    monthlyTrend: '30-Day Trend',
    practiceTime: 'Practice Time',
    recHigh: 'Try Speed Run for a challenge!',
    recMid: 'Keep practicing! Focus on your weak spots',
    recLow: 'Try narrowing your fret range for focused practice',

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

    // Metronome (legacy)
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
    accidentals: '半音音名',
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
    octaveNavigator: '八度导航',
    octaveNavigatorDesc: '在指板上找到一个音的所有八度位置',

    scaleExplorer: '音阶探索',
    chordLibrary: '和弦库',
    drumMachine: '鼓机',
    triadTrainer: '三和弦训练',
    arpeggioExplorer: '琶音探索',
    modeExplorer: '调式探索',

    // Journey
    learningJourney: '学习之旅',
    learningJourneyDesc: '从入门到指板大师的引导式学习路径',
    startPractice: '开始练习',
    locked: '🔒 未解锁',
    unlockRequirement: '需要在「%s」获得%s星才能解锁',
    stageTips: '技巧提示',
    attempts: '尝试次数',
    bestScore: '最高分',
    stageComplete: '阶段完成！',

    // Game enhancements
    hint: '💡 提示',
    hintUsed: '使用了提示——不计入满分',
    findAllOctaves: '找到所有八度位置',
    octavesFound: '已找到 %s/%s 个八度',
    intervalLevel: '等级 %s',
    intervalLevelUp: '🎉 升级！解锁新音程',

    // Drum Machine
    drumMachineTitle: '鼓机',
    patternCategory: '分类',
    basicPatterns: '基础',
    genrePatterns: '风格',
    pattern: '节奏型',
    timeSig: '拍号',
    bpm: 'BPM',
    swing: '摇摆',
    soundType: '音色',
    drumKit: '🥁 鼓组',
    clickSound: '🔔 节拍',
    hihatSound: '🎩 踩镲',
    speedTrainer: '速度训练器',
    speedStart: '起始',
    speedEnd: '目标',
    speedIncrement: '步进',
    everyBars: '每 %s 小节',
    everySeconds: '每 %s 秒',
    startTraining: '开始训练',
    stopTraining: '停止训练',
    countIn: '预备拍',
    tapTempo: '点按测速',
    playing: '播放中',
    stopped: '已停止',
    // Genre tab labels
    rock: '摇滚',
    pop: '流行',
    blues: '布鲁斯',
    funk: '放克',
    jazz: '爵士',
    latin: '拉丁',
    metal: '金属',
    country: '乡村',
    reggae: '雷鬼',
    r_b_hip_hop: 'R&B/嘻哈',
    '6_8': '6/8拍',
    odd_time: '奇数拍',

    // Triads
    triadTrainerTitle: '三和弦训练器',
    triadType: '品质',
    stringGroup: '弦组',
    inversion: '转位',
    rootPosition: '根音位',
    firstInversion: '第一转位',
    secondInversion: '第二转位',
    allInversions: '全部',
    major: '大三',
    minor: '小三',
    diminished: '减三',
    augmented: '增三',

    // Arpeggios
    arpeggioTitle: '琶音探索器',
    arpeggioType: '类型',

    // Modes
    modeExplorerTitle: '调式探索器',
    parentKey: '母调',
    mode: '调式',
    characteristicNote: '特征音',
    mood: '情绪 / 色彩',
    playScale: '▶ 播放音阶',
    compareMode: '对比',

    // Results enhancements
    positionBreakdown: '位置分析',
    hardestNotes: '最难音符',
    improvement: '对比上次',
    recommendation: '推荐练习',

    // Stats enhancements
    xpLevel: '等级',
    totalXP: '总经验值',
    weeklyTrend: '7天趋势',
    monthlyTrend: '30天趋势',
    practiceTime: '练习时间',
    recHigh: '试试极速模式挑战一下！',
    recMid: '继续保持！专注于薄弱环节',
    recLow: '尝试缩小品格范围进行专注练习',

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
    'octave-navigator': t('octaveNavigator'),
  };
}
