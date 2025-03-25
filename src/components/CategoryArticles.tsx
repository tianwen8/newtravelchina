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
}

const CategoryArticles: React.FC<CategoryArticlesProps> = ({ 
  category, 
  limit = 3, 
  showTitle = true,
  autoRefresh = false,
  refreshInterval = 60000, // 默认1分钟刷新一次
  highlightNew = true
}) => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await articleService.getLatestArticlesByCategory(category, limit);
      setArticles(fetchedArticles);
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
          <Link to={`/${category}`} className="view-more">
            {t('general.viewMore')} →
          </Link>
        </div>
      )}
      
      <div className="category-articles-grid">
        {articles.map((article, index) => (
          <Link 
            to={`/articles/${article.id}`} 
            className={`category-article-card ${index === 0 ? 'featured' : ''}`} 
            key={article.id}
          >
            <div className="article-image">
              <img 
                src={article.coverImage} 
                alt={article.title} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
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
    </div>
  );
};

export default CategoryArticles; 