// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GRID_COUNT = 20; // 网格数量
let GAME_SPEED = 150; // 游戏速度（毫秒）
const MIN_SPEED = 300; // 最慢速度（毫秒）
const MAX_SPEED = 50; // 最快速度（毫秒）

// 语言配置
const LANGUAGES = {
    zh: {
        title: "贪吃蛇游戏",
        score: "得分: ",
        start: "开始游戏",
        pause: "暂停",
        resume: "继续",
        restart: "重新开始",
        speed: "游戏速度: ",
        instructions: "游戏说明",
        controlsGuide: "使用键盘方向键（↑ ↓ ← →）控制蛇的移动方向",
        foodGuide: "吃到食物可以增加得分和蛇的长度",
        collisionGuide: "撞到墙壁或自己的身体游戏结束",
        speedGuide: "使用速度滑块调整游戏速度（1最慢，10最快）",
        gameOver: "游戏结束",
        username: "用户名: ",
        saveUsername: "保存",
        usernamePlaceholder: "请输入用户名",
        leaderboard: "排行榜",
        noRecords: "暂无记录",
        yourScore: "你的得分",
        rank: "排名",
        player: "玩家"
    },
    en: {
        title: "Snake Game",
        score: "Score: ",
        start: "Start Game",
        pause: "Pause",
        resume: "Resume",
        restart: "Restart",
        speed: "Game Speed: ",
        instructions: "Instructions",
        controlsGuide: "Use arrow keys (↑ ↓ ← →) to control snake direction",
        foodGuide: "Eat food to increase score and snake length",
        collisionGuide: "Game ends if you hit the wall or your own body",
        speedGuide: "Use the speed slider to adjust game speed (1 slowest, 10 fastest)",
        gameOver: "Game Over",
        username: "Username: ",
        saveUsername: "Save",
        usernamePlaceholder: "Enter username",
        leaderboard: "Leaderboard",
        noRecords: "No records",
        yourScore: "Your Score",
        rank: "Rank",
        player: "Player"
    }
};

// 当前语言
let currentLang = 'zh';

// 方向常量
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 获取DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const langZhButton = document.getElementById('lang-zh');
const langEnButton = document.getElementById('lang-en');

// 获取触摸控制按钮
const touchUpButton = document.getElementById('touch-up');
const touchDownButton = document.getElementById('touch-down');
const touchLeftButton = document.getElementById('touch-left');
const touchRightButton = document.getElementById('touch-right');

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
const startText = document.getElementById('start-text');
const pauseText = document.getElementById('pause-text');
const restartText = document.getElementById('restart-text');
const speedLabel = document.getElementById('speed-label');
const instructionsTitle = document.getElementById('instructions-title');
const instructionControls = document.getElementById('instruction-controls');
const instructionFood = document.getElementById('instruction-food');
const instructionCollision = document.getElementById('instruction-collision');
const instructionSpeed = document.getElementById('instruction-speed');

// 游戏状态
let snake = [];
let food = {};
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let score = 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;

// 用户名和排行榜相关
let username = localStorage.getItem('snakeUsername') || '';
let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
const MAX_LEADERBOARD_ENTRIES = 10;

// 初始化页面
function initPage() {
    // 设置用户名输入框
    if (username) {
        usernameInput.value = username;
    }
    
    // 渲染排行榜
    renderLeaderboard();
}

// 初始化游戏
function initGame() {
    // 初始化蛇
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    
    // 初始化方向
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;
    
    // 初始化分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    isPaused = false;
    isGameOver = false;
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    speedSlider.disabled = false; // 启用速度控制
    
    // 清除可能存在的游戏结束提示
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    // 绘制初始状态
    draw();
}

// 开始游戏
function startGame() {
    if (isGameOver) {
        initGame();
    }
    
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        isPaused = false;
        startButton.disabled = true;
        pauseButton.disabled = false;
        pauseButton.textContent = '暂停';
        speedSlider.disabled = false; // 启用速度控制
    }
}

// 暂停游戏
function pauseGame() {
    if (gameInterval && !isGameOver) {
        if (isPaused) {
            // 恢复游戏
            gameInterval = setInterval(gameLoop, GAME_SPEED);
            isPaused = false;
            pauseText.textContent = LANGUAGES[currentLang].pause;
            speedSlider.disabled = false; // 启用速度控制
        } else {
            // 暂停游戏
            clearInterval(gameInterval);
            gameInterval = null;
            isPaused = true;
            pauseText.textContent = LANGUAGES[currentLang].resume;
            speedSlider.disabled = true; // 禁用速度控制
        }
    }
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    initGame();
}

// 游戏主循环
function gameLoop() {
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    // 获取蛇头
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    head.x += direction.x;
    head.y += direction.y;
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        return true;
    }
    
    // 检查是否撞到自己（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFood;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    food = newFood;
}

// 吃食物
function eatFood() {
    // 增加分数
    score += 10;
    scoreElement.textContent = score;
    
    // 生成新食物
    generateFood();
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    isGameOver = true;
    
    // 更新排行榜
    updateLeaderboard();
    
    // 更新按钮状态
    startButton.disabled = false;
    pauseButton.disabled = true;
    speedSlider.disabled = true; // 禁用速度控制
    
    // 显示游戏结束提示
    const gameOverElement = document.createElement('div');
    gameOverElement.className = 'game-over';
    gameOverElement.innerHTML = `
        <h2>${LANGUAGES[currentLang].gameOver}</h2>
        <p>${LANGUAGES[currentLang].score} ${score}</p>
        <p>${LANGUAGES[currentLang].start}</p>
    `;
    document.querySelector('.game-container').appendChild(gameOverElement);
    
    // 点击游戏结束提示可以重新开始游戏
    gameOverElement.addEventListener('click', () => {
        document.querySelector('.game-container').removeChild(gameOverElement);
        restartGame();
    });
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // 绘制蛇身内部
        ctx.fillStyle = '#81c784';
        ctx.fillRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4
        );
    }
    
    // 绘制蛇头
    const head = snake[0];
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(
        head.x * GRID_SIZE,
        head.y * GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE
    );
    
    // 绘制蛇头内部
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(
        head.x * GRID_SIZE + 2,
        head.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4
    );
    
    // 绘制蛇眼睛
    ctx.fillStyle = '#000';
    
    // 根据方向绘制眼睛
    if (direction === DIRECTIONS.RIGHT) {
        ctx.fillRect(head.x * GRID_SIZE + 12, head.y * GRID_SIZE + 6, 4, 4);
        ctx.fillRect(head.x * GRID_SIZE + 12, head.y * GRID_SIZE + 12, 4, 4);
    } else if (direction === DIRECTIONS.LEFT) {
        ctx.fillRect(head.x * GRID_SIZE + 4, head.y * GRID_SIZE + 6, 4, 4);
        ctx.fillRect(head.x * GRID_SIZE + 4, head.y * GRID_SIZE + 12, 4, 4);
    } else if (direction === DIRECTIONS.UP) {
        ctx.fillRect(head.x * GRID_SIZE + 6, head.y * GRID_SIZE + 4, 4, 4);
        ctx.fillRect(head.x * GRID_SIZE + 12, head.y * GRID_SIZE + 4, 4, 4);
    } else if (direction === DIRECTIONS.DOWN) {
        ctx.fillRect(head.x * GRID_SIZE + 6, head.y * GRID_SIZE + 12, 4, 4);
        ctx.fillRect(head.x * GRID_SIZE + 12, head.y * GRID_SIZE + 12, 4, 4);
    }
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制食物高光
    ctx.fillStyle = '#ffcdd2';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
        food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
        GRID_SIZE / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 处理键盘事件
function handleKeydown(event) {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // 只有在游戏运行时才处理方向键
    if (gameInterval && !isPaused && !isGameOver) {
        switch (event.keyCode) {
            case 38: // 上箭头
                if (direction !== DIRECTIONS.DOWN) {
                    nextDirection = DIRECTIONS.UP;
                }
                break;
            case 40: // 下箭头
                if (direction !== DIRECTIONS.UP) {
                    nextDirection = DIRECTIONS.DOWN;
                }
                break;
            case 37: // 左箭头
                if (direction !== DIRECTIONS.RIGHT) {
                    nextDirection = DIRECTIONS.LEFT;
                }
                break;
            case 39: // 右箭头
                if (direction !== DIRECTIONS.LEFT) {
                    nextDirection = DIRECTIONS.RIGHT;
                }
                break;
        }
    }
}

// 更新游戏速度
function updateGameSpeed() {
    // 获取滑块值（1-10）
    const speedLevel = parseInt(speedSlider.value);
    speedValue.textContent = speedLevel;
    
    // 计算实际游戏速度（毫秒）
    // 速度级别1对应最慢速度MIN_SPEED，级别10对应最快速度MAX_SPEED
    GAME_SPEED = MIN_SPEED - ((speedLevel - 1) * (MIN_SPEED - MAX_SPEED) / 9);
    
    // 如果游戏正在运行，重新设置游戏循环以应用新速度
    if (gameInterval && !isPaused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
}

// 切换语言
function switchLanguage(lang) {
    // 更新当前语言
    currentLang = lang;
    
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
    
    // 更新标题和得分
    document.title = texts.title;
    gameTitle.textContent = texts.title;
    scoreLabel.textContent = texts.score;
    
    // 更新按钮文本
    startText.textContent = texts.start;
    restartText.textContent = texts.restart;
    
    // 根据游戏状态更新暂停按钮文本
    pauseText.textContent = isPaused ? texts.resume : texts.pause;
    
    // 更新速度控制文本
    speedLabel.textContent = texts.speed;
    
    // 更新说明文本
    instructionsTitle.textContent = texts.instructions;
    instructionControls.textContent = texts.controlsGuide;
    instructionFood.textContent = texts.foodGuide;
    instructionCollision.textContent = texts.collisionGuide;
    instructionSpeed.textContent = texts.speedGuide;
    
    // 更新用户名和排行榜文本
    usernameLabel.textContent = texts.username;
    saveUsernameButton.textContent = texts.saveUsername;
    usernameInput.placeholder = texts.usernamePlaceholder;
    leaderboardTitle.textContent = texts.leaderboard;
    noRecordsElement.textContent = texts.noRecords;
    
    // 更新游戏结束提示（如果存在）
    const gameOverElement = document.querySelector('.game-over');
    if (gameOverElement) {
        gameOverElement.textContent = texts.gameOver;
    }
    
    // 重新渲染排行榜以更新语言
    renderLeaderboard();
}

// 处理触摸控制事件
function handleTouchControl(touchDirection) {
    // 只有在游戏运行时才处理方向
    if (gameInterval && !isPaused && !isGameOver) {
        switch (touchDirection) {
            case 'up':
                if (direction !== DIRECTIONS.DOWN) {
                    nextDirection = DIRECTIONS.UP;
                }
                break;
            case 'down':
                if (direction !== DIRECTIONS.UP) {
                    nextDirection = DIRECTIONS.DOWN;
                }
                break;
            case 'left':
                if (direction !== DIRECTIONS.RIGHT) {
                    nextDirection = DIRECTIONS.LEFT;
                }
                break;
            case 'right':
                if (direction !== DIRECTIONS.LEFT) {
                    nextDirection = DIRECTIONS.RIGHT;
                }
                break;
        }
    }
}

// 保存用户名
function saveUsername() {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        localStorage.setItem('snakeUsername', username);
        usernameInput.value = username;
    }
}

// 更新排行榜
function updateLeaderboard() {
    if (!username || score === 0) return;
    
    // 创建新的记录
    const newRecord = {
        username: username,
        score: score,
        date: new Date().toISOString()
    };
    
    // 添加到排行榜
    leaderboard.push(newRecord);
    
    // 按分数排序（从高到低）
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留前MAX_LEADERBOARD_ENTRIES条记录
    if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
        leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    }
    
    // 保存到本地存储
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    // 更新排行榜显示
    renderLeaderboard();
}

// 渲染排行榜
function renderLeaderboard() {
    // 清空排行榜
    while (leaderboardList.firstChild) {
        leaderboardList.removeChild(leaderboardList.firstChild);
    }
    
    // 如果没有记录，显示"暂无记录"
    if (leaderboard.length === 0) {
        noRecordsElement.style.display = 'block';
        return;
    }
    
    // 隐藏"暂无记录"
    noRecordsElement.style.display = 'none';
    
    // 添加排行榜项
    leaderboard.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        const rank = document.createElement('div');
        rank.className = 'leaderboard-rank';
        rank.textContent = `${index + 1}`;
        
        const user = document.createElement('div');
        user.className = 'leaderboard-username';
        user.textContent = record.username;
        
        const scoreElement = document.createElement('div');
        scoreElement.className = 'leaderboard-score';
        scoreElement.textContent = record.score;
        
        item.appendChild(rank);
        item.appendChild(user);
        item.appendChild(scoreElement);
        
        leaderboardList.appendChild(item);
    });
}

// 事件监听
document.addEventListener('keydown', handleKeydown);
speedSlider.addEventListener('input', updateGameSpeed);
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', restartGame);
langZhButton.addEventListener('click', () => switchLanguage('zh'));
langEnButton.addEventListener('click', () => switchLanguage('en'));
saveUsernameButton.addEventListener('click', saveUsername);

// 触摸控制事件监听
touchUpButton.addEventListener('click', () => handleTouchControl('up'));
touchDownButton.addEventListener('click', () => handleTouchControl('down'));
touchLeftButton.addEventListener('click', () => handleTouchControl('left'));
touchRightButton.addEventListener('click', () => handleTouchControl('right'));

// 初始化游戏
initGame();

// 初始化UI文本
updateUIText();
updateGameSpeed(); // 初始化游戏速度

// 初始化页面
initPage();