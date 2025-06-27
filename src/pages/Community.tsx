import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { commentService, Comment } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import './Community.css';

const Community: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
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
  const [isLoading, setIsLoading] = useState(false);
  
  // 预定义标签
  const availableTags = [
    'beijing', 'shanghai', 'xian', 'guilin', 'chengdu', 'hongkong',
    'food', 'transport', 'accommodation', 'tips', 'visa', 'shopping'
  ];
  
  // 当用户登录状态改变时，更新表单数据
  useEffect(() => {
    if (currentUser) {
      setNewComment(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);
  
  // 从Firestore加载评论
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        let fetchedComments;
        
        if (selectedTag) {
          fetchedComments = await commentService.getCommentsByTag(selectedTag);
        } else {
          fetchedComments = await commentService.getComments();
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          fetchedComments = fetchedComments.filter(
            comment => 
              comment.content.toLowerCase().includes(term) || 
              comment.name.toLowerCase().includes(term)
          );
        }
        
        setComments(fetchedComments);
      } catch (error) {
        console.error('加载评论失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [selectedTag, searchTerm]);

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
  const handleLike = async (id: string) => {
    try {
      const success = await commentService.likeComment(id);
      
      if (success) {
        // 更新本地状态
        setComments(comments.map(comment => {
          if (comment.id === id) {
            return {
              ...comment,
              likes: (comment.likes || 0) + 1
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('点赞评论失败:', error);
    }
  };

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果用户已登录但表单中没有姓名或邮箱，自动使用用户信息
    const name = currentUser ? (currentUser.displayName || '用户') : newComment.name;
    const email = currentUser ? (currentUser.email || '') : newComment.email;
    
    // 验证并设置特定的错误信息
    if (currentUser && !newComment.content) {
      setSubmitStatus('error-content');
      return;
    } else if (!currentUser && (!newComment.name || !newComment.email || !newComment.content)) {
      setSubmitStatus('error-fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('提交评论:', { name, email, content: newComment.content, tags: newComment.tags });
      
      // 创建新评论
      const comment = await commentService.addComment({
        name: name,
        email: email,
        content: newComment.content,
        tags: newComment.tags,
        userId: currentUser?.uid || '', // 添加userId字段
      });
      
      console.log('评论提交成功:', comment);
      
      // 更新状态
      setComments([comment, ...comments]);
      
      // 重置表单，但保留用户信息
      setNewComment({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        content: '',
        tags: []
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('提交评论失败:', error);
      
      // 根据错误类型设置不同的错误信息
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        if (error.message.includes('permission-denied')) {
          setSubmitStatus('error-permission');
        } else if (error.message.includes('not-found')) {
          setSubmitStatus('error-database');
        } else {
          setSubmitStatus('error-submit');
        }
      } else {
        setSubmitStatus('error-submit');
      }
    } finally {
      setIsLoading(false);
      
      // 3秒后清除状态消息
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    }
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

  return (
    <>
      <Helmet>
        <title>{t('community.title')} - {t('app.title')}</title>
        <meta name="description" content={t('community.description')} />
        <meta name="keywords" content="China travel community, travel experiences, China travel tips, travel stories" />
      </Helmet>
      <div className="community-container community-page">
        <div className="community-content">
          <header className="page-header">
            <h1 className="page-title">{t('community.title')}</h1>
            <p className="text-large">{t('community.subtitle')}</p>
          </header>
        
        <section className="comment-section">
          <h2>{t('community.comments.title')}</h2>
          
          {/* 评论表单 */}
          <div className="comment-form-container">
            <h3>{t('community.comments.leaveComment')}</h3>
            <form onSubmit={handleSubmit} className={`comment-form ${currentUser ? 'logged-in-form' : ''}`}>
              {!currentUser && (
                <>
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
                </>
              )}
              
              {currentUser && (
                <div className="logged-in-message">
                  {t('community.comments.commentingAs', { name: currentUser.displayName || currentUser.email })}
                </div>
              )}
              
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
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? t('general.loading') : t('community.comments.submit')}
              </button>
              
              {submitStatus === 'success' && (
                <div className="status-message success">
                  {t('community.comments.successMessage')}
                </div>
              )}
              
              {submitStatus === 'error-content' && (
                <div className="status-message error">
                  {t('community.comments.errorMessageContent', '请输入留言内容')}
                </div>
              )}
              
              {submitStatus === 'error-fields' && (
                <div className="status-message error">
                  {t('community.comments.errorMessageFields', '请填写所有必填字段')}
                </div>
              )}
              
              {submitStatus === 'error-permission' && (
                <div className="status-message error">
                  {t('community.comments.errorMessagePermission', '没有权限提交评论，请确保您已登录并有适当的权限')}
                </div>
              )}
              
              {submitStatus === 'error-database' && (
                <div className="status-message error">
                  {t('community.comments.errorMessageDatabase', '数据库错误，数据集合可能不存在')}
                </div>
              )}
              
              {submitStatus === 'error-submit' && (
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
              {comments.length > 0 && (
                <span className="comment-count">({comments.length})</span>
              )}
            </h3>
            
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>{t('general.loading')}</p>
              </div>
            ) : comments.length === 0 ? (
              <p className="no-comments">
                {searchTerm || selectedTag
                  ? t('community.comments.noMatchingComments')
                  : t('community.comments.noComments')}
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.name}</span>
                    <span className="comment-date">
                      {formatRelativeTime(
                        typeof comment.timestamp === 'number' 
                          ? comment.timestamp 
                          : new Date(comment.timestamp as any).getTime()
                      )}
                    </span>
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
      </div>
    </>
  );
};

export default Community;