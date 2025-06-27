import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import FileUploader from '../components/FileUploader';
import ImageUploader from '../components/ImageUploader';

const FileUploadTest: React.FC = () => {
  const { t } = useTranslation();
  const [uploadResults, setUploadResults] = useState<Array<{
    url: string;
    type: 'image' | 'document';
    name: string;
    timestamp: Date;
  }>>([]);

  // 处理文件上传完成
  const handleFileUploaded = (fileUrl: string, fileType: 'image' | 'document') => {
    const result = {
      url: fileUrl,
      type: fileType,
      name: `${fileType}_${Date.now()}`,
      timestamp: new Date()
    };
    
    setUploadResults(prev => [result, ...prev]);
    console.log('文件上传成功:', result);
  };

  // 处理旧版图片上传器
  const handleImageUploaded = (imageUrl: string) => {
    const result = {
      url: imageUrl,
      type: 'image' as const,
      name: `image_${Date.now()}`,
      timestamp: new Date()
    };
    
    setUploadResults(prev => [result, ...prev]);
    console.log('图片上传成功:', result);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <Helmet>
        <title>File Upload Test - {t('app.title')}</title>
      </Helmet>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            📁 文件上传测试中心
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* 新版通用文件上传器 */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '1px solid #e0e6ed'
            }}>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>
                🚀 新版文件上传器 (推荐)
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                支持图片和Word文档，自动分类处理，带进度显示
              </p>
              <FileUploader
                onFileUploaded={handleFileUploaded}
                acceptedTypes="all"
                folder="test-uploads"
              />
            </div>

            {/* 仅图片上传器 */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '1px solid #e0e6ed'
            }}>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>
                🖼️ 仅图片上传器
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                只支持图片文件，适用于图片专用场景
              </p>
              <FileUploader
                onFileUploaded={handleFileUploaded}
                acceptedTypes="images"
                folder="test-images"
              />
            </div>

            {/* 仅文档上传器 */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '1px solid #e0e6ed'
            }}>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>
                📄 仅文档上传器
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                只支持Word、PDF等文档文件
              </p>
              <FileUploader
                onFileUploaded={handleFileUploaded}
                acceptedTypes="documents"
                folder="test-documents"
              />
            </div>

            {/* 旧版图片上传器对比 */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '15px',
              border: '1px solid #e0e6ed'
            }}>
              <h2 style={{ color: '#333', marginBottom: '1rem' }}>
                🔄 旧版图片上传器 (对比)
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                原有的ImageUploader组件，仅支持图片
              </p>
              <ImageUploader
                initialImageUrl=""
                onImageUploaded={handleImageUploaded}
                folder="test-old-images"
              />
            </div>
          </div>
        </div>

        {/* 上传结果展示 */}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {result.type === 'image' ? '🖼️' : '📄'}
                    </span>
                    <span style={{ 
                      fontWeight: 600, 
                      color: result.type === 'image' ? '#10b981' : '#3b82f6'
                    }}>
                      {result.type === 'image' ? '图片' : '文档'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.type === 'image' ? (
                    <img 
                      src={result.url} 
                      alt="上传的图片"
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '6px',
                        marginBottom: '0.5rem'
                      }}
                    />
                  ) : (
                    <div style={{
                      height: '150px',
                      background: '#f8f9fa',
                      border: '2px dashed #dee2e6',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                        <div>文档文件</div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.8rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        minWidth: '80px'
                      }}
                    >
                      查看
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.url);
                        alert('URL已复制！');
                      }}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.8rem',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        minWidth: '80px'
                      }}
                    >
                      复制URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测试说明 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>🧪 测试说明</h3>
          <ul style={{ color: '#666', lineHeight: 1.6 }}>
            <li><strong>图片文件：</strong> 支持 JPG、PNG、GIF、WebP、SVG 格式</li>
            <li><strong>文档文件：</strong> 支持 Word (.docx, .doc)、PDF、TXT、HTML、RTF 格式</li>
            <li><strong>文件大小：</strong> 最大 10MB</li>
            <li><strong>上传方式：</strong> 支持点击选择和拖拽上传</li>
            <li><strong>进度显示：</strong> 实时显示上传进度</li>
            <li><strong>错误处理：</strong> 详细的错误信息提示</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUploadTest; 