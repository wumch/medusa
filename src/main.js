
const {app, BrowserWindow} = require('electron');
const robot = require('robotjs');

const startup = function() {
    const win = new BrowserWindow({width: 800, height: 600});
    win.openDevTools();
    win.webContents.loadFile('./main.html');
    win.on('close', function () {
    });

    robot.setMouseDelay(2);

    let twoPI = Math.PI * 2.0;
    let screenSize = robot.getScreenSize();
    let height = (screenSize.height / 2) - 10;
    let width = screenSize.width;

    for (let x = 0; x < width; x++)
    {
        let y = height * Math.sin((twoPI * x) / width) + height;
        robot.moveMouse(x, y);
    }
};

app.on('ready', startup);
