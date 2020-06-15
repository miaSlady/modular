
let {responseObj} =require("../utils/common")
let {db}=require("../middlewares/databases")

var readList_getList = async (ctx, next) => {
  const {id}=ctx.state.user;
  console.log('我进来了哈');
  console.log('state',id);
  return new Promise((res,rej)=>{
    db.query('select * from readList where id= ?',[id],function(err,data){
      if(err){
        rej(err)
      }else{
        ctx.response.body={...responseObj,data}
        res()
      }
    })
  }) 
};

var readList_addList = async (ctx, next) => {
  const {bookName,startTime,finishTime,remark}=ctx.request.body;
  const {id}=ctx.state.user;
  return new Promise((res,rej)=>{
    db.query('insert readList SET ?',{id,bookName,startTime,finishTime,remark},function(err,data){
      if(err){
        rej(err)
      }else{
        ctx.response.body={...responseObj}
        res()
      }
    })
  }) 
};

var readList_updateList = async (ctx, next) => {
  const {rid,bookName,startTime,finishTime,remark}=ctx.request.body;
  const {id}=ctx.state.user;
  return new Promise((res,rej)=>{
    db.query('update readList SET ? where rid = ? and id=?',[{bookName,startTime,finishTime,remark},rid,id],function(err,data){
      if(err){
        rej(err)
      }else{
        console.log('更新回执',data);
        ctx.response.body={...responseObj}
        res()
      }
    })
  }) 
};

var readList_deleteList = async (ctx, next) => {
  const {rid}=ctx.request.body;
  const {id}=ctx.state.user;
  return new Promise((res,rej)=>{
    db.query('delete from readList where rid=? and id=?',[rid,id],function(err,data){
      if(err){
        rej(err)
      }else{
        console.log('删除回执',data);
        ctx.response.body={...responseObj}
        res()
      }
    })
  }) 
};


module.exports = {
  "GET /readList/getList": readList_getList,//获取阅读列表
  "POST /readList/addList": readList_addList,//新增阅读列表
  "PUT /readList/updateList": readList_updateList,//修改某条阅读计划
  "DELETE /readList/deleteList": readList_deleteList,//删除某条阅读计划
};