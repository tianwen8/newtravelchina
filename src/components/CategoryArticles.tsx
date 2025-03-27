import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articleService } from '../services/articleService';
import './CategoryArticles.css';

interface CategoryArticlesProps {
  category: string;
  limit?: number;
  showTitle?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  highlightNew?: boolean;
  listMode?: boolean;
}

const CategoryArticles: React.FC<CategoryArticlesProps> = ({ 
  category, 
  limit = 3, 
  showTitle = true,
  autoRefresh = false,
  refreshInterval = 60000, // 默认1分钟刷新一次
  highlightNew = true,
  listMode = false
}) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgLoading, setImgLoading] = useState<{[key: string]: boolean}>({});

  const fetchArticles = async () => {
    try {
      setLoading(true);
      console.log(`开始获取${category}分类文章，限制数量: ${limit}`);
      const fetchedArticles = await articleService.getLatestArticlesByCategory(category, limit);
      console.log(`获取到${category}分类文章:`, fetchedArticles);
      
      // 初始化图片加载状态
      const imgLoadingState: {[key: string]: boolean} = {};
      fetchedArticles.forEach(article => {
        imgLoadingState[article.id] = true;
      });
      
      setArticles(fetchedArticles);
      setImgLoading(imgLoadingState);
      setError('');
    } catch (err) {
      console.error('获取文章失败:', err);
      setError('无法加载文章，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    
    // 如果启用自动刷新，设置定时器
    let refreshTimer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      refreshTimer = setInterval(fetchArticles, refreshInterval);
    }
    
    // 清理函数
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [category, limit, autoRefresh, refreshInterval]);
  
  // 检查文章是否是最新的（3天内发布）
  const isNewArticle = (publishDate: string | number | Date): boolean => {
    const publishTime = new Date(publishDate).getTime();
    const threeDaysAgo = new Date().getTime() - (3 * 24 * 60 * 60 * 1000);
    return publishTime > threeDaysAgo;
  };
  
  // 获取分类的中文名称
  const getCategoryName = () => {
    const categoryMap: {[key: string]: string} = {
      'visa-free': '免签政策',
      'attractions': '景点推荐',
      'culture': '中国文化',
      'travel-tips': '旅行技巧'
    };
    
    return categoryMap[category] || category;
  };
  
  // 处理图片加载完成
  const handleImageLoaded = (articleId: string) => {
    setImgLoading(prev => ({
      ...prev,
      [articleId]: false
    }));
  };
  
  // 处理图片加载失败
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, articleId: string) => {
    const img = e.target as HTMLImageElement;
    img.src = '/images/placeholder.jpg';
    handleImageLoaded(articleId);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="category-articles-loading">
        <div className="spinner"></div>
        <p>{t('general.loading')}</p>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="category-articles-error">
        <p>{error}</p>
        <button onClick={fetchArticles} className="retry-button">
          {t('general.retry')}
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // 如果没有文章，则不显示任何内容
  }

  return (
    <div className="category-articles-container">
      {showTitle && (
        <div className="category-header">
          <h2>{getCategoryName()}</h2>
          <Link to={`/articles?category=${category}`} className="view-more">
            {t('general.viewMore')} →
          </Link>
        </div>
      )}
      
      {listMode ? (
        // 列表模式
        <div className="category-articles-list">
          {articles.map((article) => (
            <Link 
              to={`/articles/${article.id}`} 
              className="article-list-item"
              key={article.id}
            >
              <div className="article-list-content">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="article-meta">
                  <span className="publish-date">
                    {new Date(article.publishDate).toLocaleDateString()}
                  </span>
                  <span className="view-count">
                    {article.viewCount} 阅读
                  </span>
                </div>
              </div>
              {highlightNew && isNewArticle(article.publishDate) && (
                <span className="new-badge-list">最新</span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        // 卡片模式（原有样式）
        <div className="category-articles-grid">
          {articles.map((article, index) => (
            <Link 
              to={`/articles/${article.id}`} 
              className={`category-article-card ${index === 0 ? 'featured' : ''}`} 
              key={article.id}
            >
              <div className={`article-image ${imgLoading[article.id] ? 'image-loading' : ''}`}>
                {imgLoading[article.id] && (
                  <div className="article-image-placeholder">
                    <div className="image-spinner"></div>
                  </div>
                )}
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  loading="lazy"
                  onLoad={() => handleImageLoaded(article.id)}
                  onError={(e) => handleImageError(e, article.id)}
                  style={{ 
                    opacity: imgLoading[article.id] ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
                {highlightNew && isNewArticle(article.publishDate) && (
                  <span className="new-badge">最新</span>
                )}
              </div>
              <div className="article-info">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="article-meta">
                  <span className="publish-date">
                    {new Date(article.publishDate).toLocaleDateString()}
                  </span>
                  <span className="view-count">
                    {article.viewCount} 阅读
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryArticles; 