import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import './TravelGuides.css';

const TravelGuidesList: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="travel-guides-page">
      <Helmet>
        <title>{t('community.guides.title', 'Travel Guides')} - {t('app.title')}</title>
      </Helmet>
      
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">{t('community.guides.title', 'Travel Guides')}</h1>
        </header>
        
        <div className="guides-coming-soon">
          <div className="coming-soon-content">
            <p>{t('community.guides.comingSoon', 'Travel guides are coming soon, stay tuned!')}</p>
            <p>{t('community.guides.description', 'We will provide you with detailed travel guides for China, including itinerary planning, transportation information, accommodation recommendations, and more.')}</p>
            
            <div className="action-buttons">
              <Link to="/community" className="back-button">
                {t('general.backToList')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuidesList;