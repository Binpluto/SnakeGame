// 游戏常量
const GRID_SIZE = 30; // 网格大小
const GRID_WIDTH = 10; // 游戏区域宽度（格子数）
const GRID_HEIGHT = 20; // 游戏区域高度（格子数）
let GAME_SPEED = 500; // 游戏速度（毫秒）
const MIN_SPEED = 1000; // 最慢速度（毫秒）
const MAX_SPEED = 100; // 最快速度（毫秒）

// API配置
const API_URL = 'http://localhost:3000/api';

// 语言配置
const LANGUAGES = {
    zh: {
        title: "俄罗斯方块",
        score: "得分: ",
        level: "等级: ",
        lines: "消除行数: ",
        start: "开始游戏",
        pause: "暂停",
        resume: "继续",
        restart: "重新开始",
        instructions: "游戏说明",
        controlsGuide: "使用方向键控制方块移动和旋转",
        leftRightGuide: "← → 左右移动方块",
        downGuide: "↓ 加速下落",
        upGuide: "↑ 旋转方块",
        gameOver: "游戏结束",
        username: "用户名: ",
        saveUsername: "保存",
        usernamePlaceholder: "请输入用户名",
        leaderboard: "排行榜",
        noRecords: "暂无记录",
        yourScore: "你的得分",
        rank: "排名",
        player: "玩家",
        backToMenu: "返回游戏选择"
    },
    en: {
        title: "Tetris",
        score: "Score: ",
        level: "Level: ",
        lines: "Lines: ",
        start: "Start Game",
        pause: "Pause",
        resume: "Resume",
        restart: "Restart",
        instructions: "Instructions",
        controlsGuide: "Use arrow keys to move and rotate blocks",
        leftRightGuide: "← → Move block left/right",
        downGuide: "↓ Move block down faster",
        upGuide: "↑ Rotate block",
        gameOver: "Game Over",
        username: "Username: ",
        saveUsername: "Save",
        usernamePlaceholder: "Enter username",
        leaderboard: "Leaderboard",
        noRecords: "No records",
        yourScore: "Your Score",
        rank: "Rank",
        player: "Player",
        backToMenu: "Back to Game Selection"
    }
};

// 当前语言
let currentLang = 'zh';

// 方块形状定义
const SHAPES = [
    // I形方块
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // J形方块
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // L形方块
    [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // O形方块
    [
        [1, 1],
        [1, 1]
    ],
    // S形方块
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    // T形方块
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    // Z形方块
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
];

// 方块颜色
const COLORS = [
    '#00FFFF', // I - 青色
    '#0000FF', // J - 蓝色
    '#FF7F00', // L - 橙色
    '#FFFF00', // O - 黄色
    '#00FF00', // S - 绿色
    '#800080', // T - 紫色
    '#FF0000'  // Z - 红色
];

// 游戏变量
let board = [];
let currentShape = null;
let currentShapeIndex = 0;
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 1;
let lines = 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;

// 用户名和排行榜相关
let username = localStorage.getItem('tetrisUsername') || '';
let leaderboard = [];
const MAX_LEADERBOARD_ENTRIES = 10;