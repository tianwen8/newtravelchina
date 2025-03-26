import React, { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FeaturedComments from '../components/FeaturedComments';
import CategoryArticles from '../components/CategoryArticles';
import CommentWaterfall from '../components/CommentWaterfall';
import FloatingComments from '../components/FloatingComments';

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

const Home: React.FC = () => {
  const { t } = useTranslation();
  const featuresRef = useRef<HTMLDivElement>(null);
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
        
        {/* 添加分类文章展示 */}
        <section className="category-articles-section">
          <CategoryArticles 
            category="visa-free" 
            limit={5} 
            autoRefresh={true} 
            highlightNew={true} 
          />
          <CategoryArticles 
            category="attractions" 
            limit={5} 
            autoRefresh={true} 
            highlightNew={true} 
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