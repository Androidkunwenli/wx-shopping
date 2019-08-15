//获取应用实例
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    latitude: "",
    longitude: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.data.latitude = options.latitude;
    that.data.longitude = options.longitude;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  selectTap: function(e) {
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.config.url + '/apipoint/addpoint',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        userid: wx.getStorageSync("id"),
        pointid: id,
      },
      success: (res) => {
        wx.hideLoading()
        wx.navigateBack({})
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    wx.request({
      url: app.config.url + "/apipoint/searchPoint",
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        x: that.data.latitude,
        y: that.data.longitude,
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.key == 200) {
          that.setData({
            addressList: res.data.data
          });
        } else {
          that.setData({
            addressList: null
          });
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})