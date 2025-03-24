import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import './Community.css';

// 评论类型定义
interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  timestamp: number;
  featured?: boolean;
  likes?: number;
  tags?: string[];
}

const Community: React.FC = () => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    content: '',
    tags: [] as string[]
  });
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // 预定义标签
  const availableTags = [
    'beijing', 'shanghai', 'xian', 'guilin', 'chengdu', 'hongkong',
    'food', 'transport', 'accommodation', 'tips', 'visa', 'shopping'
  ];
  
  // 从本地存储加载评论
  useEffect(() => {
    const savedComments = localStorage.getItem('communityComments');
    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments);
        // 确保所有评论都有默认属性
        const enhancedComments = parsedComments.map((comment: Comment) => ({
          ...comment,
          likes: comment.likes || 0,
          tags: comment.tags || []
        }));
        setComments(enhancedComments);
      } catch (error) {
        console.error('解析评论时出错:', error);
        setComments([]);
      }
    }
  }, []);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewComment({
      ...newComment,
      [name]: value
    });
  };
  
  // 处理标签选择
  const handleTagToggle = (tag: string) => {
    if (newComment.tags.includes(tag)) {
      setNewComment({
        ...newComment,
        tags: newComment.tags.filter(t => t !== tag)
      });
    } else {
      // 最多选择3个标签
      if (newComment.tags.length < 3) {
        setNewComment({
          ...newComment,
          tags: [...newComment.tags, tag]
        });
      }
    }
  };
  
  // 处理点赞
  const handleLike = (id: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === id) {
        return {
          ...comment,
          likes: (comment.likes || 0) + 1
        };
      }
      return comment;
    });
    
    setComments(updatedComments);
    localStorage.setItem('communityComments', JSON.stringify(updatedComments));
  };

  // 提交评论
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!newComment.name || !newComment.email || !newComment.content) {
      setSubmitStatus('error');
      return;
    }
    
    // 创建新评论
    const comment: Comment = {
      id: Date.now().toString(),
      name: newComment.name,
      email: newComment.email,
      content: newComment.content,
      timestamp: Date.now(),
      likes: 0,
      tags: newComment.tags,
      featured: false
    };
    
    // 更新状态
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    
    // 保存到本地存储
    localStorage.setItem('communityComments', JSON.stringify(updatedComments));
    
    // 重置表单
    setNewComment({
      name: '',
      email: '',
      content: '',
      tags: []
    });
    
    setSubmitStatus('success');
    
    // 3秒后清除状态消息
    setTimeout(() => {
      setSubmitStatus(null);
    }, 3000);
  };

  // 格式化日期，显示相对时间
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
  
  // 过滤和排序评论
  const getFilteredComments = () => {
    // 首先按照标签过滤
    let filtered = selectedTag 
      ? comments.filter(comment => comment.tags?.includes(selectedTag))
      : comments;
    
    // 然后按照搜索词过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        comment => 
          comment.content.toLowerCase().includes(term) || 
          comment.name.toLowerCase().includes(term)
      );
    }
    
    // 按时间排序（最新的在前面）
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  };

  const filteredComments = getFilteredComments();

  return (
    <>
      <Helmet>
        <title>{t('community.pageTitle')}</title>
        <meta name="description" content={t('community.metaDescription')} />
        <meta name="keywords" content={t('community.metaKeywords')} />
      </Helmet>
      <div className="community-container">
        <header className="page-header">
          <h1>{t('community.title')}</h1>
          <p>{t('community.subtitle')}</p>
        </header>
        
        <section className="comment-section">
          <h2>{t('community.comments.title')}</h2>
          
          {/* 评论表单 */}
          <div className="comment-form-container">
            <h3>{t('community.comments.leaveComment')}</h3>
            <form onSubmit={handleSubmit} className="comment-form">
              <div className="form-group">
                <label htmlFor="name">{t('community.comments.name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newComment.name}
                  onChange={handleInputChange}
                  placeholder={t('community.comments.namePlaceholder')}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">{t('community.comments.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newComment.email}
                  onChange={handleInputChange}
                  placeholder={t('community.comments.emailPlaceholder')}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">{t('community.comments.message')}</label>
                <textarea
                  id="content"
                  name="content"
                  value={newComment.content}
                  onChange={handleInputChange}
                  placeholder={t('community.comments.messagePlaceholder')}
                  required
                  rows={5}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>{t('community.comments.tags')}</label>
                <div className="tags-container">
                  {availableTags.map(tag => (
                    <span 
                      key={tag}
                      className={`tag ${newComment.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {t(`tags.${tag}`, { defaultValue: tag })}
                    </span>
                  ))}
                </div>
                <small className="tags-hint">
                  {t('community.comments.tagsHint')}
                </small>
              </div>
              
              <button type="submit" className="submit-btn">
                {t('community.comments.submit')}
              </button>
              
              {submitStatus === 'success' && (
                <div className="status-message success">
                  {t('community.comments.successMessage')}
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="status-message error">
                  {t('community.comments.errorMessage')}
                </div>
              )}
            </form>
          </div>
          
          {/* 评论过滤和搜索 */}
          <div className="comments-filter">
            <div className="search-box">
              <input
                type="text"
                placeholder={t('community.comments.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="tag-filters">
              <span 
                className={`tag-filter ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                {t('community.comments.allComments')}
              </span>
              {availableTags.map(tag => (
                <span 
                  key={tag}
                  className={`tag-filter ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {t(`tags.${tag}`, { defaultValue: tag })}
                </span>
              ))}
            </div>
          </div>
          
          {/* 评论列表 */}
          <div className="comments-list">
            <h3>
              {t('community.comments.recentComments')}
              {filteredComments.length > 0 && (
                <span className="comment-count">({filteredComments.length})</span>
              )}
            </h3>
            
            {filteredComments.length === 0 ? (
              <p className="no-comments">
                {searchTerm || selectedTag
                  ? t('community.comments.noMatchingComments')
                  : t('community.comments.noComments')}
              </p>
            ) : (
              filteredComments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.name}</span>
                    <span className="comment-date">{formatRelativeTime(comment.timestamp)}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-footer">
                    {comment.tags && comment.tags.length > 0 && (
                      <div className="comment-tags">
                        {comment.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="comment-tag"
                            onClick={() => setSelectedTag(tag)}
                          >
                            #{t(`tags.${tag}`, { defaultValue: tag })}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="comment-actions">
                      <button 
                        className="like-button" 
                        onClick={() => handleLike(comment.id)}
                        aria-label="Like comment"
                      >
                        ❤️ {comment.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
        <section className="share-section">
          <div className="share-card">
            <h2>{t('community.shareStory.title')}</h2>
            <p>{t('community.shareStory.description')}</p>
          </div>
        </section>
        
        <section className="experience-section">
          <h2>{t('community.experience.title')}</h2>
          <div className="experience-list">
            <div className="experience-card">
              <h3>{t('community.experience.transportation.title')}</h3>
              <p>{t('community.experience.transportation.description')}</p>
            </div>
            
            <div className="experience-card">
              <h3>{t('community.experience.food.title')}</h3>
              <p>{t('community.experience.food.description')}</p>
            </div>
            
            <div className="experience-card">
              <h3>{t('community.experience.accommodation.title')}</h3>
              <p>{t('community.experience.accommodation.description')}</p>
            </div>
          </div>
        </section>
        
        <section className="tips-section">
          <h2>{t('community.tips.title')}</h2>
          <div className="tips-list">
            <div className="tip-item">
              <h3>{t('community.tips.preparation.title')}</h3>
              <p>{t('community.tips.preparation.description')}</p>
            </div>
            
            <div className="tip-item">
              <h3>{t('community.tips.safety.title')}</h3>
              <p>{t('community.tips.safety.description')}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Community;