// 游戏常量
const GRID_SIZE = 30; // 网格大小
const GRID_WIDTH = 10; // 游戏区域宽度（格子数）
const GRID_HEIGHT = 20; // 游戏区域高度（格子数）
let GAME_SPEED = 500; // 游戏速度（毫秒）
const MIN_SPEED = 1000; // 最慢速度（毫秒）
const MAX_SPEED = 100; // 最快速度（毫秒）

// API配置
const API_URL = 'http://localhost:3000';

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
        gameOver: "游戏结束",
        nextPiece: "下一个",
        username: "用户名: ",
        saveUsername: "保存",
        usernamePlaceholder: "请输入用户名",
        leaderboard: "排行榜",
        noRecords: "暂无记录",
        rank: "排名",
        player: "玩家",
        instructions: "游戏说明",
        controlsGuide: "控制方式:",
        leftRightGuide: "← → : 左右移动",
        downGuide: "↓ : 加速下落",
        upGuide: "↑ : 旋转",
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
        gameOver: "Game Over",
        nextPiece: "Next",
        username: "Username: ",
        saveUsername: "Save",
        usernamePlaceholder: "Enter username",
        leaderboard: "Leaderboard",
        noRecords: "No Records",
        rank: "Rank",
        player: "Player",
        instructions: "Instructions",
        controlsGuide: "Controls:",
        leftRightGuide: "← → : Move Left/Right",
        downGuide: "↓ : Move Down",
        upGuide: "↑ : Rotate",
        backToMenu: "Back to Menu"
    }
};

// 方块形状和颜色
const SHAPES = [
    // I形
    {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF'
    },
    // J形
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF'
    },
    // L形
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF8000'
    },
    // O形
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00'
    },
    // S形
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00'
    },
    // T形
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080'
    },
    // Z形
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000'
    }
];

// 游戏变量
let board = [];
let currentShape = null;
let currentX = 0;
let currentY = 0;
let currentColor = '';
let nextShape = null;
let nextColor = '';
let score = 0;
let level = 1;
let lines = 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;

// 用户名和排行榜
let username = localStorage.getItem('tetrisUsername') || '';
let leaderboard = [];
let currentLang = localStorage.getItem('tetrisLanguage') || 'zh';

// DOM元素
const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const backButton = document.getElementById('back-btn');
const startText = document.getElementById('start-text');
const pauseText = document.getElementById('pause-text');
const restartText = document.getElementById('restart-text');
const backText = document.getElementById('back-text');
const gameTitle = document.getElementById('game-title');
const scoreLabel = document.getElementById('score-label');
const levelLabel = document.getElementById('level-label');
const linesLabel = document.getElementById('lines-label');
const nextPieceLabel = document.getElementById('next-piece-label');
const usernameLabel = document.getElementById('username-label');
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-btn');
const leaderboardTitle = document.getElementById('leaderboard-title');
const leaderboardList = document.getElementById('leaderboard-list');
const noRecordsElement = document.getElementById('no-records');
const langZhButton = document.getElementById('lang-zh');
const langEnButton = document.getElementById('lang-en');
const instructionsTitle = document.querySelector('.instructions-title');
const instructionControls = document.querySelector('.instruction-controls');
const instructionLeftRight = document.querySelector('.instruction-left-right');
const instructionDown = document.querySelector('.instruction-down');
const instructionUp = document.querySelector('.instruction-up');

// 初始化游戏
function initGame() {
    // 初始化游戏板
    board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
    
    // 重置游戏状态
    score = 0;
    level = 1;
    lines = 0;
    isPaused = false;
    isGameOver = false;
    
    // 更新UI
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    
    // 启用按钮
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // 移除游戏结束提示（如果存在）
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    // 生成第一个方块
    generateNewShape();
    
    // 绘制游戏
    draw();
}

// 生成新方块
function generateNewShape() {
    if (nextShape === null) {
        // 第一次生成时，同时生成当前和下一个方块
        const randomIndex = Math.floor(Math.random() * SHAPES.length);
        currentShape = JSON.parse(JSON.stringify(SHAPES[randomIndex].shape));
        currentColor = SHAPES[randomIndex].color;
        
        const nextRandomIndex = Math.floor(Math.random() * SHAPES.length);
        nextShape = JSON.parse(JSON.stringify(SHAPES[nextRandomIndex].shape));
        nextColor = SHAPES[nextRandomIndex].color;
    } else {
        // 使用下一个方块作为当前方块
        currentShape = nextShape;
        currentColor = nextColor;
        
        // 生成新的下一个方块
        const randomIndex = Math.floor(Math.random() * SHAPES.length);
        nextShape = JSON.parse(JSON.stringify(SHAPES[randomIndex].shape));
        nextColor = SHAPES[randomIndex].color;
    }
    
    // 设置初始位置（居中）
    currentX = Math.floor((GRID_WIDTH - currentShape[0].length) / 2);
    currentY = 0;
    
    // 绘制下一个方块预览
    drawNextPiece();
    
    // 检查游戏是否结束
    if (!isValidMove(0, 0)) {
        gameOver();
    }
}

// 检查移动是否有效
function isValidMove(offsetX, offsetY) {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x] === 0) continue;
            
            const newX = currentX + x + offsetX;
            const newY = currentY + y + offsetY;
            
            // 检查边界
            if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                return false;
            }
            
            // 检查碰撞
            if (newY >= 0 && board[newY][newX] !== 0) {
                return false;
            }
        }
    }
    
    return true;
}

// 旋转方块
function rotateShape() {
    // 创建旋转后的方块
    const rotatedShape = [];
    for (let i = 0; i < currentShape[0].length; i++) {
        rotatedShape.push([]);
        for (let j = currentShape.length - 1; j >= 0; j--) {
            rotatedShape[i].push(currentShape[j][i]);
        }
    }
    
    // 保存当前方块
    const originalShape = currentShape;
    
    // 尝试旋转
    currentShape = rotatedShape;
    
    // 如果旋转后的位置无效，则恢复原来的方块
    if (!isValidMove(0, 0)) {
        currentShape = originalShape;
        return false;
    }
    
    return true;
}

// 锁定方块到游戏板
function lockShape() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x] !== 0) {
                const boardY = currentY + y;
                const boardX = currentX + x;
                
                // 确保在游戏板范围内
                if (boardY >= 0 && boardY < GRID_HEIGHT && boardX >= 0 && boardX < GRID_WIDTH) {
                    board[boardY][boardX] = currentColor;
                }
            }
        }
    }
}

// 消除填满的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        // 检查当前行是否已填满
        const isLineFull = board[y].every(cell => cell !== 0);
        
        if (isLineFull) {
            // 移除当前行
            for (let yy = y; yy > 0; yy--) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    board[yy][x] = board[yy - 1][x];
                }
            }
            
            // 清空顶部行
            for (let x = 0; x < GRID_WIDTH; x++) {
                board[0][x] = 0;
            }
            
            // 由于行已被移除，需要重新检查当前行
            y++;
            
            // 增加已清除行数
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数和等级
        lines += linesCleared;
        score += linesCleared * 100 * level; // 分数与等级相关
        
        // 每清除10行提升一个等级
        level = Math.floor(lines / 10) + 1;
        
        // 更新游戏速度
        GAME_SPEED = MIN_SPEED - (level - 1) * 50;
        if (GAME_SPEED < MAX_SPEED) GAME_SPEED = MAX_SPEED;
        
        // 如果游戏正在运行，更新游戏循环速度
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        }
        
        // 更新UI
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
    }
    
    return linesCleared;
}

// 游戏循环
function gameLoop() {
    // 尝试向下移动当前方块
    if (isValidMove(0, 1)) {
        currentY++;
    } else {
        // 无法继续下落，锁定方块
        lockShape();
        
        // 检查并消除填满的行
        clearLines();
        
        // 生成新方块
        generateNewShape();
    }
    
    // 更新游戏画面
    draw();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= GRID_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, GRID_HEIGHT * GRID_SIZE);
        ctx.stroke();
    }
    
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(GRID_WIDTH * GRID_SIZE, y * GRID_SIZE);
        ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (board[y][x] !== 0) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }
    
    // 绘制当前方块
    if (currentShape) {
        ctx.fillStyle = currentColor;
        
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x] !== 0) {
                    ctx.fillRect((currentX + x) * GRID_SIZE, (currentY + y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1;
                    ctx.strokeRect((currentX + x) * GRID_SIZE, (currentY + y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }
    }
}

// 绘制下一个方块预览
function drawNextPiece() {
    // 清空画布
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    if (nextShape) {
        const blockSize = 20; // 预览区块大小
        const offsetX = (nextPieceCanvas.width - nextShape[0].length * blockSize) / 2;
        const offsetY = (nextPieceCanvas.height - nextShape.length * blockSize) / 2;
        
        nextPieceCtx.fillStyle = nextColor;
        
        for (let y = 0; y < nextShape.length; y++) {
            for (let x = 0; x < nextShape[y].length; x++) {
                if (nextShape[y][x] !== 0) {
                    nextPieceCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    
                    nextPieceCtx.strokeStyle = '#000000';
                    nextPieceCtx.lineWidth = 1;
                    nextPieceCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            }
        }
    }
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        initGame();
    }
    
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
}

// 暂停游戏
function pauseGame() {
    if (isPaused) {
        // 恢复游戏
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        pauseText.textContent = LANGUAGES[currentLang].pause;
        isPaused = false;
    } else {
        // 暂停游戏
        clearInterval(gameInterval);
        gameInterval = null;
        pauseText.textContent = LANGUAGES[currentLang].resume;
        isPaused = true;
    }
}

// 重新开始游戏
function restartGame() {
    // 清除当前游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // 初始化游戏
    initGame();
    
    // 自动开始游戏
    startGame();
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    isGameOver = true;
    
    // 禁用按钮
    startButton.disabled = true;
    pauseButton.disabled = true;
    
    // 显示游戏结束提示
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.textContent = LANGUAGES[currentLang].gameOver;
    document.querySelector('.game-container').appendChild(gameOverDiv);
    
    // 更新排行榜
    if (username) {
        updateLeaderboard(score);
    }
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tetrisLanguage', lang);
    
    // 更新UI文本
    updateUIText();
    
    // 更新语言按钮状态
    if (lang === 'zh') {
        langZhButton.classList.add('active');
        langEnButton.classList.remove('active');
    } else {
        langZhButton.classList.remove('active');
        langEnButton.classList.add('active');
    }
}

// 更新UI文本
function updateUIText() {
    const texts = LANGUAGES[currentLang];
    
    // 更新标题和标签
    gameTitle.textContent = texts.title;
    scoreLabel.textContent = texts.score;
    levelLabel.textContent = texts.level;
    linesLabel.textContent = texts.lines;
    
    // 更新按钮文本
    startText.textContent = texts.start;
    pauseText.textContent = isPaused ? texts.resume : texts.pause;
    restartText.textContent = texts.restart;
    backText.textContent = texts.backToMenu;
    
    // 更新说明文本
    if (instructionsTitle) instructionsTitle.textContent = texts.instructions;
    if (instructionControls) instructionControls.textContent = texts.controlsGuide;
    if (instructionLeftRight) instructionLeftRight.textContent = texts.leftRightGuide;
    if (instructionDown) instructionDown.textContent = texts.downGuide;
    if (instructionUp) instructionUp.textContent = texts.upGuide;
    
    // 更新用户名和排行榜文本
    usernameLabel.textContent = texts.username;
    saveUsernameButton.textContent = texts.saveUsername;
    usernameInput.placeholder = texts.usernamePlaceholder;
    leaderboardTitle.textContent = texts.leaderboard;
    noRecordsElement.textContent = texts.noRecords;
    
    // 重新渲染排行榜
    renderLeaderboard();
    
    // 更新游戏结束提示（如果存在）
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.textContent = texts.gameOver;
    }
}

// 保存用户名
function saveUsername() {
    username = usernameInput.value.trim();
    if (username) {
        localStorage.setItem('tetrisUsername', username);
    }
}

// 获取排行榜数据
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/tetris-leaderboard`);
        if (response.ok) {
            leaderboard = await response.json();
            renderLeaderboard();
        }
    } catch (error) {
        console.error('获取排行榜失败:', error);
    }
}

// 更新排行榜
async function updateLeaderboard(score) {
    try {
        const response = await fetch(`${API_URL}/api/tetris-leaderboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                score: score
            })
        });
        
        if (response.ok) {
            // 更新排行榜显示
            fetchLeaderboard();
        }
    } catch (error) {
        console.error('更新排行榜失败:', error);
    }
}

// 渲染排行榜
function renderLeaderboard() {
    // 清空当前排行榜
    leaderboardList.innerHTML = '';
    
    // 如果没有记录，显示提示
    if (leaderboard.length === 0) {
        noRecordsElement.style.display = 'block';
        return;
    }
    
    // 隐藏无记录提示
    noRecordsElement.style.display = 'none';
    
    // 创建表头
    const headerRow = document.createElement('div');
    headerRow.className = 'leaderboard-item header';
    
    const rankHeader = document.createElement('span');
    rankHeader.textContent = LANGUAGES[currentLang].rank;
    
    const playerHeader = document.createElement('span');
    playerHeader.textContent = LANGUAGES[currentLang].player;
    
    const scoreHeader = document.createElement('span');
    scoreHeader.textContent = LANGUAGES[currentLang].score;
    
    headerRow.appendChild(rankHeader);
    headerRow.appendChild(playerHeader);
    headerRow.appendChild(scoreHeader);
    leaderboardList.appendChild(headerRow);
    
    // 添加排行榜项
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        if (entry.username === username) {
            item.classList.add('current-user');
        }
        
        const rank = document.createElement('span');
        rank.textContent = index + 1;
        
        const player = document.createElement('span');
        player.textContent = entry.username;
        
        const score = document.createElement('span');
        score.textContent = entry.score;
        
        item.appendChild(rank);
        item.appendChild(player);
        item.appendChild(score);
        leaderboardList.appendChild(item);
    });
}

// 初始化页面
function initPage() {
    // 设置用户名输入框
    if (username) {
        usernameInput.value = username;
    }
    
    // 获取排行榜数据
    fetchLeaderboard();
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (isGameOver || !gameInterval) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(-1, 0)) {
                currentX--;
                draw();
            }
            break;
        case 'ArrowRight':
            if (isValidMove(1, 0)) {
                currentX++;
                draw();
            }
            break;
        case 'ArrowDown':
            if (isValidMove(0, 1)) {
                currentY++;
                draw();
            }
            break;
        case 'ArrowUp':
            rotateShape();
            draw();
            break;
    }
});

// 按钮事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', restartGame);
backButton.addEventListener('click', () => {
    window.location.href = 'game-selector.html';
});

// 语言切换事件监听
langZhButton.addEventListener('click', () => switchLanguage('zh'));
langEnButton.addEventListener('click', () => switchLanguage('en'));

// 保存用户名事件监听
saveUsernameButton.addEventListener('click', saveUsername);

// 初始化设置
(function() {
    // 加载语言设置
    if (currentLang === 'en') {
        langZhButton.classList.remove('active');
        langEnButton.classList.add('active');
    } else {
        langZhButton.classList.add('active');
        langEnButton.classList.remove('active');
    }
    
    // 更新UI文本
    updateUIText();
    
    // 初始化页面和游戏
    initPage();
    initGame();
    
    // 设置速度滑块（如果存在）
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
        speedSlider.min = MAX_SPEED;
        speedSlider.max = MIN_SPEED;
        speedSlider.value = GAME_SPEED;
        speedSlider.addEventListener('input', (e) => {
            GAME_SPEED = parseInt(e.target.value);
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, GAME_SPEED);
            }
        });
    }
})();