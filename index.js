'use strict';

const debug = require('debug')('app:core');
const path = require('path');
const fs = require('fs');
const processHandler = require('./processHandler');

module.exports = (option) => {
	let {
		rootPath,
		appPath,
		configPath,
		pluginPath,
		callback
	} = Object.assign({}, option);
	const corePath = __dirname;
	if (!rootPath) {
		rootPath = path.join(corePath, '../');
	}
	if (!appPath) {
		appPath = path.join(rootPath, './app');
	}
	if(!configPath) {
		configPath = path.join(rootPath, './config');
	}
	if(!pluginPath) {
		pluginPath = path.join(rootPath, './config/plugin');
	}

	const app = {
		config: require(configPath),
		path: {
			core: corePath,
			root: rootPath,
			app: appPath,
		}
	};

	const loadComponent = (app, obj, componentPath, flag = false) => {
		return new Promise((resolve, reject) => {
			fs.access(componentPath, (err) => {
				if(!err) {
					fs.readdir(componentPath, function (err, files) {
						if (err)
							reject(err);
						if(files) {
							Promise.all(files.map((file) => {
								const f = path.join(componentPath, file);
								const name = path.posix.basename(file).split('.', 1)[0];
								if (flag)
									obj[name] = new(require(f)(app))();
								else
									obj[name] = require(f)(app);
								debug(`require ${f}, done`);
							})).then(resolve).catch(reject);
						}
					});
				} else {
					resolve();
				}
			});
		});
	};

	(async() => {
		debug('init ...');
		await loadComponent(app, app.library = {}, path.join(corePath, './lib')).catch(error => {
			debug('catch error', error);
			process.abort();
		});
		await loadPluginComponent(app, app.plugin = {}, path.join(appPath, './config/plugin')).catch(error => {
			debug('catch error', error);
			process.abort();
		});
		processHandler(app);
		await Promise.all([
			loadComponent(app, app.model = {}, path.join(appPath, './model')),
			loadComponent(app, app.service = {}, path.join(appPath, './service')),
			loadComponent(app, app.middleware = {}, path.join(appPath, './middleware')),
			loadComponent(app, app.controller = {}, path.join(appPath, './controller')),
		]);
		debug('init completed');
		if (callback)
			callback(app);
	})().catch(console.error);
};