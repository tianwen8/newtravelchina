import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { commentService, Comment } from '../services/commentService';
import './FloatingComments.css';

const FloatingComments: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [latestComments, setLatestComments] = useState<Comment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // 从Firestore获取最新评论
  useEffect(() => {
    const loadLatestComments = async () => {
      setIsLoading(true);
      try {
        // 获取最新评论
        const comments = await commentService.getComments();
        
        // 只取前5条评论
        const latestFiveComments = comments.slice(0, 5);
        
        if (latestFiveComments && latestFiveComments.length > 0) {
          setLatestComments(latestFiveComments);
        } else {
          // 如果没有评论，则使用一些默认评论
          const defaultComments: Comment[] = [
            {
              id: 'default1',
              name: 'Sarah Johnson',
              email: 'example1@example.com',
              content: i18n.language === 'zh' 
                ? '中国旅游网为我提供了所有需要的信息，从签证到景点推荐，让我的旅行变得轻松愉快。'
                : 'Travel China provided me with all the information I needed, from visa policies to attraction recommendations, making my trip smooth and enjoyable.',
              timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2天前
              featured: true
            },
            {
              id: 'default2',
              name: 'Michael Chen',
              email: 'example2@example.com',
              content: i18n.language === 'zh'
                ? '北京的长城之旅令人难忘，非常推荐每个人都去体验一次。这个网站的攻略帮了大忙！'
                : 'The Great Wall tour in Beijing was unforgettable. I highly recommend everyone to experience it once. The guides on this website were a great help!',
              timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
              featured: true
            },
            {
              id: 'default3',
              name: 'Emma Wilson',
              email: 'example3@example.com',
              content: i18n.language === 'zh'
                ? '成都的熊猫基地真的太可爱了！感谢这个网站的详细信息，让我顺利规划了行程。'
                : 'The panda base in Chengdu was so adorable! Thanks to the detailed information on this website, I was able to plan my trip smoothly.',
              timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4天前
              featured: true
            }
          ];
          
          setLatestComments(defaultComments);
        }
      } catch (error) {
        console.error('加载最新评论时出错:', error);
        // 出错时显示默认评论
        setLatestComments([
          {
            id: 'default1',
            name: 'Sarah Johnson',
            email: 'example1@example.com',
            content: i18n.language === 'zh' 
              ? '中国旅游网为我提供了所有需要的信息，从签证到景点推荐，让我的旅行变得轻松愉快。'
              : 'Travel China provided me with all the information I needed, from visa policies to attraction recommendations, making my trip smooth and enjoyable.',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            featured: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLatestComments();
    
    // 每60秒自动刷新评论
    const refreshInterval = setInterval(loadLatestComments, 60000);
    
    // 语言变更时重新加载评论
    const handleLanguageChange = () => {
      loadLatestComments();
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      clearInterval(refreshInterval);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  // 自动轮播评论
  useEffect(() => {
    if (latestComments.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === latestComments.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 每5秒切换一次
    
    return () => clearInterval(interval);
  }, [latestComments.length]);
  
  // 切换评论可见性
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // 格式化日期，显示相对时间（如"3天前"）
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return t('time.justNow');
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return t('time.minutesAgo', { count: diffInMinutes });
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return t('time.hoursAgo', { count: diffInHours });
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return t('time.daysAgo', { count: diffInDays });
    }
    
    // 如果超过30天，则显示具体日期
    return new Date(timestamp).toLocaleDateString();
  };
  
  // 如果正在加载或没有评论，不显示或显示加载状态
  if (isLoading) {
    return (
      <div className={`floating-comments ${isVisible ? 'visible' : 'collapsed'}`}>
        <div className="floating-header" onClick={toggleVisibility}>
          <h3>{t('home.comments.latestTitle')}</h3>
          <button className="toggle-button">
            {isVisible ? '−' : '+'}
          </button>
        </div>
        {isVisible && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t('general.loading')}</p>
          </div>
        )}
      </div>
    );
  }
  
  if (latestComments.length === 0) {
    return null;
  }
  
  const currentComment = latestComments[currentIndex];
  
  return (
    <div className={`floating-comments ${isVisible ? 'visible' : 'collapsed'}`}>
      <div className="floating-header" onClick={toggleVisibility}>
        <h3>{t('home.comments.latestTitle') || '最新留言'}</h3>
        <button className="toggle-button">
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="floating-content">
          <div className="comment-content">
            <p>"{currentComment.content}"</p>
          </div>
          <div className="comment-footer">
            <div className="author-info">
              <h4>{currentComment.name}</h4>
              <p className="comment-date">
                {formatRelativeTime(
                  typeof currentComment.timestamp === 'number' 
                    ? currentComment.timestamp 
                    : new Date(currentComment.timestamp as any).getTime()
                )}
              </p>
            </div>
            {latestComments.length > 1 && (
              <div className="carousel-indicators">
                {latestComments.map((_, index) => (
                  <span 
                    key={index} 
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingComments; 