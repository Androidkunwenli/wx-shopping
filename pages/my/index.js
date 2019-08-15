const app = getApp()

Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0
  },
  onLoad() {

  },
  onShow() {
    this.getUserInfo();
  },
  getUserInfo: function(cb) {
    var that = this
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo) {
      that.setData({
        userInfo: userInfo
      });
    } else {
      wx.navigateTo({
        url: '/pages/login/login?type=1'
      })
    }
  },
  order1: function() {
    wx.navigateTo({
      url: '/pages/order-list/index?id=1',
    })
  },
  order2: function() {
    wx.navigateTo({
      url: '/pages/order-list/index?id=2',
    })
  },
  order3: function() {
    wx.navigateTo({
      url: '/pages/order-list/index?id=3',
    })
  },
})