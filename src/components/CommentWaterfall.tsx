import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { commentService, Comment } from '../services/commentService';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './CommentWaterfall.css';

// Comments with position information
interface CommentWithPosition extends Comment {
  position?: {
    transitionDelay: string;
    animationDelay: string;
    left: string;
    zIndex: number;
  };
}

// Component props interface
interface CommentWaterfallProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// CommentWaterfall Component
const CommentWaterfall: React.FC<CommentWaterfallProps> = ({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 30000 // Default refresh every 30 seconds
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<CommentWithPosition[]>([]);
  const [visibleComments, setVisibleComments] = useState<CommentWithPosition[]>([]);
  const navigate = useNavigate(); // React Router navigation hook

  // Set random position
  const getRandomPosition = () => {
    return {
      transitionDelay: `${Math.random() * 2}s`,
      animationDelay: `${Math.random() * 5}s`,
      left: `${Math.random() * 80 + 10}%`,
      zIndex: Math.floor(Math.random() * 10 + 1)
    };
  };

  // Get latest comments
  const fetchComments = useCallback(async () => {
    try {
      // Get all comments and sort by time, show the latest comments
      const allComments = await commentService.getComments();
      
      // Sort by timestamp in descending order, latest first
      const sortedComments = allComments.sort((a, b) => {
        const timeA = getTimeInMs(a.timestamp);
        const timeB = getTimeInMs(b.timestamp);
        return timeB - timeA; // Descending order, latest first
      });
      
      // Get first 'limit' comments
      const limitedComments = sortedComments.slice(0, limit);
      
      // Set position information
      const commentsWithPosition = limitedComments.map(comment => ({
        ...comment,
        position: getRandomPosition()
      }));
      
      setComments(commentsWithPosition);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }, [limit]);

  // Convert different timestamp types to milliseconds
  const getTimeInMs = (timestamp: number | Date | Timestamp): number => {
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    } else if (typeof timestamp === 'number') {
      return timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      // Handle Firebase Timestamp object
      return timestamp.toDate().getTime();
    } else {
      // Try to convert other formats
      return new Date(timestamp as any).getTime();
    }
  };

  // Initial comment loading and refresh setup
  useEffect(() => {
    fetchComments();
    
    // If auto-refresh is enabled, set timer
    let timer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      timer = setInterval(fetchComments, refreshInterval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [fetchComments, autoRefresh, refreshInterval]);

  // Rotate displayed comments
  const rotateComments = useCallback(() => {
    if (comments.length > 0) {
      // Randomly select comments to display
      const displayCount = Math.min(
        Math.max(3, Math.floor(limit / 2)), // At least 3, at most limit/2
        comments.length
      );
      
      // Random selection, prioritizing newer comments
      const selected = [...comments]
        .sort(() => Math.random() > 0.3 ? 1 : -1) // 70% chance to keep original order (time descending)
        .slice(0, displayCount)
        .map(comment => ({
          ...comment,
          position: getRandomPosition()
        }));
      
      setVisibleComments(selected);
    }
  }, [comments, limit]);

  // Set initial comment display and rotation
  useEffect(() => {
    rotateComments();
    
    // Rotate displayed comments every 10 seconds
    const rotateTimer = setInterval(rotateComments, 10000);
    
    return () => {
      clearInterval(rotateTimer);
    };
  }, [comments, rotateComments]);

  // Handle click on comment to navigate to community page
  const handleCommentClick = () => {
    navigate('/community');
  };

  // Format time display
  const formatRelativeTime = (timestamp: number | Date | Timestamp) => {
    const now = new Date().getTime();
    const timeMs = getTimeInMs(timestamp);
    const diffMs = now - timeMs;
    
    // Time difference
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return t('time.justNow', 'Just now');
    if (minutes < 60) return t('time.minutesAgo', { count: minutes });
    if (hours < 24) return t('time.hoursAgo', { count: hours });
    if (days < 30) return t('time.daysAgo', { count: days });
    
    return new Date(timeMs).toLocaleDateString();
  };

  return (
    <div className="comment-waterfall-container">
      {visibleComments.map((comment, index) => (
        <div
          key={`${comment.id}-${index}`}
          className="floating-comment"
          onClick={handleCommentClick}
          style={{
            animationDelay: comment.position?.animationDelay,
            left: comment.position?.left,
            zIndex: comment.position?.zIndex
          }}
          title={t('community.viewAllComments', 'Click to view all community comments')}
        >
          <div className="comment-content">
            <p>{comment.content}</p>
          </div>
          <div className="comment-footer">
            <span className="comment-author">{comment.name}</span>
            <span className="comment-time">{formatRelativeTime(comment.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentWaterfall; 