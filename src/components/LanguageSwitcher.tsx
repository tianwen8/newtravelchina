import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // English is the only language now
  const changeLanguage = () => {
    i18n.changeLanguage('en');
    localStorage.setItem('language', 'en');
    setIsOpen(false);
  };
  
  return (
    <div className="language-switcher">
      <button 
        className="language-button" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <span className="us-flag">🇺🇸</span> EN
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <button 
            className="language-option active"
            onClick={changeLanguage}
          >
            <span className="us-flag">🇺🇸</span> English
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 