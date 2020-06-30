const fs = require('fs');
const Koa = require('koa');
// var cors = require('koa2-cors');
const app = new Koa();
const session = require('koa-session');
const bodyParser = require('koa-bodyparser')
app.use(session({
  　　keys:'koa:sess',
  　　maxAge:10000
  },app));
app.use(bodyParser());//该post请求中间件需在router之前注册到app.js里头


app.use(async (ctx, next) => {
  console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
  await next();
});

//跨域

const cors = require('./utils/koa-cors'); //跨域处理文件koa-cors.js
app.use(cors);

const {connectDb}=require('./middlewares/databases')
connectDb();

// 导入controller middleware:
const controller = require('./controller');//对路由分模块处理
controller(app);


app.listen(3000);



