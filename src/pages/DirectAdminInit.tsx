import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// 管理员账户默认显示名称
const ADMIN_DISPLAY_NAME = '系统管理员';

const DirectAdminInit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const handleInitialize = async () => {
    // 表单验证
    if (!adminEmail || !adminPassword) {
      setMessage('请输入管理员邮箱和密码');
      return;
    }
    
    setLoading(true);
    setMessage('正在初始化管理员账户，请稍候...');
    
    try {
      // 步骤1: 尝试创建用户（如果已存在则尝试登录）
      let uid;
      try {
        console.log('尝试创建用户');
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
            displayName: ADMIN_DISPLAY_NAME,
            isAdmin: true,
            createdAt: new Date()
          }, { merge: true });
          
          setSuccess(true);
          setMessage(`管理员账户已成功初始化，请使用此账户登录。`);
          
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
      <p>此页面将创建并授权管理员账户。请输入您想使用的管理员邮箱和密码。</p>
      
      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              管理员邮箱:
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="输入管理员邮箱"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              管理员密码:
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="输入管理员密码"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0' }}>
              请使用强密码，建议包含大小写字母、数字和特殊字符。
            </p>
          </div>
        </div>
        
        <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '1rem' }}>
          重要安全提示：请记住您设置的凭据。初始化后建议立即登录并验证权限。
        </p>
      </div>
      
      <button 
        onClick={handleInitialize}
        disabled={loading || !adminEmail || !adminPassword}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0077be',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: (loading || !adminEmail || !adminPassword) ? 'not-allowed' : 'pointer',
          opacity: (loading || !adminEmail || !adminPassword) ? 0.7 : 1
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