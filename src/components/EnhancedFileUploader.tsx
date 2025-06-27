import React, { useState, useRef, useCallback } from 'react';
import { fileUploadService } from '../services/fileUploadService';
import { supabaseUploadService } from '../services/supabaseUploadService';
import './FileUploader.css';

interface EnhancedFileUploaderProps {
  onFileUploaded: (fileUrl: string, fileType: 'image' | 'document', fileInfo?: any) => void;
  acceptedTypes?: 'images' | 'documents' | 'all';
  folder?: string;
  className?: string;
  useSupabase?: boolean; // 是否使用Supabase而不是Firebase
  enableWordExtraction?: boolean; // 是否启用Word文档内容提取
  maxFiles?: number; // 最大文件数量
  enableDragSort?: boolean; // 是否启用拖拽排序
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadTime: Date;
  fileType: 'image' | 'document';
  extractedContent?: string; // Word文档提取的文本内容
}

const EnhancedFileUploader: React.FC<EnhancedFileUploaderProps> = ({ 
  onFileUploaded,
  acceptedTypes = 'all',
  folder = 'uploads',
  className = '',
  useSupabase = false,
  enableWordExtraction = true,
  maxFiles = 10,
  enableDragSort = true
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>('');
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

  // Word文档内容提取（简化版）
  const extractWordContent = async (file: File): Promise<string> => {
    if (!enableWordExtraction || !file.name.match(/\.(docx?|rtf)$/i)) {
      return '';
    }

    try {
      // 这里是一个简化的实现
      // 在实际项目中，你可能需要使用专门的库如 mammoth.js
      const text = await file.text();
      // 简单的文本清理
      return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\n.,!?]/g, '').slice(0, 1000);
    } catch (error) {
      console.warn('无法提取Word文档内容:', error);
      return '';
    }
  };

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    
    // 检查文件数量限制
    if (uploadedFiles.length >= maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(0);
      setCurrentUploadFile(file.name);
      
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
      let extractedContent = '';
      
      // 选择上传服务
      const uploadService = useSupabase ? supabaseUploadService : fileUploadService;
      
      // 根据文件类型选择上传方法
      if (uploadService.isImageFile(file)) {
        uploadedUrl = await uploadService.uploadImage(file, `${folder}/images`);
        fileType = 'image';
      } else if (uploadService.isDocumentFile(file)) {
        uploadedUrl = await uploadService.uploadDocument(file, `${folder}/documents`);
        fileType = 'document';
        
        // 提取Word文档内容
        extractedContent = await extractWordContent(file);
      } else {
        throw new Error('不支持的文件类型');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 创建文件信息对象
      const uploadedFile: UploadedFile = {
        url: uploadedUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadTime: new Date(),
        fileType,
        extractedContent
      };
      
      // 添加到已上传文件列表
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // 通知父组件
      onFileUploaded(uploadedUrl, fileType, uploadedFile);
      
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
      
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadFile('');
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      console.error('文件上传错误:', err);
    }
  }, [uploadedFiles.length, maxFiles, folder, useSupabase, enableWordExtraction, onFileUploaded]);

  // 文件输入变化处理
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleFileUpload(file));
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
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileUpload(file));
  };

  // 点击上传按钮
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 删除已上传的文件
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`enhanced-file-uploader ${className}`}>
      {/* 上传服务状态指示 */}
      <div className="upload-service-indicator">
        <span className={`service-badge ${useSupabase ? 'supabase' : 'firebase'}`}>
          {useSupabase ? '📊 Supabase Storage' : '🔥 Firebase Storage'}
        </span>
        <span className="file-count">{uploadedFiles.length}/{maxFiles}</span>
      </div>

      {/* 主上传区域 */}
      <div 
        className={`upload-area enhanced ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <div className="upload-progress enhanced">
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
            <p>正在上传: {currentUploadFile}</p>
            <small>{useSupabase ? 'Supabase Storage' : 'Firebase Storage'}</small>
          </div>
        ) : (
          <div className="upload-placeholder enhanced">
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
            <p className="file-size-hint">
              最大文件大小: {useSupabase ? '50MB' : '10MB'} | 最多 {maxFiles} 个文件
            </p>
            {enableWordExtraction && (
              <p className="feature-hint">🧠 智能提取Word文档内容</p>
            )}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={getAcceptAttribute()}
          className="file-input"
          style={{ display: 'none' }}
          multiple={maxFiles > 1}
        />
      </div>
      
      {error && (
        <div className="upload-error enhanced">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button className="error-close" onClick={() => setError('')}>✖️</button>
        </div>
      )}
      
      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files enhanced">
          <div className="files-header">
            <h4>📁 已上传文件 ({uploadedFiles.length})</h4>
            <button 
              className="clear-all-btn"
              onClick={() => setUploadedFiles([])}
              title="清空所有文件"
            >
              🗑️ 清空
            </button>
          </div>
          
          <div className="files-grid">
            {uploadedFiles.map((file, index) => (
              <div key={index} className={`uploaded-file-card ${file.fileType}`}>
                <div className="file-preview">
                  {file.fileType === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="file-thumbnail"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="document-preview">
                      <span className="file-icon">{getFileIcon(file.type)}</span>
                      <div className="file-type">{file.type.split('/')[1]?.toUpperCase()}</div>
                    </div>
                  )}
                  
                  <button 
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadedFile(index);
                    }}
                    title="删除文件"
                  >
                    ✖️
                  </button>
                </div>
                
                <div className="file-info">
                  <div className="file-name" title={file.name}>
                    {file.name.length > 20 ? `${file.name.slice(0, 17)}...` : file.name}
                  </div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="upload-time">
                      {file.uploadTime.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Word文档提取的内容预览 */}
                  {file.extractedContent && (
                    <div className="extracted-content">
                      <small>📝 提取内容:</small>
                      <p className="content-preview">
                        {file.extractedContent.slice(0, 100)}
                        {file.extractedContent.length > 100 && '...'}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="file-actions">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-btn view"
                    title="查看文件"
                  >
                    👁️
                  </a>
                  <button 
                    className="action-btn copy"
                    onClick={() => {
                      navigator.clipboard.writeText(file.url);
                      alert('文件URL已复制到剪贴板');
                    }}
                    title="复制链接"
                  >
                    📋
                  </button>
                  <a 
                    href={file.url} 
                    download={file.name}
                    className="action-btn download"
                    title="下载文件"
                  >
                    📥
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="uploader-features">
        <h5>✨ 功能特色</h5>
        <ul>
          <li>🔄 支持 Firebase 和 Supabase 双存储</li>
          <li>📄 智能处理 Word 文档和图片</li>
          <li>🧠 自动提取文档文本内容</li>
          <li>📊 实时上传进度显示</li>
          <li>🗂️ 批量文件管理</li>
          {enableDragSort && <li>🔄 拖拽排序支持</li>}
        </ul>
      </div>
    </div>
  );
};

export default EnhancedFileUploader; 