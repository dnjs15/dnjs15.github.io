---
title: "Weber 的自我修养 Ⅲ：JS 篇"
date: 2026-11-05T16:00:00+08:00
lastmod: 2026-11-05T16:00:00+08:00
draft: false
description: "JS 篇扫盲：Ajax、Node.js 基础、Express 的 req/res、原型链污染原理与 POC、Webpack 与 source map 泄露、Vue 的 v-html 风险与路由/接口提取"
tags: ["Web安全", "JS"]
categories: ["技术笔记"]
---

# 前言

一个Web狗的自我修养

{{< alert "lightbulb" >}}
学了这么久了,也有一年了,浑浑噩噩的,抽课余时间学.还是很菜.又到了找班上的年纪.在此发现对于web的学习或者说对于整个安全方向的学习,我着相了,为什么这么说呢.我总是想着从基础一步一步堆上去,但殊不知基础这个东西太广泛我觉得应该是遇到一个去学一个,在学某个点的途中一定有你还不知道的其他点就tm跟goto一样再点进去看接着学.看多了就记住了.
{{< /alert >}}

# JS相关

JS的一些基础.

## Ajax

AJAX=Asynchronous JavaScript And XML.

ajax可以使网站进行异步更新即不重载整个网页的情况下更新部分，实现ajax主要有三种方式分别是原生JS代码，jQuery库还有就是axios。这里各个官网其实都有demo非常好理解，后面两个的写法基本都差不多。大家看看就行了。[w3school 的 AJAX 教程](https://www.w3school.com.cn/js/js_ajax_intro.asp)（原生写法）、[jQuery 官网](https://jquery.com/)、[axios 中文文档](https://www.axios-http.cn/docs/example)。

## 原型链污染(浅谈)

先来看nodejs的基础部分。Node.js 是运行在服务端的 JavaScript。先从文件系统的模块出发。

```js
var fs = require("fs");

// 异步读取
fs.readFile('1.txt', function (err, data) {
   if (err) {
       return console.error(err);
   }
   console.log("异步读取: " + data.toString());
});

// 同步读取
var data = fs.readFileSync('2.txt');
console.log("同步读取: " + data.toString());

console.log("执行完毕。");
```

看个最简单的demo由于不是开发所以呢我们只需要看懂就行了，重要的是fs模块，其他的api都是字如其名啊。其实只要知道这个模块是文件系统相关的就行了。下面是一个起服务的实例，以express框架为主。

```js
var express = require('express');
var app = express();
 
//  主页输出 "Hello World"
app.get('/', function (req, res) { //路由的写法。规定了哪个URL通过什么method(get/post..)去请求资源。
   console.log("主页 GET 请求");
   res.send('Hello GET');
})
 
 
//  POST 请求
app.post('/', function (req, res) {
   console.log("主页 POST 请求");
   res.send('Hello POST');
})
 
//  /del_user 页面响应
app.get('/del_user', function (req, res) {
   console.log("/del_user 响应 DELETE 请求");
   res.send('删除页面');
})
 
//  /list_user 页面 GET 请求
app.get('/list_user', function (req, res) {
   console.log("/list_user GET 请求");
   res.send('用户列表页面');
})
 
// 对页面 abcd, abxcd, ab123cd, 等响应 GET 请求
app.get('/ab*cd', function(req, res) {   
   console.log("/ab*cd GET 请求");
   res.send('正则匹配');
})
 
 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})
```

### Express req / res 对象常用属性与方法
#### Request 对象（req）
- `req.app`：当callback为外部文件时，用req.app访问express的实例
- `req.baseUrl`：获取路由当前安装的URL路径
- `req.body` / `req.cookies`：获得「请求主体」/ Cookies
- `req.fresh` / `req.stale`：判断请求是否还「新鲜」
- `req.hostname` / `req.ip`：获取主机名和IP地址
- `req.originalUrl`：获取原始请求URL
- `req.params`：获取路由的parameters
- `req.path`：获取请求路径
- `req.protocol`：获取协议类型
- `req.query`：获取URL的查询参数串
- `req.route`：获取当前匹配的路由
- `req.subdomains`：获取子域名
- `req.accepts()`：检查可接受的请求的文档类型
- `req.acceptsCharsets` / `req.acceptsEncodings` / `req.acceptsLanguages`：返回指定字符集的第一个可接受字符编码
- `req.get()`：获取指定的HTTP请求头
- `req.is()`：判断请求头Content-Type的MIME类型

#### Response 对象（res）
response 对象表示 HTTP 响应，即在接收到请求时向客户端发送的 HTTP 响应数据。常见属性有：
- `res.app`：同req.app一样
- `res.append()`：追加指定HTTP头
- `res.set()`：在res.append()后将重置之前设置的头
- `res.cookie(name，value [，option])`：设置Cookie
  - option: domain / expires / httpOnly / maxAge / path / secure / signed
- `res.clearCookie()`：清除Cookie
- `res.download()`：传送指定路径的文件
- `res.get()`：返回指定的HTTP头
- `res.json()`：传送JSON响应
- `res.jsonp()`：传送JSONP响应
- `res.location()`：只设置响应的Location HTTP头，不设置状态码或者close response
- `res.redirect()`：设置响应的Location HTTP头，并且设置状态码302
- `res.render(view,[locals],callback)`：渲染一个view，同时向callback传递渲染后的字符串，如果在渲染过程中有错误发生next(err)将会被自动调用。callback将会被传入一个可能发生的错误以及渲染后的页面，这样就不会自动输出了。
- `res.send()`：传送HTTP响应
- `res.sendFile(path [，options] [，fn])`：传送指定路径的文件 -会自动根据文件extension设定Content-Type
- `res.set()`：设置HTTP头，传入object可以一次设置多个头
- `res.status()`：设置HTTP状态码
- `res.type()`：设置Content-Type的MIME类型

这些网上很多都有，过一下就行了。然后就是**`child_process` 模块**这个模块在原型链污染中很经典。

- **exec** - child_process.exec 使用子进程执行命令，缓存子进程的输出，并将子进程的输出以回调函数参数的形式返回。
- **execFile** - 直接执行可执行文件，略安全。
- **spawn** - child_process.spawn 使用指定的命令行参数创建新进程。
- **fork** - child_process.fork 是 spawn()的特殊形式，用于在子进程中运行的模块，如 fork('./son.js') 相当于 spawn('node', ['./son.js']) 。与spawn方法不同的是，fork会在父进程与子进程之间，建立一个通信管道，用于进程之间的通信。

例如`child_process.exec('calc')`和`child_process.spawn('calc')`回到我们说的原型链污染，"如果攻击者控制并修改了一个对象的原型，`(__proto__)`那么将会影响他的父类和祖宗类的对象"看一个demo先理清一个概念`__proto__`是沿着自身这条"继承"链往上找，比如a有A属性，b有B属性。b是继承a的，`b.__proto__.A === a.A`。当然和查属性有一点区别，就是直接b.A是没问题的会查找到a.A。当然`__proto__`是查找直接上层而不是间接上层。

```js
const o = {};
o.toString;            // 自身没有 → 沿 __proto__ → Object.prototype.toString（函数）
o.toString === Object.prototype.toString;   // true
```

几个等价的概念

```js
const o = {};

o.__proto__            // → Object.prototype
Object.getPrototypeOf(o)          // → Object.prototype（标准写法）
o.constructor          // → Object（函数），o.constructor.prototype === Object.prototype
Object.prototype       // → 所有普通对象的原型
```

new 出来的实例，它的 `__proto__` 等于它所属构造函数的 `.prototype`。

来看一个经典的POC案例

```js
({}).__proto__.isAdmin = true;   // 等价于 Object.prototype.isAdmin = true

const user = { name: "guest" };
user.isAdmin;                    // true ← 沿原型链继承到了
```

这个属于是有些CTF题目中喜欢出的，鉴权的是属性字段isAdmin来达到越权。这种写法就是污染到了Object，这样所有的都会带上isAdmin=true。

## WebPack

Webpack 是一个前端资源加载/打包工具。它将根据模块的依赖关系进行静态分析，然后将这些模块按照指定的规则生成对应的静态资源。常常使用`webpack.config.js`（ESM 项目里是 `.cjs`）文件来进行打包，或者直接用指令，也是一个道理，只不过用配置文件会更方便一些。

```js
const path = require('path');  // 引入 Node.js 的 path 模块，用于处理文件和目录的路径

module.exports = {
    mode: 'development',  // 或 'production(生产模式)'
    // 指定入口文件
    entry: './src/index.js',//入口文件一定是"./"开头不然会报错

    // 定义输出设置
    output: {
        filename: 'bundle.js',  // 指定输出文件的名称
        path: path.resolve(__dirname, 'dist')  // 指定输出文件的绝对路径
    }
};
```

如果是生产模式的话那么打包后在浏览器控制台的地方不会出现webpack://而是一个打包好后的js文件，如果是开发者模式则能够在控制台的网络的地方看到webpack://。还有一个devtool字段其实。

```js
devtool:'eval-source-map'
```

eval-source-map:每个模块使用eval()执行，source map转换为DataUrl后添加到eval()中。在使用webpack打包部署代码时，如果参数devtool配置不当，将会在部署代码文件中生成对应匹配的soucemap文件（源码映射），如果将参数devtool配置为“source-map”、“cheap-source-map”、“hidden-source-map”、“nosources-source-map”、“cheap-module-source-map”等值时，打包后将生成单独的map文件。也就是我们熟知的map泄露，工具推荐：https://github.com/denandz/sourcemapper和https://github.com/SunHuawei/SourceDetector和https://github.com/paazmaya/shuji。

## Vue

vue是一款用于构建用户界面的 JavaScript 框架。它基于标准 HTML、CSS 和 JavaScript 构建，并提供了一套声明式的、组件化的编程模型，帮助你高效地开发用户界面。无论是简单还是复杂的界面，Vue 都可以胜任。vue就是js的一个框架。和上述一样的一点是它可以通过vite.config.ts来配置开发者或生产模式也有可能导致map泄露。而这个前端框架本身的安全性是比较高的。Vue 本身是纯前端框架，默认对插值（{{ }}）会做 HTML 转义，能有效防止大部分 XSS。真正需要特别注意的是 v-html。v-html 会把内容当作 原始 HTML 直接插入 DOM，不会做任何转义。其实vue更多的还是找route目录去看路由和提取接口。

# 总结

关于js的一些基础内容并没有提及很多，在实战中js的主要价值在于路由管理和接口的泄露。当然如果是比赛中可以往原型链污染去靠，甚至是EJS这些模板注入等。但是我觉得它的大价值面还是路由管理和接口管理。