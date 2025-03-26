import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { commentService, Comment } from '../services/commentService';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './CommentWaterfall.css';

// 带有位置信息的评论接口
interface CommentWithPosition extends Comment {
  position?: {
    transitionDelay: string;
    animationDelay: string;
    left: string;
    zIndex: number;
  };
}

// 组件属性接口
interface CommentWaterfallProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// CommentWaterfall组件
const CommentWaterfall: React.FC<CommentWaterfallProps> = ({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 30000 // 默认30秒刷新一次
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<CommentWithPosition[]>([]);
  const [visibleComments, setVisibleComments] = useState<CommentWithPosition[]>([]);
  const navigate = useNavigate(); // 使用React Router的导航钩子

  // 设置随机位置
  const getRandomPosition = () => {
    return {
      transitionDelay: `${Math.random() * 2}s`,
      animationDelay: `${Math.random() * 5}s`,
      left: `${Math.random() * 80 + 10}%`,
      zIndex: Math.floor(Math.random() * 10 + 1)
    };
  };

  // 获取最新评论
  const fetchComments = useCallback(async () => {
    try {
      // 获取所有评论并按时间排序，显示最新的评论
      const allComments = await commentService.getComments();
      
      // 按时间戳降序排序，确保最新的排在前面
      const sortedComments = allComments.sort((a, b) => {
        const timeA = getTimeInMs(a.timestamp);
        const timeB = getTimeInMs(b.timestamp);
        return timeB - timeA; // 降序排序，最新的排在前面
      });
      
      // 获取前limit条评论
      const limitedComments = sortedComments.slice(0, limit);
      
      // 设置位置信息
      const commentsWithPosition = limitedComments.map(comment => ({
        ...comment,
        position: getRandomPosition()
      }));
      
      setComments(commentsWithPosition);
    } catch (error) {
      console.error("获取评论失败:", error);
    }
  }, [limit]);

  // 将不同类型的时间戳转换为毫秒数
  const getTimeInMs = (timestamp: number | Date | Timestamp): number => {
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    } else if (typeof timestamp === 'number') {
      return timestamp;
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      // 处理Firebase Timestamp对象
      return timestamp.toDate().getTime();
    } else {
      // 尝试转换其他格式
      return new Date(timestamp as any).getTime();
    }
  };

  // 初始加载评论和刷新设置
  useEffect(() => {
    fetchComments();
    
    // 如果开启自动刷新，设置定时器
    let timer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      timer = setInterval(fetchComments, refreshInterval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [fetchComments, autoRefresh, refreshInterval]);

  // 轮换显示的评论
  const rotateComments = useCallback(() => {
    if (comments.length > 0) {
      // 随机选择几条评论来显示
      const displayCount = Math.min(
        Math.max(3, Math.floor(limit / 2)), // 至少显示3条，最多显示limit/2条
        comments.length
      );
      
      // 随机选择，但优先选择最新的评论
      const selected = [...comments]
        .sort(() => Math.random() > 0.3 ? 1 : -1) // 70%的概率保持原有排序（时间倒序）
        .slice(0, displayCount)
        .map(comment => ({
          ...comment,
          position: getRandomPosition()
        }));
      
      setVisibleComments(selected);
    }
  }, [comments, limit]);

  // 设置初始评论显示和轮换
  useEffect(() => {
    rotateComments();
    
    // 每10秒轮换一次显示的评论
    const rotateTimer = setInterval(rotateComments, 10000);
    
    return () => {
      clearInterval(rotateTimer);
    };
  }, [comments, rotateComments]);

  // 处理点击评论跳转到社区页面
  const handleCommentClick = () => {
    navigate('/community');
  };

  // 格式化时间显示
  const formatRelativeTime = (timestamp: number | Date | Timestamp) => {
    const now = new Date().getTime();
    const timeMs = getTimeInMs(timestamp);
    const diffMs = now - timeMs;
    
    // 时间差
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return t('time.justNow', '刚刚');
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
          title={t('community.viewAllComments', '点击查看社区全部评论')}
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