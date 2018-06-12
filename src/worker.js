
const {remote} = require('electron');
const robot = require('robotjs');
const config = remote.getGlobal('config');
const logger = require('./logger').getLogger('worker');
const {clickPos, clickElement} = require('./handler/operate');
let webview = null;

// todo: one day, FSM...
const steps = [
    'set-proxy',  // 设置代理
    'agreement',  // 同意协议
    'fill-mobile',  // 填写手机号
    'move-captcha',  // 拖滑块验证码
    'forward',  // 点击下一步
];

const agreeTerm = () => {
    clickElement();
};

const setProxy = proxy => {
    webview.getWebContents().session.setProxy({proxyRules: proxy}, () => {
        webview.loadURL('https://www.baidu.com/s?wd=ip&rsv_spt=1&rsv_iqid=0x991d149e00045283&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg&rsv_enter=1&rsv_sug3=2&rsv_sug1=2&rsv_sug7=100&rsv_sug2=0&inputT=595&rsv_sug4=595');
    });
};

exports.start = function(_webview) {
    webview = _webview;
    logger.info(webview.getWebContents().getURL());
    setTimeout(moveCaptcha, 10000);
};
