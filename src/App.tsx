import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import LanguageSwitcher from './components/LanguageSwitcher'
import { pageview } from './services/analytics'
// import { useAuth } from './contexts/AuthContext' // 暂时禁用登录功能
import './App.css'

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  // const { currentUser, logout, isAdmin } = useAuth(); // 暂时禁用
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const currentUser = null; // 临时设置
  
  // 当路由变化时，跟踪页面访问
  useEffect(() => {
    pageview(location.pathname + location.search);
    setUserMenuOpen(false);
  }, [location]);
  
  // 处理登出 - 暂时禁用
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     setUserMenuOpen(false);
  //   } catch (error) {
  //     console.error('登出失败', error);
  //   }
  // };
  
  return (
    <div className="app-container">
      <Helmet>
        <html lang="en" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Travel China",
            "url": "https://www.travelchina.space",
            "logo": "https://www.travelchina.space/china-icon.svg"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.travelchina.space",
            "name": "Travel China"
          })}
        </script>
      </Helmet>
      <nav className="main-nav">
        <Link to="/" className="nav-logo">{t('app.title')}</Link>
        
        <div className="nav-links">
          <Link to="/travel-guides">{t('nav.travelGuides')}</Link>
          <Link to="/attractions">{t('nav.attractions')}</Link>
          <Link to="/chinese-learning">{t('nav.chineseLearning')}</Link>
          <Link to="/community">{t('nav.community')}</Link>
          <LanguageSwitcher />
        </div>
        
        {/* 用户认证相关链接 - 暂时禁用 */}
        <div className="auth-links">
          {/* 登录功能和社区功能暂时禁用，专注于内容展示 */}
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="main-footer">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  )
}

export default App
