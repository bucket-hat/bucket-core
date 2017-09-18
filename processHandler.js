'use strict';

module.exports = (app) => {
  const logger = app.library.logger;
  app.beforeExit = [];

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('[Process] catch event unhandledRejection, reason is ', reason, ' promise is ', promise);
  });
  process.on('uncaughtException', (error) => {
    logger.error('[Process] catch event uncaughtException, error is ', error);
    process.abort();
  });
  process.on('warning', (warning) => {
    logger.warn('[Process] catch event warning, warning is ', warning);
  });
  let signalFlag = false;
  process.on('SIGINT', () => {
    if (signalFlag)
      return;
    signalFlag = true;
    logger.warn('[Process] Received SIGINT');
    setTimeout(process.exit, 1000);
    Promise.all(app.beforeExit.filter(item => typeof item === 'function').map(async item => await item())).then(() => {
      logger.warn('[Process] exit');
      process.exit();
    });
  });
};
