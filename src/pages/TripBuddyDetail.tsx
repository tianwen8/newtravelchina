import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import './TripBuddies.css';

const TripBuddyDetail: React.FC = () => {
  const { buddyId } = useParams<{ buddyId: string }>();
  const { t } = useTranslation();

  return (
    <div className="trip-buddy-detail-page">
      <Helmet>
        <title>{t('tripBuddies.detail.title', '旅行伙伴详情')} - {t('app.title')}</title>
      </Helmet>
      
      <div className="container">
        <div className="detail-not-available">
          <div className="detail-not-found">
            <h1>{t('tripBuddies.detail.notAvailable', '信息不可用')}</h1>
            <p>{t('tripBuddies.detail.message', '您请求的旅行伙伴信息（ID: {{id}}）目前不可用。', { id: buddyId })}</p>
            <p>{t('tripBuddies.comingSoon.title', '此功能即将推出，敬请期待！')}</p>
            
            <div className="action-buttons">
              <Link to="/community/trip-buddies" className="secondary-button">
                {t('general.backToList')}
              </Link>
              <Link to="/community" className="primary-button">
                {t('tripBuddies.backToCommunity', '返回社区')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBuddyDetail; 