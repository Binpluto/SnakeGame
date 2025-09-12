// 蜘蛛纸牌游戏逻辑

// 游戏常量
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

// 多语言支持
const TEXTS = {
    zh: {
        title: '蜘蛛纸牌',
        score: '得分',
        moves: '移动次数',
        time: '时间',
        newGame: '新游戏',
        undo: '撤销',
        hint: '提示',
        deal: '发牌',
        backToGames: '返回游戏选择',
        difficulty: '难度',
        easy: '简单 (1花色)',
        medium: '中等 (2花色)',
        hard: '困难 (4花色)',
        congratulations: '恭喜！',
        gameComplete: '游戏完成！',
        finalScore: '最终得分',
        totalMoves: '总移动次数',
        totalTime: '总用时',
        playAgain: '再玩一次',
        instructions: '游戏说明',
        objective: '游戏目标',
        objectiveText: '将所有纸牌按花色从K到A的顺序排列，完成8个完整的序列。',
        rules: '游戏规则',
        rule1: '1. 只能将较小的牌放在较大的牌上面',
        rule2: '2. 可以移动连续的同花色牌组',
        rule3: '3. 空列可以放置任何牌',
        rule4: '4. 点击发牌按钮发放新的一轮牌',
        rule5: '5. 完成从K到A的同花色序列会自动移除',
        stockEmpty: '发牌堆已空',
        noMoves: '没有可用的移动',
        sequenceComplete: '完成序列！',
        cardsRemaining: '剩余牌数',
        saveRecord: '保存记录',
        saveRecordQuestion: '是否保存游戏记录？',
        enterUsername: '请输入用户名',
        yes: '是',
        no: '否',
        cancel: '取消',
        confirm: '确认'
    },
    en: {
        title: 'Spider Solitaire',
        score: 'Score',
        moves: 'Moves',
        time: 'Time',
        newGame: 'New Game',
        undo: 'Undo',
        hint: 'Hint',
        deal: 'Deal',
        backToGames: 'Back to Games',
        difficulty: 'Difficulty',
        easy: 'Easy (1 Suit)',
        medium: 'Medium (2 Suits)',
        hard: 'Hard (4 Suits)',
        congratulations: 'Congratulations!',
        gameComplete: 'Game Complete!',
        finalScore: 'Final Score',
        totalMoves: 'Total Moves',
        totalTime: 'Total Time',
        playAgain: 'Play Again',
        instructions: 'Instructions',
        objective: 'Objective',
        objectiveText: 'Arrange all cards in descending order from King to Ace by suit to complete 8 sequences.',
        rules: 'Rules',
        rule1: '1. Only place smaller cards on larger cards',
        rule2: '2. Move sequences of same-suit cards together',
        rule3: '3. Empty columns can hold any card',
        rule4: '4. Click Deal to distribute new cards',
        rule5: '5. Complete K-A sequences are automatically removed',
        stockEmpty: 'Stock is empty',
        noMoves: 'No available moves',
        sequenceComplete: 'Sequence complete!',
        cardsRemaining: 'Cards remaining',
        saveRecord: 'Save Record',
        saveRecordQuestion: 'Do you want to save your game record?',
        enterUsername: 'Please enter your username',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
        confirm: 'Confirm'
    }
};

// 游戏状态
let currentLanguage = 'zh';
let gameState = {
    tableau: Array(10).fill().map(() => []),
    foundations: Array(8).fill().map(() => []),
    stock: [],
    score: 500,
    moves: 0,
    startTime: null,
    gameTime: 0,
    difficulty: 'easy',
    completedSequences: 0,
    selectedCards: [],
    selectedColumn: -1,
    gameHistory: [],
    isGameComplete: false
};

// 游戏初始化
function initGame() {
    setupEventListeners();
    updateLanguage();
    newGame();
}

// 设置事件监听器
function setupEventListeners() {
    // 语言切换
    document.getElementById('lang-zh').addEventListener('click', () => switchLanguage('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
    
    // 控制按钮
    document.getElementById('new-game-btn').addEventListener('click', newGame);
    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('deal-btn').addEventListener('click', dealCards);
    document.getElementById('back-to-menu-btn').addEventListener('click', () => {
        window.location.href = 'hey-welcome/vielspass.html';
    });
    
    // 难度选择
    document.getElementById('difficulty-select').addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
        newGame();
    });
    
    // 弹窗按钮
    document.getElementById('play-again-btn').addEventListener('click', () => {
        document.getElementById('complete-modal').style.display = 'none';
        newGame();
    });
    
    // 全局触摸事件
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // 防止页面滚动干扰游戏
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.card') || e.target.closest('.tableau')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.card') || e.target.closest('.tableau')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// 语言切换
function switchLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    updateLanguage();
}

// 更新语言显示
function updateLanguage() {
    const texts = TEXTS[currentLanguage];
    
    // 安全更新元素文本
    const updateElement = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };
    
    updateElement('game-title', texts.title);
    updateElement('score-label', texts.score);
    updateElement('moves-label', texts.moves);
    updateElement('time-label', texts.time);
    updateElement('new-game-btn', texts.newGame);
    updateElement('undo-btn', texts.undo);
    updateElement('hint-btn', texts.hint);
    updateElement('deal-btn', texts.deal);
    updateElement('back-to-menu-btn', texts.backToGames);
    updateElement('difficulty-label', texts.difficulty);
    
    // 难度选项
    const difficultySelect = document.getElementById('difficulty-select');
    if (difficultySelect) {
        difficultySelect.innerHTML = `
            <option value="easy">${texts.easy}</option>
            <option value="medium">${texts.medium}</option>
            <option value="hard">${texts.hard}</option>
        `;
        difficultySelect.value = gameState.difficulty;
    }
    
    // 弹窗文本
    updateElement('complete-title', texts.congratulations);
    updateElement('complete-message', texts.gameComplete);
    updateElement('play-again-btn', texts.playAgain);
    
    // 游戏说明
    updateElement('instructions-title', texts.instructions);
    updateElement('objective-title', texts.objective);
    updateElement('objective-text', texts.objectiveText);
    updateElement('rules-title', texts.rules);
    updateElement('rule-1', texts.rule1);
    updateElement('rule-2', texts.rule2);
    updateElement('rule-3', texts.rule3);
    updateElement('rule-4', texts.rule4);
    updateElement('rule-5', texts.rule5);
}

// 创建新游戏
function newGame() {
    gameState = {
        tableau: Array(10).fill().map(() => []),
        foundations: Array(8).fill().map(() => []),
        stock: [],
        score: 500,
        moves: 0,
        startTime: Date.now(),
        gameTime: 0,
        difficulty: gameState.difficulty,
        completedSequences: 0,
        selectedCards: [],
        selectedColumn: -1,
        gameHistory: [],
        isGameComplete: false
    };
    
    createDeck();
    dealInitialCards();
    updateDisplay();
    startTimer();
}

// 创建牌组
function createDeck() {
    const deck = [];
    let suits = [];
    
    // 根据难度选择花色
    switch (gameState.difficulty) {
        case 'easy':
            suits = ['♠'];
            break;
        case 'medium':
            suits = ['♠', '♥'];
            break;
        case 'hard':
            suits = SUITS;
            break;
    }
    
    // 创建8副牌
    for (let i = 0; i < 8; i++) {
        for (const suit of suits) {
            for (const rank of RANKS) {
                deck.push({
                    suit: suit,
                    rank: rank,
                    value: RANK_VALUES[rank],
                    faceUp: false,
                    id: `${suit}-${rank}-${i}`
                });
            }
        }
    }
    
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    gameState.stock = deck;
}

// 发初始牌
function dealInitialCards() {
    // 前4列发6张牌，后6列发5张牌
    for (let col = 0; col < 10; col++) {
        const cardCount = col < 4 ? 6 : 5;
        for (let i = 0; i < cardCount; i++) {
            const card = gameState.stock.pop();
            if (i === cardCount - 1) {
                card.faceUp = true;
            }
            gameState.tableau[col].push(card);
        }
    }
}

// 发牌
function dealCards() {
    if (gameState.stock.length === 0) {
        alert(TEXTS[currentLanguage].stockEmpty);
        return;
    }
    
    // 检查是否所有列都有牌
    for (let col = 0; col < 10; col++) {
        if (gameState.tableau[col].length === 0) {
            alert('所有列必须有牌才能发牌');
            return;
        }
    }
    
    saveGameState();
    
    // 每列发一张牌
    for (let col = 0; col < 10; col++) {
        if (gameState.stock.length > 0) {
            const card = gameState.stock.pop();
            card.faceUp = true;
            gameState.tableau[col].push(card);
        }
    }
    
    gameState.moves++;
    updateDisplay();
    checkForAutoFlip();
}

// 保存游戏状态（用于撤销）
function saveGameState() {
    const state = {
        tableau: gameState.tableau.map(col => col.map(card => ({...card}))),
        foundations: gameState.foundations.map(foundation => foundation.map(card => ({...card}))),
        stock: gameState.stock.map(card => ({...card})),
        score: gameState.score,
        moves: gameState.moves,
        completedSequences: gameState.completedSequences
    };
    gameState.gameHistory.push(state);
    
    // 限制历史记录数量
    if (gameState.gameHistory.length > 20) {
        gameState.gameHistory.shift();
    }
}

// 撤销移动
function undoMove() {
    if (gameState.gameHistory.length === 0) return;
    
    const previousState = gameState.gameHistory.pop();
    gameState.tableau = previousState.tableau;
    gameState.foundations = previousState.foundations;
    gameState.stock = previousState.stock;
    gameState.score = previousState.score;
    gameState.moves = previousState.moves;
    gameState.completedSequences = previousState.completedSequences;
    
    clearSelection();
    updateDisplay();
}

// 显示提示
function showHint() {
    clearHints();
    
    // 查找可能的移动
    for (let fromCol = 0; fromCol < 10; fromCol++) {
        const column = gameState.tableau[fromCol];
        if (column.length === 0) continue;
        
        // 查找可移动的序列
        for (let cardIndex = 0; cardIndex < column.length; cardIndex++) {
            const card = column[cardIndex];
            if (!card.faceUp) continue;
            
            const sequence = getMovableSequence(fromCol, cardIndex);
            if (sequence.length === 0) continue;
            
            // 查找可以放置的位置
            for (let toCol = 0; toCol < 10; toCol++) {
                if (toCol === fromCol) continue;
                
                if (canPlaceSequence(sequence, toCol)) {
                    // 显示提示
                    sequence.forEach(card => {
                        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
                        if (cardElement) {
                            cardElement.classList.add('hint');
                        }
                    });
                    
                    const targetColumn = document.querySelector(`[data-column="${toCol}"]`);
                    if (targetColumn) {
                        targetColumn.classList.add('highlight');
                    }
                    
                    setTimeout(clearHints, 2000);
                    return;
                }
            }
        }
    }
    
    alert(TEXTS[currentLanguage].noMoves);
}

// 清除提示
function clearHints() {
    document.querySelectorAll('.card.hint').forEach(card => {
        card.classList.remove('hint');
    });
    document.querySelectorAll('.tableau.highlight').forEach(column => {
        column.classList.remove('highlight');
    });
}

// 获取可移动的序列
function getMovableSequence(columnIndex, startIndex) {
    const column = gameState.tableau[columnIndex];
    const sequence = [];
    
    for (let i = startIndex; i < column.length; i++) {
        const card = column[i];
        if (!card.faceUp) break;
        
        if (sequence.length === 0) {
            sequence.push(card);
        } else {
            const prevCard = sequence[sequence.length - 1];
            if (card.suit === prevCard.suit && card.value === prevCard.value - 1) {
                sequence.push(card);
            } else {
                break;
            }
        }
    }
    
    return sequence;
}

// 检查是否可以放置序列
function canPlaceSequence(sequence, columnIndex) {
    const targetColumn = gameState.tableau[columnIndex];
    
    if (targetColumn.length === 0) {
        return true; // 空列可以放任何牌
    }
    
    const topCard = targetColumn[targetColumn.length - 1];
    const firstCard = sequence[0];
    
    return topCard.faceUp && firstCard.value === topCard.value - 1;
}

// 触摸和拖拽状态
let touchState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    draggedCards: [],
    draggedColumn: -1,
    touchStartTime: 0
};

// 处理纸牌点击
function handleCardClick(cardElement, cardId) {
    const card = findCardById(cardId);
    if (!card || !card.faceUp) return;
    
    const columnIndex = findCardColumn(cardId);
    const cardIndex = gameState.tableau[columnIndex].indexOf(card);
    
    // 获取可移动的序列
    const sequence = getMovableSequence(columnIndex, cardIndex);
    if (sequence.length === 0) return;
    
    // 如果已经选中了牌
    if (gameState.selectedCards.length > 0) {
        if (gameState.selectedColumn === columnIndex && gameState.selectedCards.includes(card)) {
            // 取消选择
            clearSelection();
        } else {
            // 尝试移动到这一列
            if (canPlaceSequence(gameState.selectedCards, columnIndex)) {
                moveCards(gameState.selectedColumn, columnIndex, gameState.selectedCards);
            }
            clearSelection();
        }
    } else {
        // 选择新的序列
        gameState.selectedCards = sequence;
        gameState.selectedColumn = columnIndex;
        
        // 高亮显示选中的牌
        sequence.forEach(card => {
            const element = document.querySelector(`[data-card-id="${card.id}"]`);
            if (element) {
                element.classList.add('selected');
            }
        });
    }
}

// 处理触摸开始
function handleTouchStart(e, cardElement, cardId) {
    e.preventDefault();
    const touch = e.touches[0];
    
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.touchStartTime = Date.now();
    touchState.isDragging = false;
    
    const card = findCardById(cardId);
    if (!card || !card.faceUp) return;
    
    const columnIndex = findCardColumn(cardId);
    const cardIndex = gameState.tableau[columnIndex].indexOf(card);
    const sequence = getMovableSequence(columnIndex, cardIndex);
    
    if (sequence.length > 0) {
        touchState.draggedCards = sequence;
        touchState.draggedColumn = columnIndex;
        
        // 添加触摸反馈
        cardElement.classList.add('touch-active');
    }
}

// 处理触摸移动
function handleTouchMove(e) {
    if (touchState.draggedCards.length === 0) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchState.startX);
    const deltaY = Math.abs(touch.clientY - touchState.startY);
    
    // 如果移动距离超过阈值，开始拖拽
    if (!touchState.isDragging && (deltaX > 10 || deltaY > 10)) {
        touchState.isDragging = true;
        
        // 选中拖拽的牌
        gameState.selectedCards = touchState.draggedCards;
        gameState.selectedColumn = touchState.draggedColumn;
        
        touchState.draggedCards.forEach(card => {
            const element = document.querySelector(`[data-card-id="${card.id}"]`);
            if (element) {
                element.classList.add('selected', 'dragging');
            }
        });
    }
    
    if (touchState.isDragging) {
        // 高亮可放置的列
        highlightDropTargets(touch.clientX, touch.clientY);
    }
}

// 处理触摸结束
function handleTouchEnd(e, cardElement, cardId) {
    const touchDuration = Date.now() - touchState.touchStartTime;
    
    // 恢复卡片样式
    if (cardElement) {
        cardElement.classList.remove('touch-active');
    }
    
    if (touchState.isDragging) {
        // 拖拽结束，尝试放置
        const touch = e.changedTouches[0];
        const targetColumn = getColumnAtPosition(touch.clientX, touch.clientY);
        
        if (targetColumn !== -1 && canPlaceSequence(touchState.draggedCards, targetColumn)) {
            moveCards(touchState.draggedColumn, targetColumn, touchState.draggedCards);
        }
        
        clearSelection();
        clearDropTargets();
    } else if (touchDuration < 300) {
        // 短触摸，当作点击处理
        handleCardClick(cardElement, cardId);
    }
    
    // 重置触摸状态
    touchState = {
        isDragging: false,
        startX: 0,
        startY: 0,
        draggedCards: [],
        draggedColumn: -1,
        touchStartTime: 0
    };
}

// 高亮可放置的目标列
function highlightDropTargets(x, y) {
    clearDropTargets();
    
    for (let col = 0; col < 10; col++) {
        if (col !== touchState.draggedColumn && canPlaceSequence(touchState.draggedCards, col)) {
            const column = document.querySelector(`[data-column="${col}"]`);
            if (column) {
                column.classList.add('highlight');
            }
        }
    }
}

// 清除放置目标高亮
function clearDropTargets() {
    document.querySelectorAll('.tableau.highlight').forEach(column => {
        column.classList.remove('highlight');
    });
}

// 根据位置获取列索引
function getColumnAtPosition(x, y) {
    const columns = document.querySelectorAll('.tableau');
    for (let i = 0; i < columns.length; i++) {
        const rect = columns[i].getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return i;
        }
    }
    return -1;
}

// 处理列点击
function handleColumnClick(columnIndex) {
    if (gameState.selectedCards.length === 0) return;
    
    if (canPlaceSequence(gameState.selectedCards, columnIndex)) {
        moveCards(gameState.selectedColumn, columnIndex, gameState.selectedCards);
    }
    
    clearSelection();
}

// 移动纸牌
function moveCards(fromColumn, toColumn, cards) {
    if (fromColumn === toColumn) return;
    
    saveGameState();
    
    // 从原列移除牌
    const fromTableau = gameState.tableau[fromColumn];
    cards.forEach(card => {
        const index = fromTableau.indexOf(card);
        if (index !== -1) {
            fromTableau.splice(index, 1);
        }
    });
    
    // 添加到目标列
    gameState.tableau[toColumn].push(...cards);
    
    gameState.moves++;
    gameState.score = Math.max(0, gameState.score - 1);
    
    updateDisplay();
    checkForAutoFlip();
    checkForCompleteSequences();
    checkGameComplete();
}

// 清除选择
function clearSelection() {
    gameState.selectedCards = [];
    gameState.selectedColumn = -1;
    
    document.querySelectorAll('.card.selected').forEach(card => {
        card.classList.remove('selected');
    });
}

// 检查自动翻牌
function checkForAutoFlip() {
    let hasFlipped = false;
    
    for (let col = 0; col < 10; col++) {
        const column = gameState.tableau[col];
        if (column.length > 0) {
            const topCard = column[column.length - 1];
            if (!topCard.faceUp) {
                topCard.faceUp = true;
                hasFlipped = true;
                
                // 添加翻牌动画和音效
                setTimeout(() => {
                    const cardElement = document.querySelector(`[data-card-id="${topCard.id}"]`);
                    if (cardElement) {
                        // 播放翻牌音效
                        playFlipSound();
                        
                        // 添加翻牌动画
                        cardElement.classList.add('flipping');
                        
                        // 添加发光效果
                        cardElement.classList.add('card-glow');
                        
                        setTimeout(() => {
                            cardElement.classList.remove('flipping');
                            setTimeout(() => {
                                cardElement.classList.remove('card-glow');
                            }, 500);
                            updateDisplay();
                        }, 400);
                    }
                }, col * 100); // 错开动画时间
            }
        }
    }
    
    // 如果有翻牌，增加得分
    if (hasFlipped) {
        gameState.score += 5;
        updateGameStatus();
    }
}

// 检查完整序列
function checkForCompleteSequences() {
    for (let col = 0; col < 10; col++) {
        const column = gameState.tableau[col];
        if (column.length < 13) continue;
        
        // 检查最后13张牌是否形成完整序列
        const lastCards = column.slice(-13);
        if (isCompleteSequence(lastCards)) {
            // 移除完整序列
            gameState.tableau[col] = column.slice(0, -13);
            gameState.completedSequences++;
            gameState.score += 100;
            
            // 显示完成动画
            lastCards.forEach((card, index) => {
                setTimeout(() => {
                    const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
                    if (cardElement) {
                        cardElement.classList.add('completing');
                    }
                }, index * 50);
            });
            
            setTimeout(() => {
                updateDisplay();
                checkForAutoFlip(); // 检查是否需要翻转新暴露的牌
                alert(TEXTS[currentLanguage].sequenceComplete);
            }, 650);
            
            break; // 一次只处理一个序列
        }
    }
}

// 检查是否为完整序列
function isCompleteSequence(cards) {
    if (cards.length !== 13) return false;
    
    const suit = cards[0].suit;
    for (let i = 0; i < 13; i++) {
        const card = cards[i];
        if (!card.faceUp || card.suit !== suit || card.value !== 13 - i) {
            return false;
        }
    }
    
    return true;
}

// 检查游戏是否完成
function checkGameComplete() {
    if (gameState.completedSequences === 8) {
        gameState.isGameComplete = true;
        showCompleteModal();
    }
}

// 播放翻牌音效
function playFlipSound() {
    // 创建音频上下文播放翻牌音效
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // 静默处理音频错误
    }
}

// 播放完成音效
function playCompleteSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // 静默处理音频错误
    }
}

// 创建烟花特效
function createFireworks() {
    const container = document.querySelector('.spider-container');
    const fireworksContainer = document.createElement('div');
    fireworksContainer.className = 'fireworks-container';
    fireworksContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    
    container.appendChild(fireworksContainer);
    
    // 创建多个烟花
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createSingleFirework(fireworksContainer);
        }, i * 300);
    }
    
    // 5秒后移除烟花容器
    setTimeout(() => {
        if (fireworksContainer.parentNode) {
            fireworksContainer.parentNode.removeChild(fireworksContainer);
        }
    }, 5000);
}

// 创建单个烟花
function createSingleFirework(container) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
    const x = Math.random() * container.offsetWidth;
    const y = Math.random() * container.offsetHeight * 0.6 + container.offsetHeight * 0.2;
    
    // 创建烟花爆炸效果
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            box-shadow: 0 0 6px currentColor;
        `;
        
        container.appendChild(particle);
        
        // 粒子动画
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 50 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let posX = x;
        let posY = y;
        let opacity = 1;
        
        const animate = () => {
            posX += vx * 0.02;
            posY += vy * 0.02;
            opacity -= 0.02;
            
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// 显示完成弹窗
function showCompleteModal() {
    // 播放完成音效和烟花特效
    playCompleteSound();
    createFireworks();
    
    const texts = TEXTS[currentLanguage];
    
    // 延迟显示保存记录询问对话框，让烟花先播放
    setTimeout(() => {
        showSaveRecordDialog();
    }, 1000);
}

// 显示保存记录询问对话框
function showSaveRecordDialog() {
    const texts = TEXTS[currentLanguage];
    const result = confirm(texts.saveRecordQuestion);
    
    if (result) {
        // 用户选择保存记录，显示用户名输入对话框
        showUsernameDialog();
    } else {
        // 用户选择不保存，直接显示完成弹窗
        showFinalModal();
    }
}

// 显示用户名输入对话框
function showUsernameDialog() {
    const texts = TEXTS[currentLanguage];
    const username = prompt(texts.enterUsername);
    
    if (username && username.trim()) {
        // 保存游戏记录
        saveGameRecord(username.trim());
    }
    
    // 显示完成弹窗
    showFinalModal();
}

// 保存游戏记录
function saveGameRecord(username) {
    const gameRecord = {
        username: username,
        score: gameState.score,
        moves: gameState.moves,
        time: gameState.gameTime,
        difficulty: gameState.difficulty,
        date: new Date().toISOString()
    };
    
    // 获取现有记录
    let records = JSON.parse(localStorage.getItem('spiderSolitaireRecords') || '[]');
    
    // 添加新记录
    records.push(gameRecord);
    
    // 按得分排序（降序）
    records.sort((a, b) => b.score - a.score);
    
    // 只保留前10名
    records = records.slice(0, 10);
    
    // 保存到本地存储
    localStorage.setItem('spiderSolitaireRecords', JSON.stringify(records));
    
    console.log('游戏记录已保存:', gameRecord);
}

// 显示最终完成弹窗
function showFinalModal() {
    const modal = document.getElementById('game-complete-modal');
    const finalScore = document.getElementById('final-score');
    const totalMoves = document.getElementById('total-moves');
    const totalTime = document.getElementById('total-time');
    
    const texts = TEXTS[currentLanguage];
    if (finalScore) finalScore.textContent = gameState.score;
    if (totalMoves) totalMoves.textContent = gameState.moves;
    if (totalTime) totalTime.textContent = formatTime(gameState.gameTime);
    
    modal.style.display = 'flex';
}

// 查找纸牌
function findCardById(cardId) {
    for (let col = 0; col < 10; col++) {
        const card = gameState.tableau[col].find(c => c.id === cardId);
        if (card) return card;
    }
    return null;
}

// 查找纸牌所在列
function findCardColumn(cardId) {
    for (let col = 0; col < 10; col++) {
        if (gameState.tableau[col].find(c => c.id === cardId)) {
            return col;
        }
    }
    return -1;
}

// 开始计时器
function startTimer() {
    setInterval(() => {
        if (!gameState.isGameComplete && gameState.startTime) {
            gameState.gameTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateDisplay();
        }
    }, 1000);
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新显示
function updateDisplay() {
    updateGameStatus();
    updateTableau();
    updateStock();
}

// 更新游戏状态显示
function updateGameStatus() {
    document.getElementById('score-value').textContent = gameState.score;
    document.getElementById('moves-value').textContent = gameState.moves;
    document.getElementById('time-value').textContent = formatTime(gameState.gameTime);
    
    // 更新撤销按钮状态
    document.getElementById('undo-btn').disabled = gameState.gameHistory.length === 0;
    
    // 更新发牌按钮状态
    document.getElementById('deal-btn').disabled = gameState.stock.length === 0;
}

// 更新游戏区域显示
function updateTableau() {
    const tableauArea = document.querySelector('.tableau-area');
    tableauArea.innerHTML = '';
    
    for (let col = 0; col < 10; col++) {
        const column = document.createElement('div');
        column.className = 'tableau';
        column.dataset.column = col;
        
        // 添加点击事件
        column.addEventListener('click', () => handleColumnClick(col));
        
        const cards = gameState.tableau[col];
        cards.forEach((card, index) => {
            const cardElement = createCardElement(card, index * 20);
            column.appendChild(cardElement);
        });
        
        tableauArea.appendChild(column);
    }
}

// 创建纸牌元素
function createCardElement(card, topOffset) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.cardId = card.id;
    cardElement.style.top = `${topOffset}px`;
    
    if (card.faceUp) {
        cardElement.classList.add('face-up');
        cardElement.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        
        cardElement.innerHTML = `
            <div class="card-rank">${card.rank}</div>
            <div class="card-center">
                <div class="card-suit">${card.suit}</div>
            </div>
            <div class="card-rank" style="transform: rotate(180deg);">${card.rank}</div>
        `;
        
        // 添加点击事件
        cardElement.addEventListener('click', (e) => {
            e.stopPropagation();
            handleCardClick(cardElement, card.id);
        });
        
        // 添加触摸事件
        cardElement.addEventListener('touchstart', (e) => {
            handleTouchStart(e, cardElement, card.id);
        }, { passive: false });
        
        cardElement.addEventListener('touchend', (e) => {
            handleTouchEnd(e, cardElement, card.id);
        }, { passive: false });
    } else {
        cardElement.classList.add('face-down');
    }
    
    return cardElement;
}

// 更新发牌区域
function updateStock() {
    const stockCount = document.querySelector('.stock-count');
    stockCount.textContent = gameState.stock.length;
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);