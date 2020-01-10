const express = require('./express-app');

const app = express();

app.use((req, res, next) => {
  console.log('请求开始');
  next();
})

app.get('/api', (req, res, next) => {
  console.log('test get 路由');
  next();
})

app.listen(8000, () => {
  console.log('server port 8000')
})