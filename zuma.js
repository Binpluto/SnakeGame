// 祖玛游戏 JavaScript 代码

// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BALL_RADIUS = 15;
const SHOOTER_RADIUS = 20;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const API_URL = 'http://localhost:3000';

// 功能球类型
const POWER_BALL_TYPES = {
    SLOW: 'slow',        // 减速球
    EXPLODE: 'explode',  // 爆炸球
    REVERSE: 'reverse',  // 倒退球
    SPEED: 'speed'       // 增加发射速度球
};

// 功能球颜色映射
const POWER_BALL_COLORS = {
    [POWER_BALL_TYPES.SLOW]: '#3498db',     // 蓝色
    [POWER_BALL_TYPES.EXPLODE]: '#e74c3c', // 红色
    [POWER_BALL_TYPES.REVERSE]: '#9b59b6', // 紫色
    [POWER_BALL_TYPES.SPEED]: '#f1c40f'    // 黄色
};

// 功能球生成概率 (每100个球中的数量)
const POWER_BALL_CHANCE = 0.15; // 15%概率

// 轨迹类型定义
const TRACK_TYPES = {
    SPIRAL: 'spiral',           // 螺旋轨迹
    ZIGZAG: 'zigzag',          // 之字形轨迹
    WAVE: 'wave',              // 波浪轨迹
    SQUARE: 'square',          // 方形轨迹
    HEART: 'heart'             // 心形轨迹
};

// 轨迹配置
const TRACK_CONFIGS = {
    [TRACK_TYPES.SPIRAL]: {
        name: { zh: '经典模式', en: 'Classic Mode' },
        description: { zh: '经典螺旋形路径', en: 'Classic spiral path' },
        difficulty: 1
    },
    [TRACK_TYPES.ZIGZAG]: {
        name: { zh: '挑战模式', en: 'Challenge Mode' },
        description: { zh: '锯齿状曲折路径', en: 'Zigzag winding path' },
        difficulty: 2
    },
    [TRACK_TYPES.WAVE]: {
        name: { zh: '波浪模式', en: 'Wave Mode' },
        description: { zh: '起伏的波浪路径', en: 'Undulating wave path' },
        difficulty: 2
    },
    [TRACK_TYPES.SQUARE]: {
        name: { zh: '方形模式', en: 'Square Mode' },
        description: { zh: '方形螺旋路径', en: 'Square spiral path' },
        difficulty: 3
    },
    [TRACK_TYPES.HEART]: {
        name: { zh: '浪漫模式', en: 'Romantic Mode' },
        description: { zh: '浪漫的心形路径', en: 'Romantic heart-shaped path' },
        difficulty: 4
    }
}

// 语言配置
const LANGUAGES = {
    zh: {
        title: "祖玛游戏",
        score: "得分: ",
        level: "等级: ",
        lives: "生命: ",
        start: "开始游戏",
        pause: "暂停",
        resume: "继续",
        restart: "重新开始",
        selectTrack: "选择模式",
        gameOver: "游戏结束",
        levelComplete: "关卡完成",
        username: "用户名: ",
        saveUsername: "保存",
        usernamePlaceholder: "请输入用户名",
        leaderboard: "排行榜",
        noRecords: "暂无记录",
        rank: "排名",
        player: "玩家",
        instructions: "游戏说明",
        controlsGuide: "控制方式:",
        mouseGuide: "鼠标移动: 瞄准方向",
        clickGuide: "鼠标点击: 发射彩球",
        spaceGuide: "空格键: 切换彩球颜色",
        touchGuide: "在移动设备上可使用触屏操作",
        backToMenu: "返回游戏选择",
        trackSelectorTitle: "选择模式",
        currentTrack: "当前模式: ",
        difficulty: "难度: ",
        close: "关闭"
    },
    en: {
        title: "Zuma Game",
        score: "Score: ",
        level: "Level: ",
        lives: "Lives: ",
        start: "Start Game",
        pause: "Pause",
        resume: "Resume",
        restart: "Restart",
        selectTrack: "Select Mode",
        gameOver: "Game Over",
        levelComplete: "Level Complete",
        username: "Username: ",
        saveUsername: "Save",
        usernamePlaceholder: "Enter username",
        leaderboard: "Leaderboard",
        noRecords: "No Records",
        rank: "Rank",
        player: "Player",
        instructions: "Instructions",
        controlsGuide: "Controls:",
        mouseGuide: "Mouse Move: Aim Direction",
        clickGuide: "Mouse Click: Shoot Ball",
        spaceGuide: "Space Key: Switch Ball Color",
        touchGuide: "Use touch controls on mobile devices",
        backToMenu: "Back to Menu",
        trackSelectorTitle: "Select Mode",
        currentTrack: "Current Mode: ",
        difficulty: "Difficulty: ",
        close: "Close"
    }
};

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    level: 1,
    lives: 3,
    currentTrack: TRACK_TYPES.SPIRAL,  // 当前轨迹类型
    // 功能球效果状态
    slowEffect: 0,        // 减速效果剩余时间
    speedBoost: 0,        // 射击速度提升剩余时间
    chainSpeed: 1,        // 球链移动速度倍数
    shootSpeed: 1         // 发射速度倍数
};

// 游戏对象
let shooter = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    angle: 0,
    currentBall: null,
    nextBall: null
};

let ballChain = [];
let shootingBalls = [];
let path = [];
let gameInterval = null;
let animationId = null;

// DOM 元素
let canvas, ctx;
let scoreElement, levelElement, livesElement;
let startButton, pauseButton, restartButton, backButton, selectTrackButton;
let gameTitle, scoreLabel, levelLabel, livesLabel;
let usernameInput, saveUsernameButton, usernameLabel;
let leaderboardTitle, leaderboardList, noRecordsElement;
let langZhButton, langEnButton;
let instructionsTitle, instructionControls, instructionMouse, instructionClick, instructionSpace, instructionTouch;
let startText, pauseText, restartText, backText, selectTrackText;
let trackSelector, trackSelectorTitle, trackSelectorClose, currentTrackLabel, currentTrackName;
let trackOptions = {};
let trackNames = {};
let trackDescs = {};
let difficultyLabels = [];

// 用户数据
let username = localStorage.getItem('zumaUsername') || '';
let leaderboard = [];
let currentLang = localStorage.getItem('zumaLanguage') || 'zh';

// 初始化游戏
function initGame() {
    // 获取DOM元素
    canvas = document.getElementById('zuma-canvas');
    ctx = canvas.getContext('2d');
    
    scoreElement = document.getElementById('score');
    levelElement = document.getElementById('level');
    livesElement = document.getElementById('lives');
    
    startButton = document.getElementById('start-btn');
    pauseButton = document.getElementById('pause-btn');
    restartButton = document.getElementById('restart-btn');
    backButton = document.getElementById('back-btn');
    
    gameTitle = document.getElementById('game-title');
    scoreLabel = document.getElementById('score-label');
    levelLabel = document.getElementById('level-label');
    livesLabel = document.getElementById('lives-label');
    
    usernameInput = document.getElementById('username-input');
    saveUsernameButton = document.getElementById('save-username-btn');
    usernameLabel = document.getElementById('username-label');
    
    leaderboardTitle = document.getElementById('leaderboard-title');
    leaderboardList = document.getElementById('leaderboard-list');
    noRecordsElement = document.getElementById('no-records');
    
    langZhButton = document.getElementById('lang-zh');
    langEnButton = document.getElementById('lang-en');
    
    instructionsTitle = document.getElementById('instructions-title');
    instructionControls = document.getElementById('instruction-controls');
    instructionMouse = document.getElementById('instruction-mouse');
    instructionClick = document.getElementById('instruction-click');
    instructionSpace = document.getElementById('instruction-space');
    instructionTouch = document.getElementById('instruction-touch');
    
    startText = document.getElementById('start-text');
    pauseText = document.getElementById('pause-text');
    restartText = document.getElementById('restart-text');
    backText = document.getElementById('back-text');
    selectTrackButton = document.getElementById('select-track-btn');
    selectTrackText = document.getElementById('select-track-text');
    
    // 轨迹选择界面元素
    trackSelector = document.getElementById('track-selector');
    trackSelectorTitle = document.getElementById('track-selector-title');
    trackSelectorClose = document.getElementById('track-selector-close');
    currentTrackLabel = document.getElementById('current-track-label');
    currentTrackName = document.getElementById('current-track-name');
    
    // 轨迹选项元素
    Object.keys(TRACK_TYPES).forEach(key => {
        const trackType = TRACK_TYPES[key];
        trackOptions[trackType] = document.getElementById(`track-${trackType}`);
        trackNames[trackType] = document.getElementById(`track-name-${trackType}`);
        trackDescs[trackType] = document.getElementById(`track-desc-${trackType}`);
    });
    
    // 难度星级元素
    for (let i = 1; i <= 5; i++) {
        Object.keys(TRACK_TYPES).forEach(key => {
            const trackType = TRACK_TYPES[key];
            const starElement = document.getElementById(`star-${trackType}-${i}`);
            if (starElement) {
                if (!difficultyLabels[trackType]) difficultyLabels[trackType] = [];
                difficultyLabels[trackType].push(starElement);
            }
        });
    }
    
    // 加载保存的轨迹设置
    const savedTrack = localStorage.getItem('zumaCurrentTrack');
    if (savedTrack && Object.values(TRACK_TYPES).includes(savedTrack)) {
        gameState.currentTrack = savedTrack;
    }
    
    // 初始化游戏路径
    generatePath();
    
    // 初始化射手
    shooter.currentBall = generateRandomBall();
    shooter.nextBall = generateRandomBall();
    
    // 初始化球链
    generateBallChain();
    
    // 设置用户名
    if (username) {
        usernameInput.value = username;
    }
    
    // 加载排行榜
    fetchLeaderboard();
    
    // 更新UI
    updateUI();
    updateUIText();
    updateTrackSelectorUI();
}

// 生成游戏路径
function generatePath() {
    path = [];
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    switch (gameState.currentTrack) {
        case TRACK_TYPES.SPIRAL:
            generateSpiralPath(centerX, centerY);
            break;
        case TRACK_TYPES.ZIGZAG:
            generateZigzagPath(centerX, centerY);
            break;
        case TRACK_TYPES.WAVE:
            generateWavePath(centerX, centerY);
            break;
        case TRACK_TYPES.SQUARE:
            generateSquarePath(centerX, centerY);
            break;
        case TRACK_TYPES.HEART:
            generateHeartPath(centerX, centerY);
            break;
        default:
            generateSpiralPath(centerX, centerY);
    }
}

// 螺旋轨迹
function generateSpiralPath(centerX, centerY) {
    const radius = 200;
    for (let i = 0; i < 360 * 3; i += 2) {
        const angle = (i * Math.PI) / 180;
        const currentRadius = radius - (i / 10);
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        path.push({ x, y });
    }
}

// 之字形轨迹
function generateZigzagPath(centerX, centerY) {
    const width = 300;
    const height = 400;
    const zigzagHeight = 40;
    const segments = 8;
    
    for (let i = 0; i < segments; i++) {
        const y = centerY + height/2 - (i * height / segments);
        const segmentWidth = width - (i * 30);
        const points = 20;
        
        for (let j = 0; j <= points; j++) {
            const progress = j / points;
            let x;
            
            if (i % 2 === 0) {
                x = centerX - segmentWidth/2 + progress * segmentWidth;
            } else {
                x = centerX + segmentWidth/2 - progress * segmentWidth;
            }
            
            const zigzagOffset = Math.sin(progress * Math.PI * 4) * zigzagHeight * (1 - i * 0.1);
            path.push({ x: x + zigzagOffset, y });
        }
    }
}

// 波浪轨迹
function generateWavePath(centerX, centerY) {
    const radius = 180;
    const waveAmplitude = 60;
    const waveFrequency = 3;
    
    for (let i = 0; i < 360 * 2.5; i += 1.5) {
        const angle = (i * Math.PI) / 180;
        const currentRadius = radius - (i / 12);
        const waveOffset = Math.sin(angle * waveFrequency) * waveAmplitude * (currentRadius / radius);
        const x = centerX + Math.cos(angle) * (currentRadius + waveOffset);
        const y = centerY + Math.sin(angle) * (currentRadius + waveOffset);
        path.push({ x, y });
    }
}

// 方形轨迹
function generateSquarePath(centerX, centerY) {
    const initialSize = 280;
    const layers = 6;
    
    for (let layer = 0; layer < layers; layer++) {
        const size = initialSize - layer * 40;
        const halfSize = size / 2;
        const pointsPerSide = Math.floor(size / 8);
        
        // 上边
        for (let i = 0; i <= pointsPerSide; i++) {
            const x = centerX - halfSize + (i / pointsPerSide) * size;
            const y = centerY - halfSize;
            path.push({ x, y });
        }
        
        // 右边
        for (let i = 1; i <= pointsPerSide; i++) {
            const x = centerX + halfSize;
            const y = centerY - halfSize + (i / pointsPerSide) * size;
            path.push({ x, y });
        }
        
        // 下边
        for (let i = 1; i <= pointsPerSide; i++) {
            const x = centerX + halfSize - (i / pointsPerSide) * size;
            const y = centerY + halfSize;
            path.push({ x, y });
        }
        
        // 左边
        for (let i = 1; i < pointsPerSide; i++) {
            const x = centerX - halfSize;
            const y = centerY + halfSize - (i / pointsPerSide) * size;
            path.push({ x, y });
        }
    }
}

// 心形轨迹
function generateHeartPath(centerX, centerY) {
    const scale = 8;
    const layers = 4;
    
    for (let layer = 0; layer < layers; layer++) {
        const currentScale = scale * (1 - layer * 0.2);
        const points = 100 - layer * 10;
        
        for (let i = 0; i <= points; i++) {
            const t = (i / points) * 2 * Math.PI;
            // 心形参数方程
            const x = currentScale * (16 * Math.pow(Math.sin(t), 3));
            const y = currentScale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            path.push({ 
                x: centerX + x, 
                y: centerY - y + 50 // 向下偏移一点
            });
        }
    }
}

// 生成随机彩球
function generateRandomBall() {
    // 判断是否生成功能球
    if (Math.random() < POWER_BALL_CHANCE) {
        return generatePowerBall();
    }
    
    return {
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        radius: BALL_RADIUS,
        isPowerBall: false
    };
}

// 生成功能球
function generatePowerBall() {
    const powerTypes = Object.values(POWER_BALL_TYPES);
    const powerType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
    
    return {
        color: POWER_BALL_COLORS[powerType],
        radius: BALL_RADIUS,
        isPowerBall: true,
        powerType: powerType
    };
}

// 生成球链
function generateBallChain() {
    ballChain = [];
    const ballCount = 20 + gameState.level * 5;
    
    for (let i = 0; i < ballCount; i++) {
        const ball = generateRandomBall();
        ball.pathIndex = i * 2;
        ball.id = i;
        ballChain.push(ball);
    }
}

// 更新射手角度
function updateShooterAngle(mouseX, mouseY) {
    const dx = mouseX - shooter.x;
    const dy = mouseY - shooter.y;
    shooter.angle = Math.atan2(dy, dx);
}

// 发射彩球
function shootBall() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const shootSpeed = 8 * gameState.shootSpeed;
    const ball = {
        x: shooter.x,
        y: shooter.y,
        vx: Math.cos(shooter.angle) * shootSpeed,
        vy: Math.sin(shooter.angle) * shootSpeed,
        color: shooter.currentBall.color,
        radius: BALL_RADIUS,
        isPowerBall: shooter.currentBall.isPowerBall || false,
        powerType: shooter.currentBall.powerType
    };
    
    shootingBalls.push(ball);
    
    // 切换彩球
    shooter.currentBall = shooter.nextBall;
    shooter.nextBall = generateRandomBall();
}

// 切换彩球颜色
function switchBall() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const temp = shooter.currentBall;
    shooter.currentBall = shooter.nextBall;
    shooter.nextBall = temp;
}

// 更新游戏逻辑
function updateGame() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // 更新功能球效果
    updatePowerEffects();
    
    // 更新球链移动
    updateBallChain();
    
    // 更新发射的球
    updateShootingBalls();
    
    // 检查碰撞
    checkCollisions();
    
    // 检查游戏结束条件
    checkGameEnd();
}

// 更新功能球效果
function updatePowerEffects() {
    // 减速效果倒计时
    if (gameState.slowEffect > 0) {
        gameState.slowEffect--;
        gameState.chainSpeed = 0.3; // 减速到30%
    } else {
        gameState.chainSpeed = 1;
    }
    
    // 射击速度提升效果倒计时
    if (gameState.speedBoost > 0) {
        gameState.speedBoost--;
        gameState.shootSpeed = 2; // 射击速度提升到200%
    } else {
        gameState.shootSpeed = 1;
    }
}

// 更新球链
function updateBallChain() {
    for (let i = 0; i < ballChain.length; i++) {
        const ball = ballChain[i];
        ball.pathIndex += 0.5 * gameState.chainSpeed;
        
        if (ball.pathIndex >= path.length) {
            // 球到达终点，玩家失去生命
            gameState.lives--;
            ballChain.splice(i, 1);
            i--;
            
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        } else {
            const pathPoint = path[Math.floor(ball.pathIndex)];
            if (pathPoint) {
                ball.x = pathPoint.x;
                ball.y = pathPoint.y;
            }
        }
    }
}

// 更新发射的球
function updateShootingBalls() {
    for (let i = shootingBalls.length - 1; i >= 0; i--) {
        const ball = shootingBalls[i];
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // 检查边界碰撞
        if (ball.x < 0 || ball.x > CANVAS_WIDTH || ball.y < 0 || ball.y > CANVAS_HEIGHT) {
            shootingBalls.splice(i, 1);
        }
    }
}

// 检查碰撞
function checkCollisions() {
    for (let i = shootingBalls.length - 1; i >= 0; i--) {
        const shootingBall = shootingBalls[i];
        
        for (let j = 0; j < ballChain.length; j++) {
            const chainBall = ballChain[j];
            const distance = Math.sqrt(
                Math.pow(shootingBall.x - chainBall.x, 2) + 
                Math.pow(shootingBall.y - chainBall.y, 2)
            );
            
            if (distance < BALL_RADIUS * 2) {
                // 检查是否为功能球
                if (shootingBall.isPowerBall) {
                    // 触发功能球效果
                    activatePowerBall(shootingBall, j);
                } else {
                    // 普通球，插入球到链中
                    insertBallIntoChain(shootingBall, j);
                    // 检查消除
                    checkMatches(j);
                }
                
                shootingBalls.splice(i, 1);
                break;
            }
        }
    }
}

// 激活功能球效果
function activatePowerBall(powerBall, hitIndex) {
    switch (powerBall.powerType) {
        case POWER_BALL_TYPES.SLOW:
            // 减速球：减慢球链移动速度
            gameState.slowEffect = 300; // 5秒效果 (60fps * 5)
            gameState.score += 50;
            break;
            
        case POWER_BALL_TYPES.EXPLODE:
            // 爆炸球：消除周围的球
            explodeBalls(hitIndex);
            gameState.score += 100;
            break;
            
        case POWER_BALL_TYPES.REVERSE:
            // 倒退球：让球链倒退
            reverseBallChain();
            gameState.score += 75;
            break;
            
        case POWER_BALL_TYPES.SPEED:
            // 速度球：增加发射速度
            gameState.speedBoost = 600; // 10秒效果
            gameState.score += 50;
            break;
    }
}

// 爆炸效果：消除周围的球
function explodeBalls(centerIndex) {
    const explodeRange = 3; // 爆炸范围
    const startIndex = Math.max(0, centerIndex - explodeRange);
    const endIndex = Math.min(ballChain.length - 1, centerIndex + explodeRange);
    
    // 计算得分
    const removedCount = endIndex - startIndex + 1;
    gameState.score += removedCount * 10;
    
    // 移除球
    ballChain.splice(startIndex, removedCount);
    
    // 重新计算路径索引
    for (let i = startIndex; i < ballChain.length; i++) {
        if (i === 0) {
            ballChain[i].pathIndex = 0;
        } else {
            ballChain[i].pathIndex = ballChain[i - 1].pathIndex + 2;
        }
    }
}

// 倒退效果：让球链向后移动
function reverseBallChain() {
    for (let i = 0; i < ballChain.length; i++) {
        ballChain[i].pathIndex = Math.max(0, ballChain[i].pathIndex - 20);
    }
}

// 将球插入链中
function insertBallIntoChain(ball, index) {
    const newBall = {
        x: ball.x,
        y: ball.y,
        color: ball.color,
        radius: BALL_RADIUS,
        pathIndex: ballChain[index].pathIndex,
        id: Date.now()
    };
    
    ballChain.splice(index, 0, newBall);
    
    // 重新计算路径索引
    for (let i = index + 1; i < ballChain.length; i++) {
        ballChain[i].pathIndex = ballChain[i - 1].pathIndex + 2;
    }
}

// 检查匹配消除
function checkMatches(startIndex) {
    const color = ballChain[startIndex].color;
    let matchStart = startIndex;
    let matchEnd = startIndex;
    
    // 向前查找相同颜色
    while (matchStart > 0 && ballChain[matchStart - 1].color === color) {
        matchStart--;
    }
    
    // 向后查找相同颜色
    while (matchEnd < ballChain.length - 1 && ballChain[matchEnd + 1].color === color) {
        matchEnd++;
    }
    
    // 如果匹配3个或更多，消除它们
    if (matchEnd - matchStart + 1 >= 3) {
        const removedCount = matchEnd - matchStart + 1;
        ballChain.splice(matchStart, removedCount);
        
        // 增加分数
        gameState.score += removedCount * 100 * gameState.level;
        
        // 重新计算路径索引
        for (let i = matchStart; i < ballChain.length; i++) {
            if (i === 0) {
                ballChain[i].pathIndex = 0;
            } else {
                ballChain[i].pathIndex = ballChain[i - 1].pathIndex + 2;
            }
        }
        
        updateUI();
    }
}

// 检查游戏结束
function checkGameEnd() {
    if (ballChain.length === 0) {
        // 关卡完成
        levelComplete();
    }
}

// 关卡完成
function levelComplete() {
    gameState.level++;
    gameState.score += 1000 * gameState.level;
    
    // 生成新的球链
    generateBallChain();
    
    updateUI();
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // 更新排行榜
    if (username && gameState.score > 0) {
        updateLeaderboard(gameState.score);
    }
    
    updateUI();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制路径
    drawPath();
    
    // 绘制终点笑脸
    drawEndPoint();
    
    // 绘制球链
    drawBallChain();
    
    // 绘制发射的球
    drawShootingBalls();
    
    // 绘制射手
    drawShooter();
    
    // 绘制准星
    drawCrosshair();
}

// 绘制路径
function drawPath() {
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = BALL_RADIUS * 2 + 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        const point = path[i];
        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.stroke();
}

// 绘制终点笑脸
function drawEndPoint() {
    if (path.length === 0) return;
    
    const endPoint = path[path.length - 1];
    const faceRadius = 30;
    
    // 计算球链距离终点的最近距离
    let minDistance = Infinity;
    if (ballChain.length > 0) {
        const firstBall = ballChain[0];
        if (firstBall.x !== undefined && firstBall.y !== undefined) {
            const dx = firstBall.x - endPoint.x;
            const dy = firstBall.y - endPoint.y;
            minDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }
    
    // 根据距离计算嘴巴张开程度 (距离越近，嘴巴张得越大)
    const maxDistance = 200; // 最大影响距离
    const mouthOpenness = Math.max(0, Math.min(1, 1 - minDistance / maxDistance));
    
    // 绘制脸部背景
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, faceRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制脸部边框
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绘制眼睛
    ctx.fillStyle = '#2c3e50';
    // 左眼
    ctx.beginPath();
    ctx.arc(endPoint.x - 10, endPoint.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    // 右眼
    ctx.beginPath();
    ctx.arc(endPoint.x + 10, endPoint.y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制动态嘴巴
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    const mouthY = endPoint.y + 5;
    const mouthWidth = 16;
    const mouthHeight = 5 + mouthOpenness * 15; // 嘴巴高度随距离变化
    
    ctx.beginPath();
    if (mouthOpenness > 0.1) {
        // 张开的嘴巴 (椭圆形)
        ctx.ellipse(endPoint.x, mouthY + mouthHeight/2, mouthWidth/2, mouthHeight/2, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#c0392b';
        ctx.fill();
        ctx.stroke();
    } else {
        // 闭合的嘴巴 (弧线)
        ctx.arc(endPoint.x, mouthY - 5, mouthWidth/2, 0, Math.PI);
        ctx.stroke();
    }
}

// 绘制球链
function drawBallChain() {
    for (const ball of ballChain) {
        if (ball.isPowerBall) {
            drawPowerBall(ball.x, ball.y, ball.radius, ball.powerType);
        } else {
            drawSphere(ball.x, ball.y, ball.radius, ball.color);
        }
    }
}

// 绘制发射的球
function drawShootingBalls() {
    for (const ball of shootingBalls) {
        if (ball.isPowerBall) {
            drawPowerBall(ball.x, ball.y, ball.radius, ball.powerType);
        } else {
            drawSphere(ball.x, ball.y, ball.radius, ball.color);
        }
    }
}

// 绘制功能球
function drawPowerBall(x, y, radius, powerType) {
    const color = POWER_BALL_COLORS[powerType];
    
    // 绘制基础球体
    drawSphere(x, y, radius, color);
    
    // 添加特殊效果
    ctx.save();
    
    // 绘制符号
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let symbol = '';
    switch (powerType) {
        case POWER_BALL_TYPES.SLOW:
            symbol = 'S';
            break;
        case POWER_BALL_TYPES.EXPLODE:
            symbol = 'E';
            break;
        case POWER_BALL_TYPES.REVERSE:
            symbol = 'R';
            break;
        case POWER_BALL_TYPES.SPEED:
            symbol = 'F';
            break;
    }
    
    ctx.fillText(symbol, x, y);
    
    // 添加闪烁效果
    const time = Date.now() * 0.01;
    const alpha = 0.3 + 0.3 * Math.sin(time);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}

// 绘制射手
function drawShooter() {
    // 绘制射手底座
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, SHOOTER_RADIUS + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制当前球
    if (shooter.currentBall) {
        if (shooter.currentBall.isPowerBall) {
            drawPowerBall(shooter.x, shooter.y, BALL_RADIUS, shooter.currentBall.powerType);
        } else {
            drawSphere(shooter.x, shooter.y, BALL_RADIUS, shooter.currentBall.color);
        }
    }
    
    // 绘制下一个球
    if (shooter.nextBall) {
        const nextX = shooter.x + 50;
        const nextY = shooter.y;
        if (shooter.nextBall.isPowerBall) {
            drawPowerBall(nextX, nextY, BALL_RADIUS - 3, shooter.nextBall.powerType);
        } else {
            drawSphere(nextX, nextY, BALL_RADIUS - 3, shooter.nextBall.color);
        }
    }
}

// 绘制3D球体
function drawSphere(x, y, radius, color) {
    // 验证参数
    if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) {
        return;
    }
    
    // 创建径向渐变
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
    );
    
    // 根据颜色设置渐变
    const colorMap = {
        'red': ['#ff6b6b', '#e74c3c', '#c0392b'],
        'blue': ['#74b9ff', '#3498db', '#2980b9'],
        'green': ['#55efc4', '#2ecc71', '#27ae60'],
        'yellow': ['#fdcb6e', '#f1c40f', '#f39c12'],
        'purple': ['#a29bfe', '#9b59b6', '#8e44ad'],
        'orange': ['#fd79a8', '#e67e22', '#d35400']
    };
    
    const colors = colorMap[color] || ['#bdc3c7', '#95a5a6', '#7f8c8d'];
    
    gradient.addColorStop(0, colors[0]);    // 高光
    gradient.addColorStop(0.7, colors[1]);  // 主色
    gradient.addColorStop(1, colors[2]);    // 阴影
    
    // 绘制球体阴影
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + radius * 0.8, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 绘制球体主体
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制高光
    const highlightGradient = ctx.createRadialGradient(
        x - radius * 0.4, y - radius * 0.4, 0,
        x - radius * 0.4, y - radius * 0.4, radius * 0.5
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制边框
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
}

// 绘制准星
function drawCrosshair() {
    const endX = shooter.x + Math.cos(shooter.angle) * 100;
    const endY = shooter.y + Math.sin(shooter.angle) * 100;
    
    // 绘制银色复古箭头
    ctx.strokeStyle = '#c0c0c0'; // 银色
    ctx.fillStyle = '#c0c0c0';
    ctx.lineWidth = 3;
    
    // 绘制箭头主线
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // 绘制箭头头部
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6; // 30度
    
    // 左侧箭头线
    const leftX = endX - arrowLength * Math.cos(shooter.angle - arrowAngle);
    const leftY = endY - arrowLength * Math.sin(shooter.angle - arrowAngle);
    
    // 右侧箭头线
    const rightX = endX - arrowLength * Math.cos(shooter.angle + arrowAngle);
    const rightY = endY - arrowLength * Math.sin(shooter.angle + arrowAngle);
    
    // 绘制箭头三角形
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fill();
    
    // 添加复古装饰线条
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#a0a0a0'; // 稍深的银色
    
    // 在箭头线上添加装饰性的短线
    for (let i = 1; i <= 3; i++) {
        const ratio = i / 4;
        const decorX = shooter.x + (endX - shooter.x) * ratio;
        const decorY = shooter.y + (endY - shooter.y) * ratio;
        
        // 垂直于箭头方向的短线
        const perpAngle = shooter.angle + Math.PI / 2;
        const decorLength = 5;
        
        ctx.beginPath();
        ctx.moveTo(decorX - decorLength * Math.cos(perpAngle), decorY - decorLength * Math.sin(perpAngle));
        ctx.lineTo(decorX + decorLength * Math.cos(perpAngle), decorY + decorLength * Math.sin(perpAngle));
        ctx.stroke();
    }
}

// 游戏循环
function gameLoop() {
    updateGame();
    draw();
    
    if (gameState.isRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 开始游戏
function startGame() {
    if (gameState.isGameOver) {
        restartGame();
        return;
    }
    
    gameState.isRunning = true;
    gameState.isPaused = false;
    
    gameLoop();
    updateUI();
}

// 暂停游戏
function pauseGame() {
    if (!gameState.isRunning) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (!gameState.isPaused) {
        gameLoop();
    }
    
    updateUI();
}

// 重新开始游戏
function restartGame() {
    gameState = {
        isRunning: false,
        isPaused: false,
        isGameOver: false,
        score: 0,
        level: 1,
        lives: 3,
        slowEffect: 0,
        speedBoost: 0,
        chainSpeed: 1,
        shootSpeed: 1
    };
    
    ballChain = [];
    shootingBalls = [];
    
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // 重新初始化
    generateBallChain();
    shooter.currentBall = generateRandomBall();
    shooter.nextBall = generateRandomBall();
    
    updateUI();
    draw();
}

// 更新UI
function updateUI() {
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    livesElement.textContent = gameState.lives;
    
    const texts = LANGUAGES[currentLang];
    
    if (gameState.isGameOver) {
        startText.textContent = texts.start;
    } else if (gameState.isRunning) {
        startText.textContent = texts.start;
    } else {
        startText.textContent = texts.start;
    }
    
    pauseText.textContent = gameState.isPaused ? texts.resume : texts.pause;
}

// 更新UI文本
function updateUIText() {
    const texts = LANGUAGES[currentLang];
    
    gameTitle.textContent = texts.title;
    scoreLabel.textContent = texts.score;
    levelLabel.textContent = texts.level;
    livesLabel.textContent = texts.lives;
    
    startText.textContent = texts.start;
    pauseText.textContent = gameState.isPaused ? texts.resume : texts.pause;
    restartText.textContent = texts.restart;
    backText.textContent = texts.backToMenu;
    selectTrackText.textContent = texts.selectTrack;
    
    usernameLabel.textContent = texts.username;
    saveUsernameButton.textContent = texts.saveUsername;
    usernameInput.placeholder = texts.usernamePlaceholder;
    leaderboardTitle.textContent = texts.leaderboard;
    noRecordsElement.textContent = texts.noRecords;
    
    if (instructionsTitle) instructionsTitle.textContent = texts.instructions;
    if (instructionControls) instructionControls.textContent = texts.controlsGuide;
    if (instructionMouse) instructionMouse.textContent = texts.mouseGuide;
    if (instructionClick) instructionClick.textContent = texts.clickGuide;
    if (instructionSpace) instructionSpace.textContent = texts.spaceGuide;
    if (instructionTouch) instructionTouch.textContent = texts.touchGuide;
    
    // 轨迹选择界面文本
    if (trackSelectorTitle) {
        trackSelectorTitle.textContent = texts.trackSelectorTitle;
    }
    if (currentTrackLabel) {
        currentTrackLabel.textContent = texts.currentTrack;
    }
    if (trackSelectorClose) {
        trackSelectorClose.textContent = texts.close;
    }
    
    // 更新轨迹选择器UI
    updateTrackSelectorUI();
    
    renderLeaderboard();
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('zumaLanguage', lang);
    
    langZhButton.classList.toggle('active', lang === 'zh');
    langEnButton.classList.toggle('active', lang === 'en');
    
    updateUIText();
}

// 保存用户名
function saveUsername() {
    username = usernameInput.value.trim();
    localStorage.setItem('zumaUsername', username);
}

// 获取排行榜
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/zuma-leaderboard`);
        leaderboard = await response.json();
        renderLeaderboard();
    } catch (error) {
        console.error('获取排行榜失败:', error);
    }
}

// 更新排行榜
async function updateLeaderboard(score) {
    try {
        await fetch(`${API_URL}/api/zuma-leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, score })
        });
        fetchLeaderboard();
    } catch (error) {
        console.error('更新排行榜失败:', error);
    }
}

// 渲染排行榜
function renderLeaderboard() {
    if (!leaderboard || leaderboard.length === 0) {
        leaderboardList.innerHTML = `<div class="no-records">${LANGUAGES[currentLang].noRecords}</div>`;
        return;
    }
    
    const texts = LANGUAGES[currentLang];
    let html = `
        <div class="leaderboard-header">
            <span>${texts.rank}</span>
            <span>${texts.player}</span>
            <span>${texts.score}</span>
        </div>
    `;
    
    leaderboard.forEach((entry, index) => {
        html += `
            <div class="leaderboard-entry">
                <span class="rank">${index + 1}</span>
                <span class="player">${entry.username}</span>
                <span class="score">${entry.score}</span>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// 轨迹选择功能
function showTrackSelector() {
    trackSelector.style.display = 'flex';
    updateTrackSelectorUI();
}

function hideTrackSelector() {
    trackSelector.style.display = 'none';
}

function selectTrack(trackType) {
    gameState.currentTrack = trackType;
    localStorage.setItem('zumaCurrentTrack', trackType);
    
    // 重新生成路径
    generatePath();
    
    // 如果游戏正在运行，重新开始游戏
    if (gameState.isRunning) {
        restartGame();
    } else {
        draw();
    }
    
    // 更新UI
    updateTrackSelectorUI();
    hideTrackSelector();
}

function updateTrackSelectorUI() {
    const texts = LANGUAGES[currentLang];
    const currentConfig = TRACK_CONFIGS[gameState.currentTrack];
    
    // 更新当前轨迹显示
    if (currentTrackName) {
        currentTrackName.textContent = currentConfig.name[currentLang];
    }
    
    // 更新轨迹选项UI
    Object.keys(TRACK_TYPES).forEach(key => {
        const trackType = TRACK_TYPES[key];
        const config = TRACK_CONFIGS[trackType];
        const option = trackOptions[trackType];
        
        if (option) {
            // 更新选中状态
            if (trackType === gameState.currentTrack) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        }
        
        // 更新轨迹名称和描述
        if (trackNames[trackType]) {
            trackNames[trackType].textContent = config.name[currentLang];
        }
        if (trackDescs[trackType]) {
            trackDescs[trackType].textContent = config.description[currentLang];
        }
        
        // 更新难度星级
        if (difficultyLabels[trackType]) {
            difficultyLabels[trackType].forEach((star, index) => {
                if (index < config.difficulty) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
    });
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // 鼠标事件
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updateShooterAngle(mouseX, mouseY);
        
        if (gameState.isRunning && !gameState.isPaused) {
            draw();
        }
    });
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updateShooterAngle(mouseX, mouseY);
        shootBall();
    });
    
    // 触屏事件
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        updateShooterAngle(touchX, touchY);
        
        if (gameState.isRunning && !gameState.isPaused) {
            draw();
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        shootBall();
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            switchBall();
        }
    });
    
    // 按钮事件
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    restartButton.addEventListener('click', restartGame);
    backButton.addEventListener('click', () => {
        window.location.href = 'hey-welcome/vielspass.html';
    });
    
    // 触屏控制
    const touchShootButton = document.getElementById('touch-shoot');
    const touchSwitchButton = document.getElementById('touch-switch');
    
    if (touchShootButton) {
        touchShootButton.addEventListener('click', shootBall);
    }
    
    if (touchSwitchButton) {
        touchSwitchButton.addEventListener('click', switchBall);
    }
    
    // 语言切换
    langZhButton.addEventListener('click', () => switchLanguage('zh'));
    langEnButton.addEventListener('click', () => switchLanguage('en'));
    
    // 用户名保存
    saveUsernameButton.addEventListener('click', saveUsername);
    
    // 轨迹选择事件
    selectTrackButton.addEventListener('click', showTrackSelector);
    trackSelectorClose.addEventListener('click', hideTrackSelector);
    
    // 轨迹选项点击事件
    Object.keys(TRACK_TYPES).forEach(key => {
        const trackType = TRACK_TYPES[key];
        if (trackOptions[trackType]) {
            trackOptions[trackType].addEventListener('click', () => selectTrack(trackType));
        }
    });
    
    // 点击轨迹选择器外部关闭
    trackSelector.addEventListener('click', (e) => {
        if (e.target === trackSelector) {
            hideTrackSelector();
        }
    });
    
    // 初始化页面
    switchLanguage(currentLang);
    draw();
});