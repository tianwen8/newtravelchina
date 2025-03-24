import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { commentService, Comment } from '../services/commentService';
import { Timestamp } from 'firebase/firestore';
import './CommentWaterfall.css';

// 扩展Comment类型，添加position属性
interface CommentWithPosition extends Comment {
  position?: {
    transitionDelay: string;
    animationDelay: string;
    left: string;
    zIndex: number;
  };
}

interface CommentWaterfallProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const CommentWaterfall: React.FC<CommentWaterfallProps> = ({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 30000 // 默认30秒刷新一次
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<CommentWithPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleComments, setVisibleComments] = useState<CommentWithPosition[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  
  const getRandomPosition = () => {
    // 为每个评论生成随机的位置和延迟
    return {
      transitionDelay: `${Math.random() * 0.5}s`,
      animationDelay: `${Math.random() * 2}s`,
      left: `${Math.max(5, Math.min(85, Math.random() * 85))}%`,
      zIndex: Math.floor(Math.random() * 5) + 1
    };
  };
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await commentService.getFeaturedComments(limit);
      
      // 为每个评论添加随机位置信息
      const commentsWithPosition = fetchedComments.map(comment => ({
        ...comment,
        position: getRandomPosition()
      })) as CommentWithPosition[];
      
      setComments(commentsWithPosition);
      
      // 初始显示2个评论
      if (commentsWithPosition.length > 0) {
        setVisibleComments(commentsWithPosition.slice(0, 2));
        setCurrentIndex(2 % commentsWithPosition.length);
      }
    } catch (error) {
      console.error('获取精选评论失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 轮换显示评论
  const rotateComments = () => {
    if (comments.length === 0) return;
    
    // 添加下一个评论到可见评论列表
    const nextIndex = currentIndex % comments.length;
    const updatedVisibleComments = [...visibleComments, comments[nextIndex]];
    
    // 如果可见评论超过5个，移除最早的一个
    if (updatedVisibleComments.length > 5) {
      updatedVisibleComments.shift();
    }
    
    setVisibleComments(updatedVisibleComments);
    setCurrentIndex((currentIndex + 1) % comments.length);
  };
  
  // 格式化相对时间
  const formatRelativeTime = (timestamp: number | Date | Timestamp) => {
    const now = new Date().getTime();
    let time: number;
    
    if (timestamp instanceof Date) {
      time = timestamp.getTime();
    } else if (timestamp instanceof Timestamp) {
      time = timestamp.toDate().getTime();
    } else {
      time = timestamp;
    }
    
    const diff = now - time;
    
    // 小于1分钟
    if (diff < 60 * 1000) {
      return t('general.justNow');
    }
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return t('general.minutesAgo', { count: minutes });
    }
    
    // 小于1天
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return t('general.hoursAgo', { count: hours });
    }
    
    // 小于30天
    if (diff < 30 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return t('general.daysAgo', { count: days });
    }
    
    // 超过30天，显示具体日期
    return new Date(time).toLocaleDateString();
  };
  
  useEffect(() => {
    fetchComments();
    
    // 清理函数
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);
  
  useEffect(() => {
    // 开始评论轮换
    if (comments.length > 0 && autoRefresh) {
      timer.current = setInterval(rotateComments, refreshInterval / 3);
      
      // 定期刷新评论数据
      const refreshTimer = setInterval(fetchComments, refreshInterval);
      
      return () => {
        if (timer.current) clearInterval(timer.current);
        clearInterval(refreshTimer);
      };
    }
  }, [comments, autoRefresh, refreshInterval]);
  
  if (loading && visibleComments.length === 0) {
    return null; // 初始加载时不显示任何内容
  }
  
  return (
    <div className="comment-waterfall-container">
      {visibleComments.map((comment, index) => (
        <div 
          key={`${comment.id}-${index}`}
          className="floating-comment"
          style={{
            left: comment.position?.left,
            transitionDelay: comment.position?.transitionDelay,
            animationDelay: comment.position?.animationDelay,
            zIndex: comment.position?.zIndex
          }}
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