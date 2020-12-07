//定义游戏参数
var bugTF = false; //定义是否开始穿墙外挂
var speed = 150; //定义开始游戏的速度100像素每秒
var allGap = 150; //定义游戏开始创建管道的上下间距
var changeGap = true; //定义是否改变管道上下间距
var minGap = 100; //定义最小的管道间距
//定义开始开始加载的方法
$(function () {
    bodyWidth = $(document).width(); //获取当前窗口宽度
    bodyHeight = $(document).height(); //获取当前窗口高度
    bgImgWidth = 4 / 3 * bodyHeight; //计算当前窗口大小一张完整的背景长度
    errorPipingPosition = bodyHeight / 4; //定义上管道生成的误差范围
    $window = $("#window"); //获取窗口对象
    $window_ol = $('#window>ol'); //获取窗口背景对象
    $bird = $('#bird'); //获取小鸟对象
    birdFlyAuto = true; //定义小鸟的状态，自动飞打开
    birdFly(); //执行小鸟开始飞的方法
    createWindow(); //创建背景
    let speedAfterGame = 30; //定义未开始游戏前的速度30像素每秒
    skyMoveTime = bgImgWidth / speedAfterGame * 1000; //计算移动一块背景的时间
    skyMove(); //移动背景一次
    skyMoveSetTime = setInterval(function () {
        skyMove();
    }, skyMoveTime);
    //点击按开始游戏执行方法
    $('.start').on('click', () => {
        $(".start").hide(); //隐藏开始按钮
        $window_ol.siblings('.fractionalNum').show(); //显示分数栏目
        fractionalNum = 0; //初始化分数
        birdFlyAuto = false; //取消小鸟自动蹦跶
        birdFlyOnce(); //开启人工操作小鸟方法
        clearInterval(skyMoveSetTime); //清除背景定时移动函数
        $window_ol.stop(true); //停止移动背景
        gameStart();
    })
    //游戏结束时候重新开始方法
    $(".againGame").on("click", () => {
        window.location.reload(); //点击再玩一次后刷新页面
    })
})
//检测窗口变化则刷新页面
$(window).resize(function () {
    window.location.reload();
});
//定义小鸟蹦跶方法
function birdFly() {
    let birdTop = $bird.offset().top; //获取当前小鸟距离屏幕顶端的距离
    birdY = 0; //记录小鸟的偏移位置
    birdFlySetTime = setInterval(() => {
        birdY += 1;
        birdTop += birdY;
        $bird.stop(true).animate({
            'top': birdTop
        }, 30);
        if (birdFlyAuto) {
            if (birdY == 10) {
                birdY = -10
                birdTop += birdY
            }
        }
    }, 30);
}
//定义小鸟飞一次的方法
function birdFlyOnce() {
    $('main').on('click', () => {
        birdY = -10;
    });
    $(document).keydown((e) => {
        if (e.keyCode == 32) {
            birdY = -10;
        }
    });
}
//定义创建背景方法
function createWindow() {
    for (let i = 0; i < 2; i++) {
        $window_ol.append('<li date-key=' + i + '></li>'); //创建前半部分背景
    }
    $window_ol.append($window_ol.children().clone()); //创建后半部分背景
    $window_ol.css({
        'width': bgImgWidth * 4,
        'height': bodyHeight
    }); //给背景设置样式
}
//定义背景移动
function skyMove(bgImgPositionLength, bgImgPositionTime) {
    $window_ol.animate({
        left: '-=' + (bgImgPositionLength || bgImgWidth)
    }, (bgImgPositionTime || skyMoveTime), 'linear', () => {
        $window_ol.css('left', '0px')
    })
}
//定义创建管道构造函数
function CreatPiping(num, gap) {
    this.num = String(num);
    this.gap = gap || allGap; //若有自定义定义间距则导入，若没定义默认为全局
    this.radomDown = errorPipingPosition + Math.round(Math.random() * errorPipingPosition);
    this.radomUp = bodyHeight - this.gap - this.radomDown;
    this.pipingUp = $("<div class='up'>");
    this.pipingDown = $("<div class='down'>");
    this.pipingUp.addClass(this.num);
    this.pipingDown.addClass(this.num);
    this.pipingUp.css({
        'bottom': -(420 - this.radomUp),
        'left': bodyWidth
    });
    this.pipingDown.css({
        'top': -(420 - this.radomDown),
        'left': bodyWidth
    });
    let $window = $("#window");
    $window.append(this.pipingDown);
    $window.append(this.pipingUp);
}
//定义管道的移动并销毁
function PipingMove(num) {
    this.num = String(num);
    let PipingMoveTime = (bodyWidth + 52) / speed * 1000;
    let pipingDown = $window.find('div.down.' + this.num);
    let pipingUp = $window.find('div.up.' + this.num);
    let checkOver = false;
    let checks = setInterval(() => {
        if (checkOver) return;
        new Check(pipingDown);
        new Check(pipingUp);
    }, 30, pipingDown, pipingUp);
    pipingDown.animate({
        left: -52
    }, PipingMoveTime, 'linear', () => {
        pipingDown.remove();
        clearInterval(checks);
    });
    pipingUp.animate({
        left: -52
    }, PipingMoveTime, 'linear', () => {
        pipingUp.remove();
        clearInterval(checks);
    });
    //定义触发游戏结束的条件判断
    function Check(piping) {
        this.piping = piping;
        let birdPositionArr = this.positionBird();
        let pipingPositionArr = this.positionPiping(this.piping);
        if (birdPositionArr[1] >= pipingPositionArr[1] + pipingPositionArr[2]) {
            if (!checkOver) {
                fractionalNum++;
                $(".fractionalNum").text(fractionalNum);
                checkOver = true;
            }
            return;
        }
        if (bugTF) return;
        if (birdPositionArr[0] < 0 || birdPositionArr[0] > bodyHeight) {
            gameOver();
        }
        let checkTF = this.checkPiping(birdPositionArr[0], birdPositionArr[1], birdPositionArr[2], pipingPositionArr[0], pipingPositionArr[1], pipingPositionArr[2], pipingPositionArr[3]);
        if (checkTF) {
            gameOver();
        }
    }
    //抽象封装判断方法
    Check.prototype = {
        //检测小鸟位置
        positionBird: function () {
            let bird = $("#bird>div");
            let birdFlyTop = parseInt(bird.offset().top);
            let birdFlyLeft = parseInt(bird.offset().left);
            return [birdFlyTop, birdFlyLeft, 30];
        },
        //检测管道位置
        positionPiping: function (piping) {
            let pipingTop = parseInt(piping.offset().top);
            let pipingLeft = parseInt(piping.offset().left);
            if (pipingTop < 0) {
                pipingTop = 0;
            }
            let pipingPositionY;
            if (piping.hasClass('down')) {
                pipingPositionY = piping.css("top");
            } else {
                pipingPositionY = piping.css("bottom");
            }
            let pipingHeight = parseInt(pipingPositionY) + 420;
            return [pipingTop, pipingLeft, 52, pipingHeight];
        },
        //检测管道碰撞
        checkPiping: function (birdFlyTop, birdFlyLeft, birdSide, pipingTop, pipingLeft, pipingWidth, pipingHeight) {
            let minX = pipingLeft - birdSide;
            let maxX = pipingLeft + pipingWidth;
            let minY = pipingTop - birdSide;
            let maxY = pipingTop + pipingHeight;
            if (birdFlyLeft >= minX && birdFlyLeft <= maxX && birdFlyTop >= minY && birdFlyTop <= maxY) {
                return true;
            } else {
                return false;
            }
        }
    }
}
//定义游戏开始函数
function gameStart() {
    let bgImgPositionLength = bgImgWidth + parseFloat($window_ol.css('left')); //计算第一次需要移动的距离
    let bgImgPositionTime = bgImgPositionLength / speed * 1000; //计算第一次需要移动的时间
    skyMoveTime = bgImgWidth / speed * 1000; //重新计算移动一块背景的时间
    skyMove(bgImgPositionLength, bgImgPositionTime); //移动背景一次
    skyMoveOnce = setTimeout(() => {
        skyMove(); //第二次运行
        skyMoveSetTime = setInterval(function () {
            skyMove();
        }, skyMoveTime);
    }, bgImgPositionTime);
    num = 1; //定义当前管道编号
    testNum = 1; //定义减小管道间距的间隔组数
    nowGap = allGap; //定义实时管道间距
    createPiping = setInterval(() => {
        if (changeGap) {
            if (testNum) {
                testNum--;
            } else {
                nowGap -= 5;
                if (nowGap < minGap) {
                    nowGap = minGap;
                }
                testNum = 1;
            }
            new CreatPiping(num, nowGap); //创建逐渐减小的管道
        } else {
            new CreatPiping(num); //创建管道
        }
        new PipingMove(num); //移动管道
        num++;
    }, skyMoveTime / 4);
}
//定义游戏结束函数
function gameOver() {
    clearInterval(birdFlySetTime); //清除小鸟移动定时器
    $bird.stop(true); //停止小鸟移动动画
    clearInterval(createPiping); //清除管道创建定时器
    $window.children('div').stop(true); //停止移动管道
    clearTimeout(skyMoveOnce); //清除第二次自动移动
    clearInterval(skyMoveSetTime); //清除背景移动定时器
    $window_ol.stop(true); //停止移动背景
    $window.children('span').hide(); //中上部分分数显示栏隐藏
    $bird.stop(true).css("animation-play-state", "paused"); //小鸟暂停动画
    $("#overGame>div").css("background", "rgba(0, 0, 0, 0.6)"); //添加背景颜色
    $("#overGame>div>.over").show(); //显示结束栏目
}