// gomoku.js
Page({
  data: {
    currentPlayer: 'black',
    gameStatus: '黑棋先行',
    canUndo: false,
    aiEnabled: true
  },

  onLoad() {
    this.initGame()
  },

  initGame() {
    const ctx = wx.createCanvasContext('gomokuCanvas', this)
    this.ctx = ctx
    this.canvasSize = 600
    this.gridSize = 15
    this.cellSize = this.canvasSize / (this.gridSize + 1)
    
    this.board = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0))
    this.moveHistory = []
    
    this.drawBoard()
  },

  drawBoard() {
    const ctx = this.ctx
    const cellSize = this.cellSize
    
    // 清空画布
    ctx.setFillStyle('#DEB887')
    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize)
    
    // 绘制网格线
    ctx.setStrokeStyle('#8B4513')
    ctx.setLineWidth(2)
    
    for (let i = 1; i <= this.gridSize; i++) {
      // 垂直线
      ctx.moveTo(i * cellSize, cellSize)
      ctx.lineTo(i * cellSize, this.gridSize * cellSize)
      // 水平线
      ctx.moveTo(cellSize, i * cellSize)
      ctx.lineTo(this.gridSize * cellSize, i * cellSize)
    }
    ctx.stroke()
    
    // 绘制星位点
    const starPoints = [
      [4, 4], [4, 12], [12, 4], [12, 12], [8, 8]
    ]
    ctx.setFillStyle('#8B4513')
    starPoints.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc((x + 1) * cellSize, (y + 1) * cellSize, 6, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    // 绘制棋子
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.board[i][j] !== 0) {
          const x = (j + 1) * cellSize
          const y = (i + 1) * cellSize
          
          ctx.beginPath()
          ctx.arc(x, y, cellSize * 0.4, 0, 2 * Math.PI)
          ctx.setFillStyle(this.board[i][j] === 1 ? '#000000' : '#FFFFFF')
          ctx.fill()
          
          if (this.board[i][j] === 2) {
            ctx.setStrokeStyle('#000000')
            ctx.setLineWidth(2)
            ctx.stroke()
          }
        }
      }
    }
    
    ctx.draw()
  },

  handleCanvasTap(e) {
    const rect = e.currentTarget
    const x = e.detail.x
    const y = e.detail.y
    
    const col = Math.round(x / this.cellSize) - 1
    const row = Math.round(y / this.cellSize) - 1
    
    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      this.makeMove(row, col)
    }
  },

  makeMove(row, col) {
    if (this.board[row][col] !== 0) return
    
    const player = this.data.currentPlayer === 'black' ? 1 : 2
    this.board[row][col] = player
    this.moveHistory.push({ row, col, player })
    
    this.setData({
      canUndo: this.moveHistory.length > 0
    })
    
    this.drawBoard()
    
    if (this.checkWin(row, col, player)) {
      const winner = player === 1 ? '黑棋' : '白棋'
      this.setData({
        gameStatus: `${winner}获胜！`
      })
      
      wx.showModal({
        title: '游戏结束',
        content: `${winner}获胜！`,
        showCancel: false,
        confirmText: '新游戏',
        success: () => {
          this.startNewGame()
        }
      })
      return
    }
    
    // 切换玩家
    const nextPlayer = this.data.currentPlayer === 'black' ? 'white' : 'black'
    this.setData({
      currentPlayer: nextPlayer,
      gameStatus: `${nextPlayer === 'black' ? '黑棋' : '白棋'}回合`
    })
    
    // AI自动下棋
    if (this.data.aiEnabled && nextPlayer === 'white') {
      setTimeout(() => {
        this.aiMove()
      }, 500)
    }
  },

  aiMove() {
    const bestMove = this.findBestMove()
    if (bestMove) {
      this.makeMove(bestMove.row, bestMove.col)
    }
  },

  findBestMove() {
    // 简单AI：寻找最佳位置
    let bestScore = -Infinity
    let bestMove = null
    
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.board[i][j] === 0) {
          // 评估这个位置
          let score = this.evaluatePosition(i, j, 2) // AI是白棋(2)
          score -= this.evaluatePosition(i, j, 1) * 1.1 // 防守黑棋
          
          if (score > bestScore) {
            bestScore = score
            bestMove = { row: i, col: j }
          }
        }
      }
    }
    
    return bestMove
  },

  evaluatePosition(row, col, player) {
    let score = 0
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ]
    
    directions.forEach(([dx, dy]) => {
      let count = 1
      let blocked = 0
      
      // 正方向
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
          blocked++
          break
        }
        if (this.board[newRow][newCol] === player) {
          count++
        } else if (this.board[newRow][newCol] !== 0) {
          blocked++
          break
        } else {
          break
        }
      }
      
      // 反方向
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow < 0 || newRow >= this.gridSize || newCol < 0 || newCol >= this.gridSize) {
          blocked++
          break
        }
        if (this.board[newRow][newCol] === player) {
          count++
        } else if (this.board[newRow][newCol] !== 0) {
          blocked++
          break
        } else {
          break
        }
      }
      
      if (count >= 5) {
        score += 10000
      } else if (count === 4 && blocked === 0) {
        score += 1000
      } else if (count === 3 && blocked === 0) {
        score += 100
      } else if (count === 2 && blocked === 0) {
        score += 10
      }
    })
    
    return score
  },

  checkWin(row, col, player) {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ]
    
    for (let [dx, dy] of directions) {
      let count = 1
      
      // 正方向计数
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow >= 0 && newRow < this.gridSize && 
            newCol >= 0 && newCol < this.gridSize && 
            this.board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      // 反方向计数
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow >= 0 && newRow < this.gridSize && 
            newCol >= 0 && newCol < this.gridSize && 
            this.board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      if (count >= 5) {
        return true
      }
    }
    
    return false
  },

  startNewGame() {
    this.setData({
      currentPlayer: 'black',
      gameStatus: '黑棋先行',
      canUndo: false
    })
    this.initGame()
  },

  undoMove() {
    if (this.moveHistory.length === 0) return
    
    const lastMove = this.moveHistory.pop()
    this.board[lastMove.row][lastMove.col] = 0
    
    // 如果AI开启，需要撤销两步
    if (this.data.aiEnabled && this.moveHistory.length > 0) {
      const secondLastMove = this.moveHistory.pop()
      this.board[secondLastMove.row][secondLastMove.col] = 0
    }
    
    this.setData({
      currentPlayer: 'black',
      gameStatus: '黑棋回合',
      canUndo: this.moveHistory.length > 0
    })
    
    this.drawBoard()
  },

  toggleAI() {
    this.setData({
      aiEnabled: !this.data.aiEnabled
    })
  },

  goBack() {
    wx.navigateBack()
  }
})