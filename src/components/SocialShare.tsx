import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaWeixin, FaWeibo, FaFacebook, FaTwitter, FaLink } from 'react-icons/fa';
import './SocialShare.css';

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  image?: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  title,
  url = window.location.href,
  description = '',
  image = '',
  className = ''
}) => {
  const { t } = useTranslation();
  
  // 编码参数，确保它们可以正确传递到URL中
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image);
  
  // 微信分享
  const handleWechatShare = () => {
    // 实际应用中这里应该使用微信SDK或显示二维码
    alert(t('share.wechatTip'));
  };
  
  // 复制链接
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => alert(t('share.linkCopied')))
      .catch(() => alert(t('share.error')));
  };

  return (
    <div className={`social-share-container ${className}`}>
      <p className="share-title">{t('share.title')}</p>
      <div className="share-buttons">
        {/* 微信 */}
        <button 
          className="share-button wechat" 
          onClick={handleWechatShare}
          aria-label={t('share.wechat')}
        >
          <FaWeixin />
          <span className="share-text">{t('share.wechat')}</span>
        </button>
        
        {/* 微博 */}
        <a 
          href={`https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}&pic=${encodedImage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button weibo"
          aria-label={t('share.weibo')}
        >
          <FaWeibo />
          <span className="share-text">{t('share.weibo')}</span>
        </a>
        
        {/* Facebook */}
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button facebook"
          aria-label={t('share.facebook')}
        >
          <FaFacebook />
          <span className="share-text">{t('share.facebook')}</span>
        </a>
        
        {/* Twitter */}
        <a 
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="share-button twitter"
          aria-label={t('share.twitter')}
        >
          <FaTwitter />
          <span className="share-text">{t('share.twitter')}</span>
        </a>
        
        {/* 复制链接 */}
        <button 
          className="share-button copy" 
          onClick={handleCopyLink}
          aria-label={t('share.copyLink')}
        >
          <FaLink />
          <span className="share-text">{t('share.copyLink')}</span>
        </button>
      </div>
    </div>
  );
};

export default SocialShare; 