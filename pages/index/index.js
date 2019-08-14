//index.js
//获取应用实例
//1新鲜水果 2蔬菜 3肉禽蛋类 4粮油米面 5休闲零食 6鲜花园艺 7居家百货 8 本地生活
var app = getApp()
Page({
  data: {
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
        name: "蔬菜"
      },
      {
        id: 3,
        name: "肉禽蛋类"
      },
      {
        id: 4,
        name: "粮油米面"
      },
      {
        id: 5,
        name: "休闲零食"
      },
      {
        id: 6,
        name: "鲜花园艺"
      },
      {
        id: 7,
        name: "居家百货"
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
    coupons: []
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
  addShopCart: function(e) {
    wx.showToast({
      title: e.currentTarget.dataset.id + "",
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
    that.getGoodsList(0);
    that.setData({
      activeCategoryId: 0
    });
  },
  onShow: function() {
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
  getGoodsList: function(categoryId) {
    // wx.showToast({
    //   title: "请求..",
    // })
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: app.config.url + '/apigoods/list',
      data: {
        type: categoryId,
        search: that.data.searchStr
      },
      success: function(res) {
        var goods = res.data.data;
        that.setData({
          goods: goods,
        });
        that.setData({
          loadingMoreHidden: false,
        });
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  SearchInput: function(event) {
    console.log(event.detail.value);

  },
  addcar: function(e) {
    console.log(e.currentTarget.dataset.id);
  }
})