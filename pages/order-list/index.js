var app = getApp()
Page({
  data: {
    statusType: ["全部", "未付款", "待提货", "已完成"],
    currentType: 0,
    tabClass: ["", "", "", "", ""]
  },
  onLoad:function(e){
    var curType = e.id;
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
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
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: orderId
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 0) {
                that.onShow();
              }
            }
          })
        }
      }
    })
  },
  toPayTap: function(e) {
    wx.showLoading({
      title: '提交订单..',
    })
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var postData = {
      orderid: orderId,
      openid: wx.getStorageSync("openid"),
    }
    wx.request({
      url: app.config.url + '/wxPay',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: postData, // 设置请求的 参数
      success: (res) => {
        var data = res.data.data
        console.log("调起支付" + JSON.stringify(data))
        if (res.data.key == 200) {
          wx.hideLoading()
          wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: 'MD5',
            paySign: data.paySign,
            success(res) {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 2000
              })
              wx.reLaunch({
                url: "/pages/order-list/index"
              });
            },
            fail(res) {
              wx.showToast({
                title: '支付失败,请重新提交!',
                icon: 'success',
                duration: 2000
              })
            }
          })
        } else {
          wx.showToast({
            title: '支付失败',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })

  },
  onShow: function() {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var type = "";
    var statusStr = "";
    if (that.data.currentType == 0) {
      type = "";
    } else if (that.data.currentType == 1) {
      type = 0;
    } else if (that.data.currentType == 2) {
      type = 1;
    } else if (that.data.currentType == 3) {
      type = 2;
    }
    wx.request({
      url: app.config.url + '/apiorder/orderlist',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userid: wx.getStorageSync("id"),
        type: type,
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
})