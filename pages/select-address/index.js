//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList: []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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
  onShow: function() {
    var that = this;
    that.getUserLocation();
  },
  initShippingAddress: function(e) {
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    var that = this;
    wx.request({
      url: app.config.url + "/apipoint/searchPoint",
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        x: e.latitude,
        y: e.longitude,
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
  getUserLocation: function() {
    let vm = this;
    wx.getSetting({
      fail: () => {
        wx.showToast({
          title: '获取定位失败，请打开定位，重新进入！',
          icon: 'none',
        })
      },
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '获取定位失败，请打开定位，重新进入！',
                  icon: 'none',
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '获取定位失败，请打开定位，重新进入！',
                        icon: 'none',
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          vm.getLocation();
        } else {
          //调用wx.getLocation的API
          vm.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function() {
    let vm = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log(JSON.stringify(res))
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
      },
      success: function(res) {
        vm.initShippingAddress(res)
      },
      fail: function(res) {
        wx.showToast({
          title: '获取定位失败，请打开定位，重新进入！',
          icon: 'none',
        })
      }
    })
  },

})