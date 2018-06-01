
'use strict';

const {app, BrowserWindow} = require('electron');
const robot = require('robotjs');

let win = null;
const startup = function() {
    win = new BrowserWindow({width: 1200, height: 800});
    win.on('close', function () {
    });
    win.loadURL('file://' + __dirname + '/main.html');
    robot.setMouseDelay(2);
};

app.on('ready', startup);
