'use strict';

const http = require('http');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const KoaBody = require('koa-body');

module.exports = (app) => {

  const init = (option) => {

    const config = Object.assign({
      port: 3031,
    }, app.config.http, option);

    const koaApp = new Koa();
    const router = new KoaRouter();
    const koaBody = new KoaBody();

    const errHandler = async(ctx, next) => {
      try {
        app.library.logger.info(`[httpRouter] request ${ctx.ip} ${ctx.method} ${ctx.url}`);
        const start = new Date();
        await next();
        const ms = new Date() - start;
        app.library.logger.info(`[httpRouter] response ${ctx.ip} ${ctx.method} ${ctx.url} status ${ctx.status} +${ms}ms`);
      } catch (err) {
        app.library.logger.error(err);
        ctx.status = 500;
        ctx.body = 'error';
      }
    };

    koaApp
      .use(errHandler)
      .use(router.routes())
      .use(router.allowedMethods());

    const httpServer = http.createServer(koaApp.callback());
    httpServer.listen(config.port);

    const serverClose = async() => {
      return await new Promise((resolve) => {
        app.library.logger.info('[httpRouter] close ...');
        httpServer.close(resolve);
      });
    };

    const controllerWrapper = (controllerAction) => {
      return async(ctx, next) => {
        let ctrlAct = controllerAction.split('.');
        if (ctrlAct.length !== 2)
          throw ('Usage: httpRouter.get(\'/example/:id\', \'controller.action\')');
        let act = ctrlAct[1];
        let ctrl = new app.controller[ctrlAct[0]](ctx);
        await ctrl[act]();
        await next();
      };
    };

    const middlewareWrapper = (middleware) => {
      const m = middleware.map((middleware) => {
        if (typeof middleware === 'function') {
          return middleware;
        } else if (typeof middleware === 'string') {
          return controllerWrapper(middleware);
        }
      });
      m.unshift(koaBody);
      return m;
    };

    const head = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.head(uri, ...m);
    };

    const options = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.options(uri, ...m);
    };

    const get = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.get(uri, ...m);
    };

    const post = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.post(uri, ...m);
    };
    
    const put = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.put(uri, ...m);
    };

    const patch = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.patch(uri, ...m);
    };

    const del = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.del(uri, ...m);
    };

    const redirect = (uri, ...middleware) => {
      const m = middlewareWrapper(middleware);
      router.redirect(uri, ...m);
    };

    return {
      head,
      options,
      get,
      post,
      put,
      patch,
      del,
      redirect,
      serverClose,
    };
  };

  return init;
};