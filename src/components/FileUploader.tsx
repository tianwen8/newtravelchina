import React, { useState, useRef } from 'react';
import { fileUploadService } from '../services/fileUploadService';
import './FileUploader.css';

interface FileUploaderProps {
  onFileUploaded: (fileUrl: string, fileType: 'image' | 'document') => void;
  acceptedTypes?: 'images' | 'documents' | 'all';
  folder?: string;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUploaded,
  acceptedTypes = 'all',
  folder = 'uploads',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{url: string, name: string, type: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取接受的文件类型
  const getAcceptAttribute = () => {
    switch (acceptedTypes) {
      case 'images':
        return 'image/*';
      case 'documents':
        return '.doc,.docx,.pdf,.txt,.html,.rtf';
      default:
        return 'image/*,.doc,.docx,.pdf,.txt,.html,.rtf';
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      let uploadedUrl: string;
      let fileType: 'image' | 'document';
      
      // 根据文件类型选择上传方法
      if (fileUploadService.isImageFile(file)) {
        uploadedUrl = await fileUploadService.uploadImage(file, `${folder}/images`);
        fileType = 'image';
      } else if (fileUploadService.isDocumentFile(file)) {
        uploadedUrl = await fileUploadService.uploadDocument(file, `${folder}/documents`);
        fileType = 'document';
      } else {
        throw new Error('不支持的文件类型');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 添加到已上传文件列表
      setUploadedFiles(prev => [...prev, {
        url: uploadedUrl,
        name: file.name,
        type: file.type
      }]);
      
      // 通知父组件
      onFileUploaded(uploadedUrl, fileType);
      
      setIsUploading(false);
      setUploadProgress(0);
      
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      console.error('文件上传错误:', err);
    }
  };

  // 文件输入变化处理
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 拖拽处理
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
      handleFileUpload(file);
    }
  };

  // 点击上传按钮
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 获取文件类型图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else {
      return '📎';
    }
  };

  return (
    <div className={`file-uploader ${className}`}>
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${uploadProgress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="percentage">{Math.round(uploadProgress)}%</div>
            </div>
            <p>正在上传...</p>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              {acceptedTypes === 'images' ? '🖼️' : 
               acceptedTypes === 'documents' ? '📄' : '📁'}
            </div>
            <h3>点击或拖拽文件到此处</h3>
            <p className="upload-hint">
              {acceptedTypes === 'images' && '支持 JPG, PNG, GIF, WebP 等图片格式'}
              {acceptedTypes === 'documents' && '支持 Word (.docx, .doc), PDF, TXT 等文档格式'}
              {acceptedTypes === 'all' && '支持图片和文档文件'}
            </p>
            <p className="file-size-hint">最大文件大小: 10MB</p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={getAcceptAttribute()}
          className="file-input"
          style={{ display: 'none' }}
        />
      </div>
      
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>已上传文件</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="uploaded-file-item">
              <span className="file-icon">{getFileIcon(file.type)}</span>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-link">
                  查看文件
                </a>
              </div>
              <button 
                className="copy-url-btn"
                onClick={() => {
                  navigator.clipboard.writeText(file.url);
                  alert('文件URL已复制到剪贴板');
                }}
              >
                复制链接
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 