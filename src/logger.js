
const log4js = require('log4js');

const configuredLoggers = {};

const getLogger = function(kind) {
    const logger = configuredLoggers[kind];
    if (logger) {
        return logger;
    }
    const appenders = [];
    if (config.debug && Object.keys(configuredLoggers).length === 0) {
        appenders.push({type: 'console'});
    }
    appenders.push({category: kind, type: 'file', filename: config.logFile});
    log4js.configure({
        replaceConsole: true,
        appenders: {
            stdout: {  // 控制台输出
                type: 'stdout',
            },
            master: {  // 主线程(browser)
                type: 'dateFile',
                filename: 'logs/',
                pattern: 'master-yyyy-MM-dd.log',
                alwaysIncludePattern: true,
            },
            worker: {  // 渲染线程(renderer)
                type: 'dateFile',
                filename: 'logs/',
                pattern: 'worker-yyyy-MM-dd.log',
                alwaysIncludePattern: true,
            }
        },
        categories: {
            master: { appenders: ['stdout', 'master'], level: 'debug' },
            worker: { appenders: ['stdout', 'worker'], level: 'debug' },
            default: { appenders: ['stdout'], level: 'debug' },
        }
    });
    return configuredLoggers[kind] = log4js.getLogger(kind);
};

exports.getLogger = getLogger;
