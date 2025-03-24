// 本地开发服务器 - 解决MIME类型问题
const express = require('express');
const { createServer: createViteServer } = require('vite');
const path = require('path');

async function createServer() {
  const app = express();

  // 创建Vite开发服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // 使用Vite的中间件
  app.use(vite.middlewares);

  // 为JS和TS文件设置正确的MIME类型
  app.use((req, res, next) => {
    const url = req.url;
    if (url.endsWith('.js') || url.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (url.endsWith('.ts') || url.endsWith('.tsx')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    
    // 添加CORS支持
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 禁止MIME类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    next();
  });
  
  // 处理根路径请求
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      // 对于HTML请求，使用Vite转换和提供HTML
      let template = path.resolve(__dirname, 'index.html');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(template);
    } catch (e) {
      // 如果出现错误，让Vite修复堆栈跟踪并记录错误
      vite.ssrFixStacktrace(e);
      console.error(e);
      next(e);
    }
  });

  const port = 5173;
  app.listen(port, () => {
    console.log(`本地开发服务器运行在: http://localhost:${port}`);
  });
}

createServer().catch((err) => {
  console.error('启动开发服务器时出错:', err);
}); 