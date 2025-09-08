// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const langZhButton = document.getElementById('lang-zh');
const langEnButton = document.getElementById('lang-en');
const backButton = document.getElementById('back-btn');

// 获取用户名和排行榜相关元素
const usernameInput = document.getElementById('username-input');
const saveUsernameButton = document.getElementById('save-username-btn');
const usernameLabel = document.getElementById('username-label');
const leaderboardTitle = document.getElementById('leaderboard-title');
const leaderboardList = document.getElementById('leaderboard-list');
const noRecordsElement = document.getElementById('no-records');

// 获取需要更新文本的元素
const gameTitle = document.getElementById('game-title');
const scoreLabel = document.getElementById('score-label');
const levelLabel = document.getElementById('level-label');
const linesLabel = document.getElementById('lines-label');
const startText = document.getElementById('start-text');
const pauseText = document.getElementById('pause-text');
const restartText = document.getElementById('restart-text');
const instructionsTitle = document.getElementById('instructions-title');
const instructionControls = document.getElementById('instruction-controls');
const instructionLeftRight = document.getElementById('instruction-left-right');
const instructionDown = document.getElementById('instruction-down');
const instructionUp = document.getElementById('instruction-up');
const backText = document.getElementById('back-btn');

// 初始化游戏
function initGame() {
    // 设置画布大小
    canvas.width = GRID_WIDTH * GRID_SIZE;
    canvas.height = GRID_HEIGHT * GRID_SIZE;
    
    // 初始化游戏板
    board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
    
    // 重置游戏状态
    score = 0;
    level = 1;
    lines = 0;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
    
    // 生成新方块
    generateNewShape();
    
    // 重置游戏状态
    isPaused = false;
    isGameOver = false;
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // 清除可能存在的游戏结束提示
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    // 绘制初始状态
    draw();
}

// 生成新方块
function generateNewShape() {
    currentShapeIndex = Math.floor(Math.random() * SHAPES.length);
    currentShape = SHAPES[currentShapeIndex];
    
    // 设置初始位置（居中，顶部）
    currentX = Math.floor((GRID_WIDTH - currentShape[0].length) / 2);
    currentY = 0;
    
    // 检查游戏是否结束（新方块无法放置）
    if (!isValidMove(0, 0)) {
        gameOver();
    }
}

// 检查移动是否有效
function isValidMove(offsetX, offsetY, newShape = currentShape) {
    for (let y = 0; y < newShape.length; y++) {
        for (let x = 0; x < newShape[y].length; x++) {
            if (newShape[y][x] === 0) continue;
            
            const newX = currentX + x + offsetX;
            const newY = currentY + y + offsetY;
            
            // 检查边界
            if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
                return false;
            }
            
            // 检查碰撞（只有在游戏区域内才检查）
            if (newY >= 0 && board[newY][newX] !== 0) {
                return false;
            }
        }
    }
    return true;
}

// 旋转方块
function rotateShape() {
    const newShape = [];
    for (let i = 0; i < currentShape[0].length; i++) {
        newShape.push([]);
        for (let j = currentShape.length - 1; j >= 0; j--) {
            newShape[i].push(currentShape[j][i]);
        }
    }
    
    if (isValidMove(0, 0, newShape)) {
        currentShape = newShape;
    }
}