import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const DirectAdminInit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  // 定义管理员信息
  const adminEmail = 'x253400489@gmail.com';
  const adminPassword = 'admin123456';
  const adminDisplayName = '系统管理员';

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('正在初始化管理员账户，请稍候...');
    
    try {
      // 步骤1: 尝试创建用户（如果已存在则尝试登录）
      let uid;
      try {
        console.log('尝试创建用户:', adminEmail);
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = userCredential.user.uid;
        console.log('用户创建成功, UID:', uid);
      } catch (createError: any) {
        console.log('创建用户失败:', createError.message);
        
        // 如果用户已存在，尝试登录
        if (createError.code === 'auth/email-already-in-use') {
          try {
            console.log('尝试登录现有用户');
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            uid = userCredential.user.uid;
            console.log('登录成功, UID:', uid);
          } catch (loginError: any) {
            console.error('登录失败:', loginError);
            setSuccess(false);
            setMessage(`登录失败: ${loginError.message}. 如果您忘记了密码，请使用重置密码功能。`);
            setLoading(false);
            return;
          }
        } else {
          throw createError;
        }
      }
      
      // 步骤2: 设置管理员权限
      if (uid) {
        try {
          console.log('设置管理员权限, UID:', uid);
          await setDoc(doc(db, 'users', uid), {
            email: adminEmail,
            displayName: adminDisplayName,
            isAdmin: true,
            createdAt: new Date()
          }, { merge: true });
          
          setSuccess(true);
          setMessage(`管理员账户 ${adminEmail} 已成功初始化。请使用此账户登录。`);
          
          // 5秒后跳转到登录页面
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        } catch (error) {
          console.error('设置管理员权限失败:', error);
          setSuccess(false);
          setMessage(`设置管理员权限失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('初始化过程中出错:', error);
      setSuccess(false);
      setMessage(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>管理员账户直接初始化</h1>
      <p>此页面将直接为指定邮箱创建管理员账户。</p>
      
      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p>将为以下邮箱创建/确认管理员权限：</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>邮箱：</strong> {adminEmail}</li>
          <li><strong>密码：</strong> {adminPassword}</li>
          <li><strong>显示名称：</strong> {adminDisplayName}</li>
        </ul>
        <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
          重要提示：初始化后请立即登录并修改默认密码！
        </p>
      </div>
      
      <button 
        onClick={handleInitialize}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0077be',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? '初始化中...' : '初始化管理员账户'}
      </button>
      
      {message && (
        <div style={{ 
          margin: '1.5rem 0', 
          padding: '1rem', 
          backgroundColor: success ? '#d4edda' : '#f8d7da',
          color: success ? '#155724' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <p>{message}</p>
          {success && <p>初始化成功！5秒后将跳转到登录页面。</p>}
        </div>
      )}
      
      <p>
        <a href="/login" style={{ color: '#0077be', textDecoration: 'none' }}>
          返回登录页面
        </a>
      </p>
    </div>
  );
};

export default DirectAdminInit; 