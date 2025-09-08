// 更新排行榜
async function updateLeaderboard(score) {
    try {
        const response = await fetch(`${API_URL}/tetris-leaderboard`, {
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
langZhButton.addEventListener('click', () => switchLanguage('zh'));
langEnButton.addEventListener('click', () => switchLanguage('en'));
saveUsernameButton.addEventListener('click', saveUsername);
backButton.addEventListener('click', () => window.location.href = 'game-selector.html');

// 初始化
// 加载保存的语言设置
const savedLang = localStorage.getItem('tetrisLanguage');
if (savedLang) {
    currentLang = savedLang;
}

// 更新UI文本
updateUIText();

// 初始化页面和游戏
initPage();
initGame();

// 设置游戏速度滑块
const speedSlider = document.getElementById('speed-slider');
if (speedSlider) {
    speedSlider.min = MAX_SPEED;
    speedSlider.max = MIN_SPEED;
    speedSlider.value = GAME_SPEED;
    speedSlider.addEventListener('input', () => {
        GAME_SPEED = parseInt(speedSlider.value);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        }
    });
}