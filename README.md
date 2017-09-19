# bucket-core

一个轻量级的基于koa.js的mvc框架，koa.js提供了中间件的思想，具体的server实现还是由程序员自己去构建，参考各种主流框架，本项目用简单的代码来定义一个具有实践价值、可成长的node后端框架。内容包括：

- 定义app大对象，启动时挂载所有组件；
- 定义目录规范，如app入口目录，model、controller、service、middleware
- 松散的模块化，功能模块可以灵活地加入与组合；
- 优雅的进程退出，当收到SIGINT信号，按顺序关闭服务，使已经接收到的请求（业务逻辑）处理完与保存数据再退出。

目前框架还处于完善阶段。

框架使用例子：[bucket-demo](https://github.com/bucket-hat/bucket-demo)