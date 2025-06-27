import React, { useState, useRef } from 'react';
import './ArticleManager.css';

interface ArticleSection {
  type: 'text' | 'image' | 'gallery';
  text?: string;
  src?: string;
  alt?: string;
  caption?: string;
  images?: Array<{src: string; alt: string; caption?: string}>;
}

interface ArticleData {
  title: string;
  category: string;
  summary: string;
  content: ArticleSection[];
  tags: string[];
}

const ArticleManager: React.FC = () => {
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    category: 'travel-guides',
    summary: '',
    content: [],
    tags: []
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = {
    'travel-guides': '旅行攻略',
    'visa-free': '免签政策', 
    'attractions': '景点介绍',
    'chinese-learning': '中文学习',
    'community': '旅行社区'
  };

  // 处理Word文档上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 这里我们先用简单的文本提取
      const text = await readFileAsText(file);
      parseTextContent(text);
      setResult('✅ 文档解析成功！请检查并调整内容。');
    } catch (error) {
      setResult('❌ 文档解析失败，请尝试复制粘贴内容。');
      console.error('文件处理错误:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 读取文件为文本
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  // 解析文本内容
  const parseTextContent = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const content: ArticleSection[] = [];
    
    // 提取标题（第一行）
    if (lines.length > 0) {
      setArticleData(prev => ({ ...prev, title: lines[0].trim() }));
    }
    
    // 处理内容
    lines.slice(1).forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        // 检查是否是图片标记（如：[图片：描述]）
        const imageMatch = trimmed.match(/\[图片[：:]\s*(.+?)\]/);
        if (imageMatch) {
          content.push({
            type: 'image',
            src: '/images/placeholder.jpg', // 占位符，需要手动替换
            alt: imageMatch[1],
            caption: imageMatch[1]
          });
        } else {
          // 普通文本
          content.push({
            type: 'text',
            text: trimmed
          });
        }
      }
    });
    
    setArticleData(prev => ({ ...prev, content }));
  };

  // 生成JSON
  const generateJSON = () => {
    const id = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const article = {
      id,
      title: articleData.title,
      slug: id,
      category: articleData.category,
      categoryName: categories[articleData.category as keyof typeof categories],
      summary: articleData.summary,
      content: articleData.content,
      featuredImage: "/images/placeholder.jpg",
      author: {
        name: "编辑部",
        id: "editor"
      },
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: articleData.tags,
      readTime: Math.max(2, Math.ceil(articleData.content.length / 3)),
      likes: 0,
      views: 0,
      seo: {
        metaTitle: `${articleData.title} - 中国旅游网`,
        metaDescription: articleData.summary
      }
    };
    
    return JSON.stringify(article, null, 2);
  };

  // 下载JSON文件
  const downloadJSON = () => {
    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${articleData.title || 'article'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 复制到剪贴板
  const copyToClipboard = () => {
    const json = generateJSON();
    navigator.clipboard.writeText(json).then(() => {
      setResult('✅ JSON已复制到剪贴板！');
    });
  };

  // 一键添加到JSON文件
  const addToJsonFile = async () => {
    if (!articleData.title || !articleData.summary) {
      setResult('❌ 请先填写标题和摘要！');
      return;
    }

    try {
      const newArticle = JSON.parse(generateJSON());
      
      // 读取现有JSON文件
      const response = await fetch('/data/articles.json');
      const data = await response.json();
      
      // 检查是否已存在相同ID的文章
      const existingIndex = data.articles.findIndex((article: any) => article.id === newArticle.id);
      
      if (existingIndex >= 0) {
        // 更新现有文章
        data.articles[existingIndex] = newArticle;
        setResult('✅ 文章已更新！');
      } else {
        // 添加新文章
        data.articles.push(newArticle);
        data.metadata.totalArticles = data.articles.length;
        setResult('✅ 文章已添加！');
      }
      
      data.metadata.lastUpdated = new Date().toISOString();
      
      // 生成更新后的JSON
      const updatedJson = JSON.stringify(data, null, 2);
      
      // 提供下载更新后的完整JSON文件
      const blob = new Blob([updatedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'articles-updated.json';
      a.click();
      URL.revokeObjectURL(url);
      
      setResult('✅ 文章已处理！请下载更新后的articles-updated.json文件，替换public/data/articles.json');
      
    } catch (error) {
      setResult('❌ 处理失败，请检查输入内容！');
      console.error('添加文章失败:', error);
    }
  };

  return (
    <div className="article-manager">
      <div className="manager-header">
        <h1>📝 文章管理工具</h1>
        <p>上传Word文档或直接编辑，快速生成JSON格式文章</p>
      </div>

      <div className="manager-content">
        {/* 文件上传区域 */}
        <div className="upload-section">
          <h2>📎 上传文档</h2>
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
              disabled={isProcessing}
            >
              {isProcessing ? '📄 处理中...' : '📎 选择文件 (.txt, .doc, .docx)'}
            </button>
            <p className="upload-hint">
              💡 提示：在Word中用 [图片：描述] 标记图片位置
            </p>
          </div>
        </div>

        {/* 编辑区域 */}
        <div className="edit-section">
          <h2>✏️ 编辑文章</h2>
          
          <div className="form-group">
            <label>文章标题</label>
            <input
              type="text"
              value={articleData.title}
              onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="输入文章标题..."
            />
          </div>

          <div className="form-group">
            <label>文章分类</label>
            <select
              value={articleData.category}
              onChange={(e) => setArticleData(prev => ({ ...prev, category: e.target.value }))}
            >
              {Object.entries(categories).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>文章摘要</label>
            <textarea
              value={articleData.summary}
              onChange={(e) => setArticleData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="简要描述文章内容..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>标签 (用逗号分隔)</label>
            <input
              type="text"
              value={articleData.tags.join(', ')}
              onChange={(e) => setArticleData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              placeholder="北京, 旅游, 攻略..."
            />
          </div>

          <div className="form-group">
            <label>快速添加内容</label>
            <div className="content-editor">
              <textarea
                placeholder="直接输入文章内容，每段用空行分隔，图片用 [图片：描述] 标记"
                rows={8}
                onChange={(e) => {
                  const text = e.target.value;
                  parseTextContent(text);
                }}
                className="content-textarea"
              />
              <small className="editor-hint">
                💡 提示：每段文字用空行分隔，用 [图片：描述] 标记图片位置
              </small>
            </div>
          </div>
        </div>

        {/* 内容预览 */}
        <div className="preview-section">
          <h2>👁️ 内容预览</h2>
          <div className="content-preview">
            {articleData.content.length > 0 ? (
              articleData.content.map((section, index) => (
                <div key={index} className="preview-item">
                  {section.type === 'text' && (
                    <div className="preview-text">
                      <strong>📝 文本段落 {index + 1}:</strong>
                      <p>{section.text}</p>
                    </div>
                  )}
                  {section.type === 'image' && (
                    <div className="preview-image">
                      <strong>🖼️ 图片 {index + 1}:</strong>
                      <div className="image-placeholder">
                        图片描述: {section.caption}
                      </div>
                      <small>路径: {section.src}</small>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-preview">
                <p>📝 请上传文档或手动添加内容来预览...</p>
                <div className="quick-start">
                  <h4>快速开始：</h4>
                  <button 
                    onClick={() => {
                      setArticleData(prev => ({
                        ...prev,
                        title: '示例文章标题',
                        summary: '这是一个示例文章的摘要...',
                        content: [
                          { type: 'text', text: '这是第一段文字内容。' },
                          { type: 'image', src: '/images/placeholder.jpg', alt: '示例图片', caption: '这是图片说明' },
                          { type: 'text', text: '这是第二段文字内容。' }
                        ],
                        tags: ['示例', '测试']
                      }));
                    }}
                    className="sample-button"
                  >
                    📋 加载示例内容
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="action-section">
          <h2>🚀 生成与导出</h2>
          <div className="action-buttons">
            <button onClick={addToJsonFile} className="add-button">
              🚀 一键添加到JSON
            </button>
            <button onClick={copyToClipboard} className="copy-button">
              📋 复制JSON
            </button>
            <button onClick={downloadJSON} className="download-button">
              💾 下载单个JSON
            </button>
          </div>
          
          {result && (
            <div className="result-message">
              {result}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="help-section">
          <h2>📖 使用说明</h2>
          <div className="help-content">
            <h3>📝 Word文档格式建议：</h3>
            <ul>
              <li>第一行作为文章标题</li>
              <li>用 <code>[图片：图片描述]</code> 标记图片位置</li>
              <li>普通段落直接输入文字</li>
              <li>支持Markdown格式（## 标题，**粗体**等）</li>
            </ul>
            
            <h3>🖼️ 图片处理：</h3>
            <ul>
              <li>图片需要手动上传到 <code>public/images/</code> 目录</li>
              <li>在生成的JSON中更新图片路径</li>
              <li>图片格式建议：JPG, PNG，大小不超过2MB</li>
            </ul>
            
            <h3>📤 发布流程：</h3>
            <div className="publish-methods">
              <div className="method-card recommended">
                <h4>🚀 推荐方法：一键处理</h4>
                <ol>
                  <li>填写文章内容</li>
                  <li>点击 <strong>"🚀 一键添加到JSON"</strong></li>
                  <li>下载 <code>articles-updated.json</code></li>
                  <li>替换 <code>public/data/articles.json</code></li>
                  <li>git push 部署</li>
                </ol>
              </div>
              
              <div className="method-card">
                <h4>📋 传统方法：手动操作</h4>
                <ol>
                  <li>复制生成的JSON</li>
                  <li>打开 <code>public/data/articles.json</code></li>
                  <li>手动添加到 articles 数组</li>
                  <li>更新文章数量</li>
                  <li>提交代码并部署</li>
                </ol>
              </div>
              
              <div className="method-card easiest">
                <h4>✨ 最简单：直接委托</h4>
                <p>把Word文档或内容直接发给开发者，由开发者直接处理，您只需git push！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleManager; 