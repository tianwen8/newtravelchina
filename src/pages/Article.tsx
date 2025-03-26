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
  const location = useLocation();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      setIsLoading(true);
      try {
        const articleData = await articleService.getArticleById(articleId);
        setArticle(articleData);
        
        // 记录文章浏览量
        await articleService.recordView(articleId);
        
        // 获取相关文章
        const related = await articleService.getRelatedArticles(articleId);
        setRelatedArticles(related);
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

  // 根据文章分类确定返回链接对应的顶部导航路径
  const getCategoryRoute = (category: string): string => {
    switch (category) {
      case 'visa-free':
        return '/visa-free';
      case 'attractions':
      case 'culture':
        return '/attractions';
      case 'travel-tips':
        return '/visa-free'; // 旅行技巧暂时放在免签政策页面
      default:
        return `/articles?category=${category}`; // 如果没有对应的专用页面，则返回通用文章列表
    }
  };

  const backToListLink = getCategoryRoute(article.category);

  return (
    <div className="article-container">
      <Helmet>
        <title>{article.title} - {t('app.title')}</title>
        <meta name="description" content={article.summary} />
      </Helmet>

      <div className="article-header">
        <div className="category-label">
          <Link to={getCategoryRoute(article.category)}>
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

      <div className="article-summary">
        <p>{article.summary}</p>
      </div>

      <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />

      {relatedArticles.length > 0 && (
        <div className="related-articles">
          <h3>{t('article.relatedArticles')}</h3>
          <div className="related-articles-list">
            {relatedArticles.map(relatedArticle => (
              <Link 
                to={`/articles/${relatedArticle.id}`} 
                key={relatedArticle.id} 
                className="related-article-item"
              >
                <h4>{relatedArticle.title}</h4>
                <p>{relatedArticle.summary}</p>
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