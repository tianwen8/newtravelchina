import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';

// 资源
const resources = {
  en: enTranslations
};

// 注释掉未使用的函数
// const getBrowserLanguage = () => {
//   const browserLang = navigator.language.split('-')[0];
//   return browserLang === 'zh' ? 'zh' : 'en'; // 支持中文或默认英文
// };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // 使用英文
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // 不转义 React 中的值
    }
  });

export default i18n; 