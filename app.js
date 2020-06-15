const fs = require('fs');
const Koa = require('koa');
let {client} =require("./utils/common")
// var cors = require('koa2-cors');
const app = new Koa();
const session = require('koa-session');
const bodyParser = require('koa-bodyparser')
app.use(session({
  　　keys:'koa:sess',
  　　maxAge:10000
  },app));
app.use(bodyParser());//该post请求中间件需在router之前注册到app.js里头

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();

app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

//跨域

const cors = require('./utils/koa-cors'); //跨域处理文件koa-cors.js
app.use(cors);

router.post('/', async function (ctx) {
    ctx.body = '请求成功了'
});

const {connectDb}=require('./middlewares/databases')
connectDb();

// 导入controller middleware:
const controller = require('./controller');//对路由分模块处理
controller(app);


app.listen(3000);



