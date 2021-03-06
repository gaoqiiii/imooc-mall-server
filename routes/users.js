var express = require('express');
var router = express.Router();
var User = require('../models/user');
require('./../util/util')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录
router.post('/login', function(req, res, next){
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }

  User.findOne(param, function(err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        // res.cookie('userId', doc.userId, {
        //   path: '/',
        //   maxAge: 1000*60*60
        // })
        res.json({
          status: '0',
          msg: 'success',
          result: {
            userName: doc.userName,  
            userId: 100000077,
          }
        })
      }
      
    }
  })
});

// 登出
router.post('/logout', function(req, res, next){
  // res.cookie("userId","",{
  //   path: "/",
  //   maxAge: 0
  // })

  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})

// 购物车列表
router.post('/cartList', function(req, res, next){
  let userId = req.body.userId
  User.findOne({userId: userId}, function(err, doc){
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: 'success',
        result: {
          cartList: doc.cartList,
          length: doc.length
        }
        
      })
    }
  })
})

// 购物车删除
router.post('/cartDel', function(req, res, next){
  let userId = req.body.userId
  let productId = req.body.productId
  User.update({
    userId: userId
  },{
    $pull: {
      'cartList': {
        'productId': productId
      }
    }
  }, function(err, doc) {
    if (err){
      res.json({
        status: '1',
        result: '',
        msg: err.message
      })
    } else {
      res.json({
        status: '0',
        result: 'success',
        msg: ''
      })
    }
  })
})

// 编辑购物车
router.post('/cartEdit', function(req, res, next){
  let userId = req.body.userId,
      productId = req.body.productId,
      productNum = req.body.productNum,
      checked = req.body.checked
  User.update({
      'userId': userId,
      'cartList.productId': productId
    },{
      "cartList.$.productNum": productNum,
      "cartList.$.checked": checked
    }, function(err, doc) {
      if (err) {
        res.json({
          status: '1',
          result: '',
          msg: err.message
        })
      } else {
        res.json({
          status: '0',
          result: 'success',
          msg: ''
        })
      }
    })
})

// 编辑购物车 全选
router.post('/editCheckAll', function(req, res, next){
  let userId = req.body.userId,
      checkAll = req.body.checkAll? '1' : '0'
  User.findOne({userId: userId},function(err, doc){
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        doc.cartList.forEach((item) => {
          item.checked = checkAll
        })
        doc.save(function(err1, doc1){
          if(err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: 'success',
              result: ''
            })
          }
        })
      }
    }
  })
})

// 查询地址接口
router.post('/addressList', function(req, res, next){
  let userId = req.body.userId
  User.findOne({userId: userId}, function(err, doc){
    if (err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else{
      res.json({
        status: '0',
        msg: 'success',
        result: doc.addressList
      })
    }
  })
})

// 设置默认地址接口
router.post('/setDefault', function(req, res, next){
  var userId = req.body.userId,
      addressId = req.body.addressId
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, function(err, doc){
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        let addressList = doc.addressList
        addressList.forEach((item)=> {
          if (item.addressId == addressId) {
            item.isDefault = true
          } else {
            item.isDefault = false
          }
        })
        doc.save(function(err1, doc1) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: 'success',
              result: ''
            })
          }
        })
      }
    })  
  }
  
})

// 删除地址
router.post('/delAddress', function(req, res, next){
  let userId = req.body.userId,
      addressId = req.body.addressId
  User.update({
    userId: userId
  },{
    $pull: {
      'addressList': {
        addressId: addressId
      }
    }
  }, function(err, doc){
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: 'success',
        result: ''
      })
    }
  })
})

// 订单
router.post('/payment', function(req, res, next){
  let userId = req.body.userId,
      orderTotal = req.body.orderTotal,
      addressId = req.body.addressId
  User.findOne({userId: userId}, function(err, doc){
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let address = '',
          goodsList = []  
      // 获取当前用户的地址信息
      doc.addressList.forEach(item => {
        if (item.addressId == addressId) {
          address = item
        }
      })
      // 获取用户购物车的购买商品
      doc.cartList.filter(item => {
        if (item.checked == '1') {
          goodsList.push(item)
        }
      })
      let platForm = '622'
      let r1 = Math.floor(Math.random() * 10)
      let r2 = Math.floor(Math.random() * 10)
      let systemDate = new Date().Format('yyyyMMddhhmmss')
      let createDate =  new Date().Format('yyyy-MM-dd hh:mm:ss')
      let orderId = platForm + r1 + systemDate + r2

      let order = {
        orderId: orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: ''
      };
      doc.orderList.push(order)
      doc.save(function(err1, doc1) {
        if (err1) {
          res.json({
            status: '1',
            msg: err1.message,
            result: ''
          })
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})

// 根据orderId查询order信息
router.post('/orderDetail', function(req, res, next) {
  let userId = req.body.userId,
      orderId = req.body.orderId
  User.findOne({userId: userId}, function(err, userInfo) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let orderList = userInfo.orderList
      if (orderList.length > 0 ) {
        let orderTotal = 0
        orderList.forEach(item => {
          if (item.orderId == orderId) {
            orderTotal = item.orderTotal
          } 
        })
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '12002',
            msg: '当前用户无订单',
            result: ''
          })
        }
      } else {
        res.json({
          status: '12001',
          msg: '无此订单',
          result: ''
        })
      }
    }
  })
})

// 查询购物车数量
router.post('/getCartCount', function(req, res, next){
  let userId =req.body.userId
  User.findOne({userId: userId}, function(err, doc){
    if (err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let cartList = doc.cartList,
          cartCount = 0
      cartList.forEach(item => {
        cartCount += parseInt(item.productNum)
      })
      res.json({
        status: '0',
        msg: 'success',
        result: cartCount
      })
    }
  })
})
module.exports = router;
