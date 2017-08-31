module.exports = {
    'GET /': async(ctx, next) => {
        ctx.render('index.html', {
            title: "学生管理系统"
        });
    },
    // 'GET /123': async(ctx, next) => {
    //     ctx.response.body = "index.html"
    // }
};