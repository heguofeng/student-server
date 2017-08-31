const _webHttp = require('../webhttp');
const APIError = require('../rest').APIError;
const ip = "http://106.14.145.165:3333";
var sample_S = "sample=student";
var sample_A = "sample=student_admin";

//云之讯
var ucpaasClass = require('ucpaas-sdk/lib/ucpaasClass');
var options = {
    accountsid: '4d34aed70a30405c8aba9a0d89330798',
    token: '471416c20b89d075cdc90a30e0a74d9b',
};
var ucpaas = new ucpaasClass(options);

// 导入WebSocket模块:
// const WebSocket = require('ws');
// 引用Server类:
// const WebSocketServer = WebSocket.Server;

module.exports = {
    //获取token
    'GET /api/token': async(ctx, next) => {
        //异步方法一  async/await，同步形式
        var st = new Date().getTime();
        console.log("token开始" + st)
        return _webHttp.httpGet(`${ip}/token?user=admin&password=123456`).then(function(data) {
            ctx.rest({
                token: data
            });
            var td = new Date().getTime() - st;
            console.log(`token时间：${td}ms`);
        }, function(error) {
            console.error("出错了：", error);
        });
    },
    //获取所有学生
    'GET /api/students': async(ctx, next) => {
        //方法二，promise嵌套
        var st = new Date().getTime();
        console.log("student开始" + st)
        return _webHttp.httpGet(`${ip}/records?${sample_S}`).then(function(data) {
            ctx.rest({
                students: data
            });
            var td = new Date().getTime() - st;
            console.log(`学生时间：${td}ms`);
        }, function(error) {
            console.error("读取学生数据出错了：", error);
        });
    },
    //新建学生
    'POST /api/student': async(ctx, next) => {
        var postDoc = {
                "sample": "student"
            },
            token = ctx.request.body.token;
        return _webHttp.httpPost(`${ip}/record?token=${token}`, JSON.stringify(postDoc)).then(function(data) {
            ctx.rest({
                student: data
            }, function(error) {
                console.log("新建出错了：" + error)
            });
            // console.log("新建学生" + data);
        });
    },
    //删除学生
    'DELETE /api/student/:token/:id': async(ctx, next) => {
        console.log(`正在执行删除学生 ${ctx.params.id}`);
        var id = ctx.params.id;
        var token = ctx.params.token;
        return _webHttp.httpDelete(`${ip}/record/${id}?token=${token}&${sample_S}`).then(function(data) {
            console.log("删除数据为： " + data);
            ctx.rest({
                result: data
            });
        }, function(error) {
            console.log("删除数据失败：" + error);
        });


    },
    //修改信息
    'PUT /api/student/:id': async(ctx, next) => {
        console.log(`正在执行修改学生：${ctx.params.id}`);
        var id = ctx.params.id,
            token = ctx.request.body.token;
        var putDoc = {
            "$set": {
                "college": ctx.request.body.college,
                "name": ctx.request.body.name,
                "sex": ctx.request.body.sex,
                "age": ctx.request.body.age,
                "student_id": ctx.request.body.student_id
            }
        }
        console.log(JSON.stringify(putDoc));
        return _webHttp.httpPut(`${ip}/record/${id}?token=${token}&${sample_S}`, JSON.stringify(putDoc)).then(function(data) {
            // console.log("修改后的数据" + data);
            ctx.rest({
                student: data
            });
        }, function(error) {
            console.log("修改数据失败：" + error);
        });
    },
    //查询某位学生
    'GET /api/student/:id': async(ctx, next) => {
        console.log("正在执行查询学生 号码" + ctx.params.id);
        var id = ctx.params.id;
        return _webHttp.httpGet(`${ip}/record/${id}?${sample_S}`).then(function(data) {
            ctx.rest({
                student: data
            });
        }, function(error) {
            console.log("查询一条数据失败：" + error);
        });
    },
    'DELETE /api/delAllStudents/:token': async(ctx, next) => {
        console.log("删除所有学生");
        var token = ctx.params.token;
        return _webHttp.httpDelete(`${ip}/records?token=${token}&${sample_S}`).then(function(data) {
            ctx.rest({
                result: "删除所有数据成功"
            });
        }, function(error) {
            console.log("删除所有学生出错：" + error);
        });
    },
    'DELETE /api/delSelect/:token': async(ctx, next) => {
        console.log("删除所选中的学生");
        var token = ctx.params.token,
            ids = ctx.request.body.ids;
        ids.forEach(function(id) {
            _webHttp.httpDelete(`${ip}/record/${id}?token=${token}&${sample_S}`).then(function(data) {

            }, function(error) {
                console.log("删除所选中的学生失败" + error);
            });
        });
        ctx.rest({
            result: "已删除所选中的学生"
        });
    },
    // 'GET /api/ws/:token': async(ctx, next) => {
    //     console.log("ws步骤");
    //     let token = ctx.params.token;
    //     var ws = new WebSocket(`ws://106.14.145.165:3334/record/subscribe?sample=student&token=${token}`);
    //     console.log(ws);
    //     ctx.rest({
    //         result: ws
    //     });
    // }
    //注册管理员1新建
    'POST /api/admin': async(ctx, next) => {
        var postDoc = {
                "sample": "student_admin"
            },
            token = ctx.request.body.token;
        return _webHttp.httpPost(`${ip}/record?token=${token}`, JSON.stringify(postDoc)).then(function(data) {
            ctx.rest({
                admin: data
            }, function(error) {
                console.log("新建出错了：" + error)
            });
            console.log("新建管理员" + data);
        });
    },
    //注册管理员2修改
    'PUT /api/admin/:id': async(ctx, next) => {
        console.log(`正在执行修改管理员操作：${ctx.params.id}`);
        var id = ctx.params.id,
            token = ctx.request.body.token;
        var putDoc = {
            "$set": {
                "phone": ctx.request.body.phone,
                "password": ctx.request.body.password,
                "security_code": ctx.request.body.security_code,
            }
        }
        console.log(JSON.stringify(putDoc));
        return _webHttp.httpPut(`${ip}/record/${id}?token=${token}&${sample_A}`, JSON.stringify(putDoc)).then(function(data) {
            console.log("修改后的数据" + data);
            ctx.rest({
                admin: data
            });
        }, function(error) {
            console.log("修改数据失败：" + error);
        });
    },
    //获取验证码
    'POST /api/security_code': async(ctx, next) => {
        var phone = ctx.request.body.phone;
        console.log("获取验证码:" + phone);
        //开发者账号信息查询
        // ucpaas.getDevinfo(function(status, responseText) {
        //     console.log('code: ' + status + ', text: ' + responseText);
        // });
        //生成随机数
        var num = "";
        for (let i = 0; i < 6; i++) {
            num += Math.floor(Math.random() * 10);
        }
        //短信验证码
        var appId = '82376abb35ee46e3938f84477ec06e9d';
        var to = phone;
        var templateId = '48675';
        var param = parseInt(num);
        console.log("验证码是：" + param);
        ucpaas.templateSMS(appId, to, templateId, param, function(status, responseText) {
            console.log('code: ' + status + ', text: ' + responseText);
        });
        ctx.rest({
            result: 'result'
        });
    }
};