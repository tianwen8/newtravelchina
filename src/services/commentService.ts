import { 
  collection, 
  doc,
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit, 
  increment,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 评论类型定义
export interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  timestamp: number | Date | Timestamp;
  featured?: boolean;
  likes?: number;
  tags?: string[];
  imageUrl?: string;
}

// 集合名称
const COMMENTS_COLLECTION = 'comments';

class CommentService {
  private initialized = false;

  constructor() {
    // 初始化时自动检查集合
    this.checkAndInitializeCollection();
  }

  // 检查并初始化集合
  private async checkAndInitializeCollection(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 尝试初始化集合和数据
      await this.seedInitialComments();
      this.initialized = true;
      console.log('评论集合已检查并初始化');
    } catch (error) {
      console.error('初始化评论集合失败:', error);
    }
  }

  // 获取所有评论
  async getComments(): Promise<Comment[]> {
    // 确保集合已初始化
    await this.checkAndInitializeCollection();

    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const q = query(commentsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toMillis() 
            : data.timestamp
        } as Comment;
      });
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  }
  
  // 添加新评论
  async addComment(commentData: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'featured'>): Promise<Comment> {
    try {
      await this.checkAndInitializeCollection();
      
      if (useLocalStorage) {
        // 本地存储模式的处理逻辑
        // 获取现有评论
        const comments = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]') as Comment[];
        
        // 创建新评论
        const newComment: Comment = {
          id: 'comment-' + Date.now(),
          ...commentData,
          timestamp: Date.now(),
          likes: 0,
          featured: false
        };
        
        // 添加到数组并保存
        comments.unshift(newComment);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(comments));
        
        return newComment;
      } else {
        // Firestore模式
        // 创建新评论
        const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
          ...commentData,
          timestamp: serverTimestamp(),
          likes: 0,
          featured: false
        });
        
        // 获取新创建的评论的ID
        return {
          id: commentRef.id,
          ...commentData,
          timestamp: new Date(),
          likes: 0,
          featured: false
        };
      }
    } catch (error) {
      console.error('添加评论时出错:', error);
      throw error;
    }
  }
  
  // 点赞评论
  async likeComment(commentId: string): Promise<boolean> {
    // 确保集合已初始化
    await this.checkAndInitializeCollection();

    try {
      const docRef = doc(db, COMMENTS_COLLECTION, commentId);
      await updateDoc(docRef, {
        likes: increment(1)
      });
      
      return true;
    } catch (error) {
      console.error('点赞评论失败:', error);
      return false;
    }
  }
  
  // 获取特定标签的评论
  async getCommentsByTag(tag: string): Promise<Comment[]> {
    // 确保集合已初始化
    await this.checkAndInitializeCollection();

    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const q = query(
        commentsRef,
        where('tags', 'array-contains', tag),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toMillis() 
            : data.timestamp
        } as Comment;
      });
    } catch (error) {
      console.error(`获取标签为${tag}的评论失败:`, error);
      return [];
    }
  }
  
  // 获取精选评论
  async getFeaturedComments(limitCount = 3): Promise<Comment[]> {
    // 确保集合已初始化
    await this.checkAndInitializeCollection();

    try {
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const q = query(
        commentsRef,
        where('featured', '==', true),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toMillis() 
            : data.timestamp
        } as Comment;
      });
    } catch (error) {
      console.error('获取精选评论失败:', error);
      return [];
    }
  }
  
  // 搜索评论
  async searchComments(searchTerm: string): Promise<Comment[]> {
    // 确保集合已初始化
    await this.checkAndInitializeCollection();

    try {
      // Firestore不支持全文搜索，所以我们获取所有评论并在客户端过滤
      const comments = await this.getComments();
      const term = searchTerm.toLowerCase();
      
      return comments.filter(
        comment => 
          comment.content.toLowerCase().includes(term) || 
          comment.name.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('搜索评论失败:', error);
      return [];
    }
  }
  
  // 初始化示例评论
  async seedInitialComments(): Promise<void> {
    try {
      // 检查集合是否存在
      const commentsRef = collection(db, COMMENTS_COLLECTION);
      const snapshot = await getDocs(commentsRef);
      
      // 如果已经有评论，不进行初始化
      if (!snapshot.empty) {
        console.log('评论集合已存在，包含数据');
        return;
      }
      
      console.log('开始初始化评论集合...');
      
      // 添加第一条测试评论（即使集合不存在也会创建）
      try {
        const testComment = {
          name: "系统测试",
          email: "system@example.com",
          content: "这是一条测试评论，用于初始化评论集合。",
          timestamp: Timestamp.fromDate(new Date()),
          likes: 0,
          featured: false,
          tags: ["test"]
        };
        
        await addDoc(collection(db, COMMENTS_COLLECTION), testComment);
        console.log('成功添加测试评论，集合已创建');
      } catch (error) {
        console.error('创建评论集合失败:', error);
        throw error;
      }
      
      // 添加其他示例评论
      const initialComments = [
        {
          name: "李明",
          email: "liming@example.com",
          content: "我去年去了北京，故宫真的很壮观！推荐大家参观前做好功课，了解一些历史背景会让体验更加丰富。",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          likes: 12,
          featured: true,
          tags: ["beijing", "tips"]
        },
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          content: "我刚从上海回来，外滩的夜景太美了！不过要注意酒店预订，旅游旺季价格会很高。",
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          likes: 8,
          featured: true,
          tags: ["shanghai", "accommodation"]
        },
        {
          name: "王小华",
          email: "xiaohua@example.com",
          content: "成都的火锅真的很赞！不过如果不能吃辣，一定要提前告诉服务员，他们可以准备鸳鸯锅。",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          likes: 15,
          featured: true,
          tags: ["chengdu", "food"]
        },
        {
          name: "张旅行",
          email: "travel@example.com",
          content: "西安的兵马俑是必去的景点，建议请一个导游，能了解更多历史知识。临潼区的华清池也很值得一去。",
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          likes: 9,
          featured: false,
          tags: ["xian", "tips"]
        },
        {
          name: "Mike Chen",
          email: "mike@example.com",
          content: "广州的早茶文化很特别，一定要去尝尝正宗的广式点心。沙面岛也是拍照的好地方。",
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          likes: 7,
          featured: false,
          tags: ["food", "tips"]
        }
      ];
      
      // 添加初始评论
      for (const comment of initialComments) {
        await addDoc(collection(db, COMMENTS_COLLECTION), {
          ...comment,
          timestamp: Timestamp.fromDate(comment.timestamp as Date)
        });
      }
      
      console.log('初始评论数据已添加完成');
    } catch (error) {
      console.error('初始化评论失败:', error);
      throw error;
    }
  }
}

export const commentService = new CommentService(); 