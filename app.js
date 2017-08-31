const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const rest = require('./rest');

const app = new Koa();

//跨域
// var cors = require('koa2-cors');
// app.use(cors()); 

//声明当前不是开发环境
const isProduction = process.env.NODE_ENV === 'production';

// log request URL:记录日志信息
app.use(async(ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next(); //直接跳转至下一个中间件，后面的两行代码最后执行
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

// static file support:如果是开发环境，则处理静态文件
if (!isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

//第三个解析POST请求
app.use(bodyParser());

// 第四个middleware负责给ctx加上render() 来使用Nunjucks：
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

// bind .rest() for ctx:
app.use(rest.restify());

//最后一个middleware处理URL路由：
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');