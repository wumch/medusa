
'use strict';

const {app, BrowserWindow} = require('electron');
const robot = require('robotjs');

let win = null;
const startup = function() {
    win = new BrowserWindow({x:0, y:0, width: 1280, height: 1024});
    win.addListener('close', function () {
    });
    win.addListener('move', function () {
        console.log(win.getPosition());
    });
    win.loadURL('file://' + __dirname + '/main.html');
    win.openDevTools();
    robot.setMouseDelay(2);
};

app.on('ready', startup);
