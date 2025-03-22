import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import zhTranslations from './locales/zh.json';

// 资源
const resources = {
  en: enTranslations,
  zh: zhTranslations
};

// 浏览器语言检测
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'zh' ? 'zh' : 'en'; // 支持中文或默认英文
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // 不转义 React 中的值
    }
  });

export default i18n; 