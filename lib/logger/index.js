'use strict';

const tracer = require('tracer')
const path = require('path')
const chalk = require('chalk');

module.exports = (app) => {

  const option = Object.assign({}, {
    root: path.join(app.path.root, './log'),
    maxLogFiles: 10,
    allLogsFileName: 'app',
    level: 'debug',
    dateformat: 'yyyy-mm-dd HH:MM:ss.L',
    inspectOpt: {
      showHidden: false,
      depth: 3
    },
    transport: function (data) {
      let output;
      switch(data.title){
        case 'info':
          output = chalk.green(data.output);
          break;
        case 'error':
          output = chalk.red(data.output);
          break;
        case 'warn':
          output = chalk.yellow(data.output);
          break;
        case 'debug':
          output = chalk.blue(data.output);
          break;
        default:
          output = data.output;
          break;
      }
      console.log(output)
    }
  }, app.config.logger);

  const Logger = tracer.dailyfile(option);

  return Logger;
};