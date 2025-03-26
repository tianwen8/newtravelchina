import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
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
  const { t } = useTranslation();
  
  // 获取免签政策相关文章
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const visaFreeArticles = await articleService.getArticlesByCategory('visa-free', 1, 5);
        const travelTipsArticles = await articleService.getArticlesByCategory('travel-tips', 1, 3);
        
        // 合并文章并按日期排序（最新的在前）
        const combinedArticles = [...visaFreeArticles, ...travelTipsArticles];
        combinedArticles.sort((a, b) => {
          const dateA = new Date(a.publishDate).getTime();
          const dateB = new Date(b.publishDate).getTime();
          return dateB - dateA;
        });
        
        setArticles(combinedArticles);
      } catch (error) {
        console.error('获取文章失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
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
  
  // 常用国家列表
  const commonCountries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 
    'France', 'Germany', 'Japan', 'South Korea'
  ];
  
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

        {/* 相关文章列表 */}
        <section className="related-articles-section">
          <h2>{t('visaFree.relatedArticles')}</h2>
          
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>{t('general.loading')}</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="visa-articles-list">
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