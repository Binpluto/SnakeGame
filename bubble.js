// 泡泡龙游戏 JavaScript

// 游戏常量
const BUBBLE_RADIUS = 20;
const BUBBLE_COLORS = ['#c0392b', '#16a085', '#27ae60', '#d68910', '#7d3c98', '#c0392b', '#d68910', '#2980b9'];
const ROWS = 12;
const COLS = 8;
const SHOOTER_Y = 550;
const BUBBLE_SPEED = 8;

// 音频系统
let audioContext = null;
let soundEnabled = true;

// 初始化音频上下文
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
        soundEnabled = false;
    }
}

// 播放碰撞音效
function playCollisionSound() {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音效参数 - 短促的碰撞声
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Error playing collision sound:', e);
    }
}

// 播放消除音效
function playPopSound() {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 设置音效参数 - 愉快的消除声
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
        console.log('Error playing pop sound:', e);
    }
}

// 多语言文本
const TEXTS = {
    zh: {
        score: '得分',
        level: '关卡',
        shots: '剩余发射',
        next: '下一个',
        newGame: '新游戏',
        pause: '暂停',
        help: '帮助',
        backToGames: '返回游戏选择',
        touchInstruction: '点击屏幕瞄准并发射泡泡',
        gameOver: '游戏结束',
        finalScore: '最终得分',
        finalLevel: '到达关卡',
        playAgain: '再玩一次',
        backToMenu: '返回菜单',
        gamePaused: '游戏暂停',
        resume: '继续游戏',
        restart: '重新开始',
        gameHelp: '游戏帮助',
        objective: '游戏目标',
        objectiveText: '发射泡泡，消除相同颜色的泡泡群（3个或以上），清除所有泡泡过关。',
        controls: '操作方法',
        control1: '点击屏幕瞄准发射方向',
        control2: '泡泡会沿直线飞行直到碰撞',
        control3: '消除3个或以上相同颜色的泡泡',
        control4: '悬空的泡泡会自动掉落',
        tips: '游戏技巧',
        tip1: '利用墙壁反弹到达难以直达的位置',
        tip2: '优先消除上方的泡泡群',
        tip3: '注意下一个泡泡的颜色，提前规划',
        close: '关闭',
        levelComplete: '关卡完成！',
        levelScore: '本关得分',
        bonus: '奖励分数',
        nextLevel: '下一关'
    },
    en: {
        score: 'Score',
        level: 'Level',
        shots: 'Shots Left',
        next: 'Next',
        newGame: 'New Game',
        pause: 'Pause',
        help: 'Help',
        backToGames: 'Back to Games',
        touchInstruction: 'Tap screen to aim and shoot bubbles',
        gameOver: 'Game Over',
        finalScore: 'Final Score',
        finalLevel: 'Level Reached',
        playAgain: 'Play Again',
        backToMenu: 'Back to Menu',
        gamePaused: 'Game Paused',
        resume: 'Resume',
        restart: 'Restart',
        gameHelp: 'Game Help',
        objective: 'Objective',
        objectiveText: 'Shoot bubbles to eliminate groups of 3 or more same-colored bubbles. Clear all bubbles to advance.',
        controls: 'Controls',
        control1: 'Tap screen to aim and shoot',
        control2: 'Bubbles fly straight until collision',
        control3: 'Eliminate 3+ same-colored bubbles',
        control4: 'Hanging bubbles will fall automatically',
        tips: 'Tips',
        tip1: 'Use wall bounces to reach difficult spots',
        tip2: 'Prioritize eliminating upper bubble groups',
        tip3: 'Plan ahead using next bubble color',
        close: 'Close',
        levelComplete: 'Level Complete!',
        levelScore: 'Level Score',
        bonus: 'Bonus Score',
        nextLevel: 'Next Level'
    }
};

// 游戏状态
let currentLanguage = 'zh';
let gameState = {
    canvas: null,
    ctx: null,
    bubbles: [],
    shooter: { x: 200, y: SHOOTER_Y, angle: 0 },
    currentBubble: null,
    nextBubble: null,
    shootingBubble: null,
    score: 0,
    level: 1,
    shots: 0,
    maxShots: 0,
    isPaused: false,
    isGameOver: false,
    animationId: null,
    mouseX: 0,
    mouseY: 0,
    isAiming: false
};

// 触摸状态
let touchState = {
    isTouch: false,
    startX: 0,
    startY: 0
};

// 初始化游戏
function initGame() {
    gameState.canvas = document.getElementById('gameCanvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // 初始化音频系统
    initAudio();
    
    // 设置画布尺寸
    resizeCanvas();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始化游戏数据
    newGame();
    
    // 开始游戏循环
    gameLoop();
}

// 调整画布大小
function resizeCanvas() {
    const container = gameState.canvas.parentElement;
    const containerWidth = container.clientWidth - 30; // 减去padding
    const aspectRatio = 400 / 600;
    
    if (containerWidth < 400) {
        gameState.canvas.width = containerWidth;
        gameState.canvas.height = containerWidth / aspectRatio;
    } else {
        gameState.canvas.width = 400;
        gameState.canvas.height = 600;
    }
    
    // 更新射手位置
    gameState.shooter.x = gameState.canvas.width / 2;
    gameState.shooter.y = gameState.canvas.height - 50;
}

// 设置事件监听器
function setupEventListeners() {
    // 鼠标事件
    gameState.canvas.addEventListener('mousemove', handleMouseMove);
    gameState.canvas.addEventListener('click', handleClick);
    
    // 触摸事件
    gameState.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameState.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameState.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // 按钮事件
    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('backBtn').addEventListener('click', () => window.location.href = 'index.html');
    
    // 弹窗按钮事件
    document.getElementById('playAgainBtn').addEventListener('click', newGame);
    document.getElementById('backToMenuBtn').addEventListener('click', () => window.location.href = 'index.html');
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', () => { hideModal('pauseModal'); newGame(); });
    document.getElementById('closeHelpBtn').addEventListener('click', () => hideModal('helpModal'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    
    // 窗口大小变化
    window.addEventListener('resize', resizeCanvas);
}

// 鼠标移动处理
function handleMouseMove(e) {
    if (gameState.isPaused || gameState.isGameOver || gameState.shootingBubble) return;
    
    const rect = gameState.canvas.getBoundingClientRect();
    gameState.mouseX = e.clientX - rect.left;
    gameState.mouseY = e.clientY - rect.top;
    
    updateAim();
}

// 点击处理
function handleClick(e) {
    if (gameState.isPaused || gameState.isGameOver || gameState.shootingBubble) return;
    
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    shootBubble(x, y);
}

// 触摸开始
function handleTouchStart(e) {
    e.preventDefault();
    if (gameState.isPaused || gameState.isGameOver || gameState.shootingBubble) return;
    
    touchState.isTouch = true;
    const touch = e.touches[0];
    const rect = gameState.canvas.getBoundingClientRect();
    
    touchState.startX = touch.clientX - rect.left;
    touchState.startY = touch.clientY - rect.top;
    
    gameState.mouseX = touchState.startX;
    gameState.mouseY = touchState.startY;
    gameState.isAiming = true;
    
    updateAim();
    
    // 触觉反馈
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

// 触摸移动
function handleTouchMove(e) {
    e.preventDefault();
    if (!touchState.isTouch || gameState.isPaused || gameState.isGameOver) return;
    
    const touch = e.touches[0];
    const rect = gameState.canvas.getBoundingClientRect();
    
    gameState.mouseX = touch.clientX - rect.left;
    gameState.mouseY = touch.clientY - rect.top;
    
    updateAim();
}

// 触摸结束
function handleTouchEnd(e) {
    e.preventDefault();
    if (!touchState.isTouch || gameState.isPaused || gameState.isGameOver || gameState.shootingBubble) return;
    
    touchState.isTouch = false;
    gameState.isAiming = false;
    
    shootBubble(gameState.mouseX, gameState.mouseY);
    
    // 触觉反馈
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// 更新瞄准
function updateAim() {
    const dx = gameState.mouseX - gameState.shooter.x;
    const dy = gameState.mouseY - gameState.shooter.y;
    gameState.shooter.angle = Math.atan2(dy, dx);
    
    // 限制角度范围
    const minAngle = -Math.PI * 0.8;
    const maxAngle = -Math.PI * 0.2;
    gameState.shooter.angle = Math.max(minAngle, Math.min(maxAngle, gameState.shooter.angle));
}

// 发射泡泡
function shootBubble(targetX, targetY) {
    if (!gameState.currentBubble || gameState.shootingBubble) return;
    
    const dx = targetX - gameState.shooter.x;
    const dy = targetY - gameState.shooter.y;
    const angle = Math.atan2(dy, dx);
    
    // 限制发射角度
    const minAngle = -Math.PI * 0.8;
    const maxAngle = -Math.PI * 0.2;
    const clampedAngle = Math.max(minAngle, Math.min(maxAngle, angle));
    
    gameState.shootingBubble = {
        x: gameState.shooter.x,
        y: gameState.shooter.y,
        vx: Math.cos(clampedAngle) * BUBBLE_SPEED,
        vy: Math.sin(clampedAngle) * BUBBLE_SPEED,
        color: gameState.currentBubble.color,
        radius: BUBBLE_RADIUS
    };
    
    // 更新当前和下一个泡泡
    gameState.currentBubble = gameState.nextBubble;
    gameState.nextBubble = createRandomBubble();
    
    updateNextBubbleDisplay();
    
    // 减少发射次数
    if (gameState.maxShots > 0) {
        gameState.shots--;
        updateDisplay();
    }
}

// 创建随机泡泡
function createRandomBubble() {
    const availableColors = getAvailableColors();
    const color = availableColors[Math.floor(Math.random() * availableColors.length)];
    return { color: color };
}

// 获取可用颜色
function getAvailableColors() {
    const colors = new Set();
    for (let row = 0; row < gameState.bubbles.length; row++) {
        for (let col = 0; col < gameState.bubbles[row].length; col++) {
            if (gameState.bubbles[row][col]) {
                colors.add(gameState.bubbles[row][col].color);
            }
        }
    }
    
    // 如果没有泡泡了，返回所有颜色
    if (colors.size === 0) {
        return BUBBLE_COLORS.slice(0, Math.min(4 + gameState.level, BUBBLE_COLORS.length));
    }
    
    return Array.from(colors);
}

// 新游戏
function newGame() {
    hideAllModals();
    
    gameState.score = 0;
    gameState.level = 1;
    gameState.shots = 0;
    gameState.maxShots = 0;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    gameState.shootingBubble = null;
    
    initLevel();
    updateDisplay();
}

// 初始化关卡
function initLevel() {
    // 创建泡泡网格
    gameState.bubbles = [];
    for (let row = 0; row < ROWS; row++) {
        gameState.bubbles[row] = [];
        for (let col = 0; col < COLS; col++) {
            gameState.bubbles[row][col] = null;
        }
    }
    
    // 生成初始泡泡
    const initialRows = Math.min(5 + Math.floor(gameState.level / 3), 8);
    const colorCount = Math.min(3 + Math.floor(gameState.level / 2), BUBBLE_COLORS.length);
    
    for (let row = 0; row < initialRows; row++) {
        for (let col = 0; col < COLS; col++) {
            if (Math.random() < 0.8) {
                gameState.bubbles[row][col] = {
                    color: BUBBLE_COLORS[Math.floor(Math.random() * colorCount)],
                    x: getBubbleX(col, row),
                    y: getBubbleY(row)
                };
            }
        }
    }
    
    // 初始化射手泡泡
    gameState.currentBubble = createRandomBubble();
    gameState.nextBubble = createRandomBubble();
    
    updateNextBubbleDisplay();
}

// 获取泡泡X坐标
function getBubbleX(col, row) {
    const offsetX = (row % 2) * BUBBLE_RADIUS;
    return col * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + offsetX;
}

// 获取泡泡Y坐标
function getBubbleY(row) {
    return row * BUBBLE_RADIUS * 1.7 + BUBBLE_RADIUS;
}

// 游戏循环
function gameLoop() {
    if (!gameState.isPaused && !gameState.isGameOver) {
        update();
    }
    render();
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 更新游戏状态
function update() {
    if (gameState.shootingBubble) {
        updateShootingBubble();
    }
}

// 更新发射中的泡泡
function updateShootingBubble() {
    const bubble = gameState.shootingBubble;
    
    // 更新位置
    bubble.x += bubble.vx;
    bubble.y += bubble.vy;
    
    // 墙壁反弹
    if (bubble.x - bubble.radius <= 0 || bubble.x + bubble.radius >= gameState.canvas.width) {
        bubble.vx = -bubble.vx;
        bubble.x = Math.max(bubble.radius, Math.min(gameState.canvas.width - bubble.radius, bubble.x));
    }
    
    // 检查碰撞
    const collision = checkCollision(bubble);
    if (collision || bubble.y - bubble.radius <= 0) {
        // 播放碰撞音效
        playCollisionSound();
        
        attachBubble(bubble);
        gameState.shootingBubble = null;
        
        // 检查消除
        setTimeout(() => {
            checkMatches();
            checkGameState();
        }, 100);
    }
}

// 检查碰撞
function checkCollision(shootingBubble) {
    for (let row = 0; row < gameState.bubbles.length; row++) {
        for (let col = 0; col < gameState.bubbles[row].length; col++) {
            const bubble = gameState.bubbles[row][col];
            if (bubble) {
                const dx = shootingBubble.x - bubble.x;
                const dy = shootingBubble.y - bubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < BUBBLE_RADIUS * 2) {
                    return { row, col };
                }
            }
        }
    }
    return null;
}

// 附加泡泡到网格
function attachBubble(shootingBubble) {
    let targetRow = Math.floor((shootingBubble.y - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 1.7));
    let targetCol = Math.floor((shootingBubble.x - BUBBLE_RADIUS) / (BUBBLE_RADIUS * 2));
    
    // 调整奇偶行的偏移
    if (targetRow % 2 === 1) {
        targetCol = Math.floor((shootingBubble.x - BUBBLE_RADIUS * 2) / (BUBBLE_RADIUS * 2));
    }
    
    // 确保在有效范围内
    targetRow = Math.max(0, Math.min(ROWS - 1, targetRow));
    targetCol = Math.max(0, Math.min(COLS - 1, targetCol));
    
    // 找到最近的空位置
    const position = findNearestEmptyPosition(targetRow, targetCol);
    if (position) {
        gameState.bubbles[position.row][position.col] = {
            color: shootingBubble.color,
            x: getBubbleX(position.col, position.row),
            y: getBubbleY(position.row)
        };
    }
}

// 找到最近的空位置
function findNearestEmptyPosition(startRow, startCol) {
    const queue = [{ row: startRow, col: startCol, distance: 0 }];
    const visited = new Set();
    
    while (queue.length > 0) {
        const { row, col, distance } = queue.shift();
        const key = `${row},${col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && !gameState.bubbles[row][col]) {
            return { row, col };
        }
        
        // 添加相邻位置
        const neighbors = getNeighbors(row, col);
        for (const neighbor of neighbors) {
            if (!visited.has(`${neighbor.row},${neighbor.col}`)) {
                queue.push({ ...neighbor, distance: distance + 1 });
            }
        }
    }
    
    return null;
}

// 获取相邻位置
function getNeighbors(row, col) {
    const neighbors = [];
    const isOddRow = row % 2 === 1;
    
    // 六边形相邻位置
    const offsets = isOddRow ? 
        [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]] :
        [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
    
    for (const [dr, dc] of offsets) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    
    return neighbors;
}

// 检查匹配
function checkMatches() {
    const toRemove = new Set();
    const visited = new Set();
    
    // 查找所有连接的同色泡泡群
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const bubble = gameState.bubbles[row][col];
            if (bubble && !visited.has(`${row},${col}`)) {
                const group = findConnectedGroup(row, col, bubble.color, visited);
                if (group.length >= 3) {
                    group.forEach(pos => toRemove.add(pos));
                }
            }
        }
    }
    
    // 移除匹配的泡泡
    if (toRemove.size > 0) {
        // 播放消除音效
        playPopSound();
        
        removeBubbles(toRemove);
        
        // 移除悬空的泡泡
        removeFloatingBubbles();
        
        // 更新分数
        const points = toRemove.size * 10 * gameState.level;
        gameState.score += points;
        updateDisplay();
    }
}

// 查找连接的同色泡泡群
function findConnectedGroup(startRow, startCol, color, globalVisited) {
    const group = [];
    const queue = [{ row: startRow, col: startCol }];
    const localVisited = new Set();
    
    while (queue.length > 0) {
        const { row, col } = queue.shift();
        const key = `${row},${col}`;
        
        if (localVisited.has(key) || globalVisited.has(key)) continue;
        
        const bubble = gameState.bubbles[row][col];
        if (!bubble || bubble.color !== color) continue;
        
        localVisited.add(key);
        globalVisited.add(key);
        group.push(key);
        
        // 添加相邻的同色泡泡
        const neighbors = getNeighbors(row, col);
        for (const neighbor of neighbors) {
            queue.push(neighbor);
        }
    }
    
    return group;
}

// 移除泡泡
function removeBubbles(toRemove) {
    toRemove.forEach(key => {
        const [row, col] = key.split(',').map(Number);
        gameState.bubbles[row][col] = null;
    });
}

// 移除悬空的泡泡
function removeFloatingBubbles() {
    const connected = new Set();
    
    // 从顶行开始标记所有连接的泡泡
    for (let col = 0; col < COLS; col++) {
        if (gameState.bubbles[0][col]) {
            markConnected(0, col, connected);
        }
    }
    
    // 移除未连接的泡泡
    let removed = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameState.bubbles[row][col] && !connected.has(`${row},${col}`)) {
                gameState.bubbles[row][col] = null;
                removed++;
            }
        }
    }
    
    // 悬空泡泡也给分数
    if (removed > 0) {
        gameState.score += removed * 5 * gameState.level;
        updateDisplay();
    }
}

// 标记连接的泡泡
function markConnected(row, col, connected) {
    const key = `${row},${col}`;
    if (connected.has(key) || !gameState.bubbles[row][col]) return;
    
    connected.add(key);
    
    const neighbors = getNeighbors(row, col);
    for (const neighbor of neighbors) {
        markConnected(neighbor.row, neighbor.col, connected);
    }
}

// 检查游戏状态
function checkGameState() {
    // 检查是否清空所有泡泡
    let hasBubbles = false;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameState.bubbles[row][col]) {
                hasBubbles = true;
                break;
            }
        }
        if (hasBubbles) break;
    }
    
    if (!hasBubbles) {
        // 关卡完成
        levelComplete();
        return;
    }
    
    // 检查是否有泡泡到达底部
    for (let col = 0; col < COLS; col++) {
        if (gameState.bubbles[ROWS - 1][col]) {
            gameOver();
            return;
        }
    }
    
    // 检查发射次数
    if (gameState.maxShots > 0 && gameState.shots <= 0) {
        gameOver();
        return;
    }
}

// 关卡完成
function levelComplete() {
    const levelScore = gameState.score;
    const bonus = gameState.level * 100;
    gameState.score += bonus;
    
    document.getElementById('levelScore').textContent = levelScore;
    document.getElementById('bonusScore').textContent = bonus;
    
    showModal('levelCompleteModal');
    updateDisplay();
}

// 下一关
function nextLevel() {
    hideModal('levelCompleteModal');
    gameState.level++;
    initLevel();
    updateDisplay();
}

// 游戏结束
function gameOver() {
    gameState.isGameOver = true;
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    
    showModal('gameOverModal');
}

// 渲染游戏
function render() {
    const ctx = gameState.ctx;
    
    // 清空画布
    ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 绘制背景
    drawBackground();
    
    // 绘制泡泡网格
    drawBubbles();
    
    // 绘制射手
    drawShooter();
    
    // 绘制发射中的泡泡
    if (gameState.shootingBubble) {
        drawBubble(gameState.shootingBubble.x, gameState.shootingBubble.y, gameState.shootingBubble.color);
    }
    
    // 绘制瞄准线
    if ((gameState.isAiming || !touchState.isTouch) && !gameState.shootingBubble) {
        drawAimLine();
    }
}

// 绘制背景
function drawBackground() {
    const ctx = gameState.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, gameState.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F6FF');
    gradient.addColorStop(1, '#F0F8FF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
}

// 绘制泡泡
function drawBubbles() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const bubble = gameState.bubbles[row][col];
            if (bubble) {
                drawBubble(bubble.x, bubble.y, bubble.color);
            }
        }
    }
}

// 绘制单个泡泡
function drawBubble(x, y, color) {
    const ctx = gameState.ctx;
    
    // 主体
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 高光效果
    const gradient = ctx.createRadialGradient(x - 6, y - 6, 0, x - 6, y - 6, BUBBLE_RADIUS);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

// 绘制射手
function drawShooter() {
    const ctx = gameState.ctx;
    
    // 射手底座
    ctx.beginPath();
    ctx.arc(gameState.shooter.x, gameState.shooter.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 当前泡泡
    if (gameState.currentBubble) {
        drawBubble(gameState.shooter.x, gameState.shooter.y, gameState.currentBubble.color);
    }
}

// 绘制瞄准线
function drawAimLine() {
    if (!gameState.currentBubble) return;
    
    const ctx = gameState.ctx;
    const startX = gameState.shooter.x;
    const startY = gameState.shooter.y;
    
    // 计算瞄准方向
    const dx = gameState.mouseX - startX;
    const dy = gameState.mouseY - startY;
    const angle = Math.atan2(dy, dx);
    
    // 限制角度
    const minAngle = -Math.PI * 0.8;
    const maxAngle = -Math.PI * 0.2;
    const clampedAngle = Math.max(minAngle, Math.min(maxAngle, angle));
    
    // 绘制瞄准线
    const length = 100;
    const endX = startX + Math.cos(clampedAngle) * length;
    const endY = startY + Math.sin(clampedAngle) * length;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
}

// 更新显示
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('shots').textContent = gameState.maxShots > 0 ? gameState.shots : '∞';
}

// 更新下一个泡泡显示
function updateNextBubbleDisplay() {
    const nextBubbleElement = document.getElementById('nextBubble');
    if (gameState.nextBubble) {
        nextBubbleElement.style.background = gameState.nextBubble.color;
    }
}

// 切换暂停
function togglePause() {
    if (gameState.isGameOver) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        showModal('pauseModal');
    } else {
        hideModal('pauseModal');
    }
}

// 显示帮助
function showHelp() {
    showModal('helpModal');
}

// 显示弹窗
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

// 隐藏弹窗
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// 隐藏所有弹窗
function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
}

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    updateLanguage();
    
    // 更新按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

// 更新语言
function updateLanguage() {
    const texts = TEXTS[currentLanguage];
    
    document.querySelectorAll('[data-text]').forEach(element => {
        const key = element.getAttribute('data-text');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    initGame();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
});