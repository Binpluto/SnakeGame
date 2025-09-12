// 数独游戏类
class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.mistakes = 0;
        this.maxMistakes = Infinity;
        this.hints = 3;
        this.timer = 0;
        this.timerInterval = null;
        this.isPaused = false;
        this.isGameComplete = false;
        this.difficulty = 'easy';
        this.username = localStorage.getItem('sudoku-username') || '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadLanguage();
        this.loadUsername();
        this.generateNewGame();
    }
    
    initializeElements() {
        this.gridElement = document.getElementById('sudoku-grid');
        this.timeElement = document.getElementById('time');
        this.mistakesElement = document.getElementById('mistakes');
        this.hintsElement = document.getElementById('hints');
        this.difficultyElement = document.getElementById('difficulty');
        
        // 创建9x9网格
        this.createGrid();
    }
    
    createGrid() {
        this.gridElement.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            this.gridElement.appendChild(cell);
        }
    }
    
    setupEventListeners() {
        // 数字按钮
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                this.selectNumber(number);
                if (this.selectedCell !== null) {
                    this.placeNumber(this.selectedCell, number);
                }
            });
        });
        
        // 游戏控制按钮
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            window.location.href = 'hey-welcome/vielspass.html';
        });
        document.getElementById('new-game-btn').addEventListener('click', () => this.generateNewGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('hint-btn').addEventListener('click', () => this.giveHint());
        document.getElementById('check-btn').addEventListener('click', () => this.checkSolution());
        
        // 难度按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.difficulty);
                this.generateNewGame();
            });
        });
        
        // 弹窗按钮
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.closeModal('game-complete-modal');
            this.generateNewGame();
        });
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeModal('game-complete-modal');
        });
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('new-game-from-pause-btn').addEventListener('click', () => {
            this.closeModal('pause-modal');
            this.generateNewGame();
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 语言切换
        document.getElementById('lang-zh').addEventListener('click', () => this.setLanguage('zh'));
        document.getElementById('lang-en').addEventListener('click', () => this.setLanguage('en'));
        
        // 用户名保存
        document.getElementById('save-username-btn').addEventListener('click', () => this.saveUsername());
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUsername();
        });
    }
    
    selectCell(index) {
        if (this.isPaused || this.isGameComplete) return;
        
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        // 如果是初始数字，不能选择
        if (this.initialGrid[row][col] !== 0) return;
        
        // 清除之前的选择
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted', 'same-number');
        });
        
        this.selectedCell = index;
        const selectedElement = document.querySelector(`[data-index="${index}"]`);
        selectedElement.classList.add('selected');
        
        // 高亮同行、同列、同宫格
        this.highlightRelatedCells(row, col);
        
        // 高亮相同数字
        const currentNumber = this.grid[row][col];
        if (currentNumber !== 0) {
            this.highlightSameNumbers(currentNumber);
        }
    }
    
    selectNumber(number) {
        // 清除之前选择的数字按钮
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 选择新的数字按钮
        const selectedBtn = document.querySelector(`[data-number="${number}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        this.selectedNumber = number;
        
        // 高亮相同数字
        if (number !== 0) {
            this.highlightSameNumbers(number);
        }
    }
    
    placeNumber(index, number) {
        if (this.isPaused || this.isGameComplete) return;
        
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        // 如果是初始数字，不能修改
        if (this.initialGrid[row][col] !== 0) return;
        
        const cell = document.querySelector(`[data-index="${index}"]`);
        
        if (number === 0) {
            // 清除数字
            this.grid[row][col] = 0;
            cell.textContent = '';
            cell.classList.remove('user-input', 'error', 'correct');
        } else {
            // 放置数字
            this.grid[row][col] = number;
            cell.textContent = number;
            cell.classList.add('user-input');
            cell.classList.remove('error', 'correct');
            
            // 检查是否正确
            if (this.solution[row][col] === number) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('error');
                this.mistakes++;
                this.updateMistakes();
            }
        }
        
        // 检查游戏是否完成
        if (this.isGridComplete()) {
            this.gameComplete();
        }
        
        // 重新高亮相同数字
        if (this.selectedNumber !== null && this.selectedNumber !== 0) {
            this.highlightSameNumbers(this.selectedNumber);
        }
    }
    
    highlightRelatedCells(row, col) {
        for (let i = 0; i < 9; i++) {
            // 高亮同行
            const rowIndex = row * 9 + i;
            document.querySelector(`[data-index="${rowIndex}"]`).classList.add('highlighted');
            
            // 高亮同列
            const colIndex = i * 9 + col;
            document.querySelector(`[data-index="${colIndex}"]`).classList.add('highlighted');
        }
        
        // 高亮同宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                const boxIndex = i * 9 + j;
                document.querySelector(`[data-index="${boxIndex}"]`).classList.add('highlighted');
            }
        }
    }
    
    highlightSameNumbers(number) {
        document.querySelectorAll('.sudoku-cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            if (this.grid[row][col] === number) {
                cell.classList.add('same-number');
            }
        });
    }
    
    handleKeyPress(e) {
        if (this.isPaused || this.isGameComplete) return;
        
        if (e.key >= '1' && e.key <= '9') {
            const number = parseInt(e.key);
            this.selectNumber(number);
            if (this.selectedCell !== null) {
                this.placeNumber(this.selectedCell, number);
            }
        } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === '0') {
            this.selectNumber(0);
            if (this.selectedCell !== null) {
                this.placeNumber(this.selectedCell, 0);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            this.moveSelection(e.key);
        }
    }
    
    moveSelection(direction) {
        if (this.selectedCell === null) return;
        
        const row = Math.floor(this.selectedCell / 9);
        const col = this.selectedCell % 9;
        let newRow = row, newCol = col;
        
        switch (direction) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, col + 1);
                break;
        }
        
        const newIndex = newRow * 9 + newCol;
        this.selectCell(newIndex);
    }
    
    generateNewGame() {
        this.resetGame();
        this.generateSolution();
        this.createPuzzle();
        this.renderGrid();
        this.startTimer();
    }
    
    resetGame() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.selectedNumber = null;
        this.mistakes = 0;
        this.hints = 3;
        this.timer = 0;
        this.isPaused = false;
        this.isGameComplete = false;
        
        this.updateMistakes();
        this.updateHints();
        this.updateTimer();
        
        // 清除所有高亮
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted', 'same-number', 'error', 'correct', 'given', 'user-input');
        });
        
        // 清除数字按钮选择
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    generateSolution() {
        // 生成完整的数独解
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(this.solution);
    }
    
    solveSudoku(grid) {
        // 使用回溯算法生成数独解
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    // 随机打乱数字顺序
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    createPuzzle() {
        // 复制解到网格
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = this.solution[i][j];
            }
        }
        
        // 根据难度移除数字
        const cellsToRemove = this.getCellsToRemove();
        const positions = [];
        
        // 创建所有位置的数组
        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }
        
        // 随机打乱位置
        this.shuffleArray(positions);
        
        // 移除指定数量的数字
        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.grid[row][col] = 0;
        }
        
        // 保存初始网格
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.initialGrid[i][j] = this.grid[i][j];
            }
        }
    }
    
    getCellsToRemove() {
        switch (this.difficulty) {
            case 'easy': return 40;
            case 'medium': return 50;
            case 'hard': return 60;
            case 'expert': return 65;
            default: return 40;
        }
    }
    
    renderGrid() {
        document.querySelectorAll('.sudoku-cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.grid[row][col];
            
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('given');
            } else {
                cell.textContent = '';
                cell.classList.remove('given');
            }
        });
    }
    
    isValidMove(grid, row, col, num) {
        // 检查行
        for (let j = 0; j < 9; j++) {
            if (grid[row][j] === num) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        
        // 检查3x3宫格
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) return false;
            }
        }
        
        return true;
    }
    
    isGridComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }
        return true;
    }
    
    giveHint() {
        if (this.hints <= 0 || this.isPaused || this.isGameComplete) return;
        
        // 找到一个空格子并填入正确答案
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const row = randomCell.row;
        const col = randomCell.col;
        const correctNumber = this.solution[row][col];
        
        this.grid[row][col] = correctNumber;
        const index = row * 9 + col;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = correctNumber;
        cell.classList.add('user-input', 'correct');
        
        this.hints--;
        this.updateHints();
        
        // 检查游戏是否完成
        if (this.isGridComplete()) {
            this.gameComplete();
        }
    }
    
    checkSolution() {
        if (this.isPaused || this.isGameComplete) return;
        
        let hasErrors = false;
        
        document.querySelectorAll('.sudoku-cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (this.grid[row][col] !== 0 && this.initialGrid[row][col] === 0) {
                if (this.grid[row][col] === this.solution[row][col]) {
                    cell.classList.remove('error');
                    cell.classList.add('correct');
                } else {
                    cell.classList.remove('correct');
                    cell.classList.add('error');
                    hasErrors = true;
                }
            }
        });
        
        if (hasErrors) {
            this.showMessage('发现错误！请检查标红的格子。', 'error');
        } else {
            this.showMessage('目前为止都正确！', 'success');
        }
    }
    
    gameComplete() {
        this.isGameComplete = true;
        this.stopTimer();
        
        // 显示完成弹窗
        document.getElementById('final-time').textContent = this.formatTime(this.timer);
        document.getElementById('final-mistakes').textContent = this.mistakes;
        this.showModal('game-complete-modal');
        
        // 保存成绩
        this.saveScore();
    }
    
    gameOver() {
        this.isGameComplete = true;
        this.stopTimer();
        this.showMessage('游戏结束！错误次数过多。', 'error');
    }
    
    togglePause() {
        if (this.isGameComplete) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopTimer();
            this.showModal('pause-modal');
        } else {
            this.startTimer();
            this.closeModal('pause-modal');
        }
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameComplete) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        this.timeElement.textContent = this.formatTime(this.timer);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateMistakes() {
        this.mistakesElement.textContent = this.mistakes;
    }
    
    updateHints() {
        this.hintsElement.textContent = this.hints;
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // 更新难度按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // 更新难度显示
        const difficultyNames = {
            'easy': this.currentLanguage === 'zh' ? '简单' : 'Easy',
            'medium': this.currentLanguage === 'zh' ? '中等' : 'Medium',
            'hard': this.currentLanguage === 'zh' ? '困难' : 'Hard',
            'expert': this.currentLanguage === 'zh' ? '专家' : 'Expert'
        };
        this.difficultyElement.textContent = difficultyNames[difficulty];
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }
    
    showMessage(message, type) {
        // 简单的消息显示（可以后续改进为更好的UI）
        alert(message);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    saveScore() {
        const scores = JSON.parse(localStorage.getItem('sudoku-scores') || '[]');
        const score = {
            username: this.username || '匿名',
            difficulty: this.difficulty,
            time: this.timer,
            mistakes: this.mistakes,
            date: new Date().toISOString()
        };
        scores.push(score);
        scores.sort((a, b) => a.time - b.time); // 按时间排序
        localStorage.setItem('sudoku-scores', JSON.stringify(scores.slice(0, 10))); // 只保存前10名
    }
    
    saveUsername() {
        const username = document.getElementById('username-input').value.trim();
        if (username) {
            this.username = username;
            localStorage.setItem('sudoku-username', username);
        }
    }
    
    loadUsername() {
        if (this.username) {
            document.getElementById('username-input').value = this.username;
        }
    }
    
    // 多语言支持
    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('sudoku-language', lang);
        
        // 更新语言按钮
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');
        
        // 更新文本
        this.updateLanguageTexts();
    }
    
    loadLanguage() {
        const savedLang = localStorage.getItem('sudoku-language') || 'zh';
        this.setLanguage(savedLang);
    }
    
    updateLanguageTexts() {
        const texts = {
            zh: {
                'game-title': '数独',
                'time-label': '时间: ',
                'difficulty-label': '难度: ',
                'username-label': '用户名: ',
                'save-username-btn': '保存',
                'number-pad-label': '数字键盘',
                'mistakes-label': '错误: ',
                'hints-label': '提示: ',
                'back-to-menu-text': '返回游戏选择',
                'new-game-text': '新游戏',
                'pause-text': '暂停',
                'hint-text': '提示',
                'check-text': '检查',
                'difficulty-selector-label': '选择难度',
                'easy-text': '简单',
                'medium-text': '中等',
                'hard-text': '困难',
                'expert-text': '专家',
                'congratulations-text': '恭喜！',
                'completion-message': '您成功完成了数独！',
                'final-time-label': '完成时间: ',
                'final-mistakes-label': '错误次数: ',
                'play-again-btn': '再玩一次',
                'close-modal-btn': '关闭',
                'game-paused-text': '游戏暂停',
                'resume-btn': '继续游戏',
                'new-game-from-pause-btn': '新游戏'
            },
            en: {
                'game-title': 'Sudoku',
                'time-label': 'Time: ',
                'difficulty-label': 'Difficulty: ',
                'username-label': 'Username: ',
                'save-username-btn': 'Save',
                'number-pad-label': 'Number Pad',
                'mistakes-label': 'Mistakes: ',
                'hints-label': 'Hints: ',
                'back-to-menu-text': 'Back to Games',
                'new-game-text': 'New Game',
                'pause-text': 'Pause',
                'hint-text': 'Hint',
                'check-text': 'Check',
                'difficulty-selector-label': 'Select Difficulty',
                'easy-text': 'Easy',
                'medium-text': 'Medium',
                'hard-text': 'Hard',
                'expert-text': 'Expert',
                'congratulations-text': 'Congratulations!',
                'completion-message': 'You have successfully completed the Sudoku!',
                'final-time-label': 'Completion Time: ',
                'final-mistakes-label': 'Mistakes: ',
                'play-again-btn': 'Play Again',
                'close-modal-btn': 'Close',
                'game-paused-text': 'Game Paused',
                'resume-btn': 'Resume',
                'new-game-from-pause-btn': 'New Game'
            }
        };
        
        const currentTexts = texts[this.currentLanguage];
        
        Object.keys(currentTexts).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = currentTexts[id];
            }
        });
        
        // 更新难度显示
        this.setDifficulty(this.difficulty);
        
        // 更新占位符
        const usernameInput = document.getElementById('username-input');
        usernameInput.placeholder = this.currentLanguage === 'zh' ? '请输入用户名' : 'Enter username';
    }
}

// 初始化游戏
let sudokuGame;

document.addEventListener('DOMContentLoaded', () => {
    sudokuGame = new SudokuGame();
});

// 防止页面刷新时丢失游戏状态
window.addEventListener('beforeunload', (e) => {
    if (sudokuGame && !sudokuGame.isGameComplete && sudokuGame.timer > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});