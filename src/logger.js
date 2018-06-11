
const log4js = require('log4js');

const configuredLoggers = {};

const getLogger = function(kind) {
    if (!configuredLoggers[kind]) {
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
                main: {  // 主线程
                    type: 'dateFile',
                    filename: 'logs/',
                    pattern: 'main-yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                },
                renderer: {  // 渲染线程
                    type: 'dateFile',
                    filename: 'logs/',
                    pattern: 'renderer-yyyy-MM-dd.log',
                    alwaysIncludePattern: true,
                }
            },
            categories: {
                main: { appenders: ['stdout', 'main'], level: 'debug' },
                renderer: { appenders: ['stdout', 'renderer'], level: 'debug' },
                default: { appenders: ['stdout'], level: 'debug' },
            }
        });
        configuredLoggers[kind] = log4js.getLogger(kind);
    }
    return configuredLoggers[kind];
};

exports.getLogger = getLogger;
