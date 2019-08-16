var app = getApp();
Page({
  data: {
    orderId: 0,
    orderDetail: {},
  },
  onLoad: function(e) {
    var orderId = e.id;
    this.data.orderId = orderId;
    this.setData({
      orderId: orderId
    });
  },
  onShow: function() {
    var that = this;
    wx.request({
      url: app.config.url + '/apiorder/orderdetail',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        orderid: that.data.orderId,
      },
      success: (res) => {
        if (res.data.key == 200) {
          that.data.orderDetail = res.data.data
          that.setData({
            orderDetail: that.data.orderDetail
          });
          var yunPrice = 0
          var goodList = that.data.orderDetail.goods
          for (var item in goodList) {
            yunPrice += parseFloat(goodList[item].price) * goodList[item].num;
          }
          that.setData({
            yunPrice: yunPrice,
            status: that.data.orderDetail.status,
          })
        }
      }
    })
  },
})