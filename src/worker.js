
const {remote} = require('electron');
const robot = require('robotjs');
const config = remote.getGlobal('config');
const logger = require('./logger').getLogger('worker');
const {clickInRect, mouseDrag, genCodeCall, genCodeGetRect, untill, defer, posInRect, globalPos} = require('./operate');
let webview = null;
let wc = null;

// todo: one day, FSM...
const steps = [
    'set-proxy',  // 设置代理
    'agreement',  // 同意协议
    'fill-mobile',  // 填写手机号
    'move-captcha',  // 拖滑块验证码
    'forward',  // 点击下一步
];

// Promise: 穿梭执行(在<webview>内执行{jsCode})
const shuttle = (jsCode, userGesture=true) => {
    return new Promise((resolve, reject) => {
        wc.executeJavaScript(jsCode, userGesture, resolve);
    });
};

// 检查元素是否出现
const elementExists = (selector, func) => {
    wc.executeJavaScript(genCodeCall(s => {
        return !!document.querySelector(s);
    }, [selector]), true, func);
};

// 等待点击【同意协议】
const agreeTerm = () => {
    const btnSelector = '#J_AgreementBtn';
    let blockRect = null;
    let agreeBtnAppears = false;
    untill(() => {  // 等待弹出【同意协议】
        elementExists(btnSelector, res => {agreeBtnAppears = res;});
        return agreeBtnAppears;
    }, 1500, 3000).then(() => {  // 点击【同意协议】，并延迟几秒
        clickElement(btnSelector);
        return defer(2000, 5000);
    }).then(() => {  // 取滑块位置
        return shuttle(genCodeGetRect('#nc_1_n1z'));
    }).then((_blockRect) => {  // 取滑槽位置
        blockRect = _blockRect;
        return shuttle(genCodeGetRect('#nc_1__scale_text'));
    }).then((slotRect) => {  // 拖动滑块
        const fromPos = globalPos(posInRect(blockRect));
        const rightRect = {
            x: slotRect.x + slotRect.width - blockRect.width,
            y: slotRect.y,
            width: blockRect.width,
            height: blockRect.height,
        };
        const toPos = globalPos(posInRect(rightRect));
        mouseDrag(fromPos, toPos);
    });
};

const setProxy = proxy => {
    webview.getWebContents().session.setProxy({proxyRules: proxy}, () => {
        webview.loadURL('https://www.baidu.com/s?wd=ip&rsv_spt=1&rsv_iqid=0x991d149e00045283&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=2&rsv_sug1=2&rsv_sug7=100&rsv_sug2=0&inputT=595&rsv_sug4=595');
    });
};

// 点击<webview>内部元素
const clickElement = (selector) => {
    wc.executeJavaScript(genCodeGetRect(selector), true, clickInRect);
};

const bootstrap = () => {
    agreeTerm();
};

exports.start = _webview => {
    webview = _webview;
    wc = webview.getWebContents();
    if (config.workerDevTools) {
        webview.openDevTools();
    }
    bootstrap();
};
