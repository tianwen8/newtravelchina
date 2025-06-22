import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './ComingSoon.css';

const ComingSoon: React.FC = () => {
  const { guide } = useParams<{ guide: string }>();
  
  const getGuideTitle = (guideId: string = '') => {
    const guides: { [key: string]: string } = {
      'alipay-wechat-pay-tourists': 'Complete Alipay & WeChat Pay Guide for Tourists',
      'transportation-china': 'China Transportation Guide',
      'essential-apps-china': 'Essential Apps for China Travel',
      'vpn-internet-china': 'VPN & Internet Access Guide'
    };
    return guides[guideId] || 'Travel Guide';
  };

  const getGuideDescription = (guideId: string = '') => {
    const descriptions: { [key: string]: string } = {
      'alipay-wechat-pay-tourists': 'Step-by-step guide to setting up and using Alipay and WeChat Pay as a foreign tourist, including Tour Pass features and fee information.',
      'transportation-china': 'Complete guide to navigating China\'s high-speed rail, metro systems, and other transportation options.',
      'essential-apps-china': 'Must-have mobile apps for traveling in China, from maps to translation tools.',
      'vpn-internet-china': 'Recommendations for reliable VPN services and internet connectivity tips for visitors to China.'
    };
    return descriptions[guideId] || 'Essential travel information for your China trip.';
  };

  return (
    <>
      <Helmet>
        <title>{getGuideTitle(guide)} - Coming Soon | Travel China</title>
        <meta name="description" content={`${getGuideDescription(guide)} This comprehensive guide is coming soon.`} />
        <meta name="keywords" content="China travel guide, coming soon, travel tips, China tourism" />
      </Helmet>
      
      <div className="coming-soon">
        <div className="coming-soon-container">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">🚧</div>
            <h1>{getGuideTitle(guide)}</h1>
            <p className="coming-soon-subtitle">Coming Soon</p>
            <p className="coming-soon-description">
              {getGuideDescription(guide)}
            </p>
            <p className="coming-soon-note">
              We're working hard to bring you the most comprehensive and up-to-date travel guide. 
              This section will be available soon with detailed information, screenshots, and step-by-step instructions.
            </p>
            
            <div className="coming-soon-features">
              <h3>What to Expect:</h3>
              <ul>
                <li>✅ Detailed step-by-step instructions</li>
                <li>✅ Latest 2025 screenshots</li>
                <li>✅ Video tutorials</li>
                <li>✅ Frequently asked questions</li>
                <li>✅ Real user experiences</li>
              </ul>
            </div>
            
            <div className="coming-soon-actions">
              <Link to="/" className="btn-primary">
                ← Back to Home
              </Link>
              <Link to="/community" className="btn-secondary">
                Join Community for Updates
              </Link>
            </div>
            
            <div className="coming-soon-subscribe">
              <p>Want to be notified when this guide is ready?</p>
              <div className="subscribe-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="subscribe-input"
                />
                <button className="subscribe-btn">Notify Me</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoon; 