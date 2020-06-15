import utils from './utils/md5.js'
let name = 'abcd'
let password = '123'
let user_ticket = utils.md5(utils.md5(name + utils.md5(password)))
console.log('加密',user_ticket) //加密后的结果

let name = 'abcd'
let password = '123'
var timestamp = Date.parse(new Date()) / 1000
let user_ticket = utils.md5(utils.md5(utils.md5(name + utils.md5(password))) + timestamp)
console.log('加盐',user_ticket) //加盐的结果

let name = 'abcd'
let password = '123'
var timestamp = Date.parse(new Date()) / 1000
let load_password = utils.md5(utils.md5(name + utils.md5(password))) //储存密码
let user_ticket_client = utils.md5(utils.md5(utils.md5(name + utils.md5(password))) + timestamp) //客户端密码
let user_ticket_service = utils.md5(load_password + timestamp) //服务端再次加密计算 储存密码加 时间戳
console.log(user_ticket_client == user_ticket_service) //客户端已经加密和服务端再次加密做对比