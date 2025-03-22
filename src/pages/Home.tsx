import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import visaIcon from '../assets/icons/visa.svg';
import landmarkIcon from '../assets/icons/landmark.svg';
import languageIcon from '../assets/icons/language.svg';
import communityIcon from '../assets/icons/community.svg';

// 使用项目中的图片资源（从public目录加载，用中文文件名）
const beijingImg = "/images/beijing.jpg";  // 使用您的北京图片
const shanghaiImg = "/images/shanghai.jpg";    // 使用您的上海图片
const xiAnImg = "/images/xian.jpg";        // 使用您的西安图片
const guilinImg = "/images/guilin.jpg";      // 使用您的桂林图片
const chengduImg = "/images/chengdu.jpg";     // 使用您的成都图片
const hongkongImg = "/images/hongkong.jpg";    // 使用您的香港图片

import './Home.css';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const featuresRef = useRef<HTMLDivElement>(null);
  
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

  // 根据当前语言创建见证数据
  const testimonials = [
    {
      id: 1,
      text: i18n.language === 'zh' 
        ? '中国旅游网为我提供了所有需要的信息，从签证到景点推荐，让我的旅行变得轻松愉快。特别感谢提供的中文学习资源，让我能够与当地人交流。'
        : 'The Travel China website provided me with all the information I needed, from visa policies to attraction recommendations, making my trip smooth and enjoyable. Special thanks for the Chinese learning resources that helped me communicate with locals.',
      name: 'Sarah Johnson',
      country: i18n.language === 'zh' ? '美国' : 'USA',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 2,
      text: i18n.language === 'zh'
        ? '作为一个第一次访问中国的游客，这个网站真的帮了我很大忙。免签政策信息非常清晰，我很容易就规划好了我的行程。'
        : 'As a first-time visitor to China, this website was incredibly helpful. The visa-free policy information was very clear, and I was able to plan my itinerary with ease.',
      name: 'Michael Chen',
      country: i18n.language === 'zh' ? '加拿大' : 'Canada',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];
  
  return (
    <>
      <Helmet>
        <title>{t('app.title')} - {t('home.hero.title')}</title>
        <meta name="description" content={`${t('home.hero.subtitle')}. ${t('home.features.visaFree.description')}, ${t('home.features.attractions.description')}, ${t('home.features.chineseLearning.description')}`} />
        <meta name="keywords" content="China travel, visa-free China, Chinese culture, tourism China, travel guide, Beijing, Shanghai, Xi'an, Guilin, Chengdu, Hong Kong" />
      </Helmet>
      
      <div className="home-container">
        <header className="hero-section">
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
        
        <section className="testimonials-section">
          <div className="section-header">
            <h2>{t('home.testimonials.title')}</h2>
            <p>{t('home.testimonials.subtitle')}</p>
          </div>
          
          <div className="testimonials-container">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
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