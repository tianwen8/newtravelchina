import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { articleService } from '../services/articleService';
import { travelGuideService } from '../services/communityService';
import { tripBuddyService } from '../services/communityService';
import './FeaturedContent.css';

// 显示相对时间的辅助函数
const getRelativeTime = (timestamp: number | Date) => {
  const now = Date.now();
  const timeMs = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diffInSeconds = Math.floor((now - timeMs) / 1000);

  if (diffInSeconds < 60) return '刚刚';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}小时前`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}天前`;
  
  return new Date(timeMs).toLocaleDateString();
};

const FeaturedContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [popularGuides, setPopularGuides] = useState<any[]>([]);
  const [tripBuddies, setTripBuddies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        setIsLoading(true);
        
        // 并行加载各类内容
        const [articles, guides, buddies] = await Promise.all([
          articleService.getFeaturedArticles(3),
          travelGuideService.getPopularGuides(2),
          tripBuddyService.getActiveTripBuddyPosts(3)
        ]);
        
        setFeaturedArticles(articles);
        setPopularGuides(guides);
        setTripBuddies(buddies);
      } catch (error) {
        console.error('加载精选内容失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedContent();
  }, [i18n.language]); // 当语言改变时重新加载内容

  if (isLoading) {
    return (
      <section className="featured-content-section">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('general.loading')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-content-section">
      {/* 精选官方文章 */}
      <div className="featured-section">
        <div className="section-header">
          <h2>{t('home.featuredArticles.title')}</h2>
          <Link to="/articles" className="view-all">{t('general.viewAll')} &rarr;</Link>
        </div>
        
        <div className="articles-grid">
          {featuredArticles.map(article => (
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
                  {t(`home.categories.${article.category}`, {defaultValue: article.category})}
                </span>
              </div>
              <div className="article-info">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <div className="article-meta">
                  <span className="views">{article.viewCount} 浏览</span>
                  <span className="date">{getRelativeTime(article.publishDate)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* 热门攻略 */}
      {popularGuides.length > 0 && (
        <div className="featured-section">
          <div className="section-header">
            <h2>{t('home.popularGuides.title')}</h2>
            <Link to="/community/guides" className="view-all">{t('general.viewAll')} &rarr;</Link>
          </div>
          
          <div className="guides-container">
            {popularGuides.map(guide => (
              <Link 
                to={`/community/guides/${guide.id}`} 
                key={guide.id} 
                className="guide-card"
              >
                <div className="guide-image">
                  <img 
                    src={guide.coverImage} 
                    alt={guide.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}  
                  />
                </div>
                <div className="guide-info">
                  <div className="guide-destination">
                    <span className="destination-label">{guide.destination}</span>
                    <span className="duration">{guide.duration}</span>
                  </div>
                  <h3>{guide.title}</h3>
                  <div className="guide-meta">
                    <span className="likes">
                      <i className="heart-icon">❤</i> {guide.likes}
                    </span>
                    <span className="author">
                      {guide.authorPhoto && (
                        <img 
                          src={guide.authorPhoto} 
                          alt={guide.authorName}
                          className="author-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      {guide.authorName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* 结伴同行 */}
      {tripBuddies.length > 0 && (
        <div className="featured-section">
          <div className="section-header">
            <h2>{t('home.tripBuddies.title')}</h2>
            <Link to="/community/trip-buddies" className="view-all">{t('general.viewAll')} &rarr;</Link>
          </div>
          
          <div className="buddies-slider">
            {tripBuddies.map(buddy => (
              <Link 
                to={`/community/trip-buddies/${buddy.id}`} 
                key={buddy.id} 
                className="buddy-card"
              >
                <div className="buddy-header">
                  <img 
                    src={buddy.authorPhoto || '/images/avatars/default.jpg'} 
                    alt={buddy.authorName} 
                    className="author-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/avatars/default.jpg';
                    }}
                  />
                  <span className="author-name">{buddy.authorName}</span>
                </div>
                <div className="buddy-details">
                  <h4>{buddy.title}</h4>
                  <div className="buddy-info">
                    <span className="destination">{buddy.destination}</span>
                    <span className="date">
                      {new Date(buddy.travelDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="buddy-description">
                    {buddy.description.length > 80 
                      ? `${buddy.description.substring(0, 80)}...` 
                      : buddy.description}
                  </p>
                </div>
                <div className="interest-count">
                  {buddy.interestedUsers.length} 人感兴趣
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedContent; 