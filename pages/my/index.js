const app = getApp()
var QR = require("../../utils/qrcode.js");
Page({
  data: {
    canvasHidden: false,
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    imagePath: '',
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function() {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
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
      var size = this.setCanvasSize(); //动态设置画布大小
      //调用插件中的draw方法，绘制二维码图片
      var url = "https://www.puyuanjingxuan.com/img/wx?" + wx.getStorageSync("id");
      QR.api.draw(url, 'mycanvas', size.w, size.h);
      setTimeout(() => {
        this.canvasToTempImage();
      }, 500);
    } else {
      wx.navigateTo({
        url: '/pages/login/login?type=1'
      })
    }
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function() {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
        });
      },
      fail: function(res) {
        console.log(res);
      }
    });
  },

  //点击图片进行预览，长按保存分享图片
  previewImg: function(e) {
    var img = this.data.imagePath;
    console.log(img);
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
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