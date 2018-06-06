
'use strict';

const {app, BrowserWindow} = require('electron');
const robot = require('robotjs');

let win = null;
const startup = function() {
    win = new BrowserWindow({width: 1280, height: 1024});
    win.on('close', function () {
    });
    win.loadURL('file://' + __dirname + '/main.html');
    win.openDevTools();
    robot.setMouseDelay(2);
};

app.on('ready', startup);
