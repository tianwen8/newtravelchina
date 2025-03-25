import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, loginWithFacebook, loginWithApple, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFirebaseHelp, setShowFirebaseHelp] = useState(false);
  
  // 当authError变化时，更新本地错误状态
  useEffect(() => {
    if (authError) {
      setError(authError);
      // 如果是Firebase配置错误，显示帮助信息
      if (authError.includes('configuration-not-found') || authError.includes('auth/')) {
        setShowFirebaseHelp(true);
      }
    }
  }, [authError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t('auth.errors.allFieldsRequired'));
      return;
    }
    
    try {
      setError('');
      setShowFirebaseHelp(false);
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      // 错误信息已在useEffect中处理
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (socialLoginFunc: () => Promise<void>, provider: string) => {
    try {
      setError('');
      setShowFirebaseHelp(false);
      setLoading(true);
      await socialLoginFunc();
      navigate('/');
    } catch (err) {
      console.error(`${provider} login error:`, err);
      // 错误信息已在useEffect中处理
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('auth.login')}</h2>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            {showFirebaseHelp && (
              <div className="firebase-help">
                <p>Firebase配置错误。请检查以下几点:</p>
                <ol>
                  <li>Firebase项目是否正确配置</li>
                  <li>是否启用了Email/Password认证方式</li>
                  <li>网络连接是否正常</li>
                </ol>
                <p>如果您是普通用户，请联系网站管理员。</p>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? t('general.loading') : t('auth.login')}
          </button>
        </form>
        
        <div className="social-login">
          <p className="divider"><span>{t('auth.orContinueWith')}</span></p>
          
          <div className="social-buttons">
            <button 
              onClick={() => handleSocialLogin(loginWithGoogle, 'Google')} 
              className="social-button google"
              disabled={loading}
            >
              <FaGoogle /> Google
            </button>
            
            <button 
              onClick={() => handleSocialLogin(loginWithFacebook, 'Facebook')} 
              className="social-button facebook"
              disabled={loading}
            >
              <FaFacebook /> Facebook
            </button>
            
            <button 
              onClick={() => handleSocialLogin(loginWithApple, 'Apple')} 
              className="social-button apple"
              disabled={loading}
            >
              <FaApple /> Apple
            </button>
          </div>
        </div>
        
        <div className="auth-links">
          <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          <p>
            {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 