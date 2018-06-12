
const log4js = require('log4js');
const config = global.config || require('electron').remote.getGlobal('config');
const configuredLoggers = {};

const getLogger = function(kind) {
    const logger = configuredLoggers[kind];
    if (logger) {
        return logger;
    }
    const options = {
        replaceConsole: true,
        appenders: {
            stdout: {  // 控制台输出
                type: 'stdout',
            },
            master: {  // 主线程(browser)
                type: 'dateFile',
                filename: config.log.dir + '/',
                pattern: 'master-yyyy-MM-dd.log',
                alwaysIncludePattern: true,
            },
            worker: {  // 渲染线程(renderer)
                type: 'dateFile',
                filename: config.log.dir + '/',
                pattern: 'worker-yyyy-MM-dd.log',
                alwaysIncludePattern: true,
            }
        },
        categories: {
            master: { appenders: ['master'], level: config.log.level },
            worker: { appenders: ['worker'], level: config.log.level },
            default: { appenders: ['stdout'], level: config.log.level },
        }
    };
    if (config.debug) {  // debug模式下日志输出到控制台
        for (let k of Object.keys(options.categories)) {
            if (options.categories[k].appenders.indexOf('stdout') === -1) {
                options.categories[k].appenders.push('stdout');
            }
        }
    }
    log4js.configure(options);
    return configuredLoggers[kind] = log4js.getLogger(kind);
};

exports.getLogger = getLogger;
