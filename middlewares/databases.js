const mysql=require("mysql");

const db=mysql.createConnection({
  host:"localhost",
  port:3306,
  user:'root',
  password:'123456',
  database:'modular',
  multipleStatements: true,//可执行多条sql语句
});

const connectDb=function(){
  db.connect(err=>{
    if(err) throw err;
    console.log("连接成功");
  })
}

module.exports={
  db,
  connectDb
}