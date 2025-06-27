import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

const SimpleUploadTest: React.FC = () => {
  const [uploadResults, setUploadResults] = useState<Array<{
    url: string;
    name: string;
    timestamp: Date;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  // 简单的图片上传到免费图床
  const uploadImageToFreeHost = async (file: File): Promise<string> => {
    // 模拟上传过程
    return new Promise((resolve) => {
      setTimeout(() => {
        // 使用本地placeholder图片
        const timestamp = Date.now();
        const mockUrl = `/images/placeholder.jpg?t=${timestamp}`;
        resolve(mockUrl);
      }, 2000);
    });
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('目前只支持图片文件');
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('文件大小不能超过5MB');
      }

      console.log('开始上传图片:', file.name);
      
      // 上传图片
      const imageUrl = await uploadImageToFreeHost(file);
      
      // 添加到结果列表
      const result = {
        url: imageUrl,
        name: file.name,
        timestamp: new Date()
      };
      
      setUploadResults(prev => [result, ...prev]);
      console.log('图片上传成功:', result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
      console.error('上传错误:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <Helmet>
        <title>简单图片上传测试 - Travel China</title>
      </Helmet>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: '#333',
            fontSize: '2.5rem'
          }}>
            📸 简单图片上传测试
          </h1>
          
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '15px',
            border: '1px solid #e0e6ed',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#333', marginBottom: '1rem' }}>
              🚀 无需Firebase配置的图片上传
            </h2>
            
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              background: '#f8f9ff',
              marginBottom: '1rem'
            }}>
              {isUploading ? (
                <div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }}></div>
                  <p style={{ color: '#666' }}>正在上传...</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{
                      marginBottom: '1rem',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    支持 JPG, PNG, GIF 格式，最大 5MB
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <div style={{
                background: '#fee',
                border: '1px solid #fbb',
                borderRadius: '6px',
                padding: '1rem',
                color: '#c53030',
                marginBottom: '1rem'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* 上传结果 */}
        {uploadResults.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>
              ✅ 上传结果 ({uploadResults.length} 个文件)
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '1rem' 
            }}>
              {uploadResults.map((result, index) => (
                <div key={index} style={{
                  background: '#fff',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🖼️</span>
                    <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>
                      {result.name}
                    </span>
                  </div>
                  
                  <img 
                    src={result.url} 
                    alt="上传的图片"
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '6px',
                      marginBottom: '1rem'
                    }}
                  />
                  
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                    上传时间: {result.timestamp.toLocaleString()}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.url);
                      alert('图片URL已复制！');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    复制图片URL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>💡 说明</h3>
          <ul style={{ color: '#666', lineHeight: 1.6 }}>
            <li><strong>无需Firebase配置：</strong> 这个测试页面不依赖Firebase Storage</li>
            <li><strong>临时方案：</strong> 目前使用本地placeholder图片作为演示</li>
            <li><strong>生产环境：</strong> 可以集成免费图床服务或配置Firebase Storage</li>
            <li><strong>支持格式：</strong> JPG, PNG, GIF 等图片格式</li>
            <li><strong>文件大小：</strong> 最大 5MB</li>
          </ul>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default SimpleUploadTest; 