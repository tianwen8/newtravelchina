import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';
import { articleService, Article } from '../services/articleService';
import './VisaFree.css';
import { useTranslation } from 'react-i18next';

const VisaFree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { policies, selectedPolicyId, userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState<{[key: string]: boolean}>({});
  const { t } = useTranslation();
  const location = useLocation();
  
  // Fetch all articles, not limited to specific categories
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      console.log('Fetching all articles...');
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
  
  const handlePolicySelect = (id: string) => {
    dispatch(selectPolicy(id));
    if (userCountry) {
      dispatch(checkEligibility());
    }
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setUserCountry(e.target.value));
  };
  
  const handleCheckEligibility = () => {
    setShowEligibilityCheck(true);
    dispatch(checkEligibility());
  };

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
  
  // Common countries list
  const commonCountries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 
    'France', 'Germany', 'Japan', 'South Korea'
  ];
  
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
        <title>{t('visaFree.title')} - {t('app.title')}</title>
        <meta name="description" content={`${t('visaFree.subtitle')}. ${t('visaFree.policies.144hour.description')}, ${t('visaFree.policies.72hour.description')}`} />
        <meta name="keywords" content="China visa-free transit, 144-hour visa-free, 72-hour visa-free, China travel tips, Beijing visa-free, Shanghai visa-free, transit visa China, visa exemption" />
      </Helmet>
      <div className="visa-free-container">
        <header className="page-header">
          <h1>{t('visaFree.title')}</h1>
          <p>{t('visaFree.subtitle')}</p>
        </header>
        
        <section className="policy-section">
          <h2>{t('visaFree.policies.title')}</h2>
          <div className="policy-cards">
            {policies.map(policy => (
              <div 
                key={policy.id} 
                className={`policy-card ${selectedPolicyId === policy.id ? 'selected' : ''}`}
                onClick={() => handlePolicySelect(policy.id)}
              >
                <h3>{t(`visaFree.policies.${policy.translationKey}.name`)}</h3>
                <p>{t(`visaFree.policies.${policy.translationKey}.description`)}</p>
                <div className="policy-details">
                  <span className="duration">{policy.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="eligibility-section">
          <h2>{t('visaFree.eligibility.title')}</h2>
          <div className="eligibility-form">
            <div className="form-group">
              <label htmlFor="country-select">{t('visaFree.eligibility.selectCountry')}</label>
              <select 
                id="country-select" 
                value={userCountry || ''}
                onChange={handleCountryChange}
              >
                <option value="">{t('visaFree.eligibility.countryPlaceholder')}</option>
                {commonCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="check-button"
              disabled={!selectedPolicyId || !userCountry}
              onClick={handleCheckEligibility}
            >
              {t('visaFree.eligibility.checkButton')}
            </button>
            
            {showEligibilityCheck && userCountry && selectedPolicyId && (
              <div className={`eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
                {isEligible 
                  ? t('visaFree.eligibility.eligible', { 
                      policy: policies.find(p => p.id === selectedPolicyId)?.translationKey 
                        ? t(`visaFree.policies.${policies.find(p => p.id === selectedPolicyId)?.translationKey}.name`) 
                        : policies.find(p => p.id === selectedPolicyId)?.name 
                    }) 
                  : t('visaFree.eligibility.notEligible', { 
                      country: userCountry, 
                      policy: policies.find(p => p.id === selectedPolicyId)?.translationKey 
                        ? t(`visaFree.policies.${policies.find(p => p.id === selectedPolicyId)?.translationKey}.name`) 
                        : policies.find(p => p.id === selectedPolicyId)?.name 
                    })}
              </div>
            )}
          </div>
        </section>
        
        <section className="travel-tips">
          <h2>{t('visaFree.tips.title')}</h2>
          <ul className="tips-list">
            <li>{t('visaFree.tips.prepare')}</li>
            <li>{t('visaFree.tips.research')}</li>
            <li>{t('visaFree.tips.plan')}</li>
            <li>{t('visaFree.tips.arrange')}</li>
          </ul>
        </section>

        {/* Related articles list */}
        <section className="related-articles-section">
          <h2>{t('visaFree.relatedArticles', 'Related Articles & Travel Information')}</h2>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>{t('general.loading')}</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="visa-articles-grid">
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

export default VisaFree;