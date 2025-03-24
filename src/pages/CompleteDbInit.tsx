import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// 管理员账户信息 - 从环境变量或配置文件中读取（安全起见）
// 注意：在实际项目中，这些值应该通过环境变量或受保护的配置文件提供
const ADMIN_CONFIG = {
  email: process.env.REACT_APP_ADMIN_EMAIL || 'admin@example.com', // 默认值作为占位符
  password: process.env.REACT_APP_ADMIN_PASSWORD || 'admin123456', // 默认值作为占位符
  displayName: '系统管理员'
};

const CompleteDbInit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState(ADMIN_CONFIG.email);
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const addLog = (log: string) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const initializeDatabase = async () => {
    setLoading(true);
    setMessage('正在完整初始化数据库，请稍候...');
    setLogs([]);
    
    // 使用表单输入的值或配置值
    const finalEmail = adminEmail || ADMIN_CONFIG.email;
    const finalPassword = adminPassword || ADMIN_CONFIG.password;
    const adminDisplayName = ADMIN_CONFIG.displayName;
    
    try {
      // 步骤1: 创建/获取管理员用户
      addLog('开始创建管理员用户...');
      let uid;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, finalPassword);
        uid = userCredential.user.uid;
        addLog(`管理员用户创建成功，UID: ${uid}`);
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          addLog('邮箱已存在，尝试登录...');
          try {
            const userCredential = await signInWithEmailAndPassword(auth, finalEmail, finalPassword);
            uid = userCredential.user.uid;
            addLog(`登录成功，UID: ${uid}`);
          } catch (loginError: any) {
            addLog(`登录失败: ${loginError.message}`);
            throw loginError;
          }
        } else {
          addLog(`创建用户失败: ${createError.message}`);
          throw createError;
        }
      }

      // 步骤2: 创建users集合并设置管理员
      addLog('创建users集合...');
      try {
        await setDoc(doc(db, 'users', uid), {
          email: finalEmail,
          displayName: adminDisplayName,
          isAdmin: true,
          createdAt: new Date()
        });
        addLog('管理员信息保存到users集合成功');
      } catch (error) {
        addLog(`创建users集合失败: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }

      // 步骤3: 创建并填充articles集合
      addLog('创建articles集合...');
      try {
        // 检查是否已存在文章
        const articlesSnapshot = await getDocs(query(collection(db, 'articles'), limit(1)));
        
        if (articlesSnapshot.empty) {
          // 添加示例文章
          const article1 = await addDoc(collection(db, 'articles'), {
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
            author: adminDisplayName,
            authorId: uid
          });

          const article2 = await addDoc(collection(db, 'articles'), {
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
            author: adminDisplayName,
            authorId: uid
          });
          
          addLog(`添加了2篇示例文章，ID: ${article1.id}, ${article2.id}`);
        } else {
          addLog('文章集合已存在，跳过创建');
        }
      } catch (error) {
        addLog(`创建articles集合失败: ${error instanceof Error ? error.message : String(error)}`);
        // 继续执行，不要因为文章添加失败而中断整个流程
      }

      // 步骤4: 创建并填充comments集合
      addLog('创建comments集合...');
      try {
        // 检查是否已存在评论
        const commentsSnapshot = await getDocs(query(collection(db, 'comments'), limit(1)));
        
        if (commentsSnapshot.empty) {
          // 添加示例评论
          const comment1 = await addDoc(collection(db, 'comments'), {
            name: "李明",
            email: "liming@example.com",
            content: "我去年去了北京，故宫真的很壮观！推荐大家参观前做好功课，了解一些历史背景会让体验更加丰富。",
            timestamp: new Date(),
            likes: 5,
            featured: true,
            tags: ["beijing", "tips"]
          });

          const comment2 = await addDoc(collection(db, 'comments'), {
            name: "Sarah Johnson",
            email: "sarah@example.com",
            content: "我刚从上海回来，外滩的夜景太美了！不过要注意酒店预订，旅游旺季价格会很高。",
            timestamp: new Date(),
            likes: 3,
            featured: true,
            tags: ["shanghai", "accommodation"]
          });
          
          addLog(`添加了2条示例评论，ID: ${comment1.id}, ${comment2.id}`);
        } else {
          addLog('评论集合已存在，跳过创建');
        }
      } catch (error) {
        addLog(`创建comments集合失败: ${error instanceof Error ? error.message : String(error)}`);
        // 继续执行，不要因为评论添加失败而中断整个流程
      }

      // 完成
      setSuccess(true);
      setMessage(`数据库初始化完成！现在您可以使用管理员账户 (${finalEmail}) 登录。`);
      addLog(`数据库初始化成功完成！管理员账户: ${finalEmail}`);
      
      // 5秒后跳转到登录页面
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (error) {
      setSuccess(false);
      setMessage(`数据库初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
      addLog(`初始化过程中出现错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>数据库一键自动初始化</h1>
      <p>此页面将自动创建并填充所有必要的数据库集合，包括管理员账户、示例文章和评论。</p>
      
      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p>将自动完成以下操作：</p>
        <ol style={{ textAlign: 'left' }}>
          <li>创建管理员账户（您可以自定义邮箱）</li>
          <li>创建 users 集合并设置管理员权限</li>
          <li>创建 articles 集合并添加示例文章</li>
          <li>创建 comments 集合并添加示例评论</li>
        </ol>
        
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
              placeholder="输入管理员密码（留空使用默认密码）"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
        
        <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
          初始化完成后，请使用上述管理员账户登录，并立即更改默认密码！
        </p>
      </div>
      
      <button 
        onClick={initializeDatabase}
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
        {loading ? '初始化中...' : '一键初始化数据库'}
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
      
      {logs.length > 0 && (
        <div style={{ 
          margin: '1.5rem 0',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          textAlign: 'left',
          height: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          <h3 style={{ marginTop: 0 }}>执行日志：</h3>
          {logs.map((log, index) => (
            <div key={index} style={{ margin: '0.25rem 0' }}>{log}</div>
          ))}
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

export default CompleteDbInit;