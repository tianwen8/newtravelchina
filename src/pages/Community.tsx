import React from 'react';
import { Helmet } from 'react-helmet';
import './Community.css';

const Community: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Travel China Community - Share Your Travel Stories</title>
        <meta name="description" content="Join our travel community to share your China travel experiences, tips, and stories. Get insights on transportation, food, accommodation, and safety from fellow travelers." />
        <meta name="keywords" content="China travel community, travel tips China, China travel experiences, China travel stories, China travel guide" />
      </Helmet>
      <div className="community-container">
        <header className="page-header">
          <h1>Community</h1>
          <p>Share your travel stories and experiences</p>
        </header>
        
        <section className="share-section">
          <div className="share-card">
            <h2>Share Your Story</h2>
            <p>Coming soon: Post your travel diary, photos, and recommendations</p>
          </div>
        </section>
        
        <section className="experience-section">
          <h2>Travel Experience</h2>
          <div className="experience-list">
            <div className="experience-card">
              <h3>Transportation</h3>
              <p>Share transportation tips for different cities</p>
            </div>
            
            <div className="experience-card">
              <h3>Food Recommendations</h3>
              <p>Recommend local specialties and restaurants</p>
            </div>
            
            <div className="experience-card">
              <h3>Accommodation Tips</h3>
              <p>Share experiences with hotels and homestays</p>
            </div>
          </div>
        </section>
        
        <section className="tips-section">
          <h2>Useful Tips</h2>
          <div className="tips-list">
            <div className="tip-item">
              <h3>Pre-trip Preparation</h3>
              <p>Important matters like passport, visa, and insurance</p>
            </div>
            
            <div className="tip-item">
              <h3>Safety Tips</h3>
              <p>Travel safety precautions and emergency contacts</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Community;