import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { marked } from 'marked';
import { articleService, Article as ArticleType } from '../services/articleService';
import './Article.css';
import '../styles/ArticleContent.css';

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true,
});

const Article: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { t } = useTranslation();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<ArticleType[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;
      
      setIsLoading(true);
      try {
        const articleData = await articleService.getArticleById(articleId);
        setArticle(articleData);
        
        // Record article view
        await articleService.recordView(articleId);
        
        // Get related articles
        const related = await articleService.getRelatedArticles(articleId);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError(t('article.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }, [articleId, t]);

  // 将Markdown转换为HTML
  const parseMarkdown = (markdown: string): string => {
    try {
      return marked(markdown) as string;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return markdown.replace(/\n/g, '<br/>');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>{t('general.loading')}</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="error-container">
        <h2>{t('general.error')}</h2>
        <p>{error || t('article.notFound')}</p>
        <Link to="/articles" className="back-button">
          {t('general.backToList')}
        </Link>
      </div>
    );
  }

  // Determine the return link based on the article category
  const getCategoryRoute = (category: string): string => {
    console.log(`Determining return path for article category '${category}'...`);
    
    // Simplified logic, only check for two main categories
    const lowerCategory = category.toLowerCase();
    
    // All attraction/culture related articles return to attractions page
    if (lowerCategory.includes('attract') || 
        lowerCategory.includes('cultur') || 
        lowerCategory.includes('palace') || 
        lowerCategory.includes('herit') || 
        lowerCategory.includes('landmark')) {
      return '/attractions';
    }
    
    // All visa/policy related articles return to visa-free page
    if (lowerCategory.includes('visa') || 
        lowerCategory.includes('poli') || 
        lowerCategory.includes('transit') || 
        lowerCategory.includes('tips')) {
      return '/visa-free';
    }
    
    // Default to attractions page for other cases
    return '/attractions';
  };

  const backToListLink = getCategoryRoute(article.category);

  return (
    <div className="article-container">
      <Helmet>
        <title>{article.title} - {t('app.title')}</title>
        <meta name="description" content={article.summary} />
      </Helmet>

      <div className="article-header">
        <div className="category-label">
          <Link to={getCategoryRoute(article.category)}>
            {t(`article.categories.${article.category}`, {defaultValue: article.category})}
          </Link>
        </div>
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">
          <span className="publish-date">
            {new Date(article.publishDate).toLocaleDateString()}
          </span>
          <span className="view-count">
            {t('article.viewCount', {count: article.viewCount})}
          </span>
        </div>
      </div>

      <div className="article-summary">
        <p>{article.summary}</p>
      </div>

      <div className="article-content">
        {Array.isArray(article.content) ? (
          article.content.map((section, index) => {
            switch (section.type) {
              case 'text':
                return (
                  <div key={index} className="content-text" dangerouslySetInnerHTML={{ __html: parseMarkdown(section.text) }} />
                );
              case 'image':
                return (
                  <div key={index} className="content-image">
                    <img src={section.src} alt={section.alt} />
                    {section.caption && <p className="image-caption">{section.caption}</p>}
                  </div>
                );
              case 'gallery':
                return (
                  <div key={index} className="content-gallery">
                    {section.images?.map((img: any, imgIndex: number) => (
                      <div key={imgIndex} className="gallery-item">
                        <img src={img.src} alt={img.alt} />
                        {img.caption && <p className="image-caption">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                );
              default:
                return null;
            }
          })
        ) : (
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(article.content) }} />
        )}
      </div>

      {relatedArticles.length > 0 && (
        <div className="related-articles">
          <h3>{t('article.relatedArticles')}</h3>
          <div className="related-articles-list">
            {relatedArticles.map(relatedArticle => (
              <Link 
                to={`/articles/${relatedArticle.id}`} 
                key={relatedArticle.id} 
                className="related-article-item"
              >
                <h4>{relatedArticle.title}</h4>
                <p>{relatedArticle.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="article-navigation">
        <Link to={backToListLink} className="back-button">
          {t('general.backToList')}
        </Link>
      </div>
    </div>
  );
};

export default Article; 