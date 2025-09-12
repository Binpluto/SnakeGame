// 五子棋游戏类
class GomokuGame {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.boardOverlay = document.getElementById('board-overlay');
        
        // 游戏配置
        this.BOARD_SIZE = 15;
        this.CELL_SIZE = 40;
        this.STONE_RADIUS = 18;
        this.BOARD_PADDING = 20;
        
        // 游戏状态
        this.board = [];
        this.currentPlayer = 1; // 1: 黑子, -1: 白子
        this.gameOver = false;
        this.isAIMode = false;
        this.moveHistory = [];
        this.scores = { black: 0, white: 0 };
        
        // 初始化
        this.initializeBoard();
        this.setupEventListeners();
        this.drawBoard();
        this.updateUI();
        
        // 响应式处理
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }
    
    // 初始化棋盘
    initializeBoard() {
        this.board = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                this.board[i][j] = 0;
            }
        }
    }
    
    // 处理响应式
    handleResize() {
        const container = this.canvas.parentElement;
        const maxSize = Math.min(container.clientWidth - 40, 600);
        
        if (window.innerWidth <= 480) {
            this.canvas.width = Math.min(320, maxSize);
            this.canvas.height = Math.min(320, maxSize);
            this.CELL_SIZE = (this.canvas.width - 40) / (this.BOARD_SIZE - 1);
            this.STONE_RADIUS = this.CELL_SIZE * 0.4;
        } else if (window.innerWidth <= 768) {
            this.canvas.width = Math.min(400, maxSize);
            this.canvas.height = Math.min(400, maxSize);
            this.CELL_SIZE = (this.canvas.width - 40) / (this.BOARD_SIZE - 1);
            this.STONE_RADIUS = this.CELL_SIZE * 0.4;
        } else {
            this.canvas.width = 600;
            this.canvas.height = 600;
            this.CELL_SIZE = 40;
            this.STONE_RADIUS = 18;
        }
        
        this.BOARD_PADDING = 20;
        this.boardOverlay.style.width = this.canvas.width + 'px';
        this.boardOverlay.style.height = this.canvas.height + 'px';
        
        this.drawBoard();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 鼠标点击事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('click', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // 按钮事件
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            window.location.href = 'hey-welcome/vielspass.html';
        });
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('mode-btn').addEventListener('click', () => this.toggleMode());
    }
    
    // 处理点击事件
    handleClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.round((x - this.BOARD_PADDING) / this.CELL_SIZE);
        const row = Math.round((y - this.BOARD_PADDING) / this.CELL_SIZE);
        
        if (this.isValidMove(row, col)) {
            this.makeMove(row, col);
        }
    }
    
    // 检查是否为有效移动
    isValidMove(row, col) {
        return row >= 0 && row < this.BOARD_SIZE && 
               col >= 0 && col < this.BOARD_SIZE && 
               this.board[row][col] === 0;
    }
    
    // 执行移动
    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        
        this.drawBoard();
        
        if (this.checkWin(row, col)) {
            this.endGame(this.currentPlayer);
            return;
        }
        
        if (this.isBoardFull()) {
            this.endGame(0); // 平局
            return;
        }
        
        this.currentPlayer = -this.currentPlayer;
        this.updateUI();
        
        // AI模式下，如果轮到AI
        if (this.isAIMode && this.currentPlayer === -1) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    // AI移动
    makeAIMove() {
        if (this.gameOver) return;
        
        const move = this.getBestMove();
        if (move) {
            this.makeMove(move.row, move.col);
        }
    }
    
    // 获取最佳移动（简单AI）
    getBestMove() {
        // 检查是否能获胜
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = -1;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = 0;
                        return { row, col };
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // 检查是否需要阻止对手获胜
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = 1;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = 0;
                        return { row, col };
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // 寻找最佳位置（基于评分）
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === 0) {
                    const score = this.evaluatePosition(row, col, -1);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    // 评估位置分数
    evaluatePosition(row, col, player) {
        let score = 0;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            score += this.evaluateDirection(row, col, dx, dy, player);
        }
        
        // 中心位置加分
        const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
        score += (14 - centerDistance) * 2;
        
        return score;
    }
    
    // 评估方向分数
    evaluateDirection(row, col, dx, dy, player) {
        let score = 0;
        let count = 1;
        let blocked = 0;
        
        // 正方向
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (newRow < 0 || newRow >= this.BOARD_SIZE || 
                newCol < 0 || newCol >= this.BOARD_SIZE) {
                blocked++;
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                count++;
            } else if (this.board[newRow][newCol] === -player) {
                blocked++;
                break;
            } else {
                break;
            }
        }
        
        // 反方向
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (newRow < 0 || newRow >= this.BOARD_SIZE || 
                newCol < 0 || newCol >= this.BOARD_SIZE) {
                blocked++;
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                count++;
            } else if (this.board[newRow][newCol] === -player) {
                blocked++;
                break;
            } else {
                break;
            }
        }
        
        if (blocked === 2) return 0;
        
        switch (count) {
            case 5: return 100000;
            case 4: return blocked === 0 ? 10000 : 1000;
            case 3: return blocked === 0 ? 1000 : 100;
            case 2: return blocked === 0 ? 100 : 10;
            default: return 1;
        }
    }
    
    // 检查获胜
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 正方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow >= 0 && newRow < this.BOARD_SIZE && 
                    newCol >= 0 && newCol < this.BOARD_SIZE && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow >= 0 && newRow < this.BOARD_SIZE && 
                    newCol >= 0 && newCol < this.BOARD_SIZE && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                this.drawWinningLine(row, col, dx, dy, count);
                return true;
            }
        }
        
        return false;
    }
    
    // 绘制获胜线
    drawWinningLine(row, col, dx, dy, count) {
        const startX = this.BOARD_PADDING + col * this.CELL_SIZE - (count - 1) * this.CELL_SIZE * dx / 2;
        const startY = this.BOARD_PADDING + row * this.CELL_SIZE - (count - 1) * this.CELL_SIZE * dy / 2;
        const endX = startX + (count - 1) * this.CELL_SIZE * dx;
        const endY = startY + (count - 1) * this.CELL_SIZE * dy;
        
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
    }
    
    // 检查棋盘是否已满
    isBoardFull() {
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 结束游戏
    endGame(winner) {
        this.gameOver = true;
        
        if (winner === 1) {
            this.scores.black++;
            document.getElementById('game-message').textContent = '黑子获胜！';
        } else if (winner === -1) {
            this.scores.white++;
            document.getElementById('game-message').textContent = '白子获胜！';
        } else {
            document.getElementById('game-message').textContent = '平局！';
        }
        
        this.updateScoreBoard();
    }
    
    // 新游戏
    newGame() {
        this.initializeBoard();
        this.currentPlayer = 1;
        this.gameOver = false;
        this.moveHistory = [];
        this.clearHints();
        this.drawBoard();
        this.updateUI();
    }
    
    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.currentPlayer = lastMove.player;
        
        // AI模式下，如果悔棋后轮到AI，再悔一步
        if (this.isAIMode && this.moveHistory.length > 0 && this.currentPlayer === -1) {
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.row][aiMove.col] = 0;
            this.currentPlayer = 1;
        }
        
        this.clearHints();
        this.drawBoard();
        this.updateUI();
    }
    
    // 显示提示
    showHint() {
        if (this.gameOver) return;
        
        this.clearHints();
        const move = this.getBestMove();
        
        if (move) {
            const x = this.BOARD_PADDING + move.col * this.CELL_SIZE;
            const y = this.BOARD_PADDING + move.row * this.CELL_SIZE;
            
            const hint = document.createElement('div');
            hint.className = 'hint-stone';
            hint.style.left = (x - this.STONE_RADIUS) + 'px';
            hint.style.top = (y - this.STONE_RADIUS) + 'px';
            hint.style.width = (this.STONE_RADIUS * 2) + 'px';
            hint.style.height = (this.STONE_RADIUS * 2) + 'px';
            
            this.boardOverlay.appendChild(hint);
            
            setTimeout(() => this.clearHints(), 3000);
        }
    }
    
    // 清除提示
    clearHints() {
        const hints = this.boardOverlay.querySelectorAll('.hint-stone');
        hints.forEach(hint => hint.remove());
    }
    
    // 切换模式
    toggleMode() {
        this.isAIMode = !this.isAIMode;
        const modeBtn = document.getElementById('mode-btn');
        modeBtn.textContent = this.isAIMode ? '切换到双人模式' : '切换到AI模式';
        this.newGame();
    }
    
    // 绘制棋盘
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#f4e4bc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(this.BOARD_PADDING + i * this.CELL_SIZE, this.BOARD_PADDING);
            this.ctx.lineTo(this.BOARD_PADDING + i * this.CELL_SIZE, 
                           this.BOARD_PADDING + (this.BOARD_SIZE - 1) * this.CELL_SIZE);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.BOARD_PADDING, this.BOARD_PADDING + i * this.CELL_SIZE);
            this.ctx.lineTo(this.BOARD_PADDING + (this.BOARD_SIZE - 1) * this.CELL_SIZE, 
                           this.BOARD_PADDING + i * this.CELL_SIZE);
            this.ctx.stroke();
        }
        
        // 绘制星位
        const starPoints = [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]];
        this.ctx.fillStyle = '#8b4513';
        
        for (const [row, col] of starPoints) {
            this.ctx.beginPath();
            this.ctx.arc(this.BOARD_PADDING + col * this.CELL_SIZE, 
                        this.BOARD_PADDING + row * this.CELL_SIZE, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // 绘制棋子
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
    }
    
    // 绘制棋子
    drawStone(row, col, player) {
        const x = this.BOARD_PADDING + col * this.CELL_SIZE;
        const y = this.BOARD_PADDING + row * this.CELL_SIZE;
        
        // 绘制阴影
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, this.STONE_RADIUS, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
        
        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.STONE_RADIUS, 0, 2 * Math.PI);
        
        if (player === 1) {
            // 黑子
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.STONE_RADIUS);
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            // 白子
            const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.STONE_RADIUS);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    // 更新UI
    updateUI() {
        const currentPlayerText = document.getElementById('current-player-text');
        const gameMessage = document.getElementById('game-message');
        const undoBtn = document.getElementById('undo-btn');
        
        if (!this.gameOver) {
            currentPlayerText.textContent = this.currentPlayer === 1 ? '黑子' : '白子';
            gameMessage.textContent = this.currentPlayer === 1 ? '黑子回合' : '白子回合';
        }
        
        undoBtn.disabled = this.moveHistory.length === 0 || this.gameOver;
    }
    
    // 更新计分板
    updateScoreBoard() {
        document.getElementById('black-wins').textContent = this.scores.black;
        document.getElementById('white-wins').textContent = this.scores.white;
    }
}

// 初始化游戏
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new GomokuGame();
});