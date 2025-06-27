import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '../config/supabase';
import { supabaseUploadService } from '../services/supabaseUploadService';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import './AdminDashboard.css';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  view_count: number;
}

const SimpleSupabaseAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // 文章表单
  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'visa-free',
    tags: '',
    featured_image: ''
  });
  
  const [success, setSuccess] = useState<string>('');

  // 检查用户登录状态
  useEffect(() => {
    checkUser();
    loadArticles();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUser(user);
  };

  // 加载文章列表
  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('加载文章失败:', err);
      setError('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArticleForm(prev => ({ ...prev, [name]: value }));
  };

  // 处理文件上传
  const handleFileUploaded = (fileUrl: string, fileType: 'image' | 'document', fileInfo?: any) => {
    if (fileType === 'image') {
      if (!articleForm.featured_image) {
        // 第一张图片作为封面
        setArticleForm(prev => ({ ...prev, featured_image: fileUrl }));
      }
      
      // 插入到内容中
      const imgTag = `\n\n<img src="${fileUrl}" alt="文章配图" style="max-width: 100%; height: auto; margin: 15px 0; border-radius: 8px;" />\n\n`;
      setArticleForm(prev => ({ 
        ...prev, 
        content: prev.content + imgTag
      }));
    } else if (fileType === 'document') {
      // Word文档处理
      const docHtml = `\n\n<div class="document-container" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
  <h4>📄 Word文档内容</h4>
  <p><a href="${fileUrl}" target="_blank" download>📎 下载文档</a></p>
  <iframe src="https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true" 
          style="width: 100%; height: 400px; border: none;">
  </iframe>
</div>\n\n`;
      
      setArticleForm(prev => ({ 
        ...prev, 
        content: prev.content + docHtml
      }));
      
      // 如果提取了文本内容，添加到正文
      if (fileInfo?.extractedContent) {
        const textContent = `\n\n<div class="extracted-text" style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
  <h5>📝 文档文本内容：</h5>
  <p>${fileInfo.extractedContent}</p>
</div>\n\n`;
        
        setArticleForm(prev => ({ 
          ...prev, 
          content: prev.content + textContent
        }));
      }
    }
  };

  // 发布文章
  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleForm.title || !articleForm.excerpt || !articleForm.content) {
      setError('请填写文章标题、摘要和内容');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('articles')
        .insert([{
          title: articleForm.title,
          content: articleForm.content,
          excerpt: articleForm.excerpt,
          featured_image: articleForm.featured_image,
          category: articleForm.category,
          tags: articleForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          author_id: user?.id,
          is_published: true,
          view_count: 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setSuccess('🎉 文章发布成功！');
      
      // 重置表单
      setArticleForm({
        title: '',
        excerpt: '',
        content: '',
        category: 'visa-free',
        tags: '',
        featured_image: ''
      });
      
      // 刷新文章列表
      loadArticles();
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('发布文章失败:', err);
      setError('发布文章失败：' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 删除文章
  const deleteArticle = async (articleId: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);
      
      if (error) throw error;
      
      setSuccess('文章删除成功');
      loadArticles();
    } catch (err) {
      setError('删除文章失败：' + (err as Error).message);
    }
  };

  // 登出
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
    <div className="admin-dashboard simple-supabase">
      <Helmet>
        <title>Supabase 后台管理 - 图文文章发布</title>
      </Helmet>
      
      <div className="dashboard-header">
        <h1>📊 Supabase 后台管理</h1>
        <div className="header-actions">
          <span>欢迎，{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">登出</button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✖️</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>✖️</button>
        </div>
      )}

      {/* 发布新文章 */}
      <div className="publish-section">
        <h2>📝 发布新文章</h2>
        
        <form onSubmit={handlePublishArticle} className="simple-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">文章标题 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={articleForm.title}
                onChange={handleFormChange}
                placeholder="输入文章标题..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">分类</label>
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
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">文章摘要 *</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={articleForm.excerpt}
              onChange={handleFormChange}
              placeholder="简短描述文章内容..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">标签（用逗号分隔）</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={articleForm.tags}
              onChange={handleFormChange}
              placeholder="中国旅游, 免签, 攻略..."
            />
          </div>

          {/* 文件上传区域 */}
          <div className="upload-section">
            <h3>📁 上传图片和文档</h3>
            <p className="upload-hint">支持图片（JPG, PNG, GIF）和Word文档（DOC, DOCX），自动插入到文章内容中</p>
            
            <EnhancedFileUploader
              onFileUploaded={handleFileUploaded}
              acceptedTypes="all"
              folder="articles"
              useSupabase={true}
              enableWordExtraction={true}
              maxFiles={10}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">文章内容 *</label>
            <textarea
              id="content"
              name="content"
              value={articleForm.content}
              onChange={handleFormChange}
              placeholder="文章正文内容，支持HTML格式。上传的图片和文档会自动插入到这里..."
              rows={15}
              required
            />
            <small>字数统计: {articleForm.content.length} 字符</small>
          </div>

          <button type="submit" className="publish-btn" disabled={loading}>
            {loading ? '🔄 发布中...' : '🚀 发布文章'}
          </button>
        </form>
      </div>

      {/* 文章列表 */}
      <div className="articles-section">
        <h2>📚 已发布文章 ({articles.length})</h2>
        
        {articles.length === 0 ? (
          <div className="empty-state">
            <p>还没有发布任何文章</p>
            <small>发布第一篇文章来开始吧！</small>
          </div>
        ) : (
          <div className="articles-list">
            {articles.map(article => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <h3>{article.title}</h3>
                  <div className="article-meta">
                    <span className="category">{article.category}</span>
                    <span className="views">👁️ {article.view_count}</span>
                    <span className="date">
                      📅 {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="article-content">
                  {article.featured_image && (
                    <img 
                      src={article.featured_image} 
                      alt={article.title}
                      className="article-thumbnail"
                    />
                  )}
                  <p className="article-excerpt">{article.excerpt}</p>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="article-tags">
                      {article.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="article-actions">
                  <a 
                    href={`/articles/${article.id}`} 
                    target="_blank"
                    className="action-btn view"
                  >
                    👁️ 预览
                  </a>
                  <button 
                    className="action-btn delete"
                    onClick={() => deleteArticle(article.id)}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supabase状态信息 */}
      <div className="supabase-info">
        <h3>📊 Supabase 存储状态</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">数据库：</span>
            <span className="value">PostgreSQL ✅</span>
          </div>
          <div className="info-item">
            <span className="label">文件存储：</span>
            <span className="value">1GB 免费额度 ✅</span>
          </div>
          <div className="info-item">
            <span className="label">API请求：</span>
            <span className="value">50万次/月 免费 ✅</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSupabaseAdmin; 