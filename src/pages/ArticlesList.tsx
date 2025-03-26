import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { articleService, Article, ARTICLE_CATEGORIES } from '../services/articleService';
import './articles.css';

const ArticlesList: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // 从URL中获取分类参数
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('');
    }
  }, [location.search]);

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    // 更新URL参数
    if (category) {
      navigate(`/articles?category=${category}`);
    } else {
      navigate('/articles');
    }
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        let articlesList: Article[];
        
        if (selectedCategory) {
          // 获取特定分类的文章
          articlesList = await articleService.getArticlesByCategory(selectedCategory);
        } else {
          // 获取全部文章（实际应用中可能需要分页）
          const categoriesPromises = ARTICLE_CATEGORIES.map(cat => 
            articleService.getArticlesByCategory(cat.id, 1, 5)
          );
          const categoriesResults = await Promise.all(categoriesPromises);
          articlesList = categoriesResults.flat();
        }
        
        // 确保按发布日期排序（最新的排在前面）
        articlesList.sort((a, b) => {
          const dateA = new Date(a.publishDate).getTime();
          const dateB = new Date(b.publishDate).getTime();
          return dateB - dateA;
        });
        
        setArticles(articlesList);
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory]);

  // 格式化时间为相对时间
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}秒前`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="articles-page">
      <Helmet>
        <title>
          {selectedCategory 
            ? `${t(`article.categories.${selectedCategory}`, { defaultValue: ARTICLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory })} - ${t('app.title')}`
            : `${t('article.categories.title', '文章')} - ${t('app.title')}`
          }
        </title>
      </Helmet>
      
      <div className="container">
        <h1 className="page-title">
          {selectedCategory 
            ? t(`article.categories.${selectedCategory}`, { defaultValue: ARTICLE_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory })
            : t('article.categories.title', '文章')
          }
        </h1>
        
        {/* 分类筛选 */}
        <div className="categories-filter">
          <button 
            className={`category-button ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            全部
          </button>
          {ARTICLE_CATEGORIES.map(category => (
            <button 
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
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
          <div className="articles-list-view">
            {articles.map(article => (
              <Link 
                to={`/articles/${article.id}`} 
                key={article.id} 
                className="article-list-item"
              >
                <div className="article-list-content">
                  <h3 className="article-list-title">{article.title}</h3>
                  <p className="article-list-summary">{article.summary}</p>
                  <div className="article-list-meta">
                    <span className="category">
                      {t(`article.categories.${article.category}`, {defaultValue: article.category})}
                    </span>
                    <span className="views">{t('article.viewCount', {count: article.viewCount})}</span>
                    <span className="date">
                      {formatRelativeTime(article.publishDate)}
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