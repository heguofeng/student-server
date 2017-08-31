//回调
// var sleep2 = function(callback) {
//     return new Promise(function(resolve, reject) {
//         setTimeout(function() {
//             callback();
//             resolve();
//         }, 1000);

//     })
// };

// var start2 = function() {
//     var time_start2 = new Date().getTime();
//     console.log('回调 start');
//     sleep2(dayin2);
//     var time_t = new Date().getTime() - time_start2;
//     console.log('回调 end' + time_t + 'ms');

//     function dayin2() {
//         //时间差

//     }

// };

// start2();


// async/await方法
var sleep1 = function() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve();
        }, 1000);

    })
};

var start1 = async function() {
    // 在这里使用起来就像同步代码那样直观
    var time_start1 = new Date().getTime();
    console.log('start');
    await sleep1();
    var time_t = new Date().getTime() - time_start1; //时间差
    console.log('end' + time_t + 'ms');
    dayin1();

    function dayin1() {

    }
};
start1();