import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import './TravelGuides.css';

const TravelGuideDetail: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const { t } = useTranslation();

  return (
    <div className="travel-guide-detail-page">
      <Helmet>
        <title>{t('community.guides.detail.title', '旅行指南详情')} - {t('app.title')}</title>
      </Helmet>
      
      <div className="container">
        <div className="guide-not-available">
          <h1>{t('community.guides.detail.notAvailable', '指南未找到')}</h1>
          <p>{t('community.guides.detail.message', '您请求的旅行指南（ID: {{id}}）目前不可用。', { id: guideId })}</p>
          <p>{t('community.guides.comingSoon', '旅行指南功能即将推出，敬请期待！')}</p>
          
          <div className="action-buttons">
            <Link to="/community/guides" className="back-button">
              {t('general.backToList')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuideDetail; 