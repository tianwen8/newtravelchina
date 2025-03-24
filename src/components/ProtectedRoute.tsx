import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { currentUser, loading } = useAuth();
  const { t } = useTranslation();
  
  // 如果正在加载用户状态，显示加载指示器
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('general.loading')}</p>
      </div>
    );
  }
  
  // 如果没有登录，重定向到登录页面
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // 如果已登录，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute; 