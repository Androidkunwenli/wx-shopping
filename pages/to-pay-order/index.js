//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    goodsList: [],
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
          that.setData({
            curAddressData: res.data.data
          })
          wx.hideLoading()
        } else {

        }
      }
    })
  },
  createOrder: function(e) {
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
      userid: 1,
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
        console.log("提交订单" + res.data.data)
        if (res.data.code == 200) {
          wx.requestPayment({
            timeStamp: '',
            nonceStr: '',
            package: '',
            signType: 'MD5',
            paySign: '',
            success(res) {},
            fail(res) {}
          })
        }
      }
    })
  },
  //点击选择地址
  selectAddress: function(e) {
    wx.navigateTo({
      url: '/pages/select-address/index'
    })
  }
})