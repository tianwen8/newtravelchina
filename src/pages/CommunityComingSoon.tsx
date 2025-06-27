import React from 'react';
import { Link } from 'react-router-dom';
import './ComingSoon.css';
import './CommunityComingSoon.css';

const CommunityComingSoon: React.FC = () => {
  return (
    <div className="coming-soon">
      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">🌟</div>
        <h1>Community Coming Soon</h1>
        <p className="coming-soon-description">
          We're developing an exciting traveler community platform where you can:
        </p>
        
        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">💬</span>
            <span>Share travel experiences and stories</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📸</span>
            <span>Upload beautiful travel photos</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤝</span>
            <span>Meet like-minded travel companions</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <span>Get practical travel advice</span>
          </div>
        </div>
        
        <p className="timeline">
          <strong>Coming Soon</strong> - For suggestions, please email us
        </p>
        
        <div className="cta-section">
          <p>Explore our amazing content now:</p>
          <div className="coming-soon-actions">
            <Link to="/travel-guides" className="btn-primary">
              Travel Guides
            </Link>
            <Link to="/attractions" className="btn-secondary">
              Attractions & Culture
            </Link>
            <Link to="/chinese-learning" className="btn-secondary">
              Learn Chinese
            </Link>
          </div>
        </div>
        
        <div className="back-home">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityComingSoon; 