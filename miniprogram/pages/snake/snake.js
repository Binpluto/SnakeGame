// snake.js
Page({
  data: {
    score: 0,
    gameStatus: '点击开始游戏',
    gameRunning: false,
    speed: 5
  },

  onLoad() {
    this.initGame()
  },

  onUnload() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
    }
  },

  initGame() {
    const ctx = wx.createCanvasContext('snakeCanvas', this)
    this.ctx = ctx
    this.canvasWidth = 600
    this.canvasHeight = 600
    this.gridSize = 20
    this.cols = this.canvasWidth / this.gridSize
    this.rows = this.canvasHeight / this.gridSize
    
    this.resetGame()
    this.drawGame()
  },

  resetGame() {
    this.snake = [
      { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
    ]
    this.direction = { x: 1, y: 0 }
    this.food = this.generateFood()
    this.setData({
      score: 0,
      gameStatus: '点击开始游戏',
      gameRunning: false
    })
  },

  generateFood() {
    let food
    do {
      food = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      }
    } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y))
    return food
  },

  startGame() {
    if (this.data.gameRunning) return
    
    this.setData({
      gameRunning: true,
      gameStatus: '游戏进行中'
    })
    
    const interval = 1000 / this.data.speed
    this.gameTimer = setInterval(() => {
      this.updateGame()
    }, interval)
  },

  pauseGame() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
      this.gameTimer = null
    }
    this.setData({
      gameRunning: false,
      gameStatus: '游戏暂停'
    })
  },

  updateGame() {
    const head = { ...this.snake[0] }
    head.x += this.direction.x
    head.y += this.direction.y

    // 检查边界碰撞
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.gameOver()
      return
    }

    // 检查自身碰撞
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver()
      return
    }

    this.snake.unshift(head)

    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      this.setData({
        score: this.data.score + 10
      })
      this.food = this.generateFood()
    } else {
      this.snake.pop()
    }

    this.drawGame()
  },

  gameOver() {
    this.pauseGame()
    this.setData({
      gameStatus: `游戏结束! 得分: ${this.data.score}`
    })
    
    wx.showModal({
      title: '游戏结束',
      content: `你的得分是: ${this.data.score}`,
      showCancel: true,
      cancelText: '返回',
      confirmText: '重新开始',
      success: (res) => {
        if (res.confirm) {
          this.resetGame()
          this.drawGame()
        }
      }
    })
  },

  drawGame() {
    const ctx = this.ctx
    
    // 清空画布
    ctx.setFillStyle('#f0f0f0')
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    // 绘制网格
    ctx.setStrokeStyle('#e0e0e0')
    ctx.setLineWidth(1)
    for (let i = 0; i <= this.cols; i++) {
      ctx.moveTo(i * this.gridSize, 0)
      ctx.lineTo(i * this.gridSize, this.canvasHeight)
    }
    for (let i = 0; i <= this.rows; i++) {
      ctx.moveTo(0, i * this.gridSize)
      ctx.lineTo(this.canvasWidth, i * this.gridSize)
    }
    ctx.stroke()
    
    // 绘制蛇
    this.snake.forEach((segment, index) => {
      ctx.setFillStyle(index === 0 ? '#2E7D32' : '#4CAF50')
      ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      )
    })
    
    // 绘制食物
    ctx.setFillStyle('#FF5722')
    ctx.fillRect(
      this.food.x * this.gridSize + 2,
      this.food.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4
    )
    
    ctx.draw()
  },

  // 触摸控制
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].x
    this.touchStartY = e.touches[0].y
  },

  handleTouchEnd(e) {
    if (!this.data.gameRunning) return
    
    const deltaX = e.changedTouches[0].x - this.touchStartX
    const deltaY = e.changedTouches[0].y - this.touchStartY
    const minDistance = 30
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
      // 水平滑动
      if (deltaX > 0 && this.direction.x !== -1) {
        this.direction = { x: 1, y: 0 }
      } else if (deltaX < 0 && this.direction.x !== 1) {
        this.direction = { x: -1, y: 0 }
      }
    } else if (Math.abs(deltaY) > minDistance) {
      // 垂直滑动
      if (deltaY > 0 && this.direction.y !== -1) {
        this.direction = { x: 0, y: 1 }
      } else if (deltaY < 0 && this.direction.y !== 1) {
        this.direction = { x: 0, y: -1 }
      }
    }
  },

  // 按钮控制
  moveUp() {
    if (this.data.gameRunning && this.direction.y !== 1) {
      this.direction = { x: 0, y: -1 }
    }
  },

  moveDown() {
    if (this.data.gameRunning && this.direction.y !== -1) {
      this.direction = { x: 0, y: 1 }
    }
  },

  moveLeft() {
    if (this.data.gameRunning && this.direction.x !== 1) {
      this.direction = { x: -1, y: 0 }
    }
  },

  moveRight() {
    if (this.data.gameRunning && this.direction.x !== -1) {
      this.direction = { x: 1, y: 0 }
    }
  },

  changeSpeed(e) {
    const newSpeed = e.detail.value
    this.setData({ speed: newSpeed })
    
    if (this.data.gameRunning) {
      this.pauseGame()
      this.startGame()
    }
  },

  goBack() {
    wx.navigateBack()
  }
})