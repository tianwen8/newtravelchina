import React, { useState, useRef, useEffect } from 'react';
import { imageUploadService } from '../services/imageUploadService';
import './ImageUploader.css';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  folder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  initialImageUrl = '', 
  onImageUploaded,
  folder = 'article-images'
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrl(initialImageUrl);
  }, [initialImageUrl]);

  const handleImageChange = async (file: File) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError('');
      
      // 上传图片并获取URL
      const uploadedUrl = await imageUploadService.uploadImage(file, folder);
      
      // 更新状态
      setImageUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
      
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      setError(err instanceof Error ? err.message : '图片上传失败');
      console.error('上传错误:', err);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handlePasteUrl = () => {
    const url = prompt('请输入图片 URL:');
    if (url) {
      setImageUrl(url);
      onImageUploaded(url);
    }
  };

  return (
    <div className="image-uploader">
      <div 
        className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <div className="image-preview-container">
            <img 
              src={imageUrl} 
              alt="文章封面" 
              className="image-preview" 
              onError={() => setError('图片加载失败，请检查URL是否正确')}
            />
            <div className="image-preview-overlay">
              <button 
                type="button" 
                className="change-image-btn"
                onClick={handleButtonClick}
              >
                更换图片
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            {isUploading ? (
              <div className="upload-loading">
                <div className="spinner"></div>
                <p>正在上传...</p>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>点击上传图片或拖放图片到此处</p>
                <p className="upload-hint">支持 JPG, PNG, GIF 格式，最大 5MB</p>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="file-input"
        />
      </div>
      
      {error && <div className="upload-error">{error}</div>}
      
      <div className="image-upload-controls">
        <div className="url-display">
          {imageUrl && (
            <>
              <input 
                type="text" 
                value={imageUrl} 
                readOnly 
                className="image-url-input"
              />
              <button 
                type="button" 
                className="paste-url-btn copy"
                onClick={() => {
                  navigator.clipboard.writeText(imageUrl);
                  alert('图片 URL 已复制到剪贴板');
                }}
              >
                复制
              </button>
            </>
          )}
        </div>
        <div className="upload-actions">
          <button 
            type="button" 
            className="upload-btn"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            {imageUrl ? '更换图片' : '上传图片'}
          </button>
          <button 
            type="button" 
            className="paste-url-btn"
            onClick={handlePasteUrl}
            disabled={isUploading}
          >
            使用URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader; 