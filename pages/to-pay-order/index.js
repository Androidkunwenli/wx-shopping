//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    goodsList: [],
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
  },
  onLoad: function(e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  onShow: function() {
    var that = this;
    var shopList = [];
    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      goodsList: shopList,
    });
    var allGoodsAndYunPrice = 0;
    for (var x in shopList) {
      allGoodsAndYunPrice += (shopList[x].price * shopList[x].num);
    }
    that.setData({
      allGoodsAndYunPrice: allGoodsAndYunPrice,
    });
    //获取默认地址
    that.getSelectpoint()
  },
  getSelectpoint: function() {
    wx.showLoading({
      title: '取货地址加载中..',
    })
    var that = this;
    wx.request({
      url: app.config.url + "/apipoint/selectpoint",
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        userid: wx.getStorageSync("id"),
      },
      success: (res) => {
        if (res.data.key == 200) {
          wx.hideLoading()
          that.setData({
            curAddressData: res.data.data
          })
        } else {
          wx.hideLoading()
        }
      }
    })
  },
  createOrder: function(e) {
    wx.showLoading({
      title: '提交订单中...',
    })
    var that = this;
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }
    var goodsList = this.data.goodsList;
    var goodList = [];
    for (var x in goodsList) {
      var goodsBean = {}
      goodsBean.goodsid = goodsList[x].goodsId;
      goodsBean.num = goodsList[x].num;
      goodsBean.price = goodsList[x].price;
      goodList.push(goodsBean);
    }
    var postData = {
      goods: goodList,
      userid: wx.getStorageSync("id"),
      note: remark,
    }
    wx.request({
      url: app.config.url + '/apiorder/addorder',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: postData, // 设置请求的 参数
      success: (res) => {
        wx.hideLoading()
        wx.showLoading({
          title: '去支付...',
        })
        var data = res.data.data
        console.log("提交订单" + JSON.stringify(data))
        if (res.data.key == 200) {
          var postData = {
            orderid: data.orderid,
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
              }
            }
          })

        }
      }
    })
  },
  createNonceStr: function() {
    return Math.random().toString(36).substr(2, 15)
  },
  //点击选择地址
  selectAddress: function(e) {
    wx.navigateTo({
      url: '/pages/select-address/index'
    })
  }
})