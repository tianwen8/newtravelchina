import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  console.log(`请求URL: ${req.url}`);
  
  // 默认提供index.html
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url.substring(1));
  
  console.log(`尝试访问文件: ${filePath}`);
  
  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // MIME类型映射
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript; charset=utf-8', // 明确设置JavaScript MIME类型
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  // 设置Content-Type
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`文件不存在: ${filePath}`);
      
      // 如果请求的文件不存在，返回index.html（支持SPA路由）
      filePath = path.join(__dirname, 'dist', 'index.html');
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`读取index.html失败: ${err.code}`);
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          console.log(`提供index.html作为替代`);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
    } else {
      // 读取文件
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`读取文件失败: ${err.code}`);
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        } else {
          // 特别处理JavaScript文件
          if (extname === '.js') {
            console.log(`提供JS文件: ${filePath} 使用MIME类型: text/javascript`);
            res.writeHead(200, { 
              'Content-Type': 'text/javascript; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
          } else {
            console.log(`成功提供: ${filePath} 使用MIME类型: ${contentType}`);
            res.writeHead(200, { 'Content-Type': contentType });
          }
          res.end(content, 'utf-8');
        }
      });
    }
  });
});

// 设置端口
const PORT = 3457;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}/`);
  console.log(`此服务器专门设置了正确的JavaScript MIME类型用于测试`);
  console.log(`请访问 http://localhost:${PORT}/ 测试应用`);
}); 