import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { articleService, Article } from '../services/articleService';
import FileUploader from '../components/FileUploader';
import './AdminDashboard.css';

// SEO关键词模板
const SEO_KEYWORDS_TEMPLATES = {
  'visa-free': [
    '中国免签', '144小时免签', '72小时免签', '过境免签', '免签政策',
    '中国旅游签证', '免签国家', '中国入境', '旅游签证', '签证申请'
  ],
  'attractions': [
    '中国旅游', '中国景点', '旅游攻略', '必游景点', '文化遗产',
    '自然风光', '历史古迹', '旅游指南', '景点推荐', '文化体验'
  ],
  'guides': [
    '中国旅行指南', '旅游贴士', '文化指南', '交通指南', '住宿指南',
    '美食推荐', '购物指南', '语言帮助', '货币兑换', '网络服务'
  ]
};

// Word文档关键词提取
const extractKeywordsFromContent = (content: string): string[] => {
  // 简单的关键词提取逻辑（实际项目中可以使用更复杂的NLP工具）
  const commonWords = ['的', '是', '在', '有', '和', '与', '为', '了', '要', '可以', '能够', '这个', '那个', '一个'];
  const words = content.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
                     .split(/\s+/)
                     .filter(word => word.length > 1 && !commonWords.includes(word))
                     .slice(0, 20);
  return [...new Set(words)]; // 去重
};

const EnhancedAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 增强的文章表单
  const [articleForm, setArticleForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'visa-free',
    tags: '',
    coverImage: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    targetKeywords: [] as string[],
    wordDocUrl: '',
    publishTime: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM格式
  });
  
  // 成功消息
  const [success, setSuccess] = useState<{
    message: string;
    articleId: string;
    title: string;
  } | null>(null);
  
  // 关键词分析状态
  const [keywordAnalysis, setKeywordAnalysis] = useState<{
    extracted: string[];
    recommended: string[];
    density: { [key: string]: number };
  }>({
    extracted: [],
    recommended: [],
    density: {}
  });

  // 数据库选择状态
  const [useSupabase, setUseSupabase] = useState(false);

  // 加载文章列表
  useEffect(() => {
    loadArticles();
  }, []);

  // 分析关键词密度
  useEffect(() => {
    if (articleForm.content) {
      const extracted = extractKeywordsFromContent(articleForm.content);
      const recommended = SEO_KEYWORDS_TEMPLATES[articleForm.category as keyof typeof SEO_KEYWORDS_TEMPLATES] || [];
      
      // 计算关键词密度
      const totalWords = articleForm.content.split(/\s+/).length;
      const density: { [key: string]: number } = {};
      
      extracted.forEach(keyword => {
        const count = (articleForm.content.match(new RegExp(keyword, 'g')) || []).length;
        density[keyword] = Math.round((count / totalWords) * 100 * 100) / 100;
      });
      
      setKeywordAnalysis({ extracted, recommended, density });
    }
  }, [articleForm.content, articleForm.category]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await articleService.getArticlesByCategory('', 1, 100);
      setArticles(fetchedArticles);
    } catch (err) {
      console.error('加载文章出错:', err);
      setError('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArticleForm(prev => ({ ...prev, [name]: value }));
    
    // 自动生成SEO标题和描述
    if (name === 'title' && value) {
      setArticleForm(prev => ({ 
        ...prev, 
        seoTitle: value.length > 60 ? value.slice(0, 60) + '...' : value
      }));
    }
    
    if (name === 'summary' && value) {
      setArticleForm(prev => ({ 
        ...prev, 
        seoDescription: value.length > 160 ? value.slice(0, 160) + '...' : value
      }));
    }
  };

  // 处理Word文档上传
  const handleWordDocUploaded = (fileUrl: string, fileType: 'image' | 'document') => {
    if (fileType === 'document') {
      setArticleForm(prev => ({ 
        ...prev, 
        wordDocUrl: fileUrl,
        content: prev.content + `\n\n<div class="word-document-embed">
  <h3>📄 Word文档内容</h3>
  <p><a href="${fileUrl}" target="_blank" download>📎 下载原始文档</a></p>
  <iframe src="https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true" 
          style="width: 100%; height: 600px; border: none; border-radius: 8px;">
  </iframe>
  <p class="doc-notice">如无法显示，请点击上方链接下载查看</p>
</div>\n\n`
      }));
      
      // 如果没有标题，尝试从文件名提取
      if (!articleForm.title) {
        const fileName = fileUrl.split('/').pop()?.split('.')[0] || '';
        setArticleForm(prev => ({ 
          ...prev, 
          title: fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        }));
      }
    }
  };

  // 处理图片上传
  const handleImageUploaded = (fileUrl: string, fileType: 'image' | 'document') => {
    if (fileType === 'image') {
      if (!articleForm.coverImage) {
        // 第一张图片作为封面
        setArticleForm(prev => ({ ...prev, coverImage: fileUrl }));
      }
      
      // 插入到内容中
      const imgTag = `<img src="${fileUrl}" alt="文章配图" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />`;
      setArticleForm(prev => ({ 
        ...prev, 
        content: prev.content + '\n\n' + imgTag + '\n\n'
      }));
    }
  };

  // 添加推荐关键词
  const addRecommendedKeyword = (keyword: string) => {
    const currentTags = articleForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (!currentTags.includes(keyword)) {
      const newTags = [...currentTags, keyword].join(', ');
      setArticleForm(prev => ({ ...prev, tags: newTags }));
    }
  };

  // 生成SEO优化的内容
  const optimizeContentForSEO = () => {
    const { title, content, category } = articleForm;
    const keywords = SEO_KEYWORDS_TEMPLATES[category as keyof typeof SEO_KEYWORDS_TEMPLATES] || [];
    
    let optimizedContent = content;
    
    // 在内容中自然地插入关键词
    if (title && keywords.length > 0) {
      const primaryKeyword = keywords[0];
      if (!content.includes(primaryKeyword) && content.length > 100) {
        const firstParagraphEnd = content.indexOf('</p>');
        if (firstParagraphEnd > -1) {
          optimizedContent = content.slice(0, firstParagraphEnd) + 
                           `这篇关于${primaryKeyword}的详细指南将为您提供全面的信息。` + 
                           content.slice(firstParagraphEnd);
        }
      }
    }
    
    setArticleForm(prev => ({ ...prev, content: optimizedContent }));
  };

  // 发布文章
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleForm.title || !articleForm.summary || !articleForm.content) {
      setError('请填写文章标题、摘要和内容');
      return;
    }
    
    try {
      setLoading(true);
      
      const articleData = {
        title: articleForm.title,
        summary: articleForm.summary,
        content: articleForm.content,
        category: articleForm.category,
        tags: articleForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        coverImage: articleForm.coverImage || '/images/placeholder.jpg',
        author: currentUser?.displayName || '管理员',
        seoTitle: articleForm.seoTitle || articleForm.title,
        seoDescription: articleForm.seoDescription || articleForm.summary,
        seoKeywords: articleForm.seoKeywords || articleForm.tags,
        wordDocUrl: articleForm.wordDocUrl,
        publishTime: new Date(articleForm.publishTime),
        // 添加关键词密度分析结果
        keywordAnalysis: keywordAnalysis
      };
      
      const publishedArticle = await articleService.publishArticle(articleData);
      
      setSuccess({
        message: '文章发布成功！SEO优化已应用。',
        articleId: publishedArticle.id,
        title: publishedArticle.title
      });
      
      // 重置表单
      setArticleForm({
        title: '',
        summary: '',
        content: '',
        category: 'visa-free',
        tags: '',
        coverImage: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        targetKeywords: [],
        wordDocUrl: '',
        publishTime: new Date().toISOString().slice(0, 16)
      });
      
      // 刷新文章列表
      loadArticles();
      
    } catch (err) {
      console.error('发布文章失败:', err);
      setError('发布文章失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard enhanced">
      <Helmet>
        <title>增强版管理员面板 - 支持Word文档导入和SEO优化</title>
      </Helmet>
      
      <div className="dashboard-header">
        <h1 className="dashboard-title">🚀 增强版管理员控制面板</h1>
        <div className="dashboard-subtitle">
          <span>支持Word文档导入 • SEO关键词优化 • 多媒体内容管理</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* 数据库选择 */}
      <div className="database-selector">
        <h3>📊 数据库配置</h3>
        <div className="selector-group">
          <label className="radio-label">
            <input 
              type="radio" 
              name="database" 
              checked={!useSupabase} 
              onChange={() => setUseSupabase(false)}
            />
            <span>Firebase (当前)</span>
            <small>功能完整，但Storage需要付费</small>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="database" 
              checked={useSupabase} 
              onChange={() => setUseSupabase(true)}
            />
            <span>Supabase (推荐)</span>
            <small>免费存储空间更大，SQL数据库</small>
          </label>
        </div>
        {useSupabase && (
          <div className="database-notice">
            <p>⚠️ 切换到Supabase后，需要重新配置数据库连接。请确保已在<code>.env</code>文件中设置Supabase凭据。</p>
          </div>
        )}
      </div>

      {/* 增强的文章发布表单 */}
      <div className="publish-article enhanced">
        <h2>📝 发布新文章</h2>
        
        <form onSubmit={handlePublishArticle} className="enhanced-article-form">
          {/* 基本信息 */}
          <div className="form-section">
            <h3>📋 基本信息</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">文章标题 *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={articleForm.title}
                  onChange={handleFormChange}
                  placeholder="输入吸引人的标题..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">分类 *</label>
                <select
                  id="category"
                  name="category"
                  value={articleForm.category}
                  onChange={handleFormChange}
                >
                  <option value="visa-free">免签政策</option>
                  <option value="attractions">景点推荐</option>
                  <option value="guides">旅行指南</option>
                  <option value="culture">文化体验</option>
                  <option value="food">美食推荐</option>
                  <option value="transport">交通指南</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="summary">文章摘要 *</label>
              <textarea
                id="summary"
                name="summary"
                value={articleForm.summary}
                onChange={handleFormChange}
                placeholder="简短描述文章内容，用于搜索结果展示..."
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="publishTime">发布时间</label>
              <input
                type="datetime-local"
                id="publishTime"
                name="publishTime"
                value={articleForm.publishTime}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* 文件上传区域 */}
          <div className="form-section">
            <h3>📁 文件上传</h3>
            
            <div className="upload-grid">
              <div className="upload-item">
                <h4>📄 Word文档导入</h4>
                <p>上传Word文档，系统将自动提取内容并生成预览</p>
                <FileUploader
                  onFileUploaded={handleWordDocUploaded}
                  acceptedTypes="documents"
                  folder="article-documents"
                />
              </div>
              
              <div className="upload-item">
                <h4>🖼️ 图片上传</h4>
                <p>上传文章配图，第一张图片将作为封面</p>
                <FileUploader
                  onFileUploaded={handleImageUploaded}
                  acceptedTypes="images"
                  folder="article-images"
                />
              </div>
            </div>
          </div>

          {/* SEO优化区域 */}
          <div className="form-section seo-section">
            <h3>🔍 SEO优化</h3>
            
            <div className="seo-grid">
              <div className="seo-fields">
                <div className="form-group">
                  <label htmlFor="seoTitle">SEO标题</label>
                  <input
                    type="text"
                    id="seoTitle"
                    name="seoTitle"
                    value={articleForm.seoTitle}
                    onChange={handleFormChange}
                    placeholder="搜索引擎显示的标题 (建议60字符以内)"
                    maxLength={60}
                  />
                  <small>{articleForm.seoTitle.length}/60 字符</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="seoDescription">SEO描述</label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    value={articleForm.seoDescription}
                    onChange={handleFormChange}
                    placeholder="搜索结果中显示的描述 (建议160字符以内)"
                    rows={3}
                    maxLength={160}
                  />
                  <small>{articleForm.seoDescription.length}/160 字符</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tags">标签/关键词</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={articleForm.tags}
                    onChange={handleFormChange}
                    placeholder="用逗号分隔的关键词..."
                  />
                </div>
              </div>
              
              <div className="keyword-analysis">
                <h4>💡 关键词建议</h4>
                <div className="recommended-keywords">
                  {keywordAnalysis.recommended.map(keyword => (
                    <button
                      key={keyword}
                      type="button"
                      className="keyword-tag"
                      onClick={() => addRecommendedKeyword(keyword)}
                    >
                      + {keyword}
                    </button>
                  ))}
                </div>
                
                {keywordAnalysis.extracted.length > 0 && (
                  <div className="extracted-keywords">
                    <h5>从内容中提取的关键词:</h5>
                    <div className="keyword-density">
                      {keywordAnalysis.extracted.slice(0, 10).map(keyword => (
                        <span key={keyword} className="density-item">
                          {keyword} ({keywordAnalysis.density[keyword]}%)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              type="button" 
              className="optimize-btn"
              onClick={optimizeContentForSEO}
            >
              🎯 自动SEO优化
            </button>
          </div>

          {/* 内容编辑 */}
          <div className="form-section">
            <h3>✏️ 文章内容</h3>
            <div className="content-editor">
              <textarea
                id="content"
                name="content"
                value={articleForm.content}
                onChange={handleFormChange}
                placeholder="文章正文内容 (支持HTML格式)..."
                rows={20}
                required
              />
              <div className="editor-stats">
                <span>字数: {articleForm.content.length}</span>
                <span>段落: {articleForm.content.split('\n\n').length}</span>
                {articleForm.wordDocUrl && (
                  <span>包含Word文档: ✅</span>
                )}
              </div>
            </div>
          </div>

          {/* 预览和发布 */}
          <div className="form-actions">
            <button type="submit" className="publish-btn" disabled={loading}>
              {loading ? '🔄 发布中...' : '🚀 发布文章'}
            </button>
            <button type="button" className="preview-btn">
              👁️ 预览文章
            </button>
            <button type="button" className="save-draft-btn">
              💾 保存草稿
            </button>
          </div>
        </form>

        {/* 成功消息 */}
        {success && (
          <div className="success-message enhanced">
            <div className="success-content">
              <h3>🎉 {success.message}</h3>
              <div className="success-actions">
                <button 
                  className="view-article-btn"
                  onClick={() => navigate(`/articles/${success.articleId}`)}
                >
                  👀 查看文章
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setSuccess(null)}
                >
                  ✖️ 关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 文章列表 */}
      <div className="articles-management enhanced">
        <h2>📚 已发布文章 ({articles.length})</h2>
        
        {articles.length === 0 ? (
          <div className="empty-state">
            <p>还没有发布任何文章</p>
            <small>发布第一篇文章来开始吧！</small>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <div key={article.id} className="article-card enhanced">
                <div className="article-cover">
                  <img 
                    src={article.coverImage || '/images/placeholder.jpg'} 
                    alt={article.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="article-category">{article.category}</div>
                </div>
                
                <div className="article-content">
                  <h3>{article.title}</h3>
                  <p className="article-summary">{article.summary}</p>
                  
                  <div className="article-meta">
                    <span className="view-count">👁️ {article.viewCount}</span>
                    <span className="publish-date">
                      📅 {new Date(article.publishDate).toLocaleDateString()}
                    </span>
                    {article.tags && (
                      <div className="article-tags">
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="article-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => navigate(`/articles/${article.id}`)}
                  >
                    👀 查看
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => alert('编辑功能即将上线')}
                  >
                    ✏️ 编辑
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => alert('删除功能即将上线')}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard; 