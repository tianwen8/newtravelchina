import React from 'react';
import { Helmet } from 'react-helmet';

const Attractions: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>China's Top Attractions & Cultural Heritage Sites</title>
        <meta name="description" content="Explore China's most famous attractions including the Great Wall, Forbidden City, Terracotta Warriors, and Giant Panda Base. Discover cultural heritage and natural wonders." />
        <meta name="keywords" content="China attractions, Chinese culture, Great Wall, Forbidden City, Terracotta Warriors, Chinese heritage sites" />
      </Helmet>
    <div className="attractions-container">
      <header className="page-header">
        <h1>Attractions & Culture</h1>
        <p>Explore China's cultural heritage and natural wonders</p>
      </header>
      
      <section className="regions-section">
        <div className="region-card">
          <h2>Beijing</h2>
          <p>Forbidden City, Great Wall, Temple of Heaven and other World Heritage sites</p>
          <div className="culture-info">
            <h3>Cultural Features</h3>
            <p>Peking Opera, Siheyuan (Courtyard Houses), Hutong Culture</p>
          </div>
        </div>
        
        <div className="region-card">
          <h2>Xi'an</h2>
          <p>Terracotta Warriors, Ancient City Wall, Giant Wild Goose Pagoda</p>
          <div className="culture-info">
            <h3>Cultural Features</h3>
            <p>Shaanxi Noodles, Shadow Puppetry, Ancient Capital Culture</p>
          </div>
        </div>
        
        <div className="region-card">
          <h2>Chengdu</h2>
          <p>Giant Panda Base, Jinli Ancient Street, Dujiangyan Irrigation System</p>
          <div className="culture-info">
            <h3>Cultural Features</h3>
            <p>Sichuan Opera Face-changing, Sichuan Cuisine, Teahouse Culture</p>
          </div>
        </div>
      </section>
      
      <section className="seasonal-info">
        <h2>Best Travel Seasons</h2>
        <div className="season-tips">
          <p>Spring: March-May, pleasant weather, perfect for flower viewing and outdoor activities</p>
          <p>Autumn: September-November, clear skies and comfortable temperatures, the golden season for tourism</p>
        </div>
      </section>
    </div>
    </>
  );
};

export default Attractions;