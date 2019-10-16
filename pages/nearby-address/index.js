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
  selectTap: function(e) {
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    var pointid = e.currentTarget.dataset.id;
    var userid = wx.getStorageSync("id")
    wx.request({
      url: app.config.url + '/apipoint/addpoint',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        userid: userid,
        pointid: pointid,
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
    this.getUserLocation();
  },
  initShippingAddress: function(e) {
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
          wx.hideLoading();
          that.setData({
            addressList: res.data.data
          });
        } else {
          that.setData({
            addressList: null
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '获取定位失败，请打开定位，重新进入！',
          icon: 'none',
        })
      },
    })
  },
  getUserLocation: function() {
    let vm = this;
    wx.showLoading({
      title: '加载中..',
      mask: true,
    });
    wx.getSetting({
      fail: () => {
        wx.hideLoading();
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
          wx.hideLoading();
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.hideLoading();
                wx.showToast({
                  title: '获取定位失败，请打开定位，重新进入！',
                  icon: 'none',
                })
              } else if (res.confirm) {
                wx.showLoading({
                  title: '加载中..',
                  mask: true,
                });
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.hideLoading();
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
        vm.data.latitude = res.latitude;
        vm.data.longitude = res.longitude;
        vm.initShippingAddress(res)
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showToast({
          title: '获取定位失败，请打开定位，重新进入！',
          icon: 'none',
        })
      }
    })
  },
})