//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
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
  getSelectpoint:function(){
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
          
        }
      }
    })
  },
  createOrder: function(e) {
    var that = this;
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

  onLoad: function(e) {
    var that = this;
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },
})