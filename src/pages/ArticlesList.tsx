import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { articleService, Article, ARTICLE_CATEGORIES } from '../services/articleService';

const ArticlesList: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        let articlesList: Article[];
        
        if (selectedCategory) {
          articlesList = await articleService.getArticlesByCategory(selectedCategory);
        } else {
          // 获取全部文章（实际应用中可能需要分页）
          const categoriesPromises = ARTICLE_CATEGORIES.map(cat => 
            articleService.getArticlesByCategory(cat.id, 1, 5)
          );
          const categoriesResults = await Promise.all(categoriesPromises);
          articlesList = categoriesResults.flat();
        }
        
        setArticles(articlesList);
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  return (
    <div className="articles-page">
      <Helmet>
        <title>{t('article.categories.title', '文章')} - {t('app.title')}</title>
      </Helmet>
      
      <div className="container">
        <h1 className="page-title">{t('article.categories.title', '文章')}</h1>
        
        {/* 分类筛选 */}
        <div className="categories-filter">
          <button 
            className={`category-button ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            全部
          </button>
          {ARTICLE_CATEGORIES.map(category => (
            <button 
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {t(`article.categories.${category.id}`, category.name)}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t('general.loading')}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="no-results">
            <p>{t('general.noResults')}</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <Link 
                to={`/articles/${article.id}`} 
                key={article.id} 
                className="article-card"
              >
                <div className="article-image">
                  <img 
                    src={article.coverImage} 
                    alt={article.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  <span className="category-tag">
                    {t(`article.categories.${article.category}`, {defaultValue: article.category})}
                  </span>
                </div>
                <div className="article-info">
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="article-meta">
                    <span className="views">{t('article.viewCount', {count: article.viewCount})}</span>
                    <span className="date">
                      {new Date(article.publishDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesList; 