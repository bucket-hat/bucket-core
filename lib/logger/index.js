'use strict';

const log4js = require('log4js');
const path = require('path');
const chalk = require('chalk');
const debug = require('debug')('app');

module.exports = (app) => {

  const option = Object.assign({}, {
    type: 'file',
    filename: path.join(app.path.root, './log/app.log'),
    absolute: true,
    pattern: '.yyyy-MM-dd.log',
    alwaysIncludePattern: true,
    category: 'log',
    maxLogSize: 2048000,
    backups: 1000
  }, app.config.logger);

  log4js.configure({
    'appenders': [option]
  });

  const logger = log4js.getLogger('log');

  const getDateFormat = (timeStamp) => {
    const addZero = (num) => {
      return num < 10 ? `0${num}` : num;
    };
    let d = timeStamp ? new Date(timeStamp) : new Date();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let date = d.getDate();
    let hour = addZero(d.getHours());
    let minute = addZero(d.getMinutes());
    let second = addZero(d.getSeconds());
    let ms = d.getMilliseconds();
    return `${year}-${month}-${date} ${hour}:${minute}:${second}:${ms}`;
  };

  const toString = (...param) => {
    return param.map(ele => {
      return typeof ele === 'object' ? JSON.stringify(ele) : ele;
    });
  };

  const loggerWrapper = {
    info: (...param) => {
      param = toString(...param);
      logger.info(...param);
      debug(chalk.green('[info]', getDateFormat(), ...param));
    },
    error: (...param) => {
      param = toString(...param);
      logger.error(...param);
      debug(chalk.red('[error]', getDateFormat()), ...param);
    },
    warn: (...param) => {
      param = toString(...param);
      logger.warn(...param);
      debug(chalk.yellow('[warn]', getDateFormat(), ...param));
    },
    debug: (...param) => {
      param = toString(...param);
      logger.debug(...param);
      debug(chalk.blue('[debug]', getDateFormat(), ...param));
    },
    trace: (...param) => {
      param = toString(...param);
      logger.trace(...param);
      debug(chalk.yellow('[trace]', getDateFormat(), ...param));
    },
  };

  return loggerWrapper;
};