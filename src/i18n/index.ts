import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';

// Resources
const resources = {
  en: enTranslations
};

// Commented unused function
// const getBrowserLanguage = () => {
//   const browserLang = navigator.language.split('-')[0];
//   return browserLang === 'zh' ? 'zh' : 'en'; // Support Chinese or default to English
// };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Use English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // Don't escape values in React
    }
  });

export default i18n; 