var express = require('express')  
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('./../models/goods')

// 链接数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall')

// 监听数据库是否链接成功
mongoose.connection.on('connected', function() {
  console.log('MongoDB connected success')
})
/*
  /goods 获取上商品列表
  [param] [sort] 查询顺序 1->升序 -1->降序
          [page] 页码
          [pageSize] 每页容量
          [priceLevel] 价格区间
*/
router.get('/', function(req, res, next) {
  // 获取前端传来的参数, req.param()取回的参数为string,需转成number
  let sort = parseInt(req.param('sort'))
  let page = parseInt(req.param('page'))
  let pageSize = parseInt(req.param('pageSize'))
  let priceLevel = req.param('priceLevel')

  let skip = (page - 1) * pageSize // 跳过多少条数据
  // 查询参数
  let param = {}

  switch (priceLevel) {
    case '0':
      param = {
        salePrice: {
          $gte: 0,
          $lte: 100
        }
      }
      break
    case '1':
      param = {
        salePrice: {
          $gte: 100,
          $lte: 500
        }
      }
      break
    case '2':
      param = {
        salePrice: {
          $gte: 500,
          $lte: 1000
        }
      }
      break
    case '3':
      param = {
        salePrice: {
          $gte: 1000,
          $lte: 5000
        }
      }
      break
    case '4':
      param = {}
      break
  }
  let goodsModel = Goods.find(param).skip(skip).limit(pageSize)
  goodsModel.sort({'salePrice': sort}) // 对salePrice字段进行排序
  // 参数1：查找条件 
  // 参数2：callback

  // Goods.find({}, function (err, doc) {
  goodsModel.exec( function (err, doc) {
    if (err) {
      res.json({
        status: 1,
        msg: err.message
      })
    } else {
      res.json({
        status: 0,
        msg:'',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
})


/*
  /goods/addCart 加入购物车
  [param] [productId] 商品id
*/
router.post('/addCart', function(req, res, next){
  let userId = '100000077'
  let productId = req.body.productId
  let User = require('../models/user')
  // 取 userId 为 100000077 的第一个用户
  User.findOne({'userId': userId}, function(err, uDoc) {
    if (err) {
      res.json({
        "status": 1,
        "msg": err.message
      })
    } else {
      if(uDoc) {
        // 判断当前商品是否存在于购物车内
        let goodsItem = ''
        uDoc.cartList.forEach(function(item, index) {
          if (item.productId == productId) { // 存在于当前购物车中
            goodsItem = item
            item.productNum++
          }       
        });

        if (goodsItem) {
          uDoc.save(function(err2, doc2) {
            if (err2) {
              res.json({
                "status": 1,
                "msg": err2.message
              })
            } else {
              res.json({
                "status": 0,
                "msg": "",
                "result": "success"
              })
            }
          })
        } else {
          Goods.findOne({'productId': productId}, function(err1, pDoc){
            if (err1) {
              res.json({
                "status": 1,
                "msg": err.message
              })
            } else {
              if (pDoc) {
                pDoc.productNum = 1
                pDoc.checked = 1
                uDoc.cartList.push(pDoc)
                uDoc.save(function(err2, doc2) {
                  if (err2) {
                    res.json({
                      "status": 1,
                      "msg": err2.message
                    })
                  } else {
                    res.json({
                      "status": 0,
                      "msg": "",
                      "result": "success"
                    })
                  }
                })
              }
            }
          })
        }
        
      }      
    }
  })
})
module.exports = router