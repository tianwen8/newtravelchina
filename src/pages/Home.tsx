import React, { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FeaturedComments from '../components/FeaturedComments';
import CategoryArticles from '../components/CategoryArticles';
import CommentWaterfall from '../components/CommentWaterfall';
import FloatingComments from '../components/FloatingComments';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';

import visaIcon from '../assets/icons/visa.svg';
import landmarkIcon from '../assets/icons/landmark.svg';
import languageIcon from '../assets/icons/language.svg';
import communityIcon from '../assets/icons/community.svg';

// 导入图片资源
import beijingImg from '../assets/images/beijing.jpg';
import shanghaiImg from '../assets/images/shanghai.jpg';
import xiAnImg from '../assets/images/xian.jpg';
import guilinImg from '../assets/images/guilin.jpg';
import chengduImg from '../assets/images/chengdu.jpg';
import hongkongImg from '../assets/images/hongkong.jpg';
import backgroundImg from '../assets/images/background.jpg';

import './Home.css';

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

const Home: React.FC = () => {
  const { t } = useTranslation();
  const featuresRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { policies, selectedPolicyId, userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  // 添加状态来存储屏幕宽度是否为移动设备
  const [isMobile, setIsMobile] = useState(false);
  
  // 设置背景图片
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-image', `url(${backgroundImg})`);
    
    // 清理函数
    return () => {
      document.documentElement.style.removeProperty('--bg-image');
    };
  }, []);
  
  // 检测屏幕大小并设置状态
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始检查
    checkScreenSize();
    
    // 监听屏幕大小变化
    window.addEventListener('resize', checkScreenSize);
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // 组件加载时默认选择第一个政策（240小时免签）
  useEffect(() => {
    if (policies.length > 0 && !selectedPolicyId) {
      dispatch(selectPolicy('1'));
    }
  }, [dispatch, policies, selectedPolicyId]);
  
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
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 根据当前语言创建目的地数据
  const destinationsData = [
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
    },
    { 
      id: 4, 
      name: t('home.destinations.guilin.name'), 
      image: guilinImg, 
      description: t('home.destinations.guilin.description') 
    },
    { 
      id: 5, 
      name: t('home.destinations.chengdu.name'), 
      image: chengduImg, 
      description: t('home.destinations.chengdu.description') 
    },
    { 
      id: 6, 
      name: t('home.destinations.hongkong.name'), 
      image: hongkongImg, 
      description: t('home.destinations.hongkong.description') 
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>{t('app.title')} - {t('home.hero.title')}</title>
        <meta name="description" content={`${t('home.hero.subtitle')}. ${t('home.features.visaFree.description')}, ${t('home.features.attractions.description')}, ${t('home.features.chineseLearning.description')}`} />
        <meta name="keywords" content="China travel, visa-free China, Chinese culture, tourism China, travel guide, Beijing, Shanghai, Xi'an, Guilin, Chengdu, Hong Kong" />
      </Helmet>
      
      <FloatingComments />
      
      <div className="home-container">
        <header className="hero-section">
          <CommentWaterfall 
            limit={isMobile ? 5 : 10} 
            autoRefresh={true} 
            refreshInterval={30000} 
          />
          
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.subtitle')}</p>
          <div className="scroll-indicator" onClick={scrollToFeatures}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>
        </header>
        
        <section className="features-section" ref={featuresRef}>
          <div className="feature-card">
            <img src={visaIcon} alt="Visa-free travel icon" className="feature-icon" />
            <h2>{t('home.features.visaFree.title')}</h2>
            <p>{t('home.features.visaFree.description')}</p>
            <Link to="/visa-free" className="cta-button" style={{marginTop: 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem'}}>
              {t('nav.visaFree')}
            </Link>
          </div>
          
          <div className="feature-card">
            <img src={landmarkIcon} alt="Cultural landmarks icon" className="feature-icon" />
            <h2>{t('home.features.attractions.title')}</h2>
            <p>{t('home.features.attractions.description')}</p>
            <Link to="/attractions" className="cta-button" style={{marginTop: 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem'}}>
              {t('nav.attractions')}
            </Link>
          </div>
          
          <div className="feature-card">
            <img src={languageIcon} alt="Chinese language learning icon" className="feature-icon" />
            <h2>{t('home.features.chineseLearning.title')}</h2>
            <p>{t('home.features.chineseLearning.description')}</p>
            <Link to="/chinese-learning" className="cta-button" style={{marginTop: 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem'}}>
              {t('nav.chineseLearning')}
            </Link>
          </div>
          
          <div className="feature-card">
            <img src={communityIcon} alt="Travel community icon" className="feature-icon" />
            <h2>{t('home.features.community.title')}</h2>
            <p>{t('home.features.community.description')}</p>
            <Link to="/community" className="cta-button" style={{marginTop: 'auto', padding: '0.75rem 1.5rem', fontSize: '1rem'}}>
              {t('nav.community')}
            </Link>
          </div>
        </section>
        
        {/* 添加免签资格检查部分 */}
        <section className="visa-eligibility-section">
          <div className="eligibility-container">
            <div className="eligibility-header">
              <h2>Check Visa-Free Eligibility</h2>
              <p>Find out if you're eligible for China's 240-hour or 72-hour visa-free transit policy</p>
            </div>
            
            <div className="eligibility-content">
              <div className="policy-selector">
                <h3>Select Policy</h3>
                <div className="policy-buttons">
                  {policies.map(policy => (
                    <button
                      key={policy.id}
                      className={`policy-button ${selectedPolicyId === policy.id ? 'selected' : ''}`}
                      onClick={() => handlePolicySelect(policy.id)}
                    >
                      {policy.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="country-selector">
                <h3>Select Your Country</h3>
                <select 
                  id="country-select" 
                  value={userCountry || ''}
                  onChange={handleCountryChange}
                  className="country-dropdown"
                >
                  <option value="">-- Select Country --</option>
                  {countryList.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              {showEligibilityCheck && userCountry && selectedPolicyId && (
                <div className="eligibility-result-text">
                  {isEligible 
                    ? `You are eligible for the ${policies.find(p => p.id === selectedPolicyId)?.name} policy.`
                    : `Sorry, citizens from ${userCountry} are not eligible for the ${policies.find(p => p.id === selectedPolicyId)?.name} policy.`}
                </div>
              )}
              
              <div className="more-info">
                <Link to="/visa-free" className="more-info-button">
                  More Information About Visa-Free Policies
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* 添加分类文章展示 */}
        <section className="category-articles-section">
          <CategoryArticles 
            category="visa-free" 
            limit={5} 
            autoRefresh={false} 
            highlightNew={true}
            listMode={true} 
          />
          <CategoryArticles 
            category="attractions" 
            limit={5} 
            autoRefresh={false} 
            highlightNew={true}
            listMode={true} 
          />
        </section>
        
        <section className="destinations-section">
          <div className="section-header">
            <h2>{t('home.destinations.title')}</h2>
            <p>{t('home.destinations.subtitle')}</p>
          </div>
          
          <div className="destinations-grid">
            {destinationsData.map(destination => (
              <div key={destination.id} className="destination-card">
                <img 
                  src={destination.image} 
                  alt={destination.name} 
                  className="destination-img" 
                />
                <div className="destination-info">
                  <h3>{destination.name}</h3>
                  <p>{destination.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <FeaturedComments />
        
        <section className="cta-section">
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.subtitle')}</p>
          <Link to="/visa-free" className="cta-button">
            {t('home.cta.button')}
          </Link>
        </section>
      </div>
    </>
  );
};

export default Home;