// 此脚本修复常见的MIME类型问题
const fs = require('fs');
const path = require('path');

// 修复dist目录中的引用
function fixMimeTypes() {
  console.log('开始修复MIME类型问题...');
  
  // 添加额外的头信息到index.html
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // 确保有正确的脚本MIME类型
    indexContent = indexContent.replace(
      '<script type="module" src="/src/main.tsx"></script>',
      '<script type="application/javascript" src="/src/main.tsx" charset="UTF-8"></script>'
    );
    
    // 添加额外的Meta标签
    if (!indexContent.includes('<meta http-equiv="X-Content-Type-Options"')) {
      indexContent = indexContent.replace(
        '</head>',
        '  <meta http-equiv="X-Content-Type-Options" content="nosniff">\n  </head>'
      );
    }
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('已修复index.html');
  }
  
  console.log('MIME类型问题修复完成');
}

// 执行修复
fixMimeTypes(); 