import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { articleService, Article as ArticleType } from '../services/articleService';
import './Article.css';

const Article: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
  const [imgLoading, setImgLoading] = useState(true);
  const [relatedImgLoading, setRelatedImgLoading] = useState<{[key: string]: boolean}>({});
  const location = useLocation();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      setIsLoading(true);
      setImgLoading(true);
      try {
        const articleData = await articleService.getArticleById(articleId);
        setArticle(articleData);
        
        // 记录文章浏览量
        await articleService.recordView(articleId);
        
        // 获取相关文章
        const related = await articleService.getRelatedArticles(articleId);
        setRelatedArticles(related);
        
        // 初始化相关文章图片加载状态
        const imgLoadingState: {[key: string]: boolean} = {};
        related.forEach(relatedArticle => {
          imgLoadingState[relatedArticle.id] = true;
        });
        setRelatedImgLoading(imgLoadingState);
      } catch (err) {
        console.error('获取文章失败:', err);
        setError(t('article.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    
    // 滚动到顶部
    window.scrollTo(0, 0);
  }, [articleId, t]);

  // 处理主图片加载完成
  const handleMainImageLoaded = () => {
    setImgLoading(false);
  };
  
  // 处理主图片加载错误
  const handleMainImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.src = '/images/placeholder.jpg';
    setImgLoading(false);
  };
  
  // 处理相关文章图片加载完成
  const handleRelatedImageLoaded = (articleId: string) => {
    setRelatedImgLoading(prev => ({
      ...prev,
      [articleId]: false
    }));
  };
  
  // 处理相关文章图片加载错误
  const handleRelatedImageError = (e: React.SyntheticEvent<HTMLImageElement>, articleId: string) => {
    const img = e.target as HTMLImageElement;
    img.src = '/images/placeholder.jpg';
    handleRelatedImageLoaded(articleId);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('general.loading')}</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="error-container">
        <h2>{t('general.error')}</h2>
        <p>{error || t('article.notFound')}</p>
        <Link to="/articles" className="back-button">
          {t('general.backToList')}
        </Link>
      </div>
    );
  }

  // 构建返回链接，确保包含分类信息
  const backToListLink = `/articles?category=${article.category}`;

  return (
    <div className="article-container">
      <Helmet>
        <title>{article.title} - {t('app.title')}</title>
        <meta name="description" content={article.summary} />
      </Helmet>

      <div className="article-header">
        <div className="category-label">
          <Link to={`/articles?category=${article.category}`}>
            {t(`article.categories.${article.category}`, {defaultValue: article.category})}
          </Link>
        </div>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">
          <span className="publish-date">
            {new Date(article.publishDate).toLocaleDateString()}
          </span>
          <span className="view-count">
            {t('article.viewCount', {count: article.viewCount})}
          </span>
        </div>
      </div>

      {article.coverImage && (
        <div className={`article-cover ${imgLoading ? 'image-loading' : ''}`}>
          {imgLoading && (
            <div className="article-image-placeholder">
              <div className="image-spinner"></div>
            </div>
          )}
          <img 
            src={article.coverImage} 
            alt={article.title}
            loading="eager"
            onLoad={handleMainImageLoaded}
            onError={handleMainImageError}
            style={{ 
              opacity: imgLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </div>
      )}

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {relatedArticles.length > 0 && (
        <div className="related-articles">
          <h3>{t('article.relatedArticles')}</h3>
          <div className="related-articles-grid">
            {relatedArticles.map(relatedArticle => (
              <Link 
                to={`/articles/${relatedArticle.id}`} 
                key={relatedArticle.id} 
                className="related-article-card"
              >
                <div className={`related-article-image ${relatedImgLoading[relatedArticle.id] ? 'image-loading' : ''}`}>
                  {relatedImgLoading[relatedArticle.id] && (
                    <div className="article-image-placeholder">
                      <div className="image-spinner"></div>
                    </div>
                  )}
                  <img 
                    src={relatedArticle.coverImage} 
                    alt={relatedArticle.title}
                    loading="lazy"
                    onLoad={() => handleRelatedImageLoaded(relatedArticle.id)}
                    onError={(e) => handleRelatedImageError(e, relatedArticle.id)}
                    style={{ 
                      opacity: relatedImgLoading[relatedArticle.id] ? 0 : 1,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                  />
                </div>
                <h4>{relatedArticle.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="article-navigation">
        <Link to={backToListLink} className="back-button">
          {t('general.backToList')}
        </Link>
      </div>
    </div>
  );
};

export default Article; 