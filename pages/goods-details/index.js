//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    currentData: 0,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择：",
    selectSizePrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 0,

    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar", //购物类型，加入购物车或立即购买，默认为加入购物车
    dataList: {},
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,

  },
  onLoad: function(e) {
    var that = this;
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum == null ? "0" : res.data.shopNum
        });
      }
    })
    wx.request({
      url: app.config.url + '/apigoods/gooddetail',
      method: "POST",
      data: {
        goodsid: e.id
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        wx.hideLoading()
        if (res.data.key == 200) {
          var goodsDetail = res.data.data;
          that.data.goodsDetail = res.data.data;
          that.setData({
            avatarUrl: goodsDetail.picture,
            commodityTitle: goodsDetail.name,
            selectSizePrice: goodsDetail.price,
            oldprice: goodsDetail.oldprice,
            sale: goodsDetail.sale,
            total: goodsDetail.total,
          });
          wx.setNavigationBarTitle({
            title: goodsDetail.name
          })
          WxParse.wxParse('article', 'html', goodsDetail.detail, that, 5);
        } else {
          wx.navigateBack({})
        }
      }
    })
  },
  goHome: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  goShopCar: function() {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },
  /**
   * 加入购物车
   */
  toAddShopCar: function() {
    //组建购物车
    var shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });
    // 写入本地存储
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function() {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.picture;
    shopCarMap.name = this.data.goodsDetail.name;
    shopCarMap.num = 1;
    shopCarMap.price = this.data.goodsDetail.price;
    var shopCarInfo = this.data.shopCarInfo;
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId) {
        hasSameGoodsIndex = i;
        shopCarMap.num = shopCarMap.num + tmpShopCarMap.num;
      }
    }
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    var shopNum = 0;
    for (var item in shopCarInfo.shopList) {
      shopNum += shopCarInfo.shopList[item].num
    }
    shopCarInfo.shopNum = shopNum;
    this.data.shopNum = shopCarInfo.shopNum;
    return shopCarInfo;
  },
  /**
   * 立即购买
   */
  tobuy: function() {
    //组建立即购买信息
    var buyNowInfo = this.buliduBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key: "buyNowInfo",
      data: buyNowInfo
    })

    wx.navigateTo({
      url: "/pages/to-pay-order/index?orderType=buyNow"
    })
  },
  /**
   * 组建立即购买信息
   */
  buliduBuyNowInfo: function() {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.id;
    shopCarMap.pic = this.data.goodsDetail.picture;
    shopCarMap.name = this.data.goodsDetail.name;
    shopCarMap.num = 1;
    shopCarMap.price = this.data.goodsDetail.price;
    var buyNowInfo = {};
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  onShareAppMessage: function() {
    console.log("商品ID = " + this.data.goodsDetail.goodsid)
    return {
      title: "分享标题",
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.goodsid,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //获取当前滑块的index
  bindchange: function(e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },

  //点击切换，滑块index赋值
  checkCurrent: function(e) {
    const that = this;
    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }
  },
  onReady: function() {
    var totalSecond = Date.parse(new Date("2019/08/30")) / 1000 - Date.parse(new Date()) / 1000;
    var interval = setInterval(function() {
      // 秒数
      var second = totalSecond;
      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;
      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;
      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;
      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;
      this.setData({
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  },





})