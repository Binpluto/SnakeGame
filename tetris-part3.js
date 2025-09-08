// 将当前方块固定到游戏板上
function lockShape() {
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x] === 0) continue;
            
            // 只有在游戏区域内的方块才添加到游戏板
            if (currentY + y >= 0) {
                board[currentY + y][currentX + x] = currentShapeIndex + 1; // +1 避免与空白(0)混淆
            }
        }
    }
}

// 消除已填满的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        // 检查当前行是否已填满
        const isLineFull = board[y].every(cell => cell !== 0);
        
        if (isLineFull) {
            // 移除该行，并在顶部添加新的空行
            board.splice(y, 1);
            board.unshift(Array(GRID_WIDTH).fill(0));
            linesCleared++;
            y++; // 重新检查当前位置（因为上面的行已经下移）
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数和等级
        const linePoints = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4行的分数
        score += linePoints[linesCleared] * level;
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        
        // 更新显示
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
        
        // 更新游戏速度
        GAME_SPEED = MIN_SPEED - ((level - 1) * (MIN_SPEED - MAX_SPEED) / 9);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        }
    }
}

// 游戏主循环
function gameLoop() {
    // 尝试将方块向下移动
    if (isValidMove(0, 1)) {
        currentY++;
    } else {
        // 无法下移，锁定方块
        lockShape();
        
        // 消除已填满的行
        clearLines();
        
        // 生成新方块
        generateNewShape();
    }
    
    // 更新画面
    draw();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    ctx.strokeStyle = '#EEEEEE';
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }
    
    // 绘制已固定的方块
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (board[y][x] !== 0) {
                const colorIndex = board[y][x] - 1; // -1 因为我们存储时加了1
                ctx.fillStyle = COLORS[colorIndex];
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                
                // 绘制边框
                ctx.strokeStyle = '#000000';
                ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }
    
    // 绘制当前方块
    if (currentShape) {
        ctx.fillStyle = COLORS[currentShapeIndex];
        
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x] !== 0) {
                    const drawX = (currentX + x) * GRID_SIZE;
                    const drawY = (currentY + y) * GRID_SIZE;
                    
                    ctx.fillRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                    
                    // 绘制边框
                    ctx.strokeStyle = '#000000';
                    ctx.strokeRect(drawX, drawY, GRID_SIZE, GRID_SIZE);
                }
            }
        }
    }
}