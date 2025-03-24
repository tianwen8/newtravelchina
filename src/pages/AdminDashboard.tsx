import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { initializeDatabase, checkDatabaseInitialized } from '../firebase/initializeDb';
import { articleService, Article } from '../services/articleService';
import ImageUploader from '../components/ImageUploader';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const [initializeStatus, setInitializeStatus] = useState<{
    inProgress: boolean;
    success: boolean | null;
    message: string;
  }>({
    inProgress: false,
    success: null,
    message: ''
  });
  
  // 管理员账号信息表单
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    displayName: '管理员'
  });
  
  // 文章表单
  const [articleForm, setArticleForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'travel-tips',
    tags: '',
    coverImage: ''
  });
  
  // 成功消息
  const [success, setSuccess] = useState<{
    message: string;
    articleId: string;
    title: string;
  } | null>(null);
  
  // 检查数据库初始化状态
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const isInitialized = await checkDatabaseInitialized();
        setInitialized(isInitialized);
        
        if (isInitialized) {
          // 加载文章列表
          loadArticles();
        }
      } catch (err) {
        console.error('检查初始化状态出错:', err);
        setError('检查数据库状态时出错');
      } finally {
        setLoading(false);
      }
    };
    
    checkInitialization();
  }, []);
  
  // 加载文章列表
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
  
  // 处理管理员表单变化
  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理文章表单变化
  const handleArticleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArticleForm(prev => ({ ...prev, [name]: value }));
  };
  
  // 初始化数据库
  const handleInitializeDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminForm.email || !adminForm.password) {
      setInitializeStatus({
        inProgress: false,
        success: false,
        message: '请填写管理员邮箱和密码'
      });
      return;
    }
    
    try {
      setInitializeStatus({
        inProgress: true,
        success: null,
        message: '正在初始化数据库...'
      });
      
      const result = await initializeDatabase(adminForm);
      
      setInitializeStatus({
        inProgress: false,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        setInitialized(true);
        // 重新加载文章列表
        loadArticles();
      }
    } catch (err) {
      setInitializeStatus({
        inProgress: false,
        success: false,
        message: `初始化失败: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };
  
  // 处理图片上传完成
  const handleImageUploaded = (imageUrl: string) => {
    setArticleForm(prev => ({ ...prev, coverImage: imageUrl }));
  };
  
  // 发布新文章
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
        tags: articleForm.tags.split(',').map(tag => tag.trim()),
        coverImage: articleForm.coverImage || '/images/placeholder.jpg',
        author: currentUser?.displayName || '管理员'
      };
      
      const publishedArticle = await articleService.publishArticle(articleData);
      
      // 重置表单
      setArticleForm({
        title: '',
        summary: '',
        content: '',
        category: 'travel-tips',
        tags: '',
        coverImage: ''
      });
      
      // 刷新文章列表
      loadArticles();
      
      // 设置成功消息和文章链接
      setError('');
      setSuccess({
        message: '文章发布成功！',
        articleId: publishedArticle.id,
        title: publishedArticle.title
      });
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccess(null);
      }, 10000);
      
    } catch (err) {
      console.error('发布文章失败:', err);
      setError('发布文章失败，请重试');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && initialized === null) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('general.loading')}</p>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <Helmet>
        <title>管理员面板 - {t('app.title')}</title>
      </Helmet>
      
      <h1 className="dashboard-title">管理员控制面板</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 数据库初始化部分 */}
      {!initialized && (
        <div className="initialization-section">
          <h2>初始化数据库</h2>
          <p>检测到数据库尚未初始化。请创建管理员账号并初始化数据库。</p>
          
          {initializeStatus.message && (
            <div className={`status-message ${initializeStatus.success === true ? 'success' : initializeStatus.success === false ? 'error' : ''}`}>
              {initializeStatus.message}
            </div>
          )}
          
          <form onSubmit={handleInitializeDatabase} className="admin-form">
            <div className="form-group">
              <label htmlFor="email">管理员邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={adminForm.email}
                onChange={handleAdminFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">管理员密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={adminForm.password}
                onChange={handleAdminFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="displayName">显示名称</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={adminForm.displayName}
                onChange={handleAdminFormChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="admin-button" 
              disabled={initializeStatus.inProgress}
            >
              {initializeStatus.inProgress ? '初始化中...' : '初始化数据库'}
            </button>
          </form>
        </div>
      )}
      
      {/* 文章管理部分 */}
      {initialized && (
        <div className="articles-management">
          <h2>文章管理</h2>
          
          {/* 发布新文章 */}
          <div className="publish-article">
            <h3>发布新文章</h3>
            <form onSubmit={handlePublishArticle} className="article-form">
              <div className="form-group">
                <label htmlFor="title">文章标题</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={articleForm.title}
                  onChange={handleArticleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="summary">文章摘要</label>
                <input
                  type="text"
                  id="summary"
                  name="summary"
                  value={articleForm.summary}
                  onChange={handleArticleFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">分类</label>
                <select
                  id="category"
                  name="category"
                  value={articleForm.category}
                  onChange={handleArticleFormChange}
                >
                  <option value="visa-free">免签政策</option>
                  <option value="attractions">景点推荐</option>
                  <option value="culture">中国文化</option>
                  <option value="travel-tips">旅行技巧</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">标签（用逗号分隔）</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={articleForm.tags}
                  onChange={handleArticleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="coverImage">封面图片</label>
                <ImageUploader
                  initialImageUrl={articleForm.coverImage}
                  onImageUploaded={handleImageUploaded}
                  folder="article-covers"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">文章内容 (支持HTML格式)</label>
                <textarea
                  id="content"
                  name="content"
                  value={articleForm.content}
                  onChange={handleArticleFormChange}
                  rows={10}
                  required
                />
              </div>
              
              <button type="submit" className="admin-button" disabled={loading}>
                {loading ? '发布中...' : '发布文章'}
              </button>
            </form>
            
            {/* 成功消息 */}
            {success && (
              <div className="success-message">
                <p>{success.message}</p>
                <div className="success-actions">
                  <Link to={`/articles/${success.articleId}`} className="view-article-link">
                    查看文章: {success.title}
                  </Link>
                  <button 
                    className="close-button"
                    onClick={() => setSuccess(null)}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 文章列表 */}
          <div className="articles-list">
            <h3>文章列表</h3>
            
            {articles.length === 0 ? (
              <p>没有找到文章</p>
            ) : (
              <ul className="admin-articles">
                {articles.map(article => (
                  <li key={article.id} className="article-item">
                    <div className="article-info">
                      <h4>{article.title}</h4>
                      <p className="article-summary">{article.summary}</p>
                      <div className="article-meta">
                        <span className="category">{article.category}</span>
                        <span className="view-count">阅读量: {article.viewCount}</span>
                        <span className="publish-date">
                          发布日期: {new Date(article.publishDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="article-actions">
                      <button 
                        className="action-button view"
                        onClick={() => navigate(`/articles/${article.id}`)}
                      >
                        查看
                      </button>
                      <button 
                        className="action-button edit"
                        onClick={() => alert('编辑功能即将上线')}
                      >
                        编辑
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => alert('删除功能即将上线')}
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 