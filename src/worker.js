
const {remote} = require('electron');
const robot = require('robotjs');
const config = remote.getGlobal('config');
const logger = require('./logger').getLogger('worker');
const {
    initialize,
    clickInRect, mouseDrag,
    shuttle, genCodeCall, genCodeGetRect, genCodeTypeText,
    untill, defer, waitElement,
    posInRect, globalPos
} = require('./operate');

let webview;
/**
 * @type WebContents
 */
let wc;

// todo: one day, FSM...
const steps = [
    'set-proxy',  // 设置代理
    'agreement',  // 同意协议
    'fill-mobile',  // 填写手机号
    'move-captcha',  // 拖滑块验证码
    'forward',  // 点击下一步
];

// 向<selector>输入文本
const typeText = (selector, text) => {
    return shuttle(genCodeTypeText(selector, text));
};

// 输入手机号，等待验证码；输入验证码
const verifyMobile = () => {
    shuttle(genCodeTypeText('#J_Mobile', '13911001439')).then(() => {  // 输入手机号
        return defer(1000, 2000);  // 延迟
    }).then(() => {  // 点击【下一步】获取验证码
        return clickElement('#J_BtnMobileForm');
    }).then(() => {  // 等待悬浮框里的短信验证码元素
        return waitElement('#J_MobileCode', 3000);
    }).then(() => {  // 输入短信验证码
        return typeText('#J_MobileCode', 'aaabbb');
    }).then(() => {  // 点击确认
        return clickElement('#J_BtnMobileCodeForm');
    });
};

// 检查元素是否出现
const elementExistsa = (selector, func) => {
    wc.executeJavaScript(genCodeCall(s => {
        return !!document.querySelector(s);
    }, [selector]), true, func);
};

// 等待点击【同意协议】 => 通过滑块验证码
const agreeTerm = () => {
    const promise = new Promise((resolve, reject) => {
        let blockRect = null;
        waitElement('#J_AgreementBtn', 3000).then(() => {  // 点击【同意协议】，并延迟几秒
            return clickElement('#J_AgreementBtn');
        }).then(() => {
            return defer(2000, 5000);
        }).then(() => {  // 取滑块位置
            return shuttle(genCodeGetRect('#nc_1_n1z'));
        }).then(_blockRect => {  // 取滑槽位置
            blockRect = _blockRect;
            return shuttle(genCodeGetRect('#nc_1__scale_text'));
        }).then(slotRect => {  // 拖动滑块
            const fromPos = globalPos(posInRect(blockRect));
            const rightRect = {
                x: slotRect.x + slotRect.width - blockRect.width,
                y: slotRect.y,
                width: blockRect.width,
                height: blockRect.height,
            };
            const toPos = globalPos(posInRect(rightRect));
            mouseDrag(fromPos, toPos);
        }).then(() => {  // 滑块验证码检查
            const captchaPast = () => {
                return /\bbtn-disabled\b/.test(document.querySelector('#J_BtnMobileForm').className);
            };
            const code = genCodeCall(captchaPast);
            return shuttle(code).then(past => {
                (past ? resolve : reject)();
            });
        });
    });
};

const setProxy = proxy => {
    wc.session.setProxy({proxyRules: proxy}, () => {
        webview.loadURL('https://www.baidu.com/s?wd=ip&rsv_spt=1&rsv_iqid=0x991d149e00045283&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=2&rsv_sug1=2&rsv_sug7=100&rsv_sug2=0&inputT=595&rsv_sug4=595');
    });
};

// 点击<webview>内部元素
const clickElement = (selector) => {
    return shuttle(genCodeGetRect(selector)).then(clickInRect);
};

const bootstrap = () => {
    agreeTerm();
};

exports.start = _webview => {
    webview = _webview;
    wc = webview.getWebContents();
    initialize(wc);
    if (config.workerDevTools) {
        webview.openDevTools();
    }
    bootstrap();
};
