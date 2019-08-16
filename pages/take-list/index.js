var app = getApp()
Page({
  data: {
    statusType: ["未提货", "已提货"],
    currentType: 0,
    userid: null,
  },
  //点击非全部订单
  onLoad: function(e) {
    var scene = decodeURIComponent(e.q);
    console.log(scene);
    var userid = scene.split('/');
    wx.showToast({
      title: "二维码参数" + scene,
      icon: "none"
    })
    this.data.userid = userid[userid.length - 1].split('?')[1]
  },
  statusTap: function(e) {
    var curType = e.currentTarget.dataset.index;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function(e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定商品已被提取吗？',
      content: '',
      success: function(res) {
        wx.showLoading();
        if (res.confirm) {
          wx.request({
            url: app.config.url + '/apiorder/takegoods',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            data: {
              orderid: orderId
            },
            success: (res) => {
              wx.hideLoading();
              that.onShow();
            }
          })
        }
      }
    })
  },
  onShow: function() {
    // 获取订单列表
    wx.showLoading({
      title: '加载中..',
    });
    var that = this;
    var userid = this.data.userid;
    if (!userid) {
      wx.showToast({
        title: '获取失败',
        icon: "none",
      })
      wx.hideLoading()
      return
    }
    wx.request({
      url: app.config.url + '/apiorder/selectorder',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userid: userid,
        openid: wx.getStorageSync("openid"),
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.key == 200) {
          var data = res.data.data;
          console.log("===data===" + JSON.stringify(data));
          that.setData({
            orderList: data.orders,
            goodsMap: data.goodsMap,
          });
        } else {
          this.setData({
            orderList: null,
            goodsMap: {}
          });
        }
      }
    })

  },
  clickClose: function(e) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
})