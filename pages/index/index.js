//index.js
//获取应用实例
//1新鲜水果 2蔬菜 3肉禽蛋类 4粮油米面 5休闲零食 6鲜花园艺 7居家百货 8 本地生活
var app = getApp()
Page({
  data: {
    pointid: "",
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [{
        id: 0,
        name: "全部"
      },
      {
        id: 1,
        name: "新鲜水果"
      },
      {
        id: 2,
        name: "时令蔬菜"
      },
      {
        id: 3,
        name: "粮油米面"
      },
      {
        id: 4,
        name: "休闲零食"
      },
      {
        id: 5,
        name: "干果山货"
      },
      {
        id: 6,
        name: "家用百货"
      },
      {
        id: 7,
        name: "酒水茶饮"
      },
      {
        id: 8,
        name: "本地生活"
      }
    ],
    activeCategoryId: 0,
    goods: [],
    scrollTop: "0",
    loadingMoreHidden: true,
    hasNoCoupons: true,
    coupons: [],
    searchStr: "",
    shopCarInfo: {},
  },
  //下拉刷新
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this
    that.getGoodsList(that.data.activeCategoryId);
  },
  // 搜索
  searchConfirm: function(e) {
    var that = this;
    that.data.searchStr = e.detail.value;
    if (e.detail.value) {
      that.getGoodsList(0);
      that.setData({
        activeCategoryId: 0
      });
    }
  },
  tabClick: function(e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function(e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  bindTypeTap: function(e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  scroll: function(e) {
    //  console.log(e) ;
    var that = this,
      scrollTop = that.data.scrollTop;
    that.setData({
      scrollTop: e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  onLoad: function() {
    var that = this
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
          that.data.pointid = res.data.data.pointid;
        } else {
          wx.hideLoading()
        }
      }
    })
    that.getGoodsList(0);
    that.setData({
      activeCategoryId: 0
    });

  },
  onShow: function() {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo) {
      // 获取购物车数据
      wx.getStorage({
        key: 'shopCarInfo',
        success: function(res) {
          that.setData({
            shopCarInfo: res.data,
          });
        }
      });
    }
  },
  //请求数据列表
  getGoodsList: function(categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: app.config.url + '/apigoods/list',
      data: {
        type: categoryId,
        search: that.data.searchStr,
        pointid: that.data.pointid
      },
      success: function(res) {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.key == 200) {
          var goods = res.data.data;
          that.setData({
            goods: goods,
          });
          that.setData({
            loadingMoreHidden: false,
          });
        }
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: wx.getStorageSync('mallName'),
      path: '/pages/index/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  /**
   * 加入购物车
   */
  addcar: function(e) {
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo) {
      var goodsDetail = e.currentTarget.dataset.item;
      console.log(goodsDetail);
      //组建购物车
      if (goodsDetail) {
        if (goodsDetail.surplus == 0) {
          wx.showToast({
            title: '暂无库存',
            icon: 'none',
          })
          return
        }
        var shopCarInfo = this.bulidShopCarInfo(goodsDetail);
        if (shopCarInfo) {
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
        }
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login?type=1'
      })
    }
  },
  /**
   * 组建购物车信息
   */
  bulidShopCarInfo: function(goodsDetail) {
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.goodsId = goodsDetail.id;
    shopCarMap.pic = goodsDetail.picture;
    shopCarMap.name = goodsDetail.name;
    shopCarMap.num = 1;
    shopCarMap.price = goodsDetail.price;
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
    return shopCarInfo;
  },
})