import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite, addRecentlyViewed } from '../store/slices/languageSlice';
import './ChineseLearning.css';

const ChineseLearning: React.FC = () => {
  const dispatch = useAppDispatch();
  const { phrases, favoriteIds } = useAppSelector(state => state.language);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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
        <title>Learn Chinese - Essential Phrases for China Travel</title>
        <meta name="description" content="Learn essential Chinese phrases for your trip to China. Practice basic conversations, restaurant ordering, and asking for directions with our AI-assisted learning tools." />
        <meta name="keywords" content="learn Chinese, Chinese phrases, travel Chinese, basic Mandarin, Chinese conversation" />
      </Helmet>
      <div className="chinese-learning-container">
        <header className="page-header">
          <h1>学习中文</h1>
          <p>Practice Chinese conversation with AI assistance</p>
        </header>
        
        <section className="category-filter">
          <h2>选择类别</h2>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </section>
        
        <section className="phrases-section">
          <h2>常用短语</h2>
          <div className="phrases-list">
            {filteredPhrases.map(phrase => (
              <div 
                key={phrase.id} 
                className="phrase-card"
                onClick={() => handlePhraseClick(phrase.id)}
              >
                <div className="phrase-header">
                  <h3>{phrase.chinese}</h3>
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
                <p className="pinyin">{phrase.pinyin}</p>
                <p className="english">{phrase.english}</p>
                <div className="phrase-category">{phrase.category}</div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="ai-practice">
          <h2>AI 会话练习</h2>
          <p>Coming soon: Practice real-time Chinese conversation with AI assistant</p>
          <button className="coming-soon-button" disabled>开始会话</button>
        </section>
      </div>
    </>
  );
};

export default ChineseLearning;