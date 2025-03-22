import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher'
import './App.css'

function App() {
  const { t } = useTranslation();
  
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
