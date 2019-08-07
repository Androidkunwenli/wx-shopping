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
  getUserLocation: function() {
    let vm = this;
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function(dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
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
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
      },
      fail: function(res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  onShow: function() {
    var that = this;
    that.getUserLocation();
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
      allGoodsAndYunPrice += shopList[x].price;
    }
    that.setData({
      allGoodsAndYunPrice: allGoodsAndYunPrice,
    });
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