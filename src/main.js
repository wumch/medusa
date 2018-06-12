
'use strict';

const {app, ipcMain, BrowserWindow} = require('electron');
const config = global.config = require('./config').config;
const logger = require('./logger').getLogger('master');

let win = null;  // 主窗口 <BrowserWindow>

const startup = function() {
    win = new BrowserWindow({
        x: config.winPos.x, y: config.winPos.y,
        width: config.winSize.width, height: config.winSize.height,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        }
    });

    win.addListener('move', function () {
        config.winPos = win.getPosition();
    });
    win.webContents.openDevTools();

    win.loadURL('file://' + __dirname + '/main.html');
};

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', startup);
