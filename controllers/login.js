
let {responseObj,client} =require("../utils/common")
let {db}=require("../middlewares/databases")
const svgCaptcha = require('svg-captcha');//生成验证码
const uuidv4 = require('uuid/v4');//基于uuid生成随机数用于token
var redis = require('redis');//中间件：缓存哈希表（1.注册/登录判断code是否输入正确；2.登录用token对应用户信息）

var login_signUp = async (ctx, next) => {
  const {account,name,userPwd,code}=ctx.request.body;
  const {token}=ctx.request.header;
  console.log("注册：我进来了",token,code);
  return new Promise((res,req)=>{
    client.hgetall('codeVerify', (err, obj)=>{
      console.log('我获取到了',obj);
      if(err){
        rej(err)
      }else{
        res(obj)
      }
    })
  }).then(obj=>{
    let rightCode=obj[token];
    console.log(11,code,obj[token],token);
    console.log(12,rightCode,obj);

    if( obj[token] && obj[token].toLowerCase()==code.toLowerCase()){//验证码正确
      return new Promise((res,rej)=>{//该账号是否注册过
        db.query('select * from userlist where account=?',[account],function(err,data){
          if(err){
            rej(err)
          }else{
            res(data)
          }
        })
      }).then(data=>{//新建该账号
        if(!data.length){
          return new Promise((res,rej)=>{
            let createTime=new Date();
            db.query('INSERT INTO userlist SET ?',{account,name,userPwd,createTime},function(err,data){
              if(err){
                rej(err)
              }else{
                ctx.response.body={...responseObj}
                res()
              }
            })
          })
        }else{
          ctx.response.body={
            code:500,
            success:false,
            msg:'该账号已存在'
          }
        }
      })
    }else{
      console.log(22);
      ctx.response.body={
        code:500,
        success:false,
        msg:'验证码不正确'
      }
    }
  })
  
};

var login_login=async (ctx, next) => {
  const {account,userPwd,code}=ctx.request.body;
  const {token}=ctx.state;
  console.log('我进来了',token);
  return new Promise((res,req)=>{
    client.hgetall('codeVerify', (err, obj)=>{
      if(err){
        rej(err)
      }else{
        res(obj)
      }
    })
  }).then(obj=>{
    if( obj && obj[token] && obj[token].toLowerCase()==code.toLowerCase()){//验证码正确
      return new Promise((res,rej)=>{
        db.query('select * from userlist where account = ? and userPwd = ?',
        [account,userPwd], 
        (err,result)=>{
          console.log(2,result);
          if(err){
            rej(err)
          }else{
            if(result.length){
              let userInfo={};
              userInfo[token]=JSON.stringify(result[0]);
              client.hmset('codeUserInfo', userInfo , redis.print);
              client.expire('codeUserInfo',24*60*60);//1天自动过期
              ctx.response.body={...responseObj,data:{name:result[0].name,account:result[0].account}}
              res()
            }else{
              ctx.response.body={
                code:500,
                success:false,
                msg:'用户名或密码错误'
              } 
              res()
            }
          }
        })
      })
    }else{
      ctx.response.body={
        code:500,
        success:false,
        msg:'验证码不正确'
      }
    }  
  });  

  
};

var login_code=async (ctx, next) => {
  let captcha = svgCaptcha.create({
    size:4,//验证码个数
    fontSize:50,//验证码字体大小
    width:135,//宽度
    heigth:47,//高度
    background:'#cc9966'//背景大小
  });

  ctx.response.type="image/svg+xml";//设置返回的数据格式
  let token=uuidv4(),obj={};
  obj[token]=captcha.text;
  client.hmset('codeVerify', obj, redis.print);
  client.expire('codeVerify',180);//3分钟自动过期

  ctx.body={
    data:{
      token,
      codeImg:captcha.data,
    },
    success:true,
    code:200
  }
};

var login_exit=async (ctx,next) => {
  const {token}=ctx.state;
  console.log('进来了');
  return new Promise((res,req)=>{
    console.log('进来退登了');
    client.hexists('codeUserInfo',token, (err, data)=>{
      if(data){
        client.hdel('codeUserInfo', token,async (err,data)=>{
          res()
        });
      }else{
        res()
      }
    });
  }).then(()=>{
    ctx.response.body={...responseObj}
  })
}


module.exports = {
  "POST /login/signUp": login_signUp,//注册
  "POST /login/login":login_login,//登录
  "GET /login/code":login_code,//登录验证码
  "GET /login/exit":login_exit,//退登
  // "GET /test":test
};