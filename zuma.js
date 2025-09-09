// 祖玛游戏 JavaScript 代码

// 游戏常量
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BALL_RADIUS = 15;
const SHOOTER_RADIUS = 20;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const API_URL = 'http://localhost:3000';

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
        backToMenu: "返回游戏选择"
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
        backToMenu: "Back to Menu"
    }
};

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    level: 1,
    lives: 3
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
let startButton, pauseButton, restartButton, backButton;
let gameTitle, scoreLabel, levelLabel, livesLabel;
let usernameInput, saveUsernameButton, usernameLabel;
let leaderboardTitle, leaderboardList, noRecordsElement;
let langZhButton, langEnButton;
let instructionsTitle, instructionControls, instructionMouse, instructionClick, instructionSpace, instructionTouch;
let startText, pauseText, restartText, backText;

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
}

// 生成游戏路径
function generatePath() {
    path = [];
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const radius = 200;
    
    // 生成螺旋路径
    for (let i = 0; i < 360 * 3; i += 2) {
        const angle = (i * Math.PI) / 180;
        const currentRadius = radius - (i / 10);
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        path.push({ x, y });
    }
}

// 生成随机彩球
function generateRandomBall() {
    return {
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        radius: BALL_RADIUS
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
    
    const ball = {
        x: shooter.x,
        y: shooter.y,
        vx: Math.cos(shooter.angle) * 8,
        vy: Math.sin(shooter.angle) * 8,
        color: shooter.currentBall.color,
        radius: BALL_RADIUS
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
    
    // 更新球链移动
    updateBallChain();
    
    // 更新发射的球
    updateShootingBalls();
    
    // 检查碰撞
    checkCollisions();
    
    // 检查游戏结束条件
    checkGameEnd();
}

// 更新球链
function updateBallChain() {
    for (let i = 0; i < ballChain.length; i++) {
        const ball = ballChain[i];
        ball.pathIndex += 0.5;
        
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
                // 碰撞发生，插入球到链中
                insertBallIntoChain(shootingBall, j);
                shootingBalls.splice(i, 1);
                
                // 检查消除
                checkMatches(j);
                break;
            }
        }
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

// 绘制球链
function drawBallChain() {
    for (const ball of ballChain) {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制球的边框
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// 绘制发射的球
function drawShootingBalls() {
    for (const ball of shootingBalls) {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
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
        ctx.fillStyle = shooter.currentBall.color;
        ctx.beginPath();
        ctx.arc(shooter.x, shooter.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 绘制下一个球
    if (shooter.nextBall) {
        const nextX = shooter.x + 50;
        const nextY = shooter.y;
        
        ctx.fillStyle = shooter.nextBall.color;
        ctx.beginPath();
        ctx.arc(nextX, nextY, BALL_RADIUS - 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// 绘制准星
function drawCrosshair() {
    const endX = shooter.x + Math.cos(shooter.angle) * 100;
    const endY = shooter.y + Math.sin(shooter.angle) * 100;
    
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.setLineDash([]);
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
        lives: 3
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
    
    canvas.addEventListener('click', () => {
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
        window.location.href = 'game-selector.html';
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
    
    // 初始化页面
    switchLanguage(currentLang);
    draw();
});