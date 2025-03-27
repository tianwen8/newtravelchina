// import { v4 as uuidv4 } from 'uuid';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query as firestoreQuery,
  where,
  orderBy,
  limit as firestoreLimit,
  increment,
  Timestamp,
  serverTimestamp,
  limit,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, useLocalStorage } from '../firebase/config';

// 文章分类
export const ARTICLE_CATEGORIES = [
  { id: 'visa-free', name: 'Visa-Free Policy' },
  { id: 'attractions', name: 'Attractions' },
  { id: 'culture', name: 'Chinese Culture' },
  { id: 'travel-tips', name: 'Travel Tips' },
];

// 文章接口
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishDate: string;
  viewCount: number;
  author?: string;
}

class ArticleService {
  private readonly STORAGE_KEY = 'travel_china_articles';
  private readonly VIEWS_KEY = 'travel_china_article_views';
  private readonly COLLECTION_NAME = 'articles';
  private readonly USER_VIEWS_COLLECTION = 'article_views';

  // 获取所有文章
  private async getArticles(): Promise<Article[]> {
    if (useLocalStorage) {
      const articlesJson = localStorage.getItem(this.STORAGE_KEY);
      if (!articlesJson) return this.seedInitialArticles();
      return JSON.parse(articlesJson);
    } else {
      try {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const snapshot = await getDocs(articlesRef);
        
        // 如果集合是空的，则初始化数据
        if (snapshot.empty) {
          return this.seedInitialArticles();
        }
        
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            publishDate: data.publishDate instanceof Timestamp 
              ? data.publishDate.toDate().toISOString() 
              : data.publishDate
          } as Article;
        });
      } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
      }
    }
  }

  // 保存所有文章
  private saveArticles(articles: Article[]): void {
    if (useLocalStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    }
    // Firebase不需要这个方法，因为每篇文章都是单独保存的
  }

  // 生成随机ID
  private generateId(): string {
    return 'article_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 保存新文章
  public async publishArticle(articleData: Omit<Article, 'id' | 'viewCount' | 'publishDate'>): Promise<Article> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      
      const newArticle: Article = {
        ...articleData,
        id: this.generateId(),
        publishDate: new Date().toISOString(),
        viewCount: 0
      };
      
      articles.push(newArticle);
      this.saveArticles(articles);
      
      return newArticle;
    } else {
      try {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const newArticleData = {
          ...articleData,
          publishDate: serverTimestamp(),
          viewCount: 0
        };
        
        const docRef = await addDoc(articlesRef, newArticleData);
        
        return {
          ...newArticleData,
          id: docRef.id,
          publishDate: new Date().toISOString()
        } as Article;
      } catch (error) {
        console.error('Error publishing article:', error);
        throw error;
      }
    }
  }

  // 上传文章图片
  public async uploadArticleImage(file: File): Promise<string> {
    if (useLocalStorage) {
      // 模拟上传
      const mockImages = [
        '/images/china1.jpg',
        '/images/china2.jpg',
        '/images/china3.jpg',
        '/images/china4.jpg',
      ];
      
      return new Promise(resolve => {
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * mockImages.length);
          resolve(mockImages[randomIndex]);
        }, 500);
      });
    } else {
      try {
        const storageRef = ref(storage, `article-images/${new Date().getTime()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }
  }

  // 获取推荐文章
  public async getFeaturedArticles(limitCount = 5): Promise<Article[]> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      return articles
        .sort((a, b) => b.viewCount - a.viewCount || new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        .slice(0, limitCount);
    } else {
      try {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const q = firestoreQuery(articlesRef, orderBy('viewCount', 'desc'), firestoreLimit(limitCount));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            ...data,
            publishDate: data.publishDate instanceof Timestamp 
              ? data.publishDate.toDate().toISOString() 
              : data.publishDate
          } as Article;
        });
      } catch (error) {
        console.error('Error fetching featured articles:', error);
        return [];
      }
    }
  }

  // 按分类获取文章
  public async getArticlesByCategory(category: string, page = 1, pageSize = 10): Promise<Article[]> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const filteredArticles = category
        ? articles.filter(article => article.category === category)
        : articles;
      
      // 按发布日期排序（最新的先显示）
      const sortedArticles = filteredArticles.sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
      
      // 简单分页
      const startIndex = (page - 1) * pageSize;
      return sortedArticles.slice(startIndex, startIndex + pageSize);
    } else {
      try {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        let q;
        
        if (category) {
          q = firestoreQuery(
            articlesRef, 
            where('category', '==', category),
            orderBy('publishDate', 'desc')
          );
        } else {
          q = firestoreQuery(articlesRef, orderBy('publishDate', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        
        // 手动分页 (Firestore需要付费计划才支持offset分页)
        const allArticles = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            ...data,
            publishDate: data.publishDate instanceof Timestamp 
              ? data.publishDate.toDate().toISOString() 
              : data.publishDate
          } as Article;
        });
        
        const startIndex = (page - 1) * pageSize;
        return allArticles.slice(startIndex, startIndex + pageSize);
      } catch (error) {
        console.error('Error fetching articles by category:', error);
        return [];
      }
    }
  }

  // 按ID获取单篇文章
  public async getArticleById(articleId: string): Promise<Article> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const article = articles.find(a => a.id === articleId);
      
      if (!article) {
        throw new Error('文章不存在');
      }
      
      return article;
    } else {
      try {
        const articleRef = doc(db, this.COLLECTION_NAME, articleId);
        const articleDoc = await getDoc(articleRef);
        
        if (!articleDoc.exists()) {
          throw new Error('文章不存在');
        }
        
        const data = articleDoc.data() as DocumentData;
        return {
          id: articleDoc.id,
          ...data,
          publishDate: data.publishDate instanceof Timestamp 
            ? data.publishDate.toDate().toISOString() 
            : data.publishDate
        } as Article;
      } catch (error) {
        console.error('Error fetching article by ID:', error);
        throw error;
      }
    }
  }

  // 记录文章浏览量
  public async recordView(articleId: string): Promise<void> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      
      if (articleIndex !== -1) {
        articles[articleIndex].viewCount += 1;
        this.saveArticles(articles);
        
        // 也可以在这里记录用户查看历史
        this.recordUserView(articleId);
      }
    } else {
      try {
        const articleRef = doc(db, this.COLLECTION_NAME, articleId);
        await updateDoc(articleRef, {
          viewCount: increment(1)
        });
        
        // 记录用户查看历史
        this.recordUserView(articleId);
      } catch (error) {
        console.error('Error recording view:', error);
      }
    }
  }

  // 记录用户查看历史
  private recordUserView(articleId: string): void {
    if (useLocalStorage) {
      const viewsJson = localStorage.getItem(this.VIEWS_KEY);
      const views = viewsJson ? JSON.parse(viewsJson) : [];
      
      // 添加到已查看列表（可能还需要去重）
      views.unshift({
        articleId,
        timestamp: new Date().toISOString()
      });
      
      // 只保留最近的30条记录
      const recentViews = views.slice(0, 30);
      localStorage.setItem(this.VIEWS_KEY, JSON.stringify(recentViews));
    } else {
      // 在实际应用中，这里应该使用用户的UID
      // 现在我们只是模拟记录，不与特定用户关联
      try {
        const viewsRef = collection(db, this.USER_VIEWS_COLLECTION);
        addDoc(viewsRef, {
          articleId,
          timestamp: serverTimestamp(),
          // userId: currentUser?.uid // 如果有登录用户
        });
      } catch (error) {
        console.error('Error recording user view:', error);
      }
    }
  }

  // 获取相关文章
  public async getRelatedArticles(articleId: string, limitCount = 3): Promise<Article[]> {
    try {
      const currentArticle = await this.getArticleById(articleId);
      
      if (useLocalStorage) {
        const articles = await this.getArticles();
        return articles
          .filter(article => 
            article.id !== articleId && article.category === currentArticle.category
          )
          .sort(() => Math.random() - 0.5) // 随机排序
          .slice(0, limitCount);
      } else {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const q = firestoreQuery(
          articlesRef,
          where('category', '==', currentArticle.category),
          where('__name__', '!=', articleId),
          firestoreLimit(limitCount + 5) // 多取几篇，以便随机选择
        );
        
        const snapshot = await getDocs(q);
        
        const relatedArticles = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            ...data,
            publishDate: data.publishDate instanceof Timestamp 
              ? data.publishDate.toDate().toISOString() 
              : data.publishDate
          } as Article;
        });
        
        // 随机排序并限制数量
        return relatedArticles
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(limitCount, relatedArticles.length));
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  }

  // 生成初始文章数据
  private async seedInitialArticles(): Promise<Article[]> {
    const initialArticles: Article[] = [
      {
        id: 'article-1',
        title: 'Exploring Beijing: Ancient Hutongs and Modern Architecture',
        summary: 'A journey through time, from old Beijing hutongs to modern architectural marvels like the Bird\'s Nest and Water Cube',
        content: `<p>北京，这座具有三千年历史的古都，是中国政治、文化的中心。在这里，古老与现代并存，传统与创新交融。</p>
                <p>胡同是老北京城市肌理的基本单元，也是北京传统文化的载体。这些窄窄的小巷，通常由四合院的一面墙构成，至今仍保持着过去那种悠闲自得的生活气息。南锣鼓巷、烟袋斜街、五道营胡同等地已经成为游客和本地人闲逛休憩的热门区域。</p>
                <p>与此同时，以奥运场馆为标志的现代建筑群，例如鸟巢（国家体育场）、水立方（国家游泳中心）、国家大剧院（蛋形建筑）等，则展示了当代中国的创新设计和建筑技术。</p>
                <h3>推荐行程</h3>
                <ul>
                  <li>上午：参观天安门、故宫等传统景点</li>
                  <li>中午：在簋街或前门大街品尝地道北京美食</li>
                  <li>下午：漫步南锣鼓巷，体验传统胡同文化</li>
                  <li>傍晚：前往奥林匹克公园欣赏鸟巢、水立方的夜景</li>
                </ul>
                <p>无论您是历史爱好者还是现代艺术追求者，北京都能满足您的好奇心。这座城市的魅力正在于它如何巧妙地将悠久历史与现代活力融为一体。</p>`,
        coverImage: '/images/beijing.jpg',
        category: 'attractions',
        tags: ['Beijing', 'Hutongs', 'Modern Architecture', 'Cultural Tour'],
        publishDate: '2023-08-15T08:30:00Z',
        viewCount: 1250,
        author: 'Li Wenhua'
      },
      {
        id: 'article-2',
        title: 'China\'s 144-Hour Transit Visa-Free Policy Explained',
        summary: 'Learn how to use China\'s 144-hour transit visa-free policy to plan your short visit to China',
        content: `<p>自2019年起，中国进一步扩大了144小时过境免签政策的适用范围，目前已覆盖北京、上海、广州、成都等多个主要城市和地区。这一政策为短期访问中国提供了极大便利。</p>
                <h3>政策要点</h3>
                <ul>
                  <li>适用于53个国家的公民，包括美国、加拿大、英国、澳大利亚等</li>
                  <li>停留时间最长为144小时（6天）</li>
                  <li>必须有前往第三国（地区）的确认机票</li>
                  <li>在规定的行政区域内活动</li>
                </ul>
                <h3>申请流程</h3>
                <p>1. 抵达中国口岸后，前往边检处</p>
                <p>2. 填写"外国人入境申请表"，申请"过境免签停留"</p>
                <p>3. 提供有效护照和72小时内前往第三国的确认机票</p>
                <p>4. 边检官员核实信息后，会在您的护照上盖章，注明允许停留的时限</p>
                <h3>适用城市和活动范围</h3>
                <p>各地区的活动范围有所不同：</p>
                <ul>
                  <li>京津冀地区：北京、天津市以及河北省石家庄、秦皇岛、唐山、廊坊、保定市等</li>
                  <li>长三角地区：上海、江苏省南京、苏州、无锡等城市以及浙江省杭州、宁波等城市</li>
                  <li>粤港澳大湾区：广东省广州、深圳、珠海等城市</li>
                </ul>
                <p>此政策为短期商务旅行、旅游观光、探亲访友提供了便利，但请注意计算好时间，确保在允许的时间内离境。</p>`,
        coverImage: '/images/visa-free.jpg',
        category: 'visa-free',
        tags: ['Visa-Free Policy', 'Travel Planning', 'Entry Guide'],
        publishDate: '2023-09-20T10:45:00Z',
        viewCount: 3680,
        author: 'Zhang International'
      },
      {
        id: 'article-3',
        title: 'Chinese Tea Culture: Savoring 5000 Years of Fragrance',
        summary: 'From Longjing to Pu\'er, explore the profound heritage and rich connotations of Chinese tea culture',
        content: `<p>茶，作为中国的国饮，拥有超过5000年的历史。从神农尝百草到陆羽《茶经》，从唐代煮茶到宋代点茶，再到明清的泡茶，中国茶文化历经变迁，形成了独特而完整的体系。</p>
                <h3>中国六大茶类</h3>
                <ul>
                  <li>绿茶：如西湖龙井、碧螺春、黄山毛峰等，保留了茶叶的天然物质</li>
                  <li>红茶：如祁门红茶、滇红、正山小种等，全发酵茶，红汤红叶</li>
                  <li>青茶（乌龙茶）：如铁观音、大红袍、凤凰单枞等，介于绿茶和红茶之间的半发酵茶</li>
                  <li>白茶：如白毫银针、白牡丹等，微发酵茶，以芽尖为主</li>
                  <li>黄茶：如君山银针、蒙顶黄芽等，轻微发酵后形成特有的黄色</li>
                  <li>黑茶：如普洱茶、安化黑茶等，后发酵茶，越陈越香</li>
                </ul>
                <h3>茶文化体验</h3>
                <p>在中国旅行时，一定不要错过这些茶文化体验：</p>
                <ul>
                  <li>杭州龙井村：体验采茶、炒茶的乐趣</li>
                  <li>武夷山：探访"茶中状元"大红袍的原产地</li>
                  <li>昆明、普洱：了解普洱茶的制作工艺和收藏文化</li>
                  <li>广州：参观广州茶叶市场，体验岭南茶文化</li>
                </ul>
                <p>中国茶道讲究"和、静、怡、真"，品茶不仅是味觉的享受，更是身心的修行。在快节奏的现代生活中，沏一壶茶，品一份闲适，感受中国传统文化的魅力。</p>`,
        coverImage: '/images/tea-culture.jpg',
        category: 'culture',
        tags: ['Tea Culture', 'Traditional Culture', 'Cultural Experience'],
        publishDate: '2023-10-05T14:20:00Z',
        viewCount: 1860,
        author: 'Chen Mingxiang'
      },
      {
        id: 'article-4',
        title: 'Essential Mobile Apps for Traveling in China',
        summary: 'These must-have apps will help make your travel in China more convenient, from navigation to payment',
        content: `<p>在中国旅行，拥有合适的手机应用可以大大提升您的旅行体验。本文将为您推荐几款在中国旅行时必不可少的应用程序。</p>
                <h3>地图与导航</h3>
                <ul>
                  <li><strong>高德地图</strong>：中国最流行的导航应用之一，支持离线地图、实时公交信息</li>
                  <li><strong>百度地图</strong>：覆盖面广，提供详细的室内地图和景点导览</li>
                </ul>
                <h3>交通出行</h3>
                <ul>
                  <li><strong>滴滴出行</strong>：中国最大的打车平台，支持多种语言</li>
                  <li><strong>铁路12306</strong>：官方铁路售票应用，可查询时刻表、购买火车票</li>
                  <li><strong>航旅纵横</strong>：航班查询与管理应用，提供实时航班动态</li>
                </ul>
                <h3>支付工具</h3>
                <ul>
                  <li><strong>支付宝</strong>：中国主要移动支付平台，支持外国游客注册使用</li>
                  <li><strong>微信支付</strong>：另一主要支付平台，结合了社交功能</li>
                </ul>
                <h3>翻译与沟通</h3>
                <ul>
                  <li><strong>百度翻译</strong>：支持拍照翻译、语音翻译等功能</li>
                  <li><strong>微信</strong>：中国最流行的社交应用，几乎所有本地人都在使用</li>
                </ul>
                <h3>实用建议</h3>
                <p>1. 出发前下载并测试这些应用</p>
                <p>2. 考虑在中国使用当地SIM卡或租用移动WiFi设备</p>
                <p>3. 提前设置好VPN（如果您需要访问国际网站）</p>
                <p>4. 为支付宝或微信绑定国际信用卡</p>
                <p>这些应用将帮助您克服语言障碍，让您的中国之旅更加顺畅、便捷。祝您旅途愉快！</p>`,
        coverImage: '/images/travel-apps.jpg',
        category: 'travel-tips',
        tags: ['Travel Tips', 'Mobile Apps', 'Travel Planning'],
        publishDate: '2023-11-12T09:15:00Z',
        viewCount: 2150,
        author: 'Wang Tech'
      },
      {
        id: 'article-5',
        title: 'Chengdu 72-Hour Transit Visa-Free: A Journey of Food and Pandas',
        summary: 'Make use of Chengdu\'s 72-hour transit visa-free policy to experience the food culture of the Land of Abundance and adorable giant pandas',
        content: `<p>成都，这座有着2300多年历史的文化名城，是中国四川省的省会，也是中国西南地区的经济、文化中心。自2019年起，成都已实施144小时过境免签政策，为国际旅客提供了更加便利的旅行选择。</p>
                <h3>免签政策要点</h3>
                <ul>
                  <li>适用于53个国家的公民</li>
                  <li>须持有有效国际旅行证件和前往第三国（地区）的联程客票</li>
                  <li>可在成都市行政区域内停留不超过144小时</li>
                </ul>
                <h3>72小时行程推荐</h3>
                <p><strong>第一天：市区文化之旅</strong></p>
                <ul>
                  <li>上午：参观宽窄巷子，体验老成都的历史风貌</li>
                  <li>中午：在锦里品尝正宗四川火锅</li>
                  <li>下午：游览杜甫草堂，感受诗人的历史遗迹</li>
                  <li>晚上：欣赏川剧变脸表演</li>
                </ul>
                <p><strong>第二天：熊猫之旅</strong></p>
                <ul>
                  <li>全天：参观成都大熊猫繁育研究基地，近距离观察可爱的大熊猫</li>
                  <li>晚上：探索太古里，感受现代成都的时尚与活力</li>
                </ul>
                <p><strong>第三天：美食与购物</strong></p>
                <ul>
                  <li>上午：参加四川菜烹饪课，学习制作宫保鸡丁、回锅肉等经典川菜</li>
                  <li>下午：在春熙路购物，采购纪念品和特产</li>
                  <li>晚上：前往机场，结束愉快的成都之旅</li>
                </ul>
                <h3>实用建议</h3>
                <p>1. 提前规划行程，确保在规定时间内离境</p>
                <p>2. 携带现金和国际信用卡，尽管成都许多地方支持移动支付</p>
                <p>3. 学习几句简单的中文问候语，增进与当地人的交流</p>
                <p>成都的悠闲生活节奏、丰富的美食文化和可爱的大熊猫，一定会给您带来难忘的旅行体验！</p>`,
        coverImage: '/images/chengdu.jpg',
        category: 'visa-free',
        tags: ['Chengdu', 'Transit Visa-Free', 'Pandas', 'Sichuan Cuisine'],
        publishDate: '2023-12-01T11:30:00Z',
        viewCount: 1560,
        author: 'Li Rongcheng'
      }
    ];
    
    if (useLocalStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialArticles));
      return initialArticles;
    } else {
      try {
        // 将初始数据写入Firestore
        const articlesRef = collection(db, this.COLLECTION_NAME);
        
        // 使用Promise.all并行添加所有文章
        const articlePromises = initialArticles.map(async (article) => {
          const docRef = await addDoc(articlesRef, {
            ...article,
            publishDate: Timestamp.fromDate(new Date(article.publishDate))
          });
          return {
            ...article,
            id: docRef.id
          };
        });
        
        return await Promise.all(articlePromises);
      } catch (error) {
        console.error('Error seeding initial articles:', error);
        return initialArticles;
      }
    }
  }

  /**
   * 获取特定分类的最新文章
   * @param category 文章分类
   * @param limitCount 返回的文章数量
   * @returns 最新的文章列表
   */
  public async getLatestArticlesByCategory(category: string, limitCount = 3): Promise<Article[]> {
    try {
      console.log(`Fetching articles for category '${category}', limit: ${limitCount}`);
      
      if (useLocalStorage) {
        const articles = await this.getArticles();
        const filteredArticles = category 
          ? articles.filter(article => article.category === category)
          : articles;
          
        const sortedArticles = filteredArticles
          .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
          .slice(0, limitCount);
          
        console.log(`Retrieved ${sortedArticles.length} articles from local storage`);
        return sortedArticles;
      } else {
        // 从Firestore获取数据
        console.log('Fetching data from Firestore');
        const articlesCollection = collection(db, this.COLLECTION_NAME);
        let articlesQuery;
        
        if (category) {
          console.log(`Query condition: category = ${category}`);
          articlesQuery = firestoreQuery(
            articlesCollection, 
            where('category', '==', category),
            orderBy('publishDate', 'desc'), 
            limit(limitCount)
          );
        } else {
          articlesQuery = firestoreQuery(
            articlesCollection,
            orderBy('publishDate', 'desc'), 
            limit(limitCount)
          );
        }
          
        const snapshot = await getDocs(articlesQuery);
        console.log(`Query result: got ${snapshot.docs.length} records`);
        
        if (snapshot.empty) {
          console.log('Query result is empty');
          return [];
        }
          
        const results = snapshot.docs.map(doc => {
          const data = doc.data() as DocumentData;
          
          // 处理发布日期
          let publishDate = data.publishDate;
          if (data.publishDate instanceof Timestamp) {
            publishDate = data.publishDate.toDate().toISOString();
          }
          
          return {
            id: doc.id,
            title: data.title,
            summary: data.summary,
            content: data.content,
            coverImage: data.coverImage,
            category: data.category,
            tags: data.tags || [],
            publishDate: publishDate,
            viewCount: data.viewCount || 0,
            author: data.author
          } as Article;
        });
        
        console.log('Processed articles:', results);
        return results;
      }
    } catch (error) {
      console.error('Error getting latest articles:', error);
      return [];
    }
  }
}

export const articleService = new ArticleService(); 