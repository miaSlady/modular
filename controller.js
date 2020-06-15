const fs = require('fs');
let {client} =require("./utils/common")
const Koa = require('koa');
const app = new Koa();
// add url-route in /controllers:

function addMapping(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            var path = url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            var path = url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router, dir) {
    fs.readdirSync(__dirname + '/' + dir).filter((f) => {
        return f.endsWith('.js');
    }).forEach((f) => {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    });
}

module.exports = function (app,dir) {
    let
        controllers_dir = dir || 'controllers',
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    //token拦截中间件
    app.use(async (ctx,next)=>{
        var url=ctx.request.URL.pathname;
        if(url!='/login/code'){//非获取验证码（需携带token）
            const {token}=ctx.request.header;
            let response={
                code:401,
                success:false,
                msg:'登录失效，请重新登录'
            };
            if(token){
                ctx.state.token=token;
                return new Promise((res,req)=>{
                    console.log(3)
                    if(url!='/login/signUp' && url!='/login/login'){//不是注册且不是登录进行token校验
                        client.hexists('codeUserInfo',token, (err, data)=>{//判断token是否失效
                            console.log(4,data)
                            if(data){//token未失效获取用户信息  
                                client.hgetall('codeUserInfo', (err, obj)=>{
                                    let user=obj[token];
                                    user=JSON.parse(user);
                                    ctx.state.user=user;
                                    res(true)
                                });
                            }else{//token失效
                                res(false)
                            }
                        }) 
                    }else{//注册或登录无需进行token校验
                        res(true)
                    }
                }).then(async(bool)=>{
                    if(bool){
                        console.log('调接口去');
                        await next();
                    }else{
                        ctx.response.body=response 
                    }
                })
            }else{//没携带token
                ctx.response.body=response
            }
        }else{//获取验证码code
            await next();
        }
    })
    app.use(router.routes());
    
    // return router.routes();
};
 