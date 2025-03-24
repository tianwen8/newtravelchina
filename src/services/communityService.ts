// 使用Firebase Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 攻略文章接口
export interface TravelGuide {
  id?: string;
  title: string;
  content: string;
  coverImage: string;
  gallery: string[];
  destination: string;
  duration: string;
  budget: string;
  tips: string[];
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  publishDate: Date | number | Timestamp;
  likes: number;
  views: number;
  savedCount: number;
}

// 结伴同行接口
export interface TripBuddy {
  id?: string;
  title: string;
  description: string;
  destination: string;
  travelDate: Date | number | Timestamp;
  duration: string;
  expectedBudget: string;
  requirements: string;
  contactInfo: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  createdAt: Date | number | Timestamp;
  status: 'open' | 'closed';
  interestedUsers: InterestedUser[];
}

// 感兴趣的用户
interface InterestedUser {
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  date: Date | number | Timestamp;
}

// 用于初始化数据的模拟攻略数据
const mockTravelGuides: TravelGuide[] = [
  {
    id: 'guide001',
    title: '北京三日经典游攻略',
    content: `<p>北京是一座拥有悠久历史和丰富文化的城市，这份攻略将帮助你在三天内体验北京的精华。</p>
      <h2>第一天：故宫和天安门</h2>
      <p>早上参观天安门广场，然后游览故宫博物院。下午可以去景山公园俯瞰紫禁城全景。</p>
      <h2>第二天：长城之旅</h2>
      <p>建议前往慕田峪长城，人少景美，交通也较为便利。</p>
      <h2>第三天：胡同文化</h2>
      <p>游览南锣鼓巷，体验老北京胡同文化，品尝地道小吃。</p>`,
    coverImage: '/images/beijing-guide.jpg',
    gallery: ['/images/beijing-guide1.jpg', '/images/beijing-guide2.jpg'],
    destination: '北京',
    duration: '3天',
    budget: '2000-3000元',
    tips: ['避开节假日人流高峰', '故宫需要提前预约', '长城记得带足饮用水'],
    tags: ['北京', '故宫', '长城', '胡同'],
    authorId: 'user001',
    authorName: '旅行家小王',
    authorPhoto: '/images/avatars/user1.jpg',
    publishDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    likes: 156,
    views: 1890,
    savedCount: 45
  },
  {
    id: 'guide002',
    title: '上海美食一日游',
    content: `<p>上海是美食天堂，这份攻略将带你品尝上海的各种特色美食。</p>
      <h2>早餐：四大金刚</h2>
      <p>生煎、小笼包、烧卖和蟹壳黄是上海人喜爱的早餐。</p>
      <h2>午餐：本帮菜</h2>
      <p>红烧肉、松鼠桂鱼等经典上海本帮菜。</p>
      <h2>晚餐：外滩美食</h2>
      <p>在外滩附近的高级餐厅享用晚餐，同时欣赏夜景。</p>`,
    coverImage: '/images/shanghai-food.jpg',
    gallery: ['/images/food1.jpg', '/images/food2.jpg'],
    destination: '上海',
    duration: '1天',
    budget: '500-800元',
    tips: ['早餐建议去南京东路', '中午可以去老饭店', '晚上提前预约外滩餐厅'],
    tags: ['上海', '美食', '小吃', '本帮菜'],
    authorId: 'user002',
    authorName: '美食家小李',
    authorPhoto: '/images/avatars/user2.jpg',
    publishDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    likes: 204,
    views: 2150,
    savedCount: 67
  }
];

// 用于初始化数据的模拟结伴同行数据
const mockTripBuddies: TripBuddy[] = [
  {
    id: 'trip001',
    title: '寻找同伴一起去云南丽江',
    description: '计划国庆期间去云南丽江和大理，想找1-2个志同道合的伙伴一起同行。我是一个喜欢摄影和慢节奏旅行的人，不赶景点，更注重体验当地生活。',
    destination: '云南丽江、大理',
    travelDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后
    duration: '7天',
    expectedBudget: '5000-6000元',
    requirements: '喜欢摄影，不赶景点，能够接受徒步和住青旅',
    contactInfo: 'WeChat: traveler_zhang',
    authorId: 'user003',
    authorName: '张旅行家',
    authorPhoto: '/images/avatars/user3.jpg',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    status: 'open',
    interestedUsers: [
      {
        userId: 'user005',
        userName: '小王',
        userPhoto: '/images/avatars/user5.jpg',
        message: '我也喜欢摄影，正好那段时间有空，可以一起啊',
        date: Date.now() - 3 * 24 * 60 * 60 * 1000
      }
    ]
  },
  {
    id: 'trip002',
    title: '西藏拉萨徒步旅行',
    description: '计划明年5月去西藏拉萨，徒步走川藏线，寻找2-3位身体素质好、有高原经验的伙伴同行。全程约15天，会经过很多美丽的风景，但也有一定难度。',
    destination: '西藏拉萨',
    travelDate: Date.now() + 180 * 24 * 60 * 60 * 1000, // 半年后
    duration: '15天',
    expectedBudget: '10000-15000元',
    requirements: '有高原经验，身体素质好，有长途徒步经验',
    contactInfo: 'Email: tibet_hiker@example.com',
    authorId: 'user004',
    authorName: '高原徒步者',
    authorPhoto: '/images/avatars/user4.jpg',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    status: 'open',
    interestedUsers: []
  }
];

// 集合名称
const GUIDES_COLLECTION = 'travel_guides';
const TRIP_BUDDIES_COLLECTION = 'trip_buddies';

// 生成ID
function generateId(prefix: string): string {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// 初始化数据
async function initializeData() {
  try {
    // 检查指南集合是否为空
    const guidesRef = collection(db, GUIDES_COLLECTION);
    const guidesSnapshot = await getDocs(guidesRef);
    
    // 如果是空的，添加初始数据
    if (guidesSnapshot.empty) {
      for (const guide of mockTravelGuides) {
        await addDoc(collection(db, GUIDES_COLLECTION), {
          ...guide,
          publishDate: Timestamp.fromMillis(Number(guide.publishDate))
        });
      }
      console.log('初始化旅行指南数据');
    }
    
    // 检查结伴同行集合是否为空
    const buddiesRef = collection(db, TRIP_BUDDIES_COLLECTION);
    const buddiesSnapshot = await getDocs(buddiesRef);
    
    // 如果是空的，添加初始数据
    if (buddiesSnapshot.empty) {
      for (const buddy of mockTripBuddies) {
        await addDoc(collection(db, TRIP_BUDDIES_COLLECTION), {
          ...buddy,
          travelDate: Timestamp.fromMillis(Number(buddy.travelDate)),
          createdAt: Timestamp.fromMillis(Number(buddy.createdAt)),
          interestedUsers: buddy.interestedUsers.map(user => ({
            ...user,
            date: Timestamp.fromMillis(Number(user.date))
          }))
        });
      }
      console.log('初始化结伴同行数据');
    }
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
}

// 尝试初始化数据
initializeData();

// 旅行攻略服务
export const travelGuideService = {
  // 发布攻略
  async createGuide(guideData: Omit<TravelGuide, 'id' | 'likes' | 'views' | 'savedCount' | 'publishDate'>): Promise<TravelGuide> {
    try {
      const newGuideData = {
        ...guideData,
        publishDate: serverTimestamp(),
        likes: 0,
        views: 0,
        savedCount: 0
      };
      
      const docRef = await addDoc(collection(db, GUIDES_COLLECTION), newGuideData);
      
      return {
        ...newGuideData,
        id: docRef.id,
        publishDate: new Date()
      };
    } catch (error) {
      console.error('发布攻略失败:', error);
      throw error;
    }
  },

  // 获取热门攻略
  async getPopularGuides(limitCount = 5): Promise<TravelGuide[]> {
    try {
      const guidesRef = collection(db, GUIDES_COLLECTION);
      const q = query(guidesRef, orderBy('likes', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          publishDate: data.publishDate instanceof Timestamp 
            ? data.publishDate.toDate() 
            : data.publishDate
        } as TravelGuide;
      });
    } catch (error) {
      console.error('获取热门攻略失败:', error);
      return [];
    }
  },

  // 获取特定目的地的攻略
  async getGuidesByDestination(destination: string, limitCount = 10): Promise<TravelGuide[]> {
    try {
      const guidesRef = collection(db, GUIDES_COLLECTION);
      const q = query(
        guidesRef, 
        where('destination', '==', destination),
        orderBy('publishDate', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          publishDate: data.publishDate instanceof Timestamp 
            ? data.publishDate.toDate() 
            : data.publishDate
        } as TravelGuide;
      });
    } catch (error) {
      console.error(`获取${destination}攻略失败:`, error);
      return [];
    }
  },

  // 获取攻略详情
  async getGuideById(guideId: string): Promise<TravelGuide | null> {
    try {
      const docRef = doc(db, GUIDES_COLLECTION, guideId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      // 增加浏览量
      await updateDoc(docRef, {
        views: increment(1)
      });
      
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        publishDate: data.publishDate instanceof Timestamp 
          ? data.publishDate.toDate() 
          : data.publishDate
      } as TravelGuide;
    } catch (error) {
      console.error('获取攻略详情失败:', error);
      return null;
    }
  },

  // 点赞攻略
  async likeGuide(guideId: string): Promise<boolean> {
    try {
      const docRef = doc(db, GUIDES_COLLECTION, guideId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }
      
      await updateDoc(docRef, {
        likes: increment(1)
      });
      
      return true;
    } catch (error) {
      console.error('点赞攻略失败:', error);
      return false;
    }
  }
};

// 结伴同行服务
export const tripBuddyService = {
  // 发布结伴请求
  async createTripBuddyPost(postData: Omit<TripBuddy, 'id' | 'createdAt' | 'status' | 'interestedUsers' | 'authorId' | 'authorName' | 'authorPhoto'>): Promise<TripBuddy> {
    try {
      // 获取当前用户信息 (实际应用中应从auth获取)
      const currentUser = {
        id: 'current-user',
        displayName: '当前用户',
        photoURL: '/images/avatars/default.jpg',
      };
      
      const newBuddyData = {
        ...postData,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        authorPhoto: currentUser.photoURL,
        createdAt: serverTimestamp(),
        status: 'open',
        interestedUsers: [],
        travelDate: Timestamp.fromMillis(Number(postData.travelDate))
      };
      
      const docRef = await addDoc(collection(db, TRIP_BUDDIES_COLLECTION), newBuddyData);
      
      return {
        ...newBuddyData,
        id: docRef.id,
        createdAt: new Date()
      } as TripBuddy;
    } catch (error) {
      console.error('发布结伴请求失败:', error);
      throw error;
    }
  },
  
  // 表达结伴兴趣
  async expressInterest(postId: string, message: string): Promise<boolean> {
    try {
      // 获取当前用户信息 (实际应用中应从auth获取)
      const currentUser = {
        id: 'current-user',
        displayName: '当前用户',
        photoURL: '/images/avatars/default.jpg',
      };
      
      const tripRef = doc(db, TRIP_BUDDIES_COLLECTION, postId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists() || tripSnap.data().status !== 'open') {
        return false;
      }
      
      const tripData = tripSnap.data();
      const interestedUsers = tripData.interestedUsers || [];
      
      // 检查是否已经表达过兴趣
      if (interestedUsers.some((user: InterestedUser) => user.userId === currentUser.id)) {
        return false;
      }
      
      const newInterestedUser = {
        userId: currentUser.id,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        message: message,
        date: serverTimestamp()
      };
      
      await updateDoc(tripRef, {
        interestedUsers: [...interestedUsers, newInterestedUser]
      });
      
      return true;
    } catch (error) {
      console.error('表达结伴兴趣失败:', error);
      return false;
    }
  },
  
  // 取消结伴兴趣
  async cancelInterest(postId: string): Promise<boolean> {
    try {
      // 获取当前用户ID (实际应用中应从auth获取)
      const currentUserId = 'current-user';
      
      const tripRef = doc(db, TRIP_BUDDIES_COLLECTION, postId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        return false;
      }
      
      const tripData = tripSnap.data();
      const interestedUsers = tripData.interestedUsers || [];
      
      const updatedUsers = interestedUsers.filter(
        (user: InterestedUser) => user.userId !== currentUserId
      );
      
      await updateDoc(tripRef, {
        interestedUsers: updatedUsers
      });
      
      return true;
    } catch (error) {
      console.error('取消结伴兴趣失败:', error);
      return false;
    }
  },
  
  // 获取活跃的结伴请求
  async getActiveTripBuddyPosts(limitCount = 10): Promise<TripBuddy[]> {
    try {
      const currentDate = new Date();
      const tripsRef = collection(db, TRIP_BUDDIES_COLLECTION);
      
      const q = query(
        tripsRef,
        where('status', '==', 'open'),
        where('travelDate', '>', currentDate),
        orderBy('travelDate', 'asc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          travelDate: data.travelDate instanceof Timestamp 
            ? data.travelDate.toDate() 
            : data.travelDate,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : data.createdAt,
          interestedUsers: data.interestedUsers.map((user: any) => ({
            ...user,
            date: user.date instanceof Timestamp 
              ? user.date.toDate() 
              : user.date
          }))
        } as TripBuddy;
      });
    } catch (error) {
      console.error('获取活跃结伴请求失败:', error);
      return [];
    }
  },
  
  // 获取结伴请求详情
  async getTripBuddyById(tripId: string): Promise<TripBuddy | null> {
    try {
      const tripRef = doc(db, TRIP_BUDDIES_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        return null;
      }
      
      const data = tripSnap.data();
      
      return {
        ...data,
        id: tripSnap.id,
        travelDate: data.travelDate instanceof Timestamp 
          ? data.travelDate.toDate() 
          : data.travelDate,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt,
        interestedUsers: data.interestedUsers.map((user: any) => ({
          ...user,
          date: user.date instanceof Timestamp 
            ? user.date.toDate() 
            : user.date
        }))
      } as TripBuddy;
    } catch (error) {
      console.error('获取结伴请求详情失败:', error);
      return null;
    }
  },
  
  // 关闭结伴请求
  async closeTripBuddyPost(tripId: string): Promise<boolean> {
    try {
      const tripRef = doc(db, TRIP_BUDDIES_COLLECTION, tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        return false;
      }
      
      await updateDoc(tripRef, {
        status: 'closed'
      });
      
      return true;
    } catch (error) {
      console.error('关闭结伴请求失败:', error);
      return false;
    }
  }
}; 