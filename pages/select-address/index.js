//index.js
//获取应用实例
var app = getApp();
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    addressList: [],
    latitude: "",
    longitude: "",
  },
  onLoad: function() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'CY4BZ-NAL3D-QSK4T-H2UFO-P6UAT-VOFG4'
    });
  },
  nearbyAddress: function() {
    wx.redirectTo({
      url: '/pages/nearby-address/index?latitude=' + this.data.latitude + "&longitude=" + this.data.longitude,
    })
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
    var that = this;
    wx.request({
      url: app.config.url + "/apipoint/history",
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        userid: wx.getStorageSync("id"),
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
      },
      fail: () => {
        wx.hideLoading();
      },
    })
  },
  getUserLocation: function() {
    let vm = this;
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
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
        //解析经纬度
        qqmapsdk.reverseGeocoder({
          location: res.latitude + ',' + res.longitude,
          success: function(res) {
            vm.setData({
              analysisAddress: res.result.address
            })
          },
          fail: function(error) {
            wx.hideLoading();
            console.error(error);
            vm.setData({
              analysisAddress: "失败"
            })
          },
        });
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