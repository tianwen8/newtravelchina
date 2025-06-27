import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectPolicy, setUserCountry, checkEligibility } from '../store/slices/visaSlice';
import { articleService, Article } from '../services/articleService';

// 导入图片资源
import beijingImg from '../assets/images/beijing.jpg';
import shanghaiImg from '../assets/images/shanghai.jpg';
import xiAnImg from '../assets/images/xian.jpg';

import './HomeModern.css';

// 热门国家 - 针对海外用户
const popularCountries = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'South Korea',
  'Australia', 'Canada', 'Singapore', 'Thailand', 'Malaysia', 'Philippines',
  'Indonesia', 'India', 'Russia', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Netherlands',
  'Belgium', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland'
].sort();

const HomeModern: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { userCountry, isEligible } = useAppSelector(state => state.visa);
  const [showResult, setShowResult] = useState(false);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    dispatch(selectPolicy('1'));
    loadArticles();
  }, [dispatch]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      // Get latest articles (sorted by publish date)
      const latest = await articleService.getArticlesByCategory('', 1, 3);
      setLatestArticles(latest);
      
      // Get popular articles (sorted by views)
      const popular = await articleService.getFeaturedArticles(3);
      setPopularArticles(popular);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    dispatch(setUserCountry(country));
    if (country) {
      dispatch(checkEligibility());
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Travel China - Visa-Free Travel Guide & Cultural Experiences</title>
        <meta name="description" content="Discover China's beauty with our comprehensive visa-free travel guide. Check eligibility, explore attractions, and plan your perfect trip to China." />
        <meta name="keywords" content="China travel, visa-free, 144 hours, 72 hours, Beijing, Shanghai, travel guide, Chinese culture" />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content="Travel China - Visa-Free Travel Guide" />
        <meta property="og:description" content="Your complete guide to visa-free travel in China. Check eligibility and discover amazing destinations." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/china-preview.jpg" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Travel China - Visa-Free Travel Guide" />
        <meta name="twitter:description" content="Your complete guide to visa-free travel in China" />
        
        {/* Structured data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Travel China",
            "description": "Complete guide to visa-free travel in China",
            "url": "https://travelchina.space",
            "serviceType": "Travel Information"
          })}
        </script>
      </Helmet>
      
      <div className="home-modern">
        {/* Hero Section */}
        <section className="hero-modern">
          <div className="hero-particles"></div>
          <div className="hero-content">
            <div className="hero-text">
              <h1>Discover China's Beauty</h1>
              <p className="hero-subtitle">
                Experience ancient culture meets modern marvels. Check your visa-free eligibility and start planning your journey.
              </p>
            </div>
            
            <div className="visa-checker-card">
              <div className="visa-checker-header">
                <div className="checker-icon">🛂</div>
                <h2>Check Visa-Free Eligibility</h2>
                <p>144-hour transit visa-free policy for 53+ countries</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="country-select">Select your country:</label>
                <div className="select-wrapper">
                  <select
                     id="country-select"
                     value={userCountry || ''}
                     onChange={handleCountryChange}
                     className="country-select"
                   >
                    <option value="">Choose your country...</option>
                    {popularCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">🔽</div>
                </div>
              </div>
              
              {showResult && (
                <div className={`eligibility-result ${isEligible ? 'eligible' : 'not-eligible'}`}>
                  {isEligible ? (
                    <div className="result-content">
                      <span className="result-icon">✅</span>
                      <div>
                        <h3>Great news!</h3>
                        <p>Citizens of {userCountry} are eligible for 144-hour visa-free transit</p>
                      </div>
                    </div>
                  ) : (
                    <div className="result-content">
                      <span className="result-icon">❌</span>
                      <div>
                        <h3>Visa required</h3>
                        <p>Citizens of {userCountry} need a visa to visit China</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Link to="/travel-guides" className="cta-primary">
                Learn More About Visa Policies →
              </Link>
            </div>
          </div>
          
          {/* Hero Background */}
          <div className="hero-background">
            <div className="hero-image"></div>
            <div className="hero-overlay"></div>
          </div>
        </section>

        {/* Key Features */}
        <section className="features-modern">
          <div className="container">
            <div className="section-header">
              <h2>Everything You Need for Your China Trip</h2>
              <p>From visa requirements to cultural insights</p>
            </div>
            
            <div className="features-grid">
              <Link to="/attractions" className="feature-item">
                <div className="feature-icon">🗺️</div>
                <h3>Top Attractions</h3>
                <p>Discover must-visit destinations from the Great Wall to modern Shanghai</p>
                <div className="feature-arrow">Explore →</div>
              </Link>
              
              <Link to="/chinese-learning" className="feature-item">
                <div className="feature-icon">🇨🇳</div>
                <h3>Learn Basic Chinese</h3>
                <p>Essential phrases and cultural tips for your journey</p>
                <div className="feature-arrow">Start Learning →</div>
              </Link>
              
              <Link to="/travel-guides" className="feature-item">
                <div className="feature-icon">📋</div>
                <h3>Travel Guides</h3>
                <p>Complete guides for payments, navigation, and essential travel tips</p>
                <div className="feature-arrow">Read Guides →</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="destinations-modern">
          <div className="container">
            <div className="section-header">
              <h2>Popular Destinations</h2>
              <p>Start your journey with these iconic Chinese cities</p>
            </div>
            
            <div className="destinations-grid">
              <Link to="/attractions?city=beijing" className="destination-card">
                <div className="destination-image">
                  <img src={beijingImg} alt="Beijing - Forbidden City" loading="lazy" />
                  <div className="destination-overlay">
                    <div className="destination-btn">
                      Explore Beijing →
                    </div>
                  </div>
                </div>
                <div className="destination-content">
                  <h3>Beijing</h3>
                  <p>Capital city rich in history and culture. Visit the Forbidden City, Great Wall, and Temple of Heaven.</p>
                  <div className="destination-highlights">
                    <span className="highlight">Great Wall</span>
                    <span className="highlight">Forbidden City</span>
                    <span className="highlight">Peking Duck</span>
                  </div>
                </div>
              </Link>
              
              <Link to="/attractions?city=shanghai" className="destination-card">
                <div className="destination-image">
                  <img src={shanghaiImg} alt="Shanghai - Modern Skyline" loading="lazy" />
                  <div className="destination-overlay">
                    <div className="destination-btn">
                      Explore Shanghai →
                    </div>
                  </div>
                </div>
                <div className="destination-content">
                  <h3>Shanghai</h3>
                  <p>Modern metropolis where East meets West. Experience the Bund, Yu Garden, and world-class shopping.</p>
                  <div className="destination-highlights">
                    <span className="highlight">The Bund</span>
                    <span className="highlight">Yu Garden</span>
                    <span className="highlight">Nightlife</span>
                  </div>
                </div>
              </Link>
              
              <Link to="/attractions?city=xian" className="destination-card">
                <div className="destination-image">
                  <img src={xiAnImg} alt="Xi'an - Terracotta Warriors" loading="lazy" />
                  <div className="destination-overlay">
                    <div className="destination-btn">
                      Explore Xi'an →
                    </div>
                  </div>
                </div>
                <div className="destination-content">
                  <h3>Xi'an</h3>
                  <p>Ancient capital famous for Terracotta Warriors. Explore thousands of years of Chinese history.</p>
                  <div className="destination-highlights">
                    <span className="highlight">Terracotta Army</span>
                    <span className="highlight">City Wall</span>
                    <span className="highlight">Dumplings</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Articles & Recommendations */}
        <section className="articles-modern">
          <div className="container">
            <div className="articles-row">
              {/* Latest Articles */}
              <div className="articles-column">
                <div className="section-header">
                  <h2>🆕 Latest Travel Guides</h2>
                  <p>Fresh insights for your China journey</p>
                </div>
                
                {isLoading ? (
                  <div className="articles-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading latest articles...</p>
                  </div>
                ) : (
                  <div className="articles-list">
                    {latestArticles.map((article) => (
                      <Link to={`/articles/${article.id}`} key={article.id} className="article-card">
                        <div className="article-meta">
                          <span className="article-category">{article.category}</span>
                          <span className="article-date">
                            {new Date(article.publishDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                        <div className="article-stats">
                          <span>👁️ {article.viewCount} views</span>
                          <span>⏱️ {(article as any).readTime || 5} min read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link to="/travel-guides" className="view-all-link">
                  View All Travel Guides →
                </Link>
              </div>
              
              {/* Popular Articles */}
              <div className="articles-column">
                <div className="section-header">
                  <h2>🔥 Most Popular</h2>
                  <p>What other travelers are reading</p>
                </div>
                
                {isLoading ? (
                  <div className="articles-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading popular articles...</p>
                  </div>
                ) : (
                  <div className="articles-list">
                    {popularArticles.map((article, index) => (
                      <Link to={`/articles/${article.id}`} key={article.id} className="article-card popular">
                        <div className="popularity-rank">#{index + 1}</div>
                        <div className="article-meta">
                          <span className="article-category">{article.category}</span>
                          <span className="article-views">👁️ {article.viewCount}</span>
                        </div>
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                        <div className="article-engagement">
                          <span>❤️ {(article as any).likes || 0} likes</span>
                          <span>⏱️ {(article as any).readTime || 5} min</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                <Link to="/attractions" className="view-all-link">
                  Explore All Destinations →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Essential Guides Section */}
        <section className="guides-modern">
          <div className="container">
            <div className="section-header">
              <h2>Essential Travel Guides</h2>
              <p>Everything you need to know before you go</p>
            </div>
            
            <div className="guides-grid">
              <Link to="/guides/alipay-wechat-pay-tourists" className="guide-card featured">
                <div className="guide-icon">💳</div>
                <h3>Payment Guide</h3>
                <p>How to use Alipay and WeChat Pay as a foreign tourist</p>
                <span className="guide-tag">Most Popular</span>
                <div className="guide-arrow">→</div>
              </Link>
              
              <Link to="/guides/transportation-china" className="guide-card">
                <div className="guide-icon">🚄</div>
                <h3>Transportation</h3>
                <p>Navigate China's high-speed rail and metro systems</p>
                <div className="guide-arrow">→</div>
              </Link>
              
              <Link to="/guides/essential-apps-china" className="guide-card">
                <div className="guide-icon">📱</div>
                <h3>Essential Apps</h3>
                <p>Must-have mobile apps for traveling in China</p>
                <div className="guide-arrow">→</div>
              </Link>
              
              <Link to="/guides/vpn-internet-china" className="guide-card">
                <div className="guide-icon">🌐</div>
                <h3>Internet Access</h3>
                <p>VPN recommendations and internet connectivity tips</p>
                <div className="guide-arrow">→</div>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-modern">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Explore China?</h2>
              <p>Start with our comprehensive visa-free travel guide and make the most of your journey.</p>
              <div className="cta-buttons">
                <Link to="/travel-guides" className="btn-primary">
                  Check Visa Requirements
                </Link>
                <Link to="/attractions" className="btn-secondary">
                  Browse Destinations
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeModern; 