const _webHttp = require('../webhttp');
const APIError = require('../rest').APIError;
const ip = "http://106.14.145.165:3333";
var sample_S = "sample=student";
var sample_A = "sample=student_admin";
module.exports = {
    getToken: async(ctx, next) => {
        //异步方法一  async/await，同步形式
        return _webHttp.httpGet(`${ip}/token?user=admin&password=123456`).then(function(data) {
            let _data = JSON.parse(data).data.attributes.token; //为了隐藏data里的服务器ip，做一步数据处理
            ctx.rest({
                result: _data
            });
        }, function(error) {
            console.error("出错了：", error);
        });
    },
}