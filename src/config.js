
'use strict';

exports.config = {
    debug: true,
    masterDevTools: false,
    workerDevTools: true,
    show: true,
    log: {
        dir: 'logs',
        level: 'debug',
    },
    restartDeadline: 150000,

    winPos: {x: 0, y: 0},
    winSize: {width: 1280, height: 1024},
    winFrame: {width: 0, height: 0},

    useraAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
};
