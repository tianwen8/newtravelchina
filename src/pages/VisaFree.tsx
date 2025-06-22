import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';
import { articleService, Article } from '../services/articleService';
import './VisaFree.css';
import { useTranslation } from 'react-i18next';

// 创建一个更全面的国家列表（包括符合免签和不符合的国家）
const countryList = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Belize', 
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 
  'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 
  'El Salvador', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Georgia', 
  'Germany', 'Ghana', 'Greece', 'Guatemala', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 
  'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 
  'Lebanon', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 
  'Oman', 'Pakistan', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'Spain', 
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 
  'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
].sort();

const VisaFree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { policies, selectedPolicyId, userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  
  // 组件加载时默认选择第一个政策（240小时免签）
  useEffect(() => {
    if (policies.length > 0 && !selectedPolicyId) {
      dispatch(selectPolicy('1'));
    }
  }, [dispatch, policies, selectedPolicyId]);
  
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
        setArticles(allArticles);
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
    if (e.target.value) {
      setShowEligibilityCheck(true);
      dispatch(checkEligibility());
    } else {
      setShowEligibilityCheck(false);
    }
  };
  
  const handleCheckEligibility = () => {
    setShowEligibilityCheck(true);
    dispatch(checkEligibility());
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
        <title>144-Hour Visa-Free Transit China 2025 | Complete Guide for 53+ Countries</title>
        <meta name="description" content="Complete guide to China's 144-hour and 72-hour visa-free transit policy. Check eligibility for 53+ countries, required documents, allowed cities, and travel tips." />
        <meta name="keywords" content="144 hour visa free China, 72 hour visa free China, China transit visa, visa free countries China, Beijing Shanghai visa free, China visa policy 2025" />
        
        {/* Open Graph */}
        <meta property="og:title" content="144-Hour Visa-Free Transit China 2025 | Complete Guide" />
        <meta property="og:description" content="Official guide to China's visa-free transit policy for tourists from 53+ countries. Learn requirements, eligible cities, and travel tips." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://travelchina.space/visa-free" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://travelchina.space/visa-free" />
        
        {/* Structured Data - Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "144-Hour Visa-Free Transit China 2025: Complete Guide",
            "description": "Complete guide to China's visa-free transit policy for tourists",
            "author": {
              "@type": "Organization",
              "name": "Travel China"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Travel China",
              "logo": {
                "@type": "ImageObject",
                "url": "https://travelchina.space/china-icon.svg"
              }
            },
            "datePublished": "2025-01-22",
            "dateModified": "2025-01-22",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://travelchina.space/visa-free"
            },
            "articleSection": "Travel Guide",
            "keywords": ["visa-free China", "144 hour visa", "China transit", "travel guide"]
          })}
        </script>
      </Helmet>
      <div className="visa-free-container visa-free-page">
        <div className="visa-free-content">
          <header className="page-header">
            <h1 className="page-title">{t('visaFree.title')}</h1>
            <p className="text-large">{t('visaFree.subtitle')}</p>
          </header>
        
        <section className="policy-section">
          <h2 className="section-title">Latest Visa-Free Policies</h2>
          <div className="policy-cards">
            {policies.map(policy => (
              <div 
                key={policy.id} 
                className={`policy-card ${selectedPolicyId === policy.id ? 'selected' : ''}`}
                onClick={() => handlePolicySelect(policy.id)}
              >
                <h3 className="card-title">{policy.name}</h3>
                <p className="description">{policy.description}</p>
                <div className="policy-details">
                  <span className="duration">{policy.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="eligibility-section">
          <h2 className="section-title">Check Eligibility</h2>
          <div className="eligibility-form">
            <div className="form-group">
              <label htmlFor="country-select">Select your country:</label>
              <select 
                id="country-select" 
                value={userCountry || ''}
                onChange={handleCountryChange}
              >
                <option value="">-- Select Country --</option>
                {countryList.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="check-button"
              disabled={!selectedPolicyId || !userCountry}
              onClick={handleCheckEligibility}
              style={{ 
                background: (!selectedPolicyId || !userCountry) ? '#cccccc' : '#0077be', 
                color: 'white', 
                cursor: (!selectedPolicyId || !userCountry) ? 'not-allowed' : 'pointer',
                padding: '12px',
                borderRadius: '4px',
                transition: 'background-color 0.3s'
              }}
            >
              Check Eligibility
            </button>
            
            {showEligibilityCheck && userCountry && selectedPolicyId && (
              <div className={`eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
                {isEligible 
                  ? `You are eligible for the ${policies.find(p => p.id === selectedPolicyId)?.name} policy.`
                  : `Sorry, citizens from ${userCountry} are not eligible for the ${policies.find(p => p.id === selectedPolicyId)?.name} policy.`}
              </div>
            )}
          </div>
        </section>
        
        <section className="travel-tips">
          <h2>Travel Tips</h2>
          <ul className="tips-list">
            <li>Prepare required documents in advance</li>
            <li>Research destination city information</li>
            <li>Plan reasonable itinerary duration</li>
            <li>Arrange necessary transportation</li>
          </ul>
        </section>

        {/* Related articles list */}
        <section className="related-articles-section">
          <h2>Related Articles & Travel Information</h2>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="visa-articles-list">
              {articles.map(article => (
                <Link 
                  to={`/articles/${article.id}`} 
                  key={article.id} 
                  className="article-list-item"
                >
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
              <p>No articles found.</p>
            </div>
          )}
        </section>
        </div>
      </div>
    </>
  );
};

export default VisaFree;