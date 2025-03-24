import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 获取URL路径
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // 设置默认的内容类型
  let contentType = mimeTypes[extname] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // 如果文件不存在，尝试提供index.html（SPA路由）
      if (error.code === 'ENOENT') {
        filePath = path.join(__dirname, 'dist', 'index.html');
        contentType = 'text/html; charset=utf-8';
        
        fs.readFile(filePath, (err, indexContent) => {
          if (err) {
            res.writeHead(500);
            res.end(`错误: ${err.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(indexContent, 'utf8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`错误: ${error.code}`);
      }
    } else {
      // 成功读取文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

// 设置端口并启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}/`);
}); 