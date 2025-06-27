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

// Article categories
export const ARTICLE_CATEGORIES = [
  { id: 'visa-free', name: 'Visa-Free Policy' },
  { id: 'attractions', name: 'Attractions' },
  { id: 'culture', name: 'Chinese Culture' },
  { id: 'travel-tips', name: 'Travel Tips' },
];

// Article interface
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

  // Get all articles
  private async getArticles(): Promise<Article[]> {
    if (useLocalStorage) {
      // 首先尝试从JSON文件加载
      try {
        const response = await fetch('/data/articles.json');
        if (response.ok) {
          const data = await response.json();
          return data.articles.map((article: any) => ({
            ...article,
            publishDate: article.publishDate || new Date().toISOString()
          }));
        }
      } catch (error) {
        console.log('JSON文件不存在，使用localStorage作为备份');
      }
      
      // 如果JSON文件不可用，回退到localStorage
      const articlesJson = localStorage.getItem(this.STORAGE_KEY);
      if (!articlesJson) return this.seedInitialArticles();
      return JSON.parse(articlesJson);
    } else {
      try {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const snapshot = await getDocs(articlesRef);
        
        // If collection is empty, initialize data
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

  // Save all articles
  private saveArticles(articles: Article[]): void {
    if (useLocalStorage) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    }
    // Firebase doesn't need this method as each article is saved individually
  }

  // Generate random ID
  private generateId(): string {
    return 'article_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Save new article
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

  // Upload article image
  public async uploadArticleImage(file: File): Promise<string> {
    if (useLocalStorage) {
      // 本地存储模式：将文件转换为data URL或使用现有图片
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // 实际应用中，您需要将图片保存到 public/images/ 目录
          // 这里返回一个占位符URL，您需要手动将图片放到public/images/目录
          const fileName = `uploaded_${Date.now()}_${file.name}`;
          console.log('请将上传的图片保存到:', `public/images/${fileName}`);
          resolve(`/images/${fileName}`);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
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

  // Get featured articles
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

  // Get articles by category
  public async getArticlesByCategory(category: string, page = 1, pageSize = 10): Promise<Article[]> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const filteredArticles = category
        ? articles.filter(article => article.category === category)
        : articles;
      
      // Sort by publish date (latest first)
      const sortedArticles = filteredArticles.sort(
        (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
      
      // Simple pagination
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
        
        // Manual pagination (Firestore needs paid plan to support offset pagination)
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

  // Get article by ID
  public async getArticleById(articleId: string): Promise<Article> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const article = articles.find(a => a.id === articleId);
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      return article;
    } else {
      try {
        const articleRef = doc(db, this.COLLECTION_NAME, articleId);
        const articleDoc = await getDoc(articleRef);
        
        if (!articleDoc.exists()) {
          throw new Error('Article not found');
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

  // Record article view count
  public async recordView(articleId: string): Promise<void> {
    if (useLocalStorage) {
      const articles = await this.getArticles();
      const articleIndex = articles.findIndex(a => a.id === articleId);
      
      if (articleIndex !== -1) {
        articles[articleIndex].viewCount += 1;
        this.saveArticles(articles);
        
        // Also record user view history here
        this.recordUserView(articleId);
      }
    } else {
      try {
        const articleRef = doc(db, this.COLLECTION_NAME, articleId);
        await updateDoc(articleRef, {
          viewCount: increment(1)
        });
        
        // Record user view history
        this.recordUserView(articleId);
      } catch (error) {
        console.error('Error recording view:', error);
      }
    }
  }

  // Record user view history
  private recordUserView(articleId: string): void {
    if (useLocalStorage) {
      const viewsJson = localStorage.getItem(this.VIEWS_KEY);
      const views = viewsJson ? JSON.parse(viewsJson) : [];
      
      // Add to viewed list (may need to deduplicate)
      views.unshift({
        articleId,
        timestamp: new Date().toISOString()
      });
      
      // Only keep recent 30 records
      const recentViews = views.slice(0, 30);
      localStorage.setItem(this.VIEWS_KEY, JSON.stringify(recentViews));
    } else {
      // In actual application, this should use user's UID
      // For now, we're just simulating, not associating with specific user
      try {
        const viewsRef = collection(db, this.USER_VIEWS_COLLECTION);
        addDoc(viewsRef, {
          articleId,
          timestamp: serverTimestamp(),
          // userId: currentUser?.uid // If there's a logged-in user
        });
      } catch (error) {
        console.error('Error recording user view:', error);
      }
    }
  }

  // Get related articles
  public async getRelatedArticles(articleId: string, limitCount = 3): Promise<Article[]> {
    try {
      const currentArticle = await this.getArticleById(articleId);
      
      if (useLocalStorage) {
        const articles = await this.getArticles();
        return articles
          .filter(article => 
            article.id !== articleId && article.category === currentArticle.category
          )
          .sort(() => Math.random() - 0.5) // Random sort
          .slice(0, limitCount);
      } else {
        const articlesRef = collection(db, this.COLLECTION_NAME);
        const q = firestoreQuery(
          articlesRef,
          where('category', '==', currentArticle.category),
          where('__name__', '!=', articleId),
          firestoreLimit(limitCount + 5) // Get a few more, so we can randomly select
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
        
        // Random sort and limit count
        return relatedArticles
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(limitCount, relatedArticles.length));
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  }

  // Generate initial article data
  private async seedInitialArticles(): Promise<Article[]> {
    const initialArticles: Article[] = [
      {
        id: 'article-1',
        title: 'Exploring Beijing: Ancient Hutongs and Modern Architecture',
        summary: 'A journey through time, from old Beijing hutongs to modern architectural marvels like the Bird\'s Nest and Water Cube',
        content: `<p>Beijing, a city with 3,000 years of history, is the political and cultural center of China. Here, ancient and modern coexist, tradition and innovation blend.</p>
                <p>Hutongs are the basic units of old Beijing's urban fabric and carriers of Beijing's traditional culture. These narrow alleys, usually formed by the walls of siheyuan (courtyard houses), still maintain the leisurely lifestyle of the past. Areas like Nanluoguxiang, Yandai Xiejie, and Wudaoying Hutong have become popular spots for tourists and locals to wander and relax.</p>
                <p>Meanwhile, modern architectural complexes marked by Olympic venues, such as the Bird's Nest (National Stadium), Water Cube (National Aquatics Center), and the National Center for the Performing Arts (egg-shaped building), showcase contemporary Chinese innovative design and architectural technology.</p>
                <h3>Recommended Itinerary</h3>
                <ul>
                  <li>Morning: Visit traditional attractions like Tiananmen Square and the Forbidden City</li>
                  <li>Noon: Enjoy authentic Beijing cuisine at Gui Street or Qianmen Street</li>
                  <li>Afternoon: Stroll through Nanluoguxiang and experience traditional hutong culture</li>
                  <li>Evening: Visit the Olympic Park to admire the night view of the Bird's Nest and Water Cube</li>
                </ul>
                <p>Whether you are a history enthusiast or a modern art pursuer, Beijing can satisfy your curiosity. The charm of this city lies in how it skillfully integrates its long history with modern vitality.</p>`,
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
        content: `<p>Since 2019, China has further expanded the applicable scope of the 144-hour transit visa-free policy, now covering major cities and regions including Beijing, Shanghai, Guangzhou, Chengdu, and more. This policy provides great convenience for short-term visits to China.</p>
                <h3>Key Policy Points</h3>
                <ul>
                  <li>Applicable to citizens of 53 countries, including the United States, Canada, United Kingdom, Australia, etc.</li>
                  <li>Maximum stay of 144 hours (6 days)</li>
                  <li>Must have a confirmed ticket to a third country (region)</li>
                  <li>Activities within specified administrative areas</li>
                </ul>
                <h3>Application Process</h3>
                <p>1. After arriving at a Chinese port of entry, proceed to immigration</p>
                <p>2. Fill out the "Foreigner Entry Application Form" and apply for "Transit Visa-Free Stay"</p>
                <p>3. Provide a valid passport and confirmed ticket to a third country within 72 hours</p>
                <p>4. After verification, immigration officers will stamp your passport indicating the allowed stay duration</p>
                <h3>Applicable Cities and Activity Ranges</h3>
                <p>Activity ranges differ by region:</p>
                <ul>
                  <li>Beijing-Tianjin-Hebei Area: Beijing, Tianjin, and cities in Hebei Province including Shijiazhuang, Qinhuangdao, Tangshan, Langfang, Baoding, etc.</li>
                  <li>Yangtze River Delta Area: Shanghai, cities in Jiangsu Province like Nanjing, Suzhou, Wuxi, and cities in Zhejiang Province like Hangzhou, Ningbo, etc.</li>
                  <li>Greater Bay Area: Cities in Guangdong Province such as Guangzhou, Shenzhen, Zhuhai, etc.</li>
                </ul>
                <p>This policy provides convenience for short-term business travel, tourism, and family visits, but please be sure to calculate your time properly to ensure departure within the allowed period.</p>`,
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
        content: `<p>Tea, as China's national drink, has a history of over 5,000 years. From Shennong tasting a hundred herbs to Lu Yu's "Tea Classic," from Tang Dynasty's tea boiling to Song Dynasty's whisked tea, to Ming and Qing Dynasties' steeped tea, Chinese tea culture has evolved through changes, forming a unique and complete system.</p>
                <h3>Six Major Tea Categories in China</h3>
                <ul>
                  <li>Green Tea: Such as West Lake Longjing, Biluochun, Huangshan Maofeng, which preserve the natural substances of tea leaves</li>
                  <li>Black Tea: Such as Qimen black tea, Dianhong, Zhengshan Xiaozhong, fully fermented tea with red soup and red leaves</li>
                  <li>Oolong Tea: Such as Tieguanyin, Da Hong Pao, Phoenix Dancong, semi-fermented tea between green tea and black tea</li>
                  <li>White Tea: Such as White Hair Silver Needle, White Peony, slightly fermented tea, mainly buds</li>
                  <li>Yellow Tea: Such as Junshan Silver Needle, Mengding Yellow Bud, forming a unique yellow color after slight fermentation</li>
                  <li>Dark Tea: Such as Pu'er tea, Anhua dark tea, post-fermented tea that gets better with age</li>
                </ul>
                <h3>Tea Culture Experiences</h3>
                <p>When traveling in China, don't miss these tea culture experiences:</p>
                <ul>
                  <li>Longjing Village in Hangzhou: Experience the fun of picking and frying tea</li>
                  <li>Wuyi Mountain: Visit the origin of Da Hong Pao, the "champion of teas"</li>
                  <li>Kunming, Pu'er: Learn about Pu'er tea production and collection culture</li>
                  <li>Guangzhou: Visit Guangzhou tea market and experience Lingnan tea culture</li>
                </ul>
                <p>Chinese tea ceremony emphasizes "harmony, tranquility, enjoyment, and authenticity." Drinking tea is not only a gustatory pleasure but also a spiritual practice. In the fast-paced modern life, brewing a pot of tea and enjoying a leisure moment allows you to experience the charm of traditional Chinese culture.</p>`,
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
        content: `<p>Having the right mobile applications can greatly enhance your travel experience in China. This article will recommend several essential apps for traveling in China.</p>
                <h3>Maps and Navigation</h3>
                <ul>
                  <li><strong>Amap (Gaode Maps)</strong>: One of China's most popular navigation apps, supporting offline maps and real-time public transit information</li>
                  <li><strong>Baidu Maps</strong>: Offers wide coverage, providing detailed indoor maps and attraction guides</li>
                </ul>
                <h3>Transportation</h3>
                <ul>
                  <li><strong>DiDi</strong>: China's largest ride-hailing platform, supporting multiple languages</li>
                  <li><strong>China Railway 12306</strong>: Official railway ticketing app, for checking timetables and purchasing train tickets</li>
                  <li><strong>Umetrip</strong>: Flight query and management app, providing real-time flight status</li>
                </ul>
                <h3>Payment Tools</h3>
                <ul>
                  <li><strong>Alipay</strong>: China's major mobile payment platform, accessible to foreign tourists with registration</li>
                  <li><strong>WeChat Pay</strong>: Another major payment platform, integrated with social functions</li>
                </ul>
                <h3>Translation and Communication</h3>
                <ul>
                  <li><strong>Baidu Translate</strong>: Supports photo translation, voice translation, and other functions</li>
                  <li><strong>WeChat</strong>: China's most popular social app, used by almost all locals</li>
                </ul>
                <h3>Practical Advice</h3>
                <p>1. Download and test these apps before departure</p>
                <p>2. Consider using a local SIM card or renting a mobile WiFi device in China</p>
                <p>3. Set up a VPN in advance (if you need to access international websites)</p>
                <p>4. Link an international credit card to Alipay or WeChat</p>
                <p>These apps will help you overcome language barriers and make your journey in China smoother and more convenient. Have a pleasant trip!</p>`,
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
        content: `<p>Chengdu, a cultural city with over 2,300 years of history, is the capital of Sichuan Province and the economic and cultural center of Southwest China. Since 2019, Chengdu has implemented the 144-hour transit visa-free policy, providing international travelers with a more convenient travel option.</p>
                <h3>Visa-Free Policy Key Points</h3>
                <ul>
                  <li>Applicable to citizens of 53 countries</li>
                  <li>Must hold valid international travel documents and connecting tickets to a third country (region)</li>
                  <li>Can stay within Chengdu's administrative area for no more than 144 hours</li>
                </ul>
                <h3>72-Hour Itinerary Recommendation</h3>
                <p><strong>Day One: Urban Cultural Tour</strong></p>
                <ul>
                  <li>Morning: Visit Wide and Narrow Alleys to experience the historical style of old Chengdu</li>
                  <li>Noon: Taste authentic Sichuan hotpot at Jinli</li>
                  <li>Afternoon: Tour Du Fu Thatched Cottage and experience the poet's historical site</li>
                  <li>Evening: Enjoy a Sichuan opera face-changing performance</li>
                </ul>
                <p><strong>Day Two: Panda Tour</strong></p>
                <ul>
                  <li>Full day: Visit the Chengdu Research Base of Giant Panda Breeding to observe adorable giant pandas up close</li>
                  <li>Evening: Explore Taikoo Li and experience the fashion and vitality of modern Chengdu</li>
                </ul>
                <p><strong>Day Three: Food and Shopping</strong></p>
                <ul>
                  <li>Morning: Take a Sichuan cuisine cooking class, learn to make classic Sichuan dishes like Kung Pao Chicken and Twice-Cooked Pork</li>
                  <li>Afternoon: Shop on Chunxi Road for souvenirs and local products</li>
                  <li>Evening: Head to the airport, concluding your pleasant Chengdu journey</li>
                </ul>
                <h3>Practical Tips</h3>
                <p>1. Plan your itinerary in advance to ensure departure within the specified time</p>
                <p>2. Carry cash and international credit cards, although many places in Chengdu support mobile payments</p>
                <p>3. Learn a few simple Chinese greeting phrases to enhance communication with locals</p>
                <p>Chengdu's leisurely lifestyle, rich food culture, and adorable giant pandas will surely bring you an unforgettable travel experience!</p>`,
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
        // Write initial data to Firestore
        const articlesRef = collection(db, this.COLLECTION_NAME);
        
        // Use Promise.all to parallel add all articles
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
   * Get the latest articles for a specific category
   * @param category Article category
   * @param limitCount Number of articles to return
   * @returns List of latest articles
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
        // Fetch data from Firestore
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
          
          // Process publish date
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