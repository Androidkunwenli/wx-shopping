const app = getApp()

Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0
  },
	onLoad() {
    
	},	
  onShow() {
    this.getUserInfo();
    this.setData({
      version: app.globalData.version
    });
  },	
  getUserInfo: function (cb) {
      var that = this
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                userInfo: res.userInfo
              });
            }
          })
        }
      })
  },
  aboutUs : function () {
    wx.showModal({
      title: '关于我们',
      content: '欢迎光临!',
      showCancel:false
    })
  },
})