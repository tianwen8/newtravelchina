import React, { useState } from 'react';
import { forceInitializeAdmin } from '../firebase/initializeDb';
import { useNavigate } from 'react-router-dom';

const AdminInit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('正在初始化管理员账户，请稍候...');
    
    try {
      const result = await forceInitializeAdmin();
      setSuccess(result.success);
      setMessage(result.message);
      
      if (result.success) {
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>管理员账户初始化</h1>
      <p>使用此页面强制初始化管理员账户。此操作将创建默认管理员账户（如果不存在）。</p>
      
      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p>默认管理员账户：</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>邮箱：</strong> x253400489@gmail.com</li>
          <li><strong>密码：</strong> admin123456</li>
          <li><strong>显示名称：</strong> 系统管理员</li>
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

export default AdminInit; 