
var redis = require('redis')//中间件：缓存哈希表（1.注册/登录判断code是否输入正确；2.登录用token对应用户信息）
var client = redis.createClient(6379, '127.0.0.1')
client.on('error', function (err) {
  console.log('Error ' + err);
});

const responseObj={
  code:200,
  success:true,
  msg:'成功'
}


module.exports={
  responseObj,
  client
}