const express = require('express');
const path = require('path');
const app = express();

// 正确的MIME类型设置
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    // 添加跨域支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 禁止MIME类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// JavaScript文件特殊处理
app.get('*.js', function(req, res, next) {
  res.set('Content-Type', 'application/javascript');
  next();
});

// 所有路由都返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Development server running on port ${PORT}`);
}); 