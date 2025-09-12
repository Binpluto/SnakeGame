// index.js
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName')
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  // 导航到贪吃蛇游戏
  navigateToSnake() {
    wx.navigateTo({
      url: '/pages/snake/snake'
    })
  },

  // 导航到俄罗斯方块游戏
  navigateToTetris() {
    wx.navigateTo({
      url: '/pages/tetris/tetris'
    })
  },

  

  // 导航到羊了个羊游戏
  navigateToSheep() {
    wx.navigateTo({
      url: '/pages/sheep/sheep'
    })
  },

  // 导航到五子棋游戏
  navigateToGomoku() {
    wx.navigateTo({
      url: '/pages/gomoku/gomoku'
    })
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  getUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})