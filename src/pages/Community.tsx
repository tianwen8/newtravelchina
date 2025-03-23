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
}

const Community: React.FC = () => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // 从本地存储加载评论（在实际应用中，这应该是从API获取）
  useEffect(() => {
    const savedComments = localStorage.getItem('communityComments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
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
      ...newComment,
      timestamp: Date.now()
    };
    
    // 更新状态
    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    
    // 保存到本地存储（在实际应用中，这应该是保存到数据库）
    localStorage.setItem('communityComments', JSON.stringify(updatedComments));
    
    // 重置表单
    setNewComment({
      name: '',
      email: '',
      content: ''
    });
    
    setSubmitStatus('success');
    
    // 3秒后清除状态消息
    setTimeout(() => {
      setSubmitStatus(null);
    }, 3000);
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

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
          
          {/* 评论列表 */}
          <div className="comments-list">
            <h3>{t('community.comments.recentComments')}</h3>
            {comments.length === 0 ? (
              <p className="no-comments">{t('community.comments.noComments')}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.name}</span>
                    <span className="comment-date">{formatDate(comment.timestamp)}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
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