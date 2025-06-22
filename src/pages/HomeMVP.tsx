import React, { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';

// 导入图片资源 - 使用压缩后的版本
import beijingImg from '../assets/images/beijing.jpg';
import shanghaiImg from '../assets/images/shanghai.jpg';
import xiAnImg from '../assets/images/xian.jpg';
import backgroundImg from '../assets/images/background.jpg';

import './Home.css';

// 简化的国家列表 - 只包含主要国家
const popularCountries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'South Korea',
  'Australia', 'Canada', 'Singapore', 'Thailand', 'Malaysia', 'Philippines',
  'Indonesia', 'India', 'Russia', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands'
].sort();

const HomeMVP: React.FC = () => {
  const { t } = useTranslation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  
  // 设置背景图片
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-image', `url(${backgroundImg})`);
    return () => document.documentElement.style.removeProperty('--bg-image');
  }, []);
  
  // 默认选择240小时免签政策
  useEffect(() => {
    dispatch(selectPolicy('1'));
  }, [dispatch]);
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setUserCountry(e.target.value));
    if (e.target.value) {
      setShowEligibilityCheck(true);
      dispatch(checkEligibility());
    } else {
      setShowEligibilityCheck(false);
    }
  };
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 精选目的地 - 只显示3个主要城市
  const featuredDestinations = [
    { 
      id: 1, 
      name: t('home.destinations.beijing.name'), 
      image: beijingImg, 
      description: t('home.destinations.beijing.description') 
    },
    { 
      id: 2, 
      name: t('home.destinations.shanghai.name'), 
      image: shanghaiImg, 
      description: t('home.destinations.shanghai.description') 
    },
    { 
      id: 3, 
      name: t('home.destinations.xian.name'), 
      image: xiAnImg, 
      description: t('home.destinations.xian.description') 
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>{t('app.title')} - {t('home.hero.title')}</title>
        <meta name="description" content={`${t('home.hero.subtitle')}. ${t('home.features.visaFree.description')}`} />
        <meta name="keywords" content="China travel, visa-free China, Beijing, Shanghai, tourism China" />
        <link rel="preload" as="image" href={backgroundImg} />
      </Helmet>
      
      <div className="home-container">
        {/* 英雄区域 */}
        <header className="hero-section">
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.subtitle')}</p>
          <div className="scroll-indicator" onClick={scrollToFeatures} aria-label="滚动到功能区域">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </header>
        
        {/* 免签查询区域 */}
        <section className="visa-eligibility-section" ref={featuresRef}>
          <div className="eligibility-container">
            <div className="eligibility-header">
              <h2>🛂 {t('visaFree.eligibility.title')}</h2>
              <p>{t('visaFree.policies.144hour.description')}</p>
            </div>
            
            <div className="eligibility-content">
              <div className="country-selector">
                <h3>{t('visaFree.eligibility.selectCountry')}</h3>
                <select 
                  className="country-dropdown"
                  value={userCountry}
                  onChange={handleCountryChange}
                  aria-label="选择您的国家"
                >
                  <option value="">{t('visaFree.eligibility.countryPlaceholder')}</option>
                  {popularCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              {showEligibilityCheck && (
                <div className="eligibility-result-text">
                  {isEligible ? (
                    <span style={{ color: '#28a745' }}>
                      ✅ {t('visaFree.eligibility.eligible', { policy: '144小时过境免签' })}
                    </span>
                  ) : (
                    <span style={{ color: '#dc3545' }}>
                      ❌ {t('visaFree.eligibility.notEligible', { country: userCountry, policy: '144小时过境免签' })}
                    </span>
                  )}
                </div>
              )}
              
              <div className="more-info">
                <Link to="/visa-free" className="more-info-button">
                  了解更多免签政策 →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* 核心功能区 */}
        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h2>{t('home.features.attractions.title')}</h2>
            <p>{t('home.features.attractions.description')}</p>
            <Link to="/attractions" className="cta-button">
              {t('nav.attractions')}
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🇨🇳</div>
            <h2>{t('home.features.chineseLearning.title')}</h2>
            <p>{t('home.features.chineseLearning.description')}</p>
            <Link to="/chinese-learning" className="cta-button">
              {t('nav.chineseLearning')}
            </Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h2>{t('home.features.community.title')}</h2>
            <p>{t('home.features.community.description')}</p>
            <Link to="/community" className="cta-button">
              {t('nav.community')}
            </Link>
          </div>
        </section>
        
        {/* 精选目的地 */}
        <section className="destinations-section">
          <div className="section-header">
            <h2>🏮 热门目的地</h2>
            <p>探索中国最受欢迎的旅游城市</p>
          </div>
          
          <div className="destinations-grid">
            {featuredDestinations.map((destination) => (
              <div key={destination.id} className="destination-card">
                <img 
                  src={destination.image} 
                  alt={destination.name}
                  className="destination-img"
                  loading="lazy"
                />
                <div className="destination-info">
                  <h3>{destination.name}</h3>
                  <p>{destination.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* 行动号召 */}
        <section className="cta-section">
          <h2>🚀 准备开始您的中国之旅？</h2>
          <p>从免签政策开始了解，规划您的完美行程</p>
          <Link to="/visa-free" className="cta-button cta-button-large">
            查看免签详情
          </Link>
        </section>
      </div>
    </>
  );
};

export default HomeMVP; 