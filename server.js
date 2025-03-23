const express = require('express');
const path = require('path');
const app = express();

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 对所有请求返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 设置端口
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 