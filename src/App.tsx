import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import LanguageSwitcher from './components/LanguageSwitcher'
import { pageview } from './services/analytics'
import './App.css'

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  
  // 当路由变化时，跟踪页面访问
  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);
  
  return (
    <div className="app-container">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">{t('app.title')}</Link>
        <div className="nav-links">
          <Link to="/visa-free">{t('nav.visaFree')}</Link>
          <Link to="/attractions">{t('nav.attractions')}</Link>
          <Link to="/chinese-learning">{t('nav.chineseLearning')}</Link>
          <Link to="/community">{t('nav.community')}</Link>
          <LanguageSwitcher />
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
