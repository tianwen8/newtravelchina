import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 配置MIME类型
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

// 设置静态文件服务
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// 所有路由返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 