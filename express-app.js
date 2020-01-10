const http = require('http');

class express {
  constructor() {
    // 存放 中间件列表
    this.routers = {
      ALL:[], //  app.use(...)
      GET: [], // app.get(...)
      POST: []  //app.post(...)
    }
  }

  register() {
    // 存储中间件的相关信息,
    let info = {};
    const slice = Array.prototype.slice;

    if (typeof arguments[0] === 'string') {
      info.path = arguments[0];
      // 从第二个参数开始，将数据放入到 stack 的数组中
      info.stack = slice.call(arguments, 1); 
    } else {
      info.path = '/';
      info.stack = slice.call(arguments, 0); 
    }

    return info;
  }

  use() {
    const info = this.register.apply(this, arguments);
    this.routers.ALL.push(info);
  }

  get() {
    const info = this.register.apply(this, arguments);
    this.routers.GET.push(info);
  }

  post() {
    const info = this.register.apply(this, arguments);
    this.routers.GET.push(info);
  }

  match(method, url) {
    let stack = [];
    
    if (url === '/favicon.ico') return stack;

    const curRoutes = [...this.routers.ALL, ...this.routers[method]];

    curRoutes.forEach(routerInfo => {
      //url = '/api/getuserinfo' 且 routerInfo.path= ‘/’；
      //url = '/api/getuserinfo' 且 routerInfo.path= ‘/api’；
      //url = '/api/getuserinfo' 且 routerInfo.path= ‘/api/getuserinfo’；
       
      if (url.indexOf(routerInfo.path) === 0) {
        stack = [...stack, ...routerInfo.stack];
      }
    });

    return stack;
  }

  /**
   * @param  {} req
   * @param  {} res  
   * @param  {} stack 该请求的执行栈
   * 处理核心next 机制
   */ 
  handle(req, res, stack) {
    const next = () => {
      // 拿到第一个匹配的中间件
      const middleware = stack.shift();
      // 执行中间件函数 
      if (middleware) middleware(req, res, next)
    }
    next();
  }

  callback() {
    return (req, res) => {
      // 定义json 方法
      res.json = (data) => {
        res.setHeader('Centent-type', 'application/json');
        res.end(JSON.stringify(data));
      }
      const { url, method = method.toLowerCase() } = req;
      // 该请求的执行栈列表
      const resultList = this.match(method, url);
      this.handle(req, res, resultList);
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback());
    server.listen(...args)
  }
}

module.exports = () => new express();
