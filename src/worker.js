
const {remote} = require('electron');
const robot = require('robotjs');
const config = remote.getGlobal('config');
const logger = require('./logger').getLogger('worker');
const {
    initialize,
    clickInRect, mouseDrag,
    shuttle, genCodeCall, genCodeGetRect, genCodeTypeText,
    untill, defer, deferMaker, waitElement,
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

// 注册成功界面
const saveAccount = () => {

};

// 填写账号信息 todo: implement
const makeAccount = () => {

};

// 输入手机号，等待验证码；输入验证码
const verifyMobile = () => {
    return new Promise((resolve, reject) => {
        shuttle(genCodeTypeText('#J_Mobile', '13911001439'))  // 输入手机号
        .then(deferMaker(500, 2000))
        .then(() => {  // 点击【下一步】发送验证码
            return clickElement('#J_BtnMobileForm');
        }).then()  // 获取验证码字符串 todo: implement
        .then(() => {  // 等待悬浮框里的短信验证码元素
            return waitElement('#J_MobileCode', 3000);
        }).then(() => {  // 输入短信验证码
            return typeText('#J_MobileCode', 'aaabbb');
        }).then(() => {  // 点击确认
            return clickElement('#J_BtnMobileCodeForm');
        }).then(deferMaker(1000))
        .then(() => {  // 检查验证是否通过 todo: implement
            return true;
        }).then(past => {
            past ? resolve() : reject();
        });
    });
};

// 等待点击【同意协议】 => 通过滑块验证码
const agreeTerm = () => {
    return new Promise((resolve, reject) => {
        let blockRect = null;
        waitElement('#J_AgreementBtn', 3000)
            .then(() => {  // 点击【同意协议】，并延迟几秒
                return clickElement('#J_AgreementBtn');
            }).then(deferMaker(2000, 5000))
            .then(() => {  // 取滑块位置
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
            }).then(() => {  // 拖完等待验证通过
                const captchaPast = () => {
                    return !/\bbtn-disabled\b/.test(document.querySelector('#J_BtnMobileForm').className);
                };
                return shuttle(genCodeCall(captchaPast));
            }).then(past => {
                past ? resolve() : reject();
            });
    });
};

// 获取代理 todo: implement
const fetchProxy = () => {
    return new Promise((resolve, reject) => {
        resolve('http://127.0.0.1:8088');
    });
};

// 为<webview>设置http代理
const attachProxy = proxy => {
    return new Promise((resolve, reject) => {
        fetchProxy().then(proxy => {
            if (!proxy) return reject();
            wc.session.setProxy({proxyRules: proxy}, () => {
                logger.info('using proxy', proxy);
                // webview.loadURL('https://www.baidu.com/s?wd=ip&rsv_spt=1&rsv_iqid=0x991d149e00045283&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=2&rsv_sug1=2&rsv_sug7=100&rsv_sug2=0&inputT=595&rsv_sug4=595');
                return resolve();
            });
        }, reject);
    })
};

// 点击<webview>内部元素
const clickElement = (selector) => {
    return shuttle(genCodeGetRect(selector)).then(clickInRect);
};

// 重启整个流程
const restart = () => {
    logger.info('reloading <WebContents>. current page url:', wc.getURL());
    window.reload();
    logger.info('<WebContents> reloaded, current url: ', wc.getURL());
};

// 启动
const bootstrap = () => {
    attachProxy()  // 设置http代理
        .then(deferMaker(100))
        .then(agreeTerm, restart)  // 同意协议
        .then(deferMaker(1000, 3000))
        .then(verifyMobile, restart)  // 手机号验证
        .then(deferMaker(1000, 3000))
        .then(makeAccount, restart)  // 填写账号信息
        .then(deferMaker(1000, 3000))
        .then(saveAccount, restart)  // 保存账号
        .then(restart);
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
