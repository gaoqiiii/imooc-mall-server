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

router.get('/', function(req, res, next) {
  // 参数1：查找条件 
  // 参数2：callback
  Goods.find({}, function (err, doc) {
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