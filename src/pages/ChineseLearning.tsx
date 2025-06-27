import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite, addRecentlyViewed } from '../store/slices/languageSlice';
import './ChineseLearning.css';
import { useTranslation } from 'react-i18next';

const ChineseLearning: React.FC = () => {
  const dispatch = useAppDispatch();
  const { phrases, favoriteIds } = useAppSelector(state => state.language);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { t } = useTranslation();
  
  const filteredPhrases = selectedCategory === 'all' 
    ? phrases 
    : phrases.filter(phrase => phrase.category === selectedCategory);
  
  const handlePhraseClick = (id: string) => {
    dispatch(addRecentlyViewed(id));
  };
  
  const handleToggleFavorite = (id: string) => {
    dispatch(toggleFavorite(id));
  };
  
  const categories = ['all', ...new Set(phrases.map(phrase => phrase.category))];
  
  return (
    <>
      <Helmet>
        <title>{t('chineseLearning.title')} - {t('app.title')}</title>
        <meta name="description" content={t('chineseLearning.description')} />
        <meta name="keywords" content="Learn Chinese, Chinese language, Mandarin, Chinese phrases, Chinese culture, travel Chinese" />
      </Helmet>
      <div className="chinese-learning-container chinese-learning-page">
        <div className="chinese-learning-content">
          <header className="page-header">
            <h1 className="page-title">{t('chineseLearning.title', 'Learn Chinese')}</h1>
            <p className="text-large">{t('chineseLearning.subtitle', 'Practice Chinese conversation with AI assistance')}</p>
          </header>
        
        <section className="learning-categories">
          <h2 className="section-title">Select Category</h2>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? t('chineseLearning.categories.all') : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </section>
        
        <section className="phrases-section">
          <h2>{t('chineseLearning.phrases.title')}</h2>
          <div className="phrases-list">
            {filteredPhrases.map(phrase => (
              <div 
                key={phrase.id} 
                className="phrase-item"
                onClick={() => handlePhraseClick(phrase.id)}
              >
                <div className="phrase-chinese">{phrase.chinese}</div>
                <div className="phrase-pinyin">{phrase.pinyin}</div>
                <div className="phrase-english">{phrase.english}</div>
                <div className="phrase-category">{phrase.category}</div>
                  <button 
                    className={`favorite-button ${favoriteIds.includes(phrase.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(phrase.id);
                    }}
                  >
                    ❤
                  </button>
              </div>
            ))}
          </div>
        </section>
        
        <section className="ai-practice-section">
          <h2>{t('chineseLearning.aiPractice.title')}</h2>
          <p>{t('chineseLearning.aiPractice.comingSoon')}</p>
          <button className="start-practice-btn" disabled>{t('chineseLearning.aiPractice.startButton')}</button>
        </section>
        </div>
      </div>
    </>
  );
};

export default ChineseLearning;