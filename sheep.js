// 羊了个羊游戏

// 游戏常量
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const CARD_WIDTH = 60;
const CARD_HEIGHT = 80;
const SLOT_COUNT = 7;
const MAX_LAYERS = 3;
const BLIND_STACK_SIZE = 8; // 盲牌堆叠数量
const API_URL = 'http://localhost:3000';

// 卡片类型（使用emoji表示不同的图案）
const CARD_TYPES = [
    '🐑', '🐄', '🐷', '🐶', '🐱', '🐰', '🐸', '🐯',
    '🦁', '🐻', '🐼', '🐨', '🐵', '🐔', '🐧', '🦆'
];

// 多语言支持
const LANGUAGES = {
    zh: {
        title: "羊了个羊",
        score: "得分: ",
        level: "关卡: ",
        moves: "剩余步数: ",
        start: "开始游戏",
        pause: "暂停",
        resume: "继续",
        restart: "重新开始",
        selectLevel: "选择关卡",
        hint: "提示",
        shuffle: "重排",
        gameOver: "游戏结束",
        levelComplete: "关卡完成",
        nextLevel: "下一关",
        allLevelsComplete: "恭喜通关所有关卡！",
        username: "用户名: ",
        saveUsername: "保存",
        usernamePlaceholder: "请输入用户名",
        leaderboard: "排行榜",
        noRecords: "暂无记录",
        rank: "排名",
        player: "玩家",
        instructions: "游戏说明",
        controlsGuide: "游戏规则:",
        rule1: "点击上层的图案卡片，将其移动到底部卡槽中",
        rule2: "当卡槽中有3个相同的图案时，它们会自动消除",
        rule3: "清除所有卡片即可过关，卡槽满了则游戏失败",
        rule4: "合理规划消除顺序，避免卡槽被无用卡片占满",
        rule5: "左右两边是盲牌堆叠，只能看到顶部卡片",
        touchGuide: "在移动设备上可直接点击卡片进行操作",
        backToMenu: "返回游戏选择",
        levelSelectorTitle: "选择关卡",
        close: "关闭"
    },
    en: {
        title: "Sheep Game",
        score: "Score: ",
        level: "Level: ",
        moves: "Moves: ",
        start: "Start Game",
        pause: "Pause",
        resume: "Resume",
        restart: "Restart",
        selectLevel: "Select Level",
        hint: "Hint",
        shuffle: "Shuffle",
        gameOver: "Game Over",
        levelComplete: "Level Complete",
        nextLevel: "Next Level",
        allLevelsComplete: "Congratulations! All levels completed!",
        username: "Username: ",
        saveUsername: "Save",
        usernamePlaceholder: "Enter username",
        leaderboard: "Leaderboard",
        noRecords: "No Records",
        rank: "Rank",
        player: "Player",
        instructions: "Instructions",
        controlsGuide: "Game Rules:",
        rule1: "Click on the top cards to move them to the bottom slots",
        rule2: "When 3 identical cards are in slots, they will be eliminated",
        rule3: "Clear all cards to pass the level, game over if slots are full",
        rule4: "Plan your moves wisely to avoid filling slots with unusable cards",
        rule5: "Left and right are blind card stacks, only top card is visible",
        touchGuide: "Tap cards directly on mobile devices",
        backToMenu: "Back to Menu",
        levelSelectorTitle: "Select Level",
        close: "Close"
    }
};

// 关卡配置
const LEVEL_CONFIG = {
    1: { cardCount: 24, types: 6, layers: 2, blindCards: 6 },
    2: { cardCount: 30, types: 8, layers: 2, blindCards: 8 },
    3: { cardCount: 36, types: 9, layers: 3, blindCards: 10 },
    4: { cardCount: 42, types: 10, layers: 3, blindCards: 12 },
    5: { cardCount: 48, types: 12, layers: 3, blindCards: 14 },
    6: { cardCount: 54, types: 14, layers: 3, blindCards: 16 },
    7: { cardCount: 60, types: 16, layers: 3, blindCards: 18 },
    8: { cardCount: 66, types: 18, layers: 3, blindCards: 20 },
    9: { cardCount: 72, types: 20, layers: 3, blindCards: 22 },
    10: { cardCount: 78, types: 22, layers: 3, blindCards: 24 }
};

// 游戏状态
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    level: 1,
    maxLevel: 10,
    cards: [],
    slots: [],
    leftBlindStack: [],
    rightBlindStack: [],
    selectedCard: null,
    hintCard: null
};

// 游戏数据
let cards = [];
let slots = [];
let selectedCard = null;
let gameInterval = null;
let animationId = null;

// DOM元素
let canvas, ctx;
let scoreElement, levelElement, movesElement;
let startButton, pauseButton, restartButton, hintButton, shuffleButton, backButton, selectLevelButton;
let gameTitle, scoreLabel, levelLabel, movesLabel;
let usernameInput, saveUsernameButton, usernameLabel;
let leaderboardTitle, leaderboardList, noRecordsElement;
let langZhButton, langEnButton;
let instructionsTitle, controlsGuide, rule1, rule2, rule3, rule4, rule5, touchGuide;
let startText, pauseText, restartText, hintText, shuffleText, backText;
let levelSelector, levelSelectorTitle, levelSelectorClose;

// 用户数据
let username = localStorage.getItem('sheepUsername') || '';
let leaderboard = [];
let currentLang = localStorage.getItem('sheepLanguage') || 'zh';

// 初始化游戏
function initGame() {
    canvas = document.getElementById('sheep-canvas');
    ctx = canvas.getContext('2d');
    
    // 获取DOM元素
    scoreElement = document.getElementById('score');
    levelElement = document.getElementById('level');
    movesElement = document.getElementById('moves');
    
    startButton = document.getElementById('start-btn');
    pauseButton = document.getElementById('pause-btn');
    restartButton = document.getElementById('restart-btn');
    hintButton = document.getElementById('hint-btn');
    shuffleButton = document.getElementById('shuffle-btn');
    backButton = document.getElementById('back-btn');
    selectLevelButton = document.getElementById('select-level-btn');
    
    gameTitle = document.getElementById('game-title');
    scoreLabel = document.getElementById('score-label');
    levelLabel = document.getElementById('level-label');
    movesLabel = document.getElementById('moves-label');
    
    usernameInput = document.getElementById('username-input');
    saveUsernameButton = document.getElementById('save-username');
    usernameLabel = document.getElementById('username-label');
    
    leaderboardTitle = document.getElementById('leaderboard-title');
    leaderboardList = document.getElementById('leaderboard-list');
    noRecordsElement = document.getElementById('no-records');
    
    langZhButton = document.getElementById('lang-zh');
    langEnButton = document.getElementById('lang-en');
    
    instructionsTitle = document.getElementById('instructions-title');
    controlsGuide = document.getElementById('controls-guide');
    rule1 = document.getElementById('rule-1');
    rule2 = document.getElementById('rule-2');
    rule3 = document.getElementById('rule-3');
    rule4 = document.getElementById('rule-4');
    rule5 = document.getElementById('rule-5');
    touchGuide = document.getElementById('touch-guide');
    
    levelSelector = document.getElementById('level-selector');
    levelSelectorTitle = document.getElementById('level-selector-title');
    levelSelectorClose = document.getElementById('level-selector-close');
    
    // 设置用户名
    if (username) {
        usernameInput.value = username;
    }
    
    // 初始化语言
    switchLanguage(currentLang);
    
    // 获取排行榜
    fetchLeaderboard();
    
    // 初始化游戏数据
    resetGame();
    
    // 绘制初始状态
    draw();
}

// 生成卡片
function generateCards() {
    const config = LEVEL_CONFIG[gameState.level];
    cards = [];
    const cardTypes = CARD_TYPES.slice(0, config.types);
    
    // 主游戏区域卡片
    const mainCards = config.cardCount;
    const cardsPerType = Math.floor(mainCards / cardTypes.length);
    
    // 确保每种类型的卡片数量是3的倍数
    for (let i = 0; i < cardTypes.length; i++) {
        const count = Math.max(3, Math.floor(cardsPerType / 3) * 3);
        
        for (let j = 0; j < count; j++) {
            cards.push({
                type: cardTypes[i],
                id: `main_${cardTypes[i]}_${j}`,
                x: 0,
                y: 0,
                layer: 0,
                visible: true,
                clickable: false,
                isBlind: false
            });
        }
    }
    
    // 生成盲牌
    const blindCards = config.blindCards;
    for (let i = 0; i < blindCards; i++) {
        const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        cards.push({
            type: randomType,
            id: `blind_${randomType}_${i}`,
            x: 0,
            y: 0,
            layer: 0,
            visible: false,
            clickable: false,
            isBlind: true
        });
    }
    
    // 打乱卡片顺序
    shuffleArray(cards);
    
    // 布局卡片
    layoutCards();
}

// 布局卡片
function layoutCards() {
    const config = LEVEL_CONFIG[gameState.level];
    const mainCards = cards.filter(card => !card.isBlind);
    const blindCards = cards.filter(card => card.isBlind);
    
    // 布局主游戏区域卡片
    layoutMainCards(mainCards, config);
    
    // 布局盲牌堆叠
    layoutBlindStacks(blindCards);
    
    updateClickableCards();
}

// 布局主游戏区域卡片
function layoutMainCards(mainCards, config) {
    const rows = Math.ceil(Math.sqrt(mainCards.length / config.layers));
    const cols = Math.ceil(mainCards.length / (rows * config.layers));
    const startX = 100;
    const startY = 50;
    const offsetX = CARD_WIDTH * 0.7;
    const offsetY = CARD_HEIGHT * 0.7;
    
    let cardIndex = 0;
    
    // 分层布局
    for (let layer = 0; layer < config.layers; layer++) {
        const layerOffsetX = layer * 8;
        const layerOffsetY = layer * 8;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cardIndex >= mainCards.length) break;
                
                const card = mainCards[cardIndex];
                card.x = startX + col * offsetX + layerOffsetX;
                card.y = startY + row * offsetY + layerOffsetY;
                card.layer = layer;
                
                cardIndex++;
            }
            if (cardIndex >= mainCards.length) break;
        }
        if (cardIndex >= mainCards.length) break;
    }
}

// 布局盲牌堆叠
function layoutBlindStacks(blindCards) {
    gameState.leftBlindStack = [];
    gameState.rightBlindStack = [];
    
    const leftStackX = 20;
    const rightStackX = CANVAS_WIDTH - CARD_WIDTH - 20;
    const stackY = 100;
    
    // 分配盲牌到左右堆叠
    for (let i = 0; i < blindCards.length; i++) {
        const card = blindCards[i];
        const isLeft = i % 2 === 0;
        
        if (isLeft) {
            card.x = leftStackX;
            card.y = stackY + gameState.leftBlindStack.length * 2;
            card.stackIndex = gameState.leftBlindStack.length;
            gameState.leftBlindStack.push(card);
        } else {
            card.x = rightStackX;
            card.y = stackY + gameState.rightBlindStack.length * 2;
            card.stackIndex = gameState.rightBlindStack.length;
            gameState.rightBlindStack.push(card);
        }
        
        card.layer = 0;
        card.visible = card.stackIndex === 0; // 只有顶部卡片可见
        card.clickable = card.stackIndex === 0; // 只有顶部卡片可点击
    }
}

// 更新可点击的卡片
function updateClickableCards() {
    // 重置所有卡片的可点击状态
    cards.forEach(card => {
        if (card.visible) {
            card.clickable = true;
        }
    });
    
    // 检查每张卡片是否被其他卡片遮挡
    for (let i = 0; i < cards.length; i++) {
        if (!cards[i].visible) continue;
        
        for (let j = 0; j < cards.length; j++) {
            if (i === j || !cards[j].visible) continue;
            
            // 如果卡片j在卡片i的上层且有重叠，则卡片i不可点击
            if (cards[j].layer > cards[i].layer && isOverlapping(cards[i], cards[j])) {
                cards[i].clickable = false;
                break;
            }
        }
    }
}

// 检查两张卡片是否重叠
function isOverlapping(card1, card2) {
    return !(card1.x + CARD_WIDTH < card2.x || 
             card2.x + CARD_WIDTH < card1.x || 
             card1.y + CARD_HEIGHT < card2.y || 
             card2.y + CARD_HEIGHT < card1.y);
}

// 打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 处理卡片点击
function handleCardClick(x, y) {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    // 找到被点击的最上层卡片
    let clickedCard = null;
    let maxLayer = -1;
    
    for (let card of cards) {
        if (card.visible && card.clickable && 
            x >= card.x && x <= card.x + CARD_WIDTH &&
            y >= card.y && y <= card.y + CARD_HEIGHT &&
            card.layer > maxLayer) {
            clickedCard = card;
            maxLayer = card.layer;
        }
    }
    
    if (clickedCard) {
        // 处理盲牌堆叠点击
        if (clickedCard.isBlind) {
            handleBlindCardClick(clickedCard);
        }
        
        moveCardToSlot(clickedCard);
    }
}

// 处理盲牌点击
function handleBlindCardClick(clickedCard) {
    let stack, stackName;
    
    // 确定是左堆还是右堆
    if (gameState.leftBlindStack.includes(clickedCard)) {
        stack = gameState.leftBlindStack;
        stackName = 'left';
    } else {
        stack = gameState.rightBlindStack;
        stackName = 'right';
    }
    
    // 移除顶部卡片
    if (stack.length > 0 && stack[0] === clickedCard) {
        stack.shift();
        
        // 更新剩余卡片的位置和可见性
        for (let i = 0; i < stack.length; i++) {
            const card = stack[i];
            card.stackIndex = i;
            card.visible = i === 0;
            card.clickable = i === 0;
            
            // 更新位置
            if (stackName === 'left') {
                card.y = 100 + i * 2;
            } else {
                card.y = 100 + i * 2;
            }
        }
    }
}

// 将卡片移动到卡槽
function moveCardToSlot(card) {
    // 找到空的卡槽
    let emptySlotIndex = -1;
    for (let i = 0; i < SLOT_COUNT; i++) {
        if (!slots[i]) {
            emptySlotIndex = i;
            break;
        }
    }
    
    if (emptySlotIndex === -1) {
        // 卡槽已满，游戏结束
        gameOver();
        return;
    }
    
    // 移动卡片到卡槽
    slots[emptySlotIndex] = card.type;
    card.visible = false;
    
    // 减少步数
    gameState.moves--;
    
    // 检查是否有三个相同的卡片
    checkForMatches();
    
    // 更新可点击的卡片
    updateClickableCards();
    
    // 检查游戏状态
    checkGameEnd();
    
    // 更新UI
    updateUI();
}

// 检查匹配
function checkForMatches() {
    const typeCount = {};
    const typePositions = {};
    
    // 统计每种类型的数量和位置
    for (let i = 0; i < SLOT_COUNT; i++) {
        if (slots[i]) {
            if (!typeCount[slots[i]]) {
                typeCount[slots[i]] = 0;
                typePositions[slots[i]] = [];
            }
            typeCount[slots[i]]++;
            typePositions[slots[i]].push(i);
        }
    }
    
    // 检查是否有三个相同的
    for (let type in typeCount) {
        if (typeCount[type] >= 3) {
            // 消除三个相同的卡片
            const positions = typePositions[type].slice(0, 3);
            positions.forEach(pos => {
                slots[pos] = null;
            });
            
            // 整理卡槽，将剩余卡片向前移动
            compactSlots();
            
            // 增加分数
            gameState.score += 100;
            
            break; // 一次只处理一种匹配
        }
    }
}

// 整理卡槽
function compactSlots() {
    const newSlots = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
        if (slots[i]) {
            newSlots.push(slots[i]);
        }
    }
    
    slots = new Array(SLOT_COUNT).fill(null);
    for (let i = 0; i < newSlots.length; i++) {
        slots[i] = newSlots[i];
    }
}

// 检查游戏结束
function checkGameEnd() {
    // 检查是否所有卡片都被清除
    const visibleCards = cards.filter(card => card.visible);
    if (visibleCards.length === 0) {
        levelComplete();
        return;
    }
    
    // 检查是否没有步数了
    if (gameState.moves <= 0) {
        gameOver();
        return;
    }
    
    // 检查卡槽是否已满
    const filledSlots = slots.filter(slot => slot !== null);
    if (filledSlots.length >= SLOT_COUNT) {
        gameOver();
        return;
    }
}

// 关卡完成
function levelComplete() {
    gameState.score += gameState.moves * 10; // 剩余步数奖励
    
    if (gameState.level >= 10) {
        alert(LANGUAGES[currentLang].allLevelsComplete);
        gameState.isRunning = false;
        gameState.isGameOver = true;
    } else {
        alert(LANGUAGES[currentLang].levelComplete);
        gameState.level++;
        gameState.moves = Math.max(20, 30 - gameState.level * 2);
        
        // 生成新关卡
        generateCards();
        slots = new Array(SLOT_COUNT).fill(null);
    }
    
    updateUI();
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    gameState.isGameOver = true;
    
    alert(LANGUAGES[currentLang].gameOver + ' ' + LANGUAGES[currentLang].score + gameState.score);
    
    // 更新排行榜
    if (username) {
        updateLeaderboard(gameState.score);
    }
    
    updateUI();
}

// 提示功能
function useHint() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const clickableCards = cards.filter(card => card.visible && card.clickable);
    if (clickableCards.length === 0) return;
    
    // 找到最佳的卡片（在卡槽中已有相同类型的）
    let bestCard = null;
    for (let card of clickableCards) {
        const sameTypeInSlots = slots.filter(slot => slot === card.type).length;
        if (sameTypeInSlots > 0) {
            bestCard = card;
            break;
        }
    }
    
    if (!bestCard) {
        bestCard = clickableCards[0];
    }
    
    // 高亮显示提示卡片
    selectedCard = bestCard;
    setTimeout(() => {
        selectedCard = null;
    }, 2000);
    
    gameState.hintsUsed++;
}

// 重排功能
function shuffleCards() {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const visibleCards = cards.filter(card => card.visible);
    const cardTypes = visibleCards.map(card => card.type);
    
    shuffleArray(cardTypes);
    
    let typeIndex = 0;
    for (let card of cards) {
        if (card.visible) {
            card.type = cardTypes[typeIndex++];
        }
    }
    
    gameState.shufflesUsed++;
}

// 重置游戏
function resetGame() {
    gameState = {
        isRunning: false,
        isPaused: false,
        isGameOver: false,
        score: 0,
        level: 1,
        moves: 30,
        hintsUsed: 0,
        shufflesUsed: 0,
        leftBlindStack: [],
        rightBlindStack: [],
        selectedCard: null,
        hintCard: null
    };
    
    slots = new Array(SLOT_COUNT).fill(null);
    selectedCard = null;
    
    generateCards();
    updateUI();
}

// 开始新关卡
function startLevel(level) {
    gameState.level = Math.min(level, gameState.maxLevel || 10);
    gameState.moves = Math.max(20, 30 - gameState.level * 2);
    generateCards();
    slots = new Array(SLOT_COUNT).fill(null);
    gameState.isRunning = true;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    updateUI();
    draw();
}

// 下一关
function nextLevel() {
    if (gameState.level < (gameState.maxLevel || 10)) {
        gameState.level++;
        startLevel(gameState.level);
    } else {
        // 游戏通关
        alert(currentLang === 'zh' ? '恭喜通关！' : 'Congratulations! You completed all levels!');
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制盲牌堆叠背景
    drawBlindStackBg();
    
    // 绘制卡片
    drawCards();
    
    // 绘制盲牌堆叠信息
    drawBlindStackInfo();
    
    // 绘制卡槽
    drawSlots();
    
    if (gameState.isRunning && !gameState.isGameOver) {
        animationId = requestAnimationFrame(draw);
    }
}

// 绘制盲牌堆叠背景
function drawBlindStackBg() {
    const leftStackX = 20;
    const rightStackX = CANVAS_WIDTH - CARD_WIDTH - 20;
    const stackY = 100;
    
    // 左侧盲牌堆叠背景
    ctx.fillStyle = 'rgba(233, 30, 99, 0.1)';
    ctx.fillRect(leftStackX - 5, stackY - 5, CARD_WIDTH + 10, CARD_HEIGHT + 20);
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 2;
    ctx.strokeRect(leftStackX - 5, stackY - 5, CARD_WIDTH + 10, CARD_HEIGHT + 20);
    
    // 右侧盲牌堆叠背景
    ctx.fillRect(rightStackX - 5, stackY - 5, CARD_WIDTH + 10, CARD_HEIGHT + 20);
    ctx.strokeRect(rightStackX - 5, stackY - 5, CARD_WIDTH + 10, CARD_HEIGHT + 20);
}

// 绘制盲牌堆叠信息
function drawBlindStackInfo() {
    ctx.fillStyle = '#e91e63';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    
    // 左侧堆叠数量
    const leftCount = gameState.leftBlindStack.length;
    if (leftCount > 0) {
        ctx.fillText(leftCount.toString(), 20 + CARD_WIDTH / 2, 95);
    }
    
    // 右侧堆叠数量
    const rightCount = gameState.rightBlindStack.length;
    if (rightCount > 0) {
        ctx.fillText(rightCount.toString(), CANVAS_WIDTH - CARD_WIDTH - 20 + CARD_WIDTH / 2, 95);
    }
}

// 绘制卡片
function drawCards() {
    // 按层级排序绘制
    const sortedCards = [...cards].sort((a, b) => a.layer - b.layer);
    
    for (let card of sortedCards) {
        if (!card.visible) continue;
        
        // 设置卡片样式
        if (card === selectedCard) {
            ctx.fillStyle = '#ffeb3b'; // 高亮颜色
        } else if (card.clickable) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#e0e0e0';
        }
        
        // 绘制卡片背景
        ctx.fillRect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
        
        // 绘制卡片边框
        ctx.strokeStyle = card.clickable ? '#333333' : '#999999';
        ctx.lineWidth = 2;
        ctx.strokeRect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
        
        // 绘制卡片图案
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(card.type, card.x + CARD_WIDTH / 2, card.y + CARD_HEIGHT / 2);
    }
}

// 绘制卡槽
function drawSlots() {
    const slotWidth = 80;
    const slotHeight = 100;
    const startX = (CANVAS_WIDTH - SLOT_COUNT * slotWidth) / 2;
    const startY = CANVAS_HEIGHT - slotHeight - 10;
    
    for (let i = 0; i < SLOT_COUNT; i++) {
        const x = startX + i * slotWidth;
        const y = startY;
        
        // 绘制卡槽背景
        ctx.fillStyle = slots[i] ? '#ffffff' : '#f5f5f5';
        ctx.fillRect(x, y, slotWidth - 5, slotHeight);
        
        // 绘制卡槽边框
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, slotWidth - 5, slotHeight);
        
        // 绘制卡槽中的卡片
        if (slots[i]) {
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(slots[i], x + (slotWidth - 5) / 2, y + slotHeight / 2);
        }
    }
}

// 开始游戏
function startGame() {
    if (gameState.isGameOver) {
        resetGame();
    }
    
    gameState.isRunning = true;
    gameState.isPaused = false;
    
    draw();
    updateUI();
}

// 暂停游戏
function pauseGame() {
    if (gameState.isRunning) {
        gameState.isPaused = !gameState.isPaused;
        if (!gameState.isPaused) {
            draw();
        }
        updateUI();
    }
}

// 重新开始游戏
function restartGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    resetGame();
    
    if (gameState.isRunning) {
        draw();
    }
    
    updateUI();
}

// 更新UI
function updateUI() {
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    movesElement.textContent = gameState.moves;
    
    // 更新按钮状态
    if (gameState.isRunning && !gameState.isGameOver) {
        startButton.textContent = LANGUAGES[currentLang].start;
        startButton.disabled = true;
        pauseButton.disabled = false;
        pauseButton.textContent = gameState.isPaused ? LANGUAGES[currentLang].resume : LANGUAGES[currentLang].pause;
    } else {
        startButton.textContent = LANGUAGES[currentLang].start;
        startButton.disabled = false;
        pauseButton.disabled = true;
        pauseButton.textContent = LANGUAGES[currentLang].pause;
    }
}

// 更新UI文本
function updateUIText() {
    const lang = LANGUAGES[currentLang];
    
    gameTitle.textContent = lang.title;
    scoreLabel.textContent = lang.score;
    levelLabel.textContent = lang.level;
    movesLabel.textContent = lang.moves;
    
    startButton.textContent = lang.start;
    pauseButton.textContent = lang.pause;
    restartButton.textContent = lang.restart;
    hintButton.textContent = lang.hint;
    shuffleButton.textContent = lang.shuffle;
    backButton.textContent = lang.backToMenu;
    if (selectLevelButton) selectLevelButton.textContent = lang.selectLevel;
    
    usernameLabel.textContent = lang.username;
    saveUsernameButton.textContent = lang.saveUsername;
    usernameInput.placeholder = lang.usernamePlaceholder;
    
    leaderboardTitle.textContent = lang.leaderboard;
    noRecordsElement.textContent = lang.noRecords;
    
    instructionsTitle.textContent = lang.instructions;
    controlsGuide.textContent = lang.controlsGuide;
    rule1.textContent = lang.rule1;
    rule2.textContent = lang.rule2;
    rule3.textContent = lang.rule3;
    rule4.textContent = lang.rule4;
    if (rule5) rule5.textContent = lang.rule5;
    touchGuide.textContent = lang.touchGuide;
    
    if (levelSelectorTitle) levelSelectorTitle.textContent = lang.levelSelectorTitle;
    if (levelSelectorClose) levelSelectorClose.textContent = lang.close;
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('sheepLanguage', lang);
    
    langZhButton.classList.toggle('active', lang === 'zh');
    langEnButton.classList.toggle('active', lang === 'en');
    
    updateUIText();
}

// 保存用户名
function saveUsername() {
    username = usernameInput.value.trim();
    localStorage.setItem('sheepUsername', username);
}

// 获取排行榜
async function fetchLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard/sheep`);
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
    if (!username) return;
    
    try {
        const response = await fetch(`${API_URL}/api/leaderboard/sheep`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, score })
        });
        
        if (response.ok) {
            fetchLeaderboard();
        }
    } catch (error) {
        console.error('更新排行榜失败:', error);
    }
}

// 渲染排行榜
function renderLeaderboard() {
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = `<div class="no-records">${LANGUAGES[currentLang].noRecords}</div>`;
        return;
    }
    
    const top10 = leaderboard.slice(0, 10);
    leaderboardList.innerHTML = top10.map((entry, index) => `
        <div class="leaderboard-entry">
            <span class="rank">${index + 1}</span>
            <span class="player">${entry.username}</span>
            <span class="score">${entry.score}</span>
        </div>
    `).join('');
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // 画布点击事件
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleCardClick(x, y);
    });
    
    // 按钮事件
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    restartButton.addEventListener('click', restartGame);
    hintButton.addEventListener('click', useHint);
    shuffleButton.addEventListener('click', shuffleCards);
    backButton.addEventListener('click', () => {
        window.location.href = 'hey-welcome/vielspass.html';
    });
    
    if (selectLevelButton) {
        selectLevelButton.addEventListener('click', showLevelSelector);
    }
    
    if (levelSelectorClose) {
        levelSelectorClose.addEventListener('click', hideLevelSelector);
    }
    
    // 关卡选择按钮事件
    for (let i = 1; i <= 10; i++) {
        const levelBtn = document.getElementById(`level-${i}`);
        if (levelBtn) {
            levelBtn.addEventListener('click', () => {
                selectLevel(i);
                hideLevelSelector();
            });
        }
    }
    
    // 用户名保存
    saveUsernameButton.addEventListener('click', saveUsername);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveUsername();
        }
    });
    
    // 语言切换
    langZhButton.addEventListener('click', () => switchLanguage('zh'));
    langEnButton.addEventListener('click', () => switchLanguage('en'));
    
    // 触摸控制事件监听
    const touchHintButton = document.getElementById('touch-hint');
    const touchShuffleButton = document.getElementById('touch-shuffle');
    
    if (touchHintButton) {
        touchHintButton.addEventListener('click', useHint);
    }
    
    if (touchShuffleButton) {
        touchShuffleButton.addEventListener('click', shuffleCards);
    }
    
    // 检测移动设备
    if (window.innerWidth <= 768) {
        const touchControls = document.querySelector('.touch-controls');
        if (touchControls) {
            touchControls.style.display = 'flex';
        }
    }
});

// 显示关卡选择界面
function showLevelSelector() {
    if (levelSelector) {
        levelSelector.style.display = 'flex';
    }
}

// 隐藏关卡选择界面
function hideLevelSelector() {
    if (levelSelector) {
        levelSelector.style.display = 'none';
    }
}

// 选择关卡
function selectLevel(level) {
    gameState.level = level;
    gameState.moves = Math.max(20, 30 - gameState.level * 2);
    gameState.score = 0;
    resetGame();
    startGame();
}