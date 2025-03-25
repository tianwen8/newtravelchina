import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { imageUploadService } from '../services/imageUploadService';
import '../components/ImageUploader.css';

const ImageUploadTest: React.FC = () => {
  const { t } = useTranslation();
  const [singleImageUrl, setSingleImageUrl] = useState<string>('');
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('test-images');

  // 处理单图片上传
  const handleSingleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const file = files[0];
      const imageUrl = await imageUploadService.uploadImage(file, selectedFolder);
      setSingleImageUrl(imageUrl);
      console.log('图片上传成功:', imageUrl);
    } catch (error) {
      console.error('图片上传失败:', error);
      setUploadError(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理多图片上传
  const handleMultipleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await imageUploadService.uploadImage(file, selectedFolder);
        uploadedUrls.push(imageUrl);
      }
      
      setMultipleImageUrls(uploadedUrls);
      console.log('多图片上传成功:', uploadedUrls);
    } catch (error) {
      console.error('多图片上传失败:', error);
      setUploadError(error instanceof Error ? error.message : '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理文件夹选择变更
  const handleFolderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolder(event.target.value);
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Helmet>
        <title>{t('app.title')} - 图片上传测试</title>
      </Helmet>

      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>图片上传测试页面</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>选择上传文件夹</h2>
        <select 
          value={selectedFolder} 
          onChange={handleFolderChange}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginBottom: '1rem'
          }}
        >
          <option value="test-images">测试图片</option>
          <option value="article-images">文章图片</option>
          <option value="user-uploads">用户上传</option>
          <option value="avatars">头像</option>
          <option value="comments">评论图片</option>
        </select>
      </div>

      {/* 单图片上传区域 */}
      <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>单图片上传测试</h2>
        <div className="image-upload-area" style={{ margin: '1.5rem 0' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleSingleImageUpload}
            style={{ marginBottom: '1rem' }}
          />
          
          {isUploading && (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>上传中，请稍候...</p>
            </div>
          )}
          
          {uploadError && (
            <div className="upload-error" style={{ color: 'red', marginBottom: '1rem' }}>
              {uploadError}
            </div>
          )}
          
          {singleImageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <h3>上传结果:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                  src={singleImageUrl} 
                  alt="上传图片预览" 
                  style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '1rem' }}
                />
                <textarea 
                  readOnly 
                  value={singleImageUrl} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 多图片上传区域 */}
      <div style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h2>多图片上传测试</h2>
        <div className="image-upload-area" style={{ margin: '1.5rem 0' }}>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleMultipleImageUpload}
            style={{ marginBottom: '1rem' }}
          />
          
          {isUploading && (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>上传中，请稍候...</p>
            </div>
          )}
          
          {uploadError && (
            <div className="upload-error" style={{ color: 'red', marginBottom: '1rem' }}>
              {uploadError}
            </div>
          )}
          
          {multipleImageUrls.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3>上传结果:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {multipleImageUrls.map((url, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                      src={url} 
                      alt={`上传图片预览 ${index + 1}`} 
                      style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', marginBottom: '0.5rem' }}
                    />
                    <input 
                      readOnly 
                      value={url} 
                      style={{ 
                        width: '100%', 
                        padding: '0.25rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#f0f4f8', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>使用说明</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>单图片上传：一次只能上传一张图片</li>
          <li>多图片上传：可以同时选择多张图片上传</li>
          <li>文件夹选择：可以选择不同的目标文件夹进行上传测试</li>
          <li>图片大小：建议上传小于300KB的图片以获得更好的性能</li>
          <li>支持格式：JPG, PNG, GIF, WebP等常见图片格式</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadTest; 