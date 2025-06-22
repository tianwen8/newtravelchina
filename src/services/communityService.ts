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

// Mock travel guide data for initialization
const mockTravelGuides: TravelGuide[] = [
  {
    id: 'guide001',
    title: 'Beijing 3-Day Classic Tour Guide',
    content: `<p>Beijing is a city with a long history and rich culture. This guide will help you experience the essence of Beijing in three days.</p>
      <h2>Day 1: Forbidden City and Tiananmen</h2>
      <p>Visit Tiananmen Square in the morning, then tour the Forbidden City. In the afternoon, you can go to Jingshan Park to overlook the panoramic view of the Forbidden City.</p>
      <h2>Day 2: Great Wall Journey</h2>
      <p>Recommend visiting Mutianyu Great Wall, with fewer crowds, beautiful scenery, and convenient transportation.</p>
      <h2>Day 3: Hutong Culture</h2>
      <p>Visit Nanluoguxiang, experience old Beijing hutong culture, and taste authentic local snacks.</p>`,
    coverImage: '/images/beijing-guide.jpg',
    gallery: ['/images/beijing-guide1.jpg', '/images/beijing-guide2.jpg'],
    destination: 'Beijing',
    duration: '3 days',
    budget: '$300-450',
    tips: ['Avoid holiday crowds', 'Forbidden City requires advance booking', 'Bring enough water for the Great Wall'],
    tags: ['Beijing', 'Forbidden City', 'Great Wall', 'Hutong'],
    authorId: 'user001',
    authorName: 'Travel Expert Wang',
    authorPhoto: '/images/avatars/user1.jpg',
    publishDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    likes: 156,
    views: 1890,
    savedCount: 45
  },
  {
    id: 'guide002',
    title: 'Shanghai Food One-Day Tour',
    content: `<p>Shanghai is a food paradise. This guide will take you to taste various specialty foods of Shanghai.</p>
      <h2>Breakfast: Four Golden Classics</h2>
      <p>Pan-fried buns, xiaolongbao, shumai, and crab shell pastry are favorite breakfast foods of Shanghai people.</p>
      <h2>Lunch: Shanghai Cuisine</h2>
      <p>Red-braised pork, sweet and sour mandarin fish and other classic Shanghai local dishes.</p>
      <h2>Dinner: Bund Cuisine</h2>
      <p>Enjoy dinner at high-end restaurants near the Bund while admiring the night view.</p>`,
    coverImage: '/images/shanghai-food.jpg',
    gallery: ['/images/food1.jpg', '/images/food2.jpg'],
    destination: 'Shanghai',
    duration: '1 day',
    budget: '$70-120',
    tips: ['Recommend Nanjing East Road for breakfast', 'Try old restaurants for lunch', 'Book Bund restaurants in advance for dinner'],
    tags: ['Shanghai', 'Food', 'Snacks', 'Local Cuisine'],
    authorId: 'user002',
    authorName: 'Food Expert Li',
    authorPhoto: '/images/avatars/user2.jpg',
    publishDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    likes: 204,
    views: 2150,
    savedCount: 67
  }
];

// Mock trip buddy data for initialization
const mockTripBuddies: TripBuddy[] = [
  {
    id: 'trip001',
    title: 'Looking for travel companions to Yunnan Lijiang',
    description: 'Planning to visit Yunnan Lijiang and Dali during National Day holiday, looking for 1-2 like-minded companions to travel together. I am someone who enjoys photography and slow-paced travel, not rushing through attractions, focusing more on experiencing local life.',
    destination: 'Yunnan Lijiang, Dali',
    travelDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days later
    duration: '7 days',
    expectedBudget: '$700-850',
    requirements: 'Enjoy photography, not rushing attractions, able to accept hiking and staying in hostels',
    contactInfo: 'WeChat: traveler_zhang',
    authorId: 'user003',
    authorName: 'Traveler Zhang',
    authorPhoto: '/images/avatars/user3.jpg',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    status: 'open',
    interestedUsers: [
      {
        userId: 'user005',
        userName: 'Wang',
        userPhoto: '/images/avatars/user5.jpg',
        message: 'I also love photography and happen to be free during that time, would love to join',
        date: Date.now() - 3 * 24 * 60 * 60 * 1000
      }
    ]
  },
  {
    id: 'trip002',
    title: 'Tibet Lhasa Hiking Trip',
    description: 'Planning to go to Tibet Lhasa next May, hiking the Sichuan-Tibet route, looking for 2-3 companions with good physical fitness and high-altitude experience. The whole journey takes about 15 days, will pass through many beautiful sceneries, but also has certain difficulties.',
    destination: 'Tibet Lhasa',
    travelDate: Date.now() + 180 * 24 * 60 * 60 * 1000, // 6 months later
    duration: '15 days',
    expectedBudget: '$1400-2100',
    requirements: 'High-altitude experience, good physical fitness, long-distance hiking experience',
    contactInfo: 'Email: tibet_hiker@example.com',
    authorId: 'user004',
    authorName: 'Highland Hiker',
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
      console.log('Initializing travel guide data');
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
      console.log('Initializing trip buddy data');
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

// 尝试初始化数据
initializeData();

// Travel guide service
export const travelGuideService = {
  // Publish guide
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
      console.error('Failed to publish guide:', error);
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