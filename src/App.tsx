import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import LanguageSwitcher from './components/LanguageSwitcher'
import { pageview } from './services/analytics'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // 当路由变化时，跟踪页面访问
  useEffect(() => {
    pageview(location.pathname + location.search);
    setUserMenuOpen(false);
  }, [location]);
  
  // 处理登出
  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('登出失败', error);
    }
  };
  
  return (
    <div className="app-container">
      <nav className="main-nav">
        <Link to="/" className="nav-logo">{t('app.title')}</Link>
        
        <div className="nav-links">
          <Link to="/articles?category=visa-free">{t('nav.visaFree')}</Link>
          <Link to="/attractions">{t('nav.attractions')}</Link>
          <Link to="/chinese-learning">{t('nav.chineseLearning')}</Link>
          <Link to="/community">{t('nav.community')}</Link>
          <LanguageSwitcher />
        </div>
        
        {/* 用户认证相关链接 - 单独放置以确保可见性 */}
        <div className="auth-links">
          {currentUser ? (
            <>
              <Link to="/profile" className="profile-link">
                {currentUser.displayName || '个人资料'}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="admin-link">
                  {t('nav.adminDashboard')}
                </Link>
              )}
              <button onClick={handleLogout} className="logout-button">
                {t('auth.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">{t('auth.login')}</Link>
              <Link to="/register">{t('auth.register')}</Link>
            </>
          )}
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
