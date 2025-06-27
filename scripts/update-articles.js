#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 文章更新工具
 * 使用方法：
 * node scripts/update-articles.js add "新文章标题" "文章摘要" "attractions"
 * node scripts/update-articles.js update "article-id" --title "新标题"
 * node scripts/update-articles.js delete "article-id"
 */

const ARTICLES_FILE = path.join(__dirname, '../public/data/articles.json');

// 确保目录存在
function ensureDataDir() {
  const dataDir = path.dirname(ARTICLES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 读取文章数据
function loadArticles() {
  ensureDataDir();
  if (!fs.existsSync(ARTICLES_FILE)) {
    return {
      articles: [],
      categories: [
        { id: 'visa-free', name: '免签政策', nameEn: 'Visa-Free Policy' },
        { id: 'attractions', name: '景点推荐', nameEn: 'Attractions' },
        { id: 'culture', name: '中华文化', nameEn: 'Chinese Culture' },
        { id: 'travel-tips', name: '旅行贴士', nameEn: 'Travel Tips' }
      ],
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalArticles: 0,
        version: '1.0.0'
      }
    };
  }
  return JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
}

// 保存文章数据
function saveArticles(data) {
  data.metadata.lastUpdated = new Date().toISOString();
  data.metadata.totalArticles = data.articles.length;
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ 已保存到 ${ARTICLES_FILE}`);
}

// 生成文章ID
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-') + '-' + Date.now();
}

// 添加新文章
function addArticle(title, summary, category = 'attractions') {
  const data = loadArticles();
  
  const newArticle = {
    id: generateId(title),
    title,
    summary,
    content: {
      sections: [
        {
          type: 'text',
          content: `<p>${summary}</p><p>请在此处添加详细内容...</p>`
        }
      ]
    },
    coverImage: '/images/placeholder.jpg',
    category,
    tags: [],
    publishDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    viewCount: 0,
    author: {
      name: '编辑部',
      avatar: '/avatars/editor.jpg'
    },
    seo: {
      metaTitle: title,
      metaDescription: summary,
      keywords: []
    },
    readingTime: 5,
    featured: false
  };
  
  data.articles.push(newArticle);
  saveArticles(data);
  
  console.log(`🎉 已添加文章: ${title}`);
  console.log(`📝 文章ID: ${newArticle.id}`);
  console.log(`📂 分类: ${category}`);
  
  return newArticle.id;
}

// 更新文章
function updateArticle(articleId, updates) {
  const data = loadArticles();
  const articleIndex = data.articles.findIndex(a => a.id === articleId);
  
  if (articleIndex === -1) {
    throw new Error(`文章未找到: ${articleId}`);
  }
  
  const article = data.articles[articleIndex];
  
  // 更新字段
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      article[key] = updates[key];
    }
  });
  
  article.lastModified = new Date().toISOString();
  
  saveArticles(data);
  console.log(`✏️ 已更新文章: ${article.title}`);
}

// 删除文章
function deleteArticle(articleId) {
  const data = loadArticles();
  const articleIndex = data.articles.findIndex(a => a.id === articleId);
  
  if (articleIndex === -1) {
    throw new Error(`文章未找到: ${articleId}`);
  }
  
  const article = data.articles[articleIndex];
  data.articles.splice(articleIndex, 1);
  
  saveArticles(data);
  console.log(`🗑️ 已删除文章: ${article.title}`);
}

// 列出所有文章
function listArticles() {
  const data = loadArticles();
  
  console.log(`📚 共有 ${data.articles.length} 篇文章:`);
  console.log('');
  
  data.articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   ID: ${article.id}`);
    console.log(`   分类: ${article.category}`);
    console.log(`   发布时间: ${new Date(article.publishDate).toLocaleDateString()}`);
    console.log('');
  });
}

// 主程序
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'add':
        if (args.length < 3) {
          console.error('用法: node update-articles.js add "标题" "摘要" [分类]');
          process.exit(1);
        }
        addArticle(args[1], args[2], args[3]);
        break;
        
      case 'update':
        if (args.length < 3) {
          console.error('用法: node update-articles.js update "article-id" --title "新标题" --summary "新摘要"');
          process.exit(1);
        }
        
        const updates = {};
        for (let i = 2; i < args.length; i += 2) {
          const key = args[i].replace('--', '');
          const value = args[i + 1];
          updates[key] = value;
        }
        
        updateArticle(args[1], updates);
        break;
        
      case 'delete':
        if (args.length < 2) {
          console.error('用法: node update-articles.js delete "article-id"');
          process.exit(1);
        }
        deleteArticle(args[1]);
        break;
        
      case 'list':
        listArticles();
        break;
        
      default:
        console.log('中国旅游网站 - 文章管理工具');
        console.log('');
        console.log('使用方法:');
        console.log('  node update-articles.js add "标题" "摘要" [分类]     # 添加新文章');
        console.log('  node update-articles.js update "id" --title "新标题"  # 更新文章');
        console.log('  node update-articles.js delete "id"                   # 删除文章');
        console.log('  node update-articles.js list                          # 列出所有文章');
        console.log('');
        console.log('示例:');
        console.log('  node update-articles.js add "北京美食攻略" "探索北京地道美食" "travel-tips"');
        console.log('  node update-articles.js update "beijing-food-guide-123" --title "北京美食完整指南"');
    }
    
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
    process.exit(1);
  }
}

// ES modules 中的替代方案 - 直接调用main函数
main(); 