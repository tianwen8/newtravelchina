import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = i18n.language || 'en';
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };
  
  return (
    <div className="language-switcher">
      <button 
        className="language-button" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        {currentLanguage === 'en' ? '🇺🇸 EN' : '🇨🇳 中文'}
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <button 
            className={`language-option ${currentLanguage === 'en' ? 'active' : ''}`}
            onClick={() => changeLanguage('en')}
          >
            🇺🇸 English
          </button>
          <button 
            className={`language-option ${currentLanguage === 'zh' ? 'active' : ''}`}
            onClick={() => changeLanguage('zh')}
          >
            🇨🇳 中文
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 