let {responseObj,client} =require("../utils/common")
let {db}=require("../middlewares/databases")


var user_changePwd = async (ctx, next) => {
  const {oldPwd,newPwd }=ctx.request.body;
  const {id}=ctx.state.user;
  return new Promise((res,rej)=>{
    db.query('SELECT * from userList where id = ? and userPwd=?',[id,oldPwd],function(err,data){
      if(err){
        rej(err)
      }else{
        console.log(11,data);
        if(data.length){
          res(true)
        }else{
          res(false)
        }
      }
    })
  }).then(bool=>{
    if(bool){
      return new Promise((res,req)=>{
        db.query('update userList set userPwd=? where id = ? ',[newPwd,id],function(err,data){
          console.log('更新回执',data);
          if(data.affectedRows){
            res({success:true})
          }else{
            res({success:false,msg:'修改失败'})
          }
        })
      })
    }else{
      return new Promise((res,req)=>{
        res({success:false,msg:'原密码错误'})
      })
    }
  }).then(res=>{
    let errorRes={
      code:500,
      ...res
    } ;
    ctx.response.body = res.success ? {...responseObj} : errorRes;
  }) 
};

var user_accountList = async (ctx, next) => {
  const {account}=ctx.state.user;
  let response={code:500};
  return new Promise((res,rej)=>{
    if(account=='account'){
      db.query('select * from userList',function(err,data){
        if(err){
          res({success:false,msg:err})
        }else{
          res({success:true,data})
        }
      })
    }else{
      res({success:false,msg:'您暂无查看权限'})
    }
  }).then(msg=>{
    ctx.response.body = msg.success ? {...responseObj,...msg} : {...response,...msg}; 
  }) 
};

var user_resetPwd = async (ctx, next) => {
  const {id}=ctx.request.body;
  const {account}=ctx.state.user;
  console.log('state',id);
  let response={code:500};
  return new Promise((res,rej)=>{
    if(account=='account'){
      db.query('update userList set userPwd="123456" where id = ? ',[id],function(err,data){
        console.log('更新回执',data);
        if(data.affectedRows){
          res({success:true})
        }else{
          res({success:false,msg:'重置密码失败'})
        }
      })
    }else{
      res({success:false,msg:'您暂无重置权限'})
    }
  }).then(msg=>{
    ctx.response.body = msg.success ? {...responseObj,...msg} : {...response,...msg}; 
  }) 
};

var user_deleteAccount = async (ctx, next) => {
  const {id}=ctx.request.body;
  const {account}=ctx.state.user;
  let response={code:500};
  return new Promise((res,rej)=>{
    if(account=='account'){
      db.query('update userList set userPwd="123456" where id = ? ',[id],function(err,data){
        console.log('更新回执',data);
        if(data.affectedRows){
          res({success:true})
        }else{
          res({success:false,msg:'重置密码失败'})
        }
      })
      db.query('delete from userList where id=?',[id],function(err,data){
        if(err){
          rej(err)
        }else{
          console.log('删除回执',data);
          res({success:true})
        }
      })
    }else{
      res({success:false,msg:'您暂无删除权限'})
    }
  }).then(msg=>{
    ctx.response.body = msg.success ? {...responseObj,...msg} : {...response,...msg}; 
  }) 
};

module.exports = {
  "PUT /user/changePwd":user_changePwd,//修改密码
  "GET /user/accountList":user_accountList,//获取账号列表
  "PUT /user/resetPwd":user_resetPwd,//重置密码
  "DELETE /user/deleteAccount":user_deleteAccount,//删除账号
};