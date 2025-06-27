# JSON文章管理系统使用指南

## 🎯 系统概述

您的旅游网站现在使用**JSON+本地目录**的方式管理文章，这样可以：
- ✅ **零成本运行** - 不需要数据库服务
- ✅ **完美支持图文** - JSON结构化存储图文内容
- ✅ **UI逻辑不变** - 现有界面和功能完全保持
- ✅ **SEO友好** - 静态文件搜索引擎更容易索引

## 📁 文件结构

```
public/
├── data/
│   └── articles.json          # 文章数据文件
├── images/                    # 图片目录
│   ├── beijing.jpg
│   ├── shanghai.jpg
│   └── ...
scripts/
└── update-articles.js         # 文章管理工具
```

## 🔧 文章管理命令

### 查看所有文章
```bash
npm run article:list
```

### 添加新文章
```bash
npm run article:add "文章标题" "文章摘要" "分类"
```
示例：
```bash
npm run article:add "成都美食攻略" "探索成都地道美食文化" "travel-tips"
```

### 更新文章
```bash
npm run article:update "文章ID" --title "新标题" --summary "新摘要"
```
示例：
```bash
npm run article:update "beijing-travel-guide-2024" --title "北京深度游完整攻略"
```

### 删除文章
```bash
npm run article:delete "文章ID"
```

## 📝 文章编辑流程

### 方式一：直接编辑JSON文件
1. 打开 `public/data/articles.json`
2. 编辑对应文章的内容
3. 保存文件
4. 重新启动开发服务器 `npm run dev`

### 方式二：使用命令行工具
1. 使用上述命令添加/更新文章
2. 重新启动开发服务器

## 🖼️ 图片管理

### 添加图片
1. 将图片文件放到 `public/images/` 目录
2. 在文章content中引用：`<img src="/images/图片名.jpg" />`

### 图片命名建议
- 使用英文或拼音命名
- 包含城市或景点信息：`beijing-forbidden-city.jpg`
- 按分类整理：`attractions/`, `food/`, `culture/`

## 📚 文章内容格式

### HTML格式示例
```html
<div class="article-content">
  <p>这是一段普通文本...</p>
  
  <h2>这是二级标题</h2>
  
  <div class="article-image">
    <img src="/images/beijing.jpg" alt="北京天安门广场" />
    <p class="image-caption">天安门广场 - 北京的心脏地带</p>
  </div>
  
  <div class="highlight-box">
    <h3>重要提示</h3>
    <p>这是一个高亮显示的重要信息框</p>
  </div>
  
  <div class="image-gallery">
    <div class="gallery-item">
      <img src="/images/hutong1.jpg" alt="胡同1" />
      <p class="image-caption">南锣鼓巷胡同</p>
    </div>
    <div class="gallery-item">
      <img src="/images/hutong2.jpg" alt="胡同2" />
      <p class="image-caption">传统四合院</p>
    </div>
  </div>
</div>
```

## 🎨 可用CSS类

- `.article-content` - 文章主容器
- `.article-image` - 单张图片容器
- `.image-caption` - 图片说明文字
- `.image-gallery` - 图片画廊
- `.gallery-item` - 画廊单个项目
- `.highlight-box` - 高亮信息框

## 📂 分类说明

- `visa-free` - 免签政策
- `attractions` - 景点推荐
- `culture` - 中华文化
- `travel-tips` - 旅行贴士

## 🚀 发布流程

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 部署到Vercel/Netlify
1. 提交代码到Git：`git add . && git commit -m "更新文章"`
2. 推送到GitHub：`git push`
3. 自动部署完成

## 🔍 SEO优化

### 在JSON中设置SEO信息
```json
{
  "seo": {
    "metaTitle": "北京旅游攻略2024 - 故宫胡同深度游指南",
    "metaDescription": "最全面的北京旅游攻略，包含故宫、胡同、美食推荐",
    "keywords": ["北京旅游", "故宫攻略", "胡同游", "北京美食"]
  }
}
```

## ⚡ 性能优化

### 图片优化
- 使用WebP格式（现代浏览器支持更好）
- 压缩图片文件大小
- 建议单张图片不超过500KB

### JSON文件优化
- 定期清理不需要的文章
- 避免单个content字段过长（建议分段）

## 🛠️ 故障排除

### 文章不显示
1. 检查JSON文件格式是否正确
2. 验证图片路径是否存在
3. 重新启动开发服务器

### 图片加载失败
1. 确认图片文件在 `public/images/` 目录
2. 检查文件名是否正确（区分大小写）
3. 验证图片格式（支持jpg、png、webp等）

### 样式显示问题
1. 确认已导入 `ArticleContent.css`
2. 检查HTML结构是否使用了正确的CSS类

## 📞 技术支持

如遇到问题，请检查：
1. 浏览器控制台错误信息
2. JSON文件语法是否正确
3. 图片文件是否存在

---

**提示：** 这个系统非常适合初期使用，当网站访问量增长后，您可以轻松迁移到数据库方案。 