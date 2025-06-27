import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesPath = path.join(__dirname, '../public/data/articles.json');

// 生成文章ID
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 添加新文章
function addArticle() {
  console.log('🎨 图文并茂文章创建工具\n');
  
  // 示例文章模板
  const exampleArticle = {
    "id": "shanghai-modern-city-guide",
    "title": "上海现代都市魅力探索",
    "slug": "shanghai-modern-city-guide", 
    "category": "travel-guides",
    "categoryName": "旅行攻略",
    "summary": "从外滩到陆家嘴，从老洋房到摩天大楼，体验上海东西方文化交融的独特魅力。",
    "content": [
      {
        "type": "text",
        "text": "上海，这座被誉为'东方巴黎'的国际大都市，以其独特的海派文化和现代化风貌吸引着世界各地的游客。漫步在黄浦江畔，您可以感受到这座城市古今交融的独特韵味。"
      },
      {
        "type": "image",
        "src": "/images/shanghai.jpg",
        "alt": "上海外滩夜景",
        "caption": "华灯初上的外滩，展现着上海的璀璨夜色"
      },
      {
        "type": "text", 
        "text": "## 🏙️ 必游地标\n\n### 外滩\n外滩是上海最具标志性的地区，这里汇聚了各种风格的历史建筑，被誉为'万国建筑博览群'。\n\n### 东方明珠塔\n作为上海的地标性建筑，东方明珠塔高468米，是观赏上海全景的最佳地点。\n\n### 豫园\n这座明代私家园林完美展现了中国古典园林艺术，是体验传统文化的绝佳去处。"
      },
      {
        "type": "text",
        "text": "## 🍜 美食推荐\n\n上海菜以精致著称，小笼包、生煎包、白切鸡等都是不可错过的地道美味。南京路步行街和新天地是品尝美食的热门地点。"
      }
    ],
    "featuredImage": "/images/shanghai.jpg",
    "author": {
      "name": "城市探索者",
      "id": "city-explorer"
    },
    "publishedAt": new Date().toISOString(),
    "updatedAt": new Date().toISOString(),
    "tags": ["上海", "都市旅游", "现代建筑", "海派文化", "美食"],
    "readTime": 6,
    "likes": 0,
    "views": 0,
    "seo": {
      "metaTitle": "上海旅游攻略 - 现代都市魅力探索",
      "metaDescription": "上海旅游完全指南，外滩、东方明珠、豫园等必游景点，体验海派文化魅力。"
    }
  };

  try {
    // 读取现有文章
    const data = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    
    // 添加新文章
    data.articles.push(exampleArticle);
    data.metadata.totalArticles = data.articles.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    // 保存
    fs.writeFileSync(articlesPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('✅ 示例文章添加成功!');
    console.log(`📄 文章ID: ${exampleArticle.id}`);
    console.log(`🔗 访问链接: http://localhost:5174/articles/${exampleArticle.id}`);
    console.log(`\n📝 您可以编辑 public/data/articles.json 来修改这篇文章`);
    
  } catch (error) {
    console.error('❌ 添加文章失败:', error.message);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
🎨 图文并茂文章创建指南

📝 JSON 文章结构:
{
  "type": "text",     // 文本内容，支持Markdown
  "text": "内容..."
}

🖼️ 图片结构:
{
  "type": "image", 
  "src": "/images/图片名.jpg",
  "alt": "图片描述",
  "caption": "图片说明"
}

🖼️🖼️ 图片画廊:
{
  "type": "gallery",
  "images": [
    {"src": "/images/1.jpg", "alt": "描述1", "caption": "说明1"},
    {"src": "/images/2.jpg", "alt": "描述2", "caption": "说明2"}
  ]
}

📁 图片存放位置: public/images/
🔗 访问路径: /images/图片名.jpg

💡 使用方法:
1. npm run add-example-article  # 添加示例文章
2. 编辑 public/data/articles.json 文件
3. 刷新网站查看效果
`);
}

// 命令行参数处理
const command = process.argv[2];

switch (command) {
  case 'add':
    addArticle();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    addArticle();
    break;
} 