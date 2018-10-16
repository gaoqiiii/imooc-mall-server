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
  @param [sort] 查询顺序 1->升序 -1->降序
         [page] 页码
         [pageSize] 每页容量
*/
router.get('/', function(req, res, next) {
  // 获取前端传来的参数, req.param()取回的参数为string,需转成number
  let sort = parseInt(req.param('sort'))
  let page = parseInt(req.param('page'))
  let pageSize = parseInt(req.param('pageSize'))
  let skip = (page - 1) * pageSize // 跳过多少条数据
  // 查询参数
  let param = {}

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

module.exports = router