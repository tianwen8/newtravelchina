// Firebase配置文件
import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase配置 - 使用环境变量
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDqeBnmpJ9D4yjD6EirRblkeRDvMOclX4Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "newtravelchina-36648.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "newtravelchina-36648",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "newtravelchina-36648.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "658492259597",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:658492259597:web:6c39164438227666360444"
};

// 验证必要的环境变量
if (import.meta.env.PROD) {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
  }
}

// 初始化Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // 避免应用崩溃，创建一个后备初始化
  app = initializeApp(firebaseConfig, "backup-instance");
}

// 获取服务实例
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// 设置为false以使用Firebase服务，设置为true则使用本地存储作为备份
export const useLocalStorage = true;

// 检查用户是否为管理员
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  // 使用Firestore检查用户权限
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error('检查管理员状态时出错:', error);
    return false;
  }
};

// 用于调试
export const DEBUG = import.meta.env.DEV; 