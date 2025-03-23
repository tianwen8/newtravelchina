// Google Analytics 集成服务
// 注意：使用前需替换为你实际的 Google Analytics ID
const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // 替换为您的Google Analytics 4测量ID

// 定义全局Google Analytics对象
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * 初始化Google Analytics
 */
export const initGA = (): void => {
  if (typeof window !== 'undefined') {
    // 避免多次加载
    if (!window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
      });

      // 加载GA脚本
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      document.head.appendChild(script);
    }
  }
};

/**
 * 跟踪页面访问
 * @param url 页面URL
 */
export const pageview = (url: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * 跟踪事件
 * @param action 事件动作
 * @param category 事件类别
 * @param label 事件标签
 * @param value 事件值
 */
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}; 