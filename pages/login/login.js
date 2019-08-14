// pages/me/me.js

//获取应用实例
var app = getApp();
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    // 页面加载时使用用户授权逻辑，弹出确认的框  
    this.userAuthorized()
  },

  userAuthorized() {
    wx.getSetting({
      success: data => {
        if (data.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: data => {
              this.setData({
                userInfo: data.userInfo
              })
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })

        }
      }
    })
  },

  onGetUserInfo(e) {
    wx.showLoading({
      title: '加载中...',
    })
    const userInfo = e.detail.userInfo
    if (userInfo) {
      // 1. 小程序通过wx.login()获取code
      wx.login({
        success: function (login_res) {
          //获取用户信息
          wx.getUserInfo({
            success: function (info_res) {
              // 2. 小程序通过wx.request()发送code到开发者服务器
              wx.request({
                url: app.config.url +'/wechat/wx/login',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  code: login_res.code, //临时登录凭证
                  rawData: info_res.rawData, //用户非敏感信息
                  signature: info_res.signature, //签名
                  encrypteData: info_res.encryptedData, //用户敏感信息
                  iv: info_res.iv //解密算法的向量
                },
                success: function (res) {
                  if (res.data.key == 200) {
                    wx.hideLoading();
                    // 7.小程序存储skey（自定义登录状态）到本地
                    wx.setStorageSync('userInfo', userInfo);
                    wx.setStorageSync('skey', res.data.data.skey);
                    wx.setStorageSync('id', res.data.data.id);
                    wx.setStorageSync('openid', res.data.data.openid);
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                  } else {
                    console.log('服务器异常');
                  }
                },
              })
            }
          })
        }
      })
    }
  }

})