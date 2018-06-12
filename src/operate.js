
const robot = require('robotjs');
const {getLogger} = require('./logger');

// 点击坐标
const clickPos = pos => {
    robot.moveMouse(pos.x, pos.y);
    robot.mouseClick();
};

// 点击DOM元素
const clickInRect = (rect) => {
    const pos = {
        x: rect.x + (Math.random() + 1) * rect.width / 3,  // 中间 1/3  位置
        y: rect.y + (Math.random() + 1) * rect.height / 3,
    };
    getLogger().info('click at', pos);
    clickPos(pos);
};

// 点击DOM元素
const clickElement = element => {
    const box = element.getBoundingClientRect();
    const pos = {
        x: box.x + (Math.random() + 1) * box.width / 3,  // 中间 1/3  位置
        y: box.y + (Math.random() + 1) * box.height / 3,
    };
    clickPos(pos);
};

// 拖动滑块验证码
const mouseDrag = (from, to) => {
    robot.setMouseDelay(100);
    robot.moveMouse(from.x, from.y);
    robot.mouseToggle('down');
    robot.dragMouse(to.x, to.y);
    robot.mouseToggle('up');
};

// 生成js代码：取<webview>内部元素的位置
const getRect = (selector) => {
    const f = (s) => {
        const e = document.querySelector(s);
        alert(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return {x: r.x, y: r.y, width: r.width, height: r.height};
    };
    return genCodeCall(f, [selector]);
};

// 生成js代码
const genCodeCall = (func, args) => {
    const funcBody = '(' + func.toString() + ')';
    if (!args) {
        return funcBody + '()';
    }
    const argsSegs = [];
    for (let a of args) {
        argsSegs.push(JSON.stringify(a));
    }
    const code = funcBody + '(' + argsSegs.join(',') + ')';
    getLogger().debug('generate code: [' + code + ']');
    return code;
};

// 等待执行
const waitFor = function(options) {
    const maxtimeOutMillis = options.timeoutMillis || 3000,
        end = new Date().getTime() + maxtimeOutMillis;
    const work = function() {
        if (options.testFunc()) {
            if (options.delayMillis) {
                setTimeout(options.onReady, options.delayMillis);
            } else {
                options.onReady();
            }
        } else if (new Date().getTime() < end) {
            setTimeout(work, 200);
        } else {
            options.onTimeout();
        }
    };
    work();
};

exports.clickPos = clickPos;
exports.clickElement = clickElement;
exports.clickInRect = clickInRect;
exports.mouseDrag = mouseDrag;
exports.genCodeCall = genCodeCall;
exports.getRect = getRect;
exports.waitFor = waitFor;
