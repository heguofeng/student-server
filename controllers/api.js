const _webHttp = require('../webhttp');
const APIError = require('../rest').APIError;
const ip = "http://106.14.145.165:3333";
var sample_S = "sample=student";
var sample_A = "sample=student_admin";
const { uploadFile } = require('../upload');
const path = require('path');

//云之讯
var ucpaasClass = require('ucpaas-sdk/lib/ucpaasClass');
var options = {
    accountsid: '4d34aed70a30405c8aba9a0d89330798',
    token: '471416c20b89d075cdc90a30e0a74d9b',
};
var ucpaas = new ucpaasClass(options);
const index = require('./index')

module.exports = {
    //获取token
    'GET /api/token': index.getToken,
    //获取所有学生
    'GET /api/students': async(ctx, next) => {
        return _webHttp.httpGet(`${ip}/records?${sample_S}`).then(function(data) {
            let _data = JSON.parse(data).data;
            let dataArr = [];
            _data.forEach(function(item) {
                let dataJson = {
                    _id: item.data.attributes._id,
                    sex: item.data.attributes.sex,
                    name: item.data.attributes.name,
                    age: item.data.attributes.age,
                    college: item.data.attributes.college,
                    student_id: item.data.attributes.student_id
                };
                dataArr.push(dataJson);
            });
            ctx.rest({
                result: dataArr
            });
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
            let _data = JSON.parse(data).data.id; //传递ID
            ctx.rest({
                result: _data
            });
        }, function(error) {
            console.log("新建出错了：" + error)
        });
    },
    //删除学生
    'DELETE /api/student/:token/:id': async(ctx, next) => {
        console.log(`正在执行删除学生 ${ctx.params.id}`);
        var id = ctx.params.id;
        var token = ctx.params.token;
        return _webHttp.httpDelete(`${ip}/record/${id}?token=${token}&${sample_S}`).then(function(data) {
            let _data = JSON.parse(data).data.attributes;
            console.log("删除数据为： " + data);
            ctx.rest({
                result: _data
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
        return _webHttp.httpPut(`${ip}/record/${id}?token=${token}&${sample_S}`, JSON.stringify(putDoc)).then(function(data) {
            let _data = JSON.parse(data).data.attributes;
            ctx.rest({
                result: _data
            });
        }, function(error) {
            console.log("修改数据失败：" + error);
        });
    },
    //查询某位学生
    'GET /api/student/:id': async(ctx, next) => {
        var id = ctx.params.id;
        return _webHttp.httpGet(`${ip}/record/${id}?${sample_S}`).then(function(data) {
            let _data = JSON.parse(data).data.attributes;
            ctx.rest({
                result: _data
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
    //注册管理员1新建
    'POST /api/admin': async(ctx, next) => {
        var postDoc = {
                "sample": "student_admin"
            },
            token = ctx.request.body.token,
            security_code = ctx.request.body.security_code;
        //先判断验证码是否正确
        if (security_code == ctx.session.param) {
            return _webHttp.httpPost(`${ip}/record?token=${token}`, JSON.stringify(postDoc)).then(function(data) {
                ctx.rest({
                    success: true,
                    result: data
                });
                console.log("新建管理员" + data);
            });
        } else {
            ctx.rest({
                success: false,
                result: "验证码不正确!"
            });
        }
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
        var templateId = '136720';
        var param = parseInt(num);
        // console.log("验证码是：" + param);
        ctx.session.param = param;
        ucpaas.templateSMS(appId, to, templateId, param, function(status, responseText) {
            console.log('code: ' + status + ', text: ' + responseText);
        });
        ctx.rest({
            result: '获取成功，已发送至您手机'
        });
    },
    //登录
    'POST /api/admin/login': async(ctx, next) => {
        var postDoc = {
            phone: ctx.request.body.phone,
            password: ctx.request.body.password
        };
        var _postDoc = JSON.stringify(postDoc);
        return _webHttp.httpGet(`${ip}/records?${sample_A}&wjson=${_postDoc}`).then(function(res) {
            var _res = JSON.parse(res); //转json为字符串判断是否得到值
            if (_res.data.length == 0) {
                ctx.rest({
                    success: false,
                    result: "账号或密码错误"
                });
            } else {
                //设置cookies
                ctx.cookies.set("phone", postDoc.phone, {
                    // domain: 'localhost', // 写cookie所在的域名
                    // path: '/index', // 写cookie所在的路径
                    maxAge: 30 * 60 * 1000, // cookie有效时长
                    httpOnly: false, // 是否只用于http请求中获取
                    overwrite: false // 是否允许重写
                });
                ctx.session.phone = postDoc.phone;
                ctx.rest({
                    success: true,
                    result: res,
                });
            }
        }, function(error) {
            console.log("查询管理员：" + error);
        });
    },
    //上传文件
    'POST /api/upload': async(ctx, next) => {
        // 上传文件请求处理
        let serverFilePath = path.resolve(__dirname, '../static/uploads') //该方法直接跳转至上级目录的static。。。
            // 上传文件事件
        return uploadFile(ctx, {
            fileType: 'album', // common or album 文件类别
            path: serverFilePath
        }).then(function(result) {
            ctx.rest({
                result: result
            });
        }, function(error) {
            console.log("上传失败" + error);
        });

    }
};