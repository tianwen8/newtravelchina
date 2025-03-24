const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 正确的MIME类型设置
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.ts': 'application/javascript; charset=utf-8',
  '.tsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'dist'), {
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
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  next();
});

// TypeScript文件特殊处理
app.get('*.ts', function(req, res, next) {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  next();
});

// TypeScript React文件特殊处理
app.get('*.tsx', function(req, res, next) {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  next();
});

// 所有路由都返回index.html（SPA应用)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`开发服务器运行在 http://localhost:${PORT}`);
}); 