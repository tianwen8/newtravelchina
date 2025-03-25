import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import '../styles/Auth.css';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const { register, loginWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !displayName) {
      setError(t('auth.errors.allFieldsRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(authError || t('auth.errors.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (socialLoginFunc: () => Promise<void>, provider: string) => {
    try {
      setError('');
      setLoading(true);
      await socialLoginFunc();
      navigate('/');
    } catch (err) {
      setError(authError || `${t('auth.errors.socialLoginFailed')} ${provider}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{t('auth.register')}</h2>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">{t('auth.name')}</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? t('general.loading') : t('auth.register')}
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
          </div>
        </div>
        
        <div className="auth-links">
          <p>
            {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 