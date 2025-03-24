import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateProfile, error: authError } = useAuth();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError(t('profile.errors.nameRequired'));
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await updateProfile({ displayName });
      setSuccess(t('profile.updateSuccess'));
    } catch (err) {
      setError(authError || t('profile.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="error-message">{t('profile.errors.notLoggedIn')}</div>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{t('profile.title')}</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="profile-info">
        <div className="profile-email">
          <strong>{t('profile.email')}:</strong> {currentUser.email}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="displayName">{t('profile.displayName')}</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        
        <button type="submit" disabled={loading} className="profile-button">
          {loading ? t('general.loading') : t('profile.update')}
        </button>
      </form>
    </div>
  );
};

export default Profile; 