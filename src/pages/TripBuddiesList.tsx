import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import './TripBuddies.css';

const TripBuddiesList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="trip-buddies-page">
      <Helmet>
        <title>{t('tripBuddies.title', '寻找旅行伙伴')} - {t('app.title')}</title>
      </Helmet>
      
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">{t('tripBuddies.title', '寻找旅行伙伴')}</h1>
          <p className="page-subtitle">{t('tripBuddies.subtitle', '找到志同道合的旅伴，共同探索中国')}</p>
        </header>
        
        <div className="feature-coming-soon">
          <div className="coming-soon-content">
            <h2>{t('tripBuddies.comingSoon.title', '功能即将推出')}</h2>
            <p>{t('tripBuddies.comingSoon.message', '我们正在努力开发此功能，很快您就可以：')}</p>
            
            <ul className="feature-list">
              <li>{t('tripBuddies.features.find', '寻找前往同一目的地的旅行伙伴')}</li>
              <li>{t('tripBuddies.features.share', '分享行程计划和旅行预算')}</li>
              <li>{t('tripBuddies.features.connect', '与其他旅行者建立联系')}</li>
              <li>{t('tripBuddies.features.create', '创建自己的旅行伙伴招募帖')}</li>
            </ul>
            
            <div className="action-buttons">
              <Link to="/community" className="primary-button">
                {t('tripBuddies.backToCommunity', '返回社区')}
              </Link>
            </div>
          </div>
          
          <div className="coming-soon-image">
            <img 
              src="/images/travel-buddies.jpg" 
              alt={t('tripBuddies.title', '寻找旅行伙伴')}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBuddiesList; 