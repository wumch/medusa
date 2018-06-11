
'use strict';

const {app, ipcMain, BrowserWindow} = require('electron');
const robot = require('robotjs');
const config = global.config = require('./config').config;
const context = global.context = {
    task: 'register',  // 整体目标。预留参数，当前没用。
    prev_step: null,  // 上一步骤。（step 与 页面 不对应）
    step: 'agreement',  // 当前步骤
    next_step: 'fill-mobile',  // 下一步骤
};

const logger = require('./logger').getLogger('main');  //

let win = null;  // 主窗口 <BrowserWindow>

// todo: one day, FSM...
const steps = [
    'set-proxy',  // 设置代理
    'agreement',  // 同意协议
    'fill-mobile',  // 填写手机号
    'move-captcha',  // 拖滑块验证码
    'forward',  // 点击下一步
];

const startup = function() {
    win = new BrowserWindow({
        x: 0, y: 0,
        width: 1280, height: 1024,
    });

    win.webContents.on('did-finish-load', function() {
        logger.info('haha');
    });

    win.addListener('move', function () {
        console.log(win.getPosition());
    });
    win.loadURL('file://' + __dirname + '/main.html');
    win.openDevTools();
    robot.setMouseDelay(2);
};

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', startup);
