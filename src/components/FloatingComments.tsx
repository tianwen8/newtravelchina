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

  // Fetch latest comments from Firestore
  useEffect(() => {
    const loadLatestComments = async () => {
      setIsLoading(true);
      try {
        // Get latest comments
        const comments = await commentService.getComments();
        
        // Take only the first 5 comments
        const latestFiveComments = comments.slice(0, 5);
        
        if (latestFiveComments && latestFiveComments.length > 0) {
          setLatestComments(latestFiveComments);
        } else {
          // If no comments, use default comments
          const defaultComments: Comment[] = [
            {
              id: 'default1',
              name: 'Sarah Johnson',
              email: 'example1@example.com',
              content: 'Travel China provided me with all the information I needed, from visa policies to attraction recommendations, making my trip smooth and enjoyable.',
              timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
              featured: true
            },
            {
              id: 'default2',
              name: 'Michael Chen',
              email: 'example2@example.com',
              content: 'The Great Wall tour in Beijing was unforgettable. I highly recommend everyone to experience it once. The guides on this website were a great help!',
              timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
              featured: true
            },
            {
              id: 'default3',
              name: 'Emma Wilson',
              email: 'example3@example.com',
              content: 'The panda base in Chengdu was so adorable! Thanks to the detailed information on this website, I was able to plan my trip smoothly.',
              timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
              featured: true
            }
          ];
          
          setLatestComments(defaultComments);
        }
      } catch (error) {
        console.error('Error loading latest comments:', error);
        // Show default comments on error
        setLatestComments([
          {
            id: 'default1',
            name: 'Sarah Johnson',
            email: 'example1@example.com',
            content: 'Travel China provided me with all the information I needed, from visa policies to attraction recommendations, making my trip smooth and enjoyable.',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            featured: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLatestComments();
    
    // Auto-refresh comments every 60 seconds
    const refreshInterval = setInterval(loadLatestComments, 60000);
    
    // Reload comments when language changes
    const handleLanguageChange = () => {
      loadLatestComments();
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      clearInterval(refreshInterval);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  // Auto-carousel for comments
  useEffect(() => {
    if (latestComments.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === latestComments.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [latestComments.length]);
  
  // Toggle comments visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // Format date, show relative time (e.g., "3 days ago")
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
    
    // If more than 30 days, show actual date
    return new Date(timestamp).toLocaleDateString();
  };
  
  // If loading or no comments, don't show or show loading state
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
        <h3>{t('home.comments.latestTitle') || 'Latest Comments'}</h3>
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