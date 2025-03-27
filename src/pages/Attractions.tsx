import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articleService, Article } from '../services/articleService';
import './Attractions.css';

const Attractions: React.FC = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState<{[key: string]: boolean}>({});
  const location = useLocation();

  // Get all articles, not limited to specific category
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      console.log('Fetching all articles for Attractions page...');
      try {
        // Get all articles
        const allArticles = await articleService.getArticlesByCategory('', 1, 50);
        
        // Sort by date (newest first)
        allArticles.sort((a, b) => {
          const dateA = new Date(a.publishDate).getTime();
          const dateB = new Date(b.publishDate).getTime();
          return dateB - dateA;
        });
        
        console.log(`Retrieved ${allArticles.length} articles`);
        
        // Initialize image loading states
        const imgLoadingState: {[key: string]: boolean} = {};
        allArticles.forEach(article => {
          imgLoadingState[article.id] = true;
        });
        
        setArticles(allArticles);
        setImgLoading(imgLoadingState);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, [location.pathname]); // Refresh articles when path changes

  // Handle image loading completion
  const handleImageLoaded = (articleId: string) => {
    setImgLoading(prev => ({
      ...prev,
      [articleId]: false
    }));
  };
  
  // Handle image loading failure
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, articleId: string) => {
    console.log(`Image failed to load for article ${articleId}, using placeholder`);
    const img = e.target as HTMLImageElement;
    img.src = '/images/placeholder.jpg'; // Use a generic placeholder image
    handleImageLoaded(articleId); // Mark as loaded
  };

  // Format time as relative time (English)
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('attractions.title')} - {t('app.title')}</title>
        <meta name="description" content={t('attractions.description')} />
        <meta name="keywords" content="China attractions, Chinese culture, Great Wall, Forbidden City, Terracotta Warriors, Chinese heritage sites" />
      </Helmet>
      <div className="attractions-container">
        <header className="page-header">
          <h1>{t('attractions.title', 'Attractions & Culture')}</h1>
          <p>{t('attractions.subtitle', 'Explore China\'s cultural heritage and natural wonders')}</p>
        </header>
        
        <section className="regions-section">
          <h2>{t('attractions.regions.title', 'Popular Destinations')}</h2>
          <div className="region-cards">
            <div className="region-card">
              <h3>{t('attractions.regions.beijing.name', 'Beijing')}</h3>
              <p>{t('attractions.regions.beijing.attractions', 'Forbidden City, Great Wall, Temple of Heaven and other World Heritage sites')}</p>
              <div className="culture-info">
                <h4>{t('attractions.regions.culturalFeatures', 'Cultural Features')}</h4>
                <p>{t('attractions.regions.beijing.culture', 'Peking Opera, Siheyuan (Courtyard Houses), Hutong Culture')}</p>
              </div>
            </div>
            
            <div className="region-card">
              <h3>{t('attractions.regions.xian.name', 'Xi\'an')}</h3>
              <p>{t('attractions.regions.xian.attractions', 'Terracotta Warriors, Ancient City Wall, Giant Wild Goose Pagoda')}</p>
              <div className="culture-info">
                <h4>{t('attractions.regions.culturalFeatures', 'Cultural Features')}</h4>
                <p>{t('attractions.regions.xian.culture', 'Shaanxi Noodles, Shadow Puppetry, Ancient Capital Culture')}</p>
              </div>
            </div>
            
            <div className="region-card">
              <h3>{t('attractions.regions.chengdu.name', 'Chengdu')}</h3>
              <p>{t('attractions.regions.chengdu.attractions', 'Giant Panda Base, Jinli Ancient Street, Dujiangyan Irrigation System')}</p>
              <div className="culture-info">
                <h4>{t('attractions.regions.culturalFeatures', 'Cultural Features')}</h4>
                <p>{t('attractions.regions.chengdu.culture', 'Sichuan Opera Face-changing, Sichuan Cuisine, Teahouse Culture')}</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="seasonal-info">
          <h2>{t('attractions.seasons.title', 'Best Travel Seasons')}</h2>
          <div className="season-tips">
            <p>{t('attractions.seasons.spring', 'Spring: March-May, pleasant weather, perfect for flower viewing and outdoor activities')}</p>
            <p>{t('attractions.seasons.autumn', 'Autumn: September-November, clear skies and comfortable temperatures, the golden season for tourism')}</p>
          </div>
        </section>
        
        {/* 相关文章列表 */}
        <section className="attractions-articles-section">
          <h2>{t('attractions.relatedArticles', 'Explore More About Chinese Attractions & Culture')}</h2>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>{t('general.loading')}</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="attractions-articles-grid">
              {articles.map(article => (
                <Link 
                  to={`/articles/${article.id}`} 
                  key={article.id} 
                  className="article-card"
                >
                  <div className={`article-image ${imgLoading[article.id] ? 'image-loading' : ''}`}>
                    {imgLoading[article.id] && (
                      <div className="article-image-placeholder">
                        <div className="image-spinner"></div>
                      </div>
                    )}
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title}
                        onLoad={() => handleImageLoaded(article.id)}
                        onError={(e) => handleImageError(e, article.id)}
                        style={{ opacity: imgLoading[article.id] ? 0 : 1 }}
                      />
                    ) : (
                      // No cover image available, use placeholder directly
                      <img 
                        src="/images/placeholder.jpg" 
                        alt={article.title}
                        onLoad={() => handleImageLoaded(article.id)}
                        style={{ opacity: imgLoading[article.id] ? 0 : 1 }}
                      />
                    )}
                  </div>
                  <div className="article-content">
                    <div className="article-category">
                      {t(`article.categories.${article.category}`, {defaultValue: article.category})}
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-summary">{article.summary}</p>
                    <div className="article-meta">
                      <span className="article-date">{formatRelativeTime(article.publishDate)}</span>
                      <span className="article-views">{t('article.viewCount', {count: article.viewCount})}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-articles">
              <p>{t('general.noArticles')}</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default Attractions;