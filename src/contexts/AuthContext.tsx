import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile as firebaseUpdateProfile, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  AuthProvider as FirebaseAuthProvider,
  Auth,
  signInWithCredential
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// 用户信息接口
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
  providerId?: string;
}

// 身份验证上下文接口
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 将Firebase用户转换为应用用户
const transformUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  
  const providerId = firebaseUser.providerData.length > 0 
    ? firebaseUser.providerData[0].providerId 
    : 'password';
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    providerId,
    // isAdmin在实际应用中应该从自定义claims或数据库中加载
    isAdmin: false
  };
};

// 上下文提供者组件
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 初始化 - 监听Firebase认证状态
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(transformUser(firebaseUser));
      setLoading(false);
    });

    // 清理函数
    return () => unsubscribe();
  }, []);

  // 检查用户是否是管理员
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('检查管理员状态时出错:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // 社交账号登录通用方法
  const signInWithProvider = async (provider: FirebaseAuthProvider): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError('登录失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 谷歌登录
  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithProvider(provider);
  };

  // 登录
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError('登录失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // 创建用户
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 更新用户资料
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName });
      }
    } catch (e) {
      setError('注册失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (e) {
      setError('登出失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      setError('重置密码失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 更新用户资料
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new Error('用户未登录');
      }

      // 更新Firebase用户资料
      const updateData: { displayName?: string; photoURL?: string } = {};
      if (data.displayName) updateData.displayName = data.displayName;
      if (data.photoURL) updateData.photoURL = data.photoURL;

      if (Object.keys(updateData).length > 0) {
        await firebaseUpdateProfile(auth.currentUser, updateData);
      }

      // 更新本地状态
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          ...data
        });
      }
    } catch (e) {
      setError('更新资料失败: ' + (e instanceof Error ? e.message : String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 上下文值
  const value = {
    currentUser,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用上下文的钩子
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 