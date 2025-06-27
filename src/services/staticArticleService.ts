import { Article } from './articleService';

// 扩展文章接口以支持推荐标记
interface ExtendedArticle extends Article {
  featured?: boolean;
}

// 静态文章服务 - 使用JSON文件
export class StaticArticleService {
  private static instance: StaticArticleService;
  private articlesData: any = null;

  public static getInstance(): StaticArticleService {
    if (!StaticArticleService.instance) {
      StaticArticleService.instance = new StaticArticleService();
    }
    return StaticArticleService.instance;
  }

  // 加载文章数据
  private async loadArticlesData() {
    if (!this.articlesData) {
      try {
        // 从public目录加载JSON文件
        const response = await fetch('/data/articles.json');
        this.articlesData = await response.json();
      } catch (error) {
        console.error('加载文章数据失败:', error);
        this.articlesData = { articles: [], categories: [] };
      }
    }
    return this.articlesData;
  }

  // 获取所有文章
  public async getArticles(): Promise<ExtendedArticle[]> {
    const data = await this.loadArticlesData();
    return data.articles.map(this.transformToArticle);
  }

  // 根据分类获取文章
  public async getArticlesByCategory(category: string, page = 1, pageSize = 10): Promise<Article[]> {
    const articles = await this.getArticles();
    const filtered = articles.filter(article => article.category === category);
    
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }

  // 根据ID获取文章
  public async getArticleById(articleId: string): Promise<Article> {
    const articles = await this.getArticles();
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      throw new Error('文章未找到');
    }
    
    return article;
  }

  // 获取推荐文章
  public async getFeaturedArticles(limitCount = 5): Promise<Article[]> {
    const articles = await this.getArticles();
    return articles
      .filter(article => article.featured)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limitCount);
  }

  // 获取最新文章
  public async getLatestArticlesByCategory(category: string, limitCount = 3): Promise<Article[]> {
    const articles = await this.getArticlesByCategory(category);
    return articles
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, limitCount);
  }

  // 记录浏览量（存储到localStorage）
  public async recordView(articleId: string): Promise<void> {
    const viewKey = `article_view_${articleId}`;
    const lastView = localStorage.getItem(viewKey);
    const now = Date.now();
    
    // 同一用户24小时内只计算一次浏览
    if (!lastView || (now - parseInt(lastView)) > 24 * 60 * 60 * 1000) {
      localStorage.setItem(viewKey, now.toString());
      
      // 更新文章浏览量（在实际应用中可以发送到分析服务）
      const analytics = this.getAnalytics();
      analytics[articleId] = (analytics[articleId] || 0) + 1;
      localStorage.setItem('article_analytics', JSON.stringify(analytics));
    }
  }

  // 获取分析数据
  private getAnalytics(): Record<string, number> {
    const analyticsData = localStorage.getItem('article_analytics');
    return analyticsData ? JSON.parse(analyticsData) : {};
  }

  // 转换数据格式以兼容现有接口
  private transformToArticle(jsonArticle: any): ExtendedArticle {
    // 将结构化内容转换为HTML字符串
    let contentHtml = '';
    if (jsonArticle.content && jsonArticle.content.sections) {
      contentHtml = jsonArticle.content.sections.map((section: any) => {
        switch (section.type) {
          case 'text':
            return section.content;
          case 'image':
            return `<div class="article-image">
              <img src="${section.src}" alt="${section.alt}" />
              ${section.caption ? `<p class="image-caption">${section.caption}</p>` : ''}
            </div>`;
          case 'gallery':
            const galleryHtml = section.images.map((img: any) => 
              `<div class="gallery-item">
                <img src="${img.src}" alt="${img.alt}" />
                ${img.caption ? `<p class="image-caption">${img.caption}</p>` : ''}
              </div>`
            ).join('');
            return `<div class="image-gallery">${galleryHtml}</div>`;
          default:
            return '';
        }
      }).join('');
    } else {
      contentHtml = jsonArticle.content || '';
    }

    return {
      id: jsonArticle.id,
      title: jsonArticle.title,
      summary: jsonArticle.summary,
      content: contentHtml,
      coverImage: jsonArticle.coverImage,
      category: jsonArticle.category,
      tags: jsonArticle.tags || [],
      publishDate: jsonArticle.publishDate,
      viewCount: jsonArticle.viewCount || 0,
      author: typeof jsonArticle.author === 'object' ? jsonArticle.author.name : jsonArticle.author,
      featured: jsonArticle.featured
    };
  }

  // 搜索文章
  public async searchArticles(query: string): Promise<Article[]> {
    const articles = await this.getArticles();
    const searchTerm = query.toLowerCase();
    
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
} 