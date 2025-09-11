// tetris.js
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

  initGame() {
    const ctx = wx.createCanvasContext('tetrisCanvas', this)
    this.ctx = ctx
    this.canvasWidth = 400
    this.canvasHeight = 600
    this.blockSize = 20
    this.cols = this.canvasWidth / this.blockSize
    this.rows = this.canvasHeight / this.blockSize
    
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0))
    this.currentPiece = null
    this.gameTimer = null
    this.touchStartX = 0
    this.touchStartY = 0
    
    // 俄罗斯方块形状定义
    this.pieces = [
      // I形
      [[[1,1,1,1]]],
      // O形
      [[[1,1],[1,1]]],
      // T形
      [[[0,1,0],[1,1,1]], [[1,0],[1,1],[1,0]], [[1,1,1],[0,1,0]], [[0,1],[1,1],[0,1]]],
      // S形
      [[[0,1,1],[1,1,0]], [[1,0],[1,1],[0,1]]],
      // Z形
      [[[1,1,0],[0,1,1]], [[0,1],[1,1],[1,0]]],
      // J形
      [[[1,0,0],[1,1,1]], [[1,1],[1,0],[1,0]], [[1,1,1],[0,0,1]], [[0,1],[0,1],[1,1]]],
      // L形
      [[[0,0,1],[1,1,1]], [[1,0],[1,0],[1,1]], [[1,1,1],[1,0,0]], [[1,1],[0,1],[0,1]]]
    ]
    
    this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500']
    
    this.drawBoard()
  },

  drawBoard() {
    const ctx = this.ctx
    
    // 清空画布
    ctx.setFillStyle('#000000')
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    // 绘制已放置的方块
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col] > 0) {
          ctx.setFillStyle(this.colors[this.board[row][col] - 1])
          ctx.fillRect(col * this.blockSize, row * this.blockSize, this.blockSize - 1, this.blockSize - 1)
        }
      }
    }
    
    // 绘制当前方块
    if (this.currentPiece) {
      const piece = this.currentPiece
      const shape = this.pieces[piece.type][piece.rotation]
      
      ctx.setFillStyle(this.colors[piece.type])
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const x = (piece.x + col) * this.blockSize
            const y = (piece.y + row) * this.blockSize
            ctx.fillRect(x, y, this.blockSize - 1, this.blockSize - 1)
          }
        }
      }
    }
    
    ctx.draw()
  },

  startGame() {
    if (this.data.gameRunning) return
    
    this.setData({
      gameRunning: true,
      gameStatus: '游戏进行中',
      score: 0
    })
    
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0))
    this.spawnPiece()
    this.startGameLoop()
  },

  pauseGame() {
    this.setData({
      gameRunning: false,
      gameStatus: '游戏暂停'
    })
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
      this.gameTimer = null
    }
  },

  resetGame() {
    this.pauseGame()
    this.setData({
      score: 0,
      gameStatus: '点击开始游戏'
    })
    this.initGame()
  },

  startGameLoop() {
    const interval = 1100 - this.data.speed * 100
    this.gameTimer = setInterval(() => {
      this.gameStep()
    }, interval)
  },

  gameStep() {
    if (!this.currentPiece) {
      this.spawnPiece()
      return
    }
    
    if (this.canMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.currentPiece.y++
    } else {
      this.placePiece()
      this.clearLines()
      this.spawnPiece()
      
      // 检查游戏结束
      if (!this.canMove(this.currentPiece.x, this.currentPiece.y, this.currentPiece.rotation)) {
        this.gameOver()
        return
      }
    }
    
    this.drawBoard()
  },

  spawnPiece() {
    const type = Math.floor(Math.random() * this.pieces.length)
    this.currentPiece = {
      type: type,
      x: Math.floor(this.cols / 2) - 1,
      y: 0,
      rotation: 0
    }
  },

  canMove(x, y, rotation) {
    const shape = this.pieces[this.currentPiece.type][rotation]
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col
          const newY = y + row
          
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return false
          }
          
          if (newY >= 0 && this.board[newY][newX] > 0) {
            return false
          }
        }
      }
    }
    
    return true
  },

  placePiece() {
    const piece = this.currentPiece
    const shape = this.pieces[piece.type][piece.rotation]
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const x = piece.x + col
          const y = piece.y + row
          if (y >= 0) {
            this.board[y][x] = piece.type + 1
          }
        }
      }
    }
  },

  clearLines() {
    let linesCleared = 0
    
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell > 0)) {
        this.board.splice(row, 1)
        this.board.unshift(Array(this.cols).fill(0))
        linesCleared++
        row++ // 重新检查这一行
      }
    }
    
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared]
      this.setData({
        score: this.data.score + points
      })
    }
  },

  moveLeft() {
    if (!this.currentPiece || !this.data.gameRunning) return
    
    if (this.canMove(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.rotation)) {
      this.currentPiece.x--
      this.drawBoard()
    }
  },

  moveRight() {
    if (!this.currentPiece || !this.data.gameRunning) return
    
    if (this.canMove(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.rotation)) {
      this.currentPiece.x++
      this.drawBoard()
    }
  },

  moveDown() {
    if (!this.currentPiece || !this.data.gameRunning) return
    
    if (this.canMove(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.currentPiece.y++
      this.drawBoard()
    }
  },

  rotate() {
    if (!this.currentPiece || !this.data.gameRunning) return
    
    const newRotation = (this.currentPiece.rotation + 1) % this.pieces[this.currentPiece.type].length
    
    if (this.canMove(this.currentPiece.x, this.currentPiece.y, newRotation)) {
      this.currentPiece.rotation = newRotation
      this.drawBoard()
    }
  },

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
  },

  handleTouchMove(e) {
    // 防止页面滚动
    e.preventDefault()
  },

  handleTouchEnd(e) {
    if (!this.data.gameRunning) return
    
    const deltaX = e.changedTouches[0].clientX - this.touchStartX
    const deltaY = e.changedTouches[0].clientY - this.touchStartY
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30) {
        this.moveRight()
      } else if (deltaX < -30) {
        this.moveLeft()
      }
    } else {
      if (deltaY > 30) {
        this.moveDown()
      } else if (deltaY < -30) {
        this.rotate()
      }
    }
  },

  changeSpeed(e) {
    const newSpeed = e.detail.value
    this.setData({ speed: newSpeed })
    
    if (this.data.gameRunning) {
      clearInterval(this.gameTimer)
      this.startGameLoop()
    }
  },

  gameOver() {
    this.pauseGame()
    this.setData({
      gameStatus: '游戏结束'
    })
    
    wx.showModal({
      title: '游戏结束',
      content: `最终得分: ${this.data.score}`,
      showCancel: false,
      confirmText: '重新开始',
      success: () => {
        this.resetGame()
      }
    })
  },

  goBack() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
    }
    wx.navigateBack()
  },

  onUnload() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
    }
  }
})