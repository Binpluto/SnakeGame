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
    instructionsTitle.textContent = texts.instructions;
    instructionControls.textContent = texts.controlsGuide;
    instructionLeftRight.textContent = texts.leftRightGuide;
    instructionDown.textContent = texts.downGuide;
    instructionUp.textContent = texts.upGuide;
    
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
        const response = await fetch(`${API_URL}/tetris-leaderboard`);
        if (response.ok) {
            leaderboard = await response.json();
            renderLeaderboard();
        }
    } catch (error) {
        console.error('获取排行榜失败:', error);
    }
}