
const {remote} = require('electron');
const robot = require('robotjs');
const {getLogger} = require('./logger');
const config = remote.getGlobal('config');

/**
 * @type WebContents
 */
let wc;

const initialize = _wc => {
    wc = _wc;
};

// 点击全局坐标
const clickPos = pos => {
    robot.moveMouse(pos.x, pos.y);
    getLogger().debug('click at', pos);
    robot.mouseClick();
};

// 点击DOM元素
const clickInRect = rect => {
    const pos = globalPos(posInRect(rect));
    getLogger().debug('click in rect', pos);
    clickPos(pos);
};

// 转换为全局坐标
const globalPos = pos => {
    return {
        x: pos.x + config.winPos.x + config.winFrame.width,
        y: pos.y + config.winPos.y + config.winFrame.height,
    };
};

// 区域随机取点
const posInRect = rect => {
    return {
        x: rect.x + (Math.random() + 1) * rect.width / 3,  // 中间 1/3  位置
        y: rect.y + (Math.random() + 1) * rect.height / 3,
    };
};

// 拖动滑块验证码
const mouseDrag = (from, to) => {
    robot.setMouseDelay(100);
    robot.moveMouse(from.x, from.y);
    robot.mouseToggle('down');
    robot.dragMouse(to.x, to.y);
    robot.mouseToggle('up');
};

// 生成js代码：向<selector>输入文本
const genCodeTypeText = (selector, text) => {
    const f = (s, t) => {
        document.querySelector(s).value = t;
    };
    return genCodeCall(f, [selector, text]);
};

// 生成js代码：取<webview>内部元素的位置
const genCodeGetRect = selector => {
    const f = s => {
        const e = document.querySelector(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return {x: r.x, y: r.y, width: r.width, height: r.height};
    };
    return genCodeCall(f, [selector]);
};

// 生成js代码
const genCodeCall = (func, args) => {
    const funcBody = '(' + func.toString() + ')';
    if (!args || args.length === 0) {
        return funcBody + '()';
    }
    const argsSegs = [];
    for (let a of args) {
        argsSegs.push(JSON.stringify(a));
    }
    const code = funcBody + '(' + argsSegs.join(',') + ')';
    getLogger().debug('generate code:', code);
    return code;
};

// Promise: 穿梭执行(在<webview>内执行{jsCode})
const shuttle = (jsCode, userGesture=true) => {
    return new Promise((resolve, reject) => {
        wc.executeJavaScript(jsCode, userGesture, resolve);
    });
};

// 延迟执行
const defer = (delay, randomFactor=0) => {
    return new Promise((resolve, reject) => {
        if (randomFactor) {
            delay += randomFactor * Math.random();
        }
        setTimeout(resolve, delay);
    });
};

// defer包装，用法：<Promise>.then(deferMaker(300))
const deferMaker = (delay, randomFactor=0) => {
    return () => {
        return defer(delay, randomFactor);
    }
};

// 条件等待
const untill = (inspect, timeout) => {
    return new Promise((resolve, reject) => {
        const end = new Date().getTime() + (timeout || 3000);
        const work = () => {
            if (inspect()) {
                resolve();
            } else if (new Date().getTime() < end) {
                defer(200).then(work);
            } else {
                reject();
            }
        };
        work();
    });
};

// 等待<selector>出现
const waitElement = (selector, timeout) => {
    const f = s => {
        return !!document.querySelector(s);
    };
    const code = genCodeCall(f, [selector]);
    const end = new Date().getTime() + (timeout || 3000);
    let resolve, reject;
    const exam = exists => {
        if (exists) {
            resolve();
        } else if (new Date().getTime() > end) {
            getLogger().warn('wait for element [' + selector + '] timeout after ' + (timeout || 3000));
            reject();
        } else {
            return defer(200).then(() => {
                return shuttle(code).then(exam);
            });
        }
    };
    return new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
        exam(false);
    });
};

exports.initialize = initialize;
exports.clickPos = clickPos;
exports.clickInRect = clickInRect;
exports.genCodeTypeText = genCodeTypeText;
exports.mouseDrag = mouseDrag;
exports.shuttle = shuttle;
exports.genCodeCall = genCodeCall;
exports.genCodeGetRect = genCodeGetRect;
exports.untill = untill;
exports.defer = defer;
exports.deferMaker = deferMaker;
exports.waitElement = waitElement;
exports.posInRect = posInRect;
exports.globalPos = globalPos;
