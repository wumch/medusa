
'use strict';

(function() {

    const {ipcRenderer} = require("electron");

    const route = function() {
        const handlerMap = {
            'reg.taobao.com/member/reg/fill_mobile.htm': FillMobileHandler,
        };
        const routeKey = location.host + location.pathname;
        const Handler = handlerMap[routeKey] || ErrorHandler;
        return new Handler;
    };

    class BaseHandler {
        constructor() {
            this.loc = location;
            this.ipc = ipcRenderer;
            this.initialize();
        }

        start() {};

        initialize() {};

        ipcCallbackWrap(cb) {
            return function() {

            }
        }

        // 点击坐标
        clickPos(pos, cb) {
            this.ipc.on('', this.ipcCallbackWrap(cb));
            this.ipc.send({
                action: 'click',
                data: {pos: pos}
            });
        }

        // 点击DOM元素
        clickElement(element, cb) {
            const box = element.getBoundingClientRect();
            const pos = {
                x: (Math.random() + 1) / 3 * (box.right - box.left),  // 中间 1/3  位置
                y: (Math.random() + 1) / 3 * (box.bottom - box.top)
            };
            this.clickPos(pos, cb);
        }
    }

    /**
     * 找不到Handler时的缺省处理
     */
    class ErrorHandler extends BaseHandler {
        start() {
            console.error('no handler for [' + location.href + ']');
        }
    }

    /**
     * 填写手机号页面处理
     */
    class FillMobileHandler extends BaseHandler {
        start() {

        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        route().start();
    });
})();
