//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    canvasHidden: false,
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
    shareImage: "",
  },
  onLoad: function(e) {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    })
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
      fail: function(res) {
        wx.navigateBack({})
      },
      success: function(res) {
        wx.hideLoading()
        if (res.data.key == 200) {
          var goodsDetail = res.data.data;
          that.data.goodsDetail = res.data.data;
          var display = goodsDetail.surplus == 0 ? "block" : "none";
          that.setData({
            avatarUrl: goodsDetail.picture,
            commodityTitle: goodsDetail.name,
            selectSizePrice: goodsDetail.price,
            oldprice: goodsDetail.oldprice,
            sale: goodsDetail.sale,
            total: goodsDetail.surplus,
            stime: goodsDetail.stime,
            etime: goodsDetail.etime,
            display: display,
            supplier: goodsDetail.supplier,
            spec: goodsDetail.spec,
            brand: goodsDetail.brand,
            orign: goodsDetail.orign,
          });
          wx.setNavigationBarTitle({
            title: goodsDetail.name
          })
          WxParse.wxParse('article', 'html', goodsDetail.detail, that, 5);
          that.onShowTime(goodsDetail.endtime);
          wx.showLoading({
            title: '加载中..',
            mask: true,
          })
          wx.getImageInfo({
            src: goodsDetail.picture, // 这里填写网络图片路径 
            success: (res) => {
              setTimeout(function() {
                // 这个是我封装的裁剪图片方法（下面将会说到）
                clipImage(res.path, res.width, res.height, goodsDetail.price, goodsDetail.sale, goodsDetail.surplus, (img) => {
                  wx.uploadFile({
                    url: app.config.url + '/upload ',
                    filePath: img,
                    name: "file",
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    formData: {
                      'goodsid': goodsDetail.goodsid //其他额外的formdata，可不写
                    },
                    success: function(res) {
                      var data = JSON.parse(res.data)
                      if (data.code == 200) {
                        //截图赋值
                        that.data.shareImage = data.msg;
                        wx.hideLoading()
                      }
                    },
                    fail: function(res) {
                      wx.hideLoading()
                    },
                  })
                });
              }, 600)

            }
          });
        } else {
          wx.navigateBack({})
        }
      }
    })
    wx.request({
      url: app.config.url + '/apiorder/buyhis',
      method: "POST",
      data: {
        goodsid: e.id
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if (res.data.key == 200) {
          that.setData({
            buyhis: res.data.data,
          })
        }
      }
    })
    /* 裁剪封面，
       src为本地图片路径或临时文件路径，
       imgW为原图宽度，
       imgH为原图高度，
       cb为裁剪成功后的回调函数
    */
    const clipImage = (src, imgW, imgH, price, sale, total, cb) => {
      // ‘canvas’为前面创建的canvas标签的canvas-id属性值
      let ctx = wx.createCanvasContext('canvas');
      // 将图片绘制到画布
      ctx.font = 'normal 11px sans-serif';
      ctx.drawImage(src, 0, -80, 640, 640)
      ctx.setFillStyle('#FFA500')
      ctx.fillRect(0, 392, 640, 120)
      ctx.setFontSize(35)
      ctx.setFillStyle('white')
      ctx.fillText('¥ ', 20, 445)
      ctx.setFontSize(50)
      ctx.fillText(price, 45, 445)
      ctx.setFontSize(40)
      ctx.fillText("已售" + sale + "份/剩余" + total + "份", 20, 492)
      // ctx.fillText("距结束", 560, 265)
      // ctx.fillText(that.data.countDownHour + ":" + that.data.countDownMinute + ":" + that.data.countDownSecond, 555, 295)
      // draw()必须要用到，并且需要在绘制成功后导出图片
      ctx.draw(false, () => {
        setTimeout(() => {
          //  导出图片
          wx.canvasToTempFilePath({
            width: 640,
            height: 512,
            destWidth: 640,
            destHeight: 512,
            canvasId: 'canvas',
            fileType: 'jpg',
            success: (res) => {
              // res.tempFilePath为导出的图片路径
              typeof cb == 'function' && cb(res.tempFilePath);
            }
          })
        }, 0);
      })
    }

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
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo) {
      if (this.data.goodsDetail.surplus == 0) {
        wx.showToast({
          title: '暂无库存',
          icon: 'none',
        })
        return
      }
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
    } else {
      wx.navigateTo({
        url: '/pages/login/login?type=1'
      })
    }
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
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo) {
      if (this.data.goodsDetail.surplus == 0) {
        wx.showToast({
          title: '暂无库存',
          icon: 'none',
        })
        return
      }
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
    } else {
      wx.navigateTo({
        url: '/pages/login/login?type=1'
      })
    }
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
  //分享
  onShareAppMessage: function() {
    return {
      title: this.data.goodsDetail.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.goodsid,
      imageUrl: this.data.shareImage,
      success: function(res) {
        console.log("分享成功")
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
        console.log("分享失败")
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
  onShowTime: function(endtime) {
    var totalSecond = endtime / 1000 - new Date().getTime() / 1000;
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

      this.data.countDownDay = parseInt(dayStr);
      this.data.countDownHour = parseInt(hrStr);
      this.data.countDownMinute = parseInt(minStr);
      this.data.countDownSecond = parseInt(secStr);
      this.setData({
        countDownDay: this.data.countDownDay,
        countDownHour: this.data.countDownHour,
        countDownMinute: this.data.countDownMinute,
        countDownSecond: this.data.countDownSecond,
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