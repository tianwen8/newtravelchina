import { collection, doc, getDoc, setDoc, getDocs, query, limit, addDoc, where, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from './config';

// 管理员账号信息
interface AdminUser {
  email: string;
  password: string;
  displayName: string;
}

// 初始化数据库
export const initializeDatabase = async (adminUser: AdminUser): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('开始初始化数据库...');
    
    // 1. 创建管理员用户
    let adminUid = '';
    try {
      console.log('创建管理员账号...');
      const userCredential = await createUserWithEmailAndPassword(auth, adminUser.email, adminUser.password);
      
      // 更新用户资料
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: adminUser.displayName });
      }
      
      adminUid = userCredential.user.uid;
      console.log('管理员账号创建成功, UID:', adminUid);
    } catch (error: any) {
      // 如果用户已存在，尝试查找管理员UID
      if (error.code === 'auth/email-already-in-use') {
        console.log('管理员账号已存在，尝试查找...');
        // 这里我们需要手动查找用户UID - 在实际应用中可能需要额外步骤
        // 由于Firebase不允许通过邮箱直接查找UID，此处简化处理
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', adminUser.email), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          adminUid = querySnapshot.docs[0].id;
          console.log('找到现有管理员, UID:', adminUid);
        } else {
          adminUid = 'admin-' + Date.now(); // 临时生成ID
          console.log('无法找到现有管理员，使用临时ID:', adminUid);
        }
      } else {
        throw error;
      }
    }
    
    // 2. 设置管理员权限
    console.log('设置管理员权限...');
    const userDocRef = doc(db, 'users', adminUid);
    await setDoc(userDocRef, {
      email: adminUser.email,
      displayName: adminUser.displayName,
      isAdmin: true,
      createdAt: new Date()
    }, { merge: true });
    
    // 3. 初始化文章集合
    console.log('初始化文章集合...');
    const articlesQuery = query(collection(db, 'articles'), limit(1));
    const articlesSnapshot = await getDocs(articlesQuery);
    
    if (articlesSnapshot.empty) {
      const sampleArticles = [
        {
          title: '探索北京的古老胡同与现代建筑',
          summary: '一段穿越时空的旅程，从老北京的胡同到鸟巢、水立方等现代建筑奇观',
          content: `<p>北京，这座具有三千年历史的古都，是中国政治、文化的中心。在这里，古老与现代并存，传统与创新交融。</p>
                   <p>胡同是老北京城市肌理的基本单元，也是北京传统文化的载体。这些窄窄的小巷，通常由四合院的一面墙构成，至今仍保持着过去那种悠闲自得的生活气息。南锣鼓巷、烟袋斜街、五道营胡同等地已经成为游客和本地人闲逛休憩的热门区域。</p>
                   <p>与此同时，以奥运场馆为标志的现代建筑群，例如鸟巢（国家体育场）、水立方（国家游泳中心）、国家大剧院（蛋形建筑）等，则展示了当代中国的创新设计和建筑技术。</p>`,
          coverImage: '/images/beijing.jpg',
          category: 'attractions',
          tags: ['北京', '胡同', '现代建筑', '文化之旅'],
          publishDate: new Date(),
          viewCount: 0,
          author: adminUser.displayName
        },
        {
          title: '中国最新144小时过境免签政策详解',
          summary: '了解中国最新的144小时过境免签政策，为您的旅行提供便利',
          content: `<p>中国的144小时过境免签政策是为了方便外国旅客短期访问中国而设立的。符合条件的旅客可以在指定城市停留长达144小时（6天），而无需办理常规签证。</p>
                   <p>目前，该政策适用于53个国家的公民，包括美国、加拿大、英国、澳大利亚以及大多数欧盟国家等。</p>
                   <p>使用该政策的条件包括：</p>
                   <ul>
                     <li>持有效国际旅行证件（护照）</li>
                     <li>持前往第三国或地区的确认机票</li>
                     <li>在规定的144小时内从指定口岸入境并离境</li>
                   </ul>`,
          coverImage: '/images/visa-policy.jpg',
          category: 'visa-free',
          tags: ['免签政策', '旅行规划', '入境指南'],
          publishDate: new Date(),
          viewCount: 0,
          author: adminUser.displayName
        }
      ];
      
      // 创建示例文章
      for (const article of sampleArticles) {
        await addDoc(collection(db, 'articles'), article);
      }
      console.log('示例文章创建成功');
    } else {
      console.log('文章集合已存在，跳过示例文章创建');
    }
    
    // 4. 初始化评论集合
    console.log('初始化评论集合...');
    const commentsQuery = query(collection(db, 'comments'), limit(1));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    if (commentsSnapshot.empty) {
      const sampleComments = [
        {
          name: "李明",
          email: "liming@example.com",
          content: "我去年去了北京，故宫真的很壮观！推荐大家参观前做好功课，了解一些历史背景会让体验更加丰富。",
          timestamp: new Date(),
          likes: 5,
          featured: true,
          tags: ["beijing", "tips"]
        },
        {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          content: "我刚从上海回来，外滩的夜景太美了！不过要注意酒店预订，旅游旺季价格会很高。",
          timestamp: new Date(),
          likes: 3,
          featured: true,
          tags: ["shanghai", "accommodation"]
        }
      ];
      
      // 创建示例评论
      for (const comment of sampleComments) {
        await addDoc(collection(db, 'comments'), comment);
      }
      console.log('示例评论创建成功');
    } else {
      console.log('评论集合已存在，跳过示例评论创建');
    }
    
    console.log('数据库初始化完成！');
    return { 
      success: true, 
      message: '数据库初始化成功！管理员账号已创建，示例内容已添加。' 
    };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return { 
      success: false, 
      message: `数据库初始化失败: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// 检查是否已初始化
export const checkDatabaseInitialized = async (): Promise<boolean> => {
  try {
    // 检查是否有文章
    const articlesQuery = query(collection(db, 'articles'), limit(1));
    const articlesSnapshot = await getDocs(articlesQuery);
    
    // 检查是否有评论
    const commentsQuery = query(collection(db, 'comments'), limit(1));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    return !articlesSnapshot.empty && !commentsSnapshot.empty;
  } catch (error) {
    console.error('检查数据库状态失败:', error);
    return false;
  }
};

// 强制初始化函数
export const forceInitializeAdmin = async (): Promise<{ success: boolean; message: string; adminUid?: string }> => {
  try {
    // 创建默认管理员账户
    const defaultAdmin = {
      email: "x253400489@gmail.com",
      password: "admin123456",
      displayName: "系统管理员"
    };
    
    // 尝试创建管理员
    let adminUid;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        defaultAdmin.email, 
        defaultAdmin.password
      );
      
      await updateProfile(userCredential.user, {
        displayName: defaultAdmin.displayName
      });
      
      adminUid = userCredential.user.uid;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // 如果邮箱已存在，假设其为管理员
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', defaultAdmin.email), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          adminUid = snapshot.docs[0].id;
        } else {
          // 生成临时ID
          adminUid = 'admin-' + Date.now();
        }
      } else {
        throw error;
      }
    }
    
    // 设置管理员权限
    if (adminUid) {
      const userDocRef = doc(db, 'users', adminUid);
      await setDoc(userDocRef, {
        email: defaultAdmin.email,
        displayName: defaultAdmin.displayName,
        isAdmin: true,
        createdAt: new Date()
      }, { merge: true });
      
      return { 
        success: true, 
        message: `管理员账户 ${defaultAdmin.email} 已成功初始化，请使用密码登录。`, 
        adminUid 
      };
    } else {
      return { success: false, message: '无法创建管理员账户。' };
    }
  } catch (error) {
    console.error('强制初始化管理员失败:', error);
    return { 
      success: false, 
      message: `初始化失败: ${error instanceof Error ? error.message : '未知错误'}` 
    };
  }
}; 