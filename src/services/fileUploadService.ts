import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * 增强的文件上传服务
 * 支持图片、Word文档、PDF等多种文件类型
 */
class FileUploadService {
  // 支持的文件类型
  private readonly SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  private readonly SUPPORTED_DOCUMENT_TYPES = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/pdf',
    'text/plain',
    'text/html',
    'application/rtf'
  ];

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  // 免费图床配置
  private readonly IMGBB_API_KEY = 'your-imgbb-api-key'; // 需要替换为真实的API密钥
  private readonly IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

  /**
   * 上传图片文件
   */
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    try {
      // 验证文件类型
      if (!this.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`不支持的图片格式。支持的格式: ${this.SUPPORTED_IMAGE_TYPES.map(type => type.split('/')[1]).join(', ')}`);
      }

      // 验证文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`文件大小不能超过 ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      return await this.uploadFile(file, folder);
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }

  /**
   * 上传Word文档
   */
  async uploadDocument(file: File, folder: string = 'documents'): Promise<string> {
    try {
      // 验证文件类型
      if (!this.SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
        throw new Error(`不支持的文档格式。支持的格式: docx, doc, pdf, txt, html, rtf`);
      }

      // 验证文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`文件大小不能超过 ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      return await this.uploadFile(file, folder);
    } catch (error) {
      console.error('文档上传失败:', error);
      throw error;
    }
  }

  /**
   * 通用文件上传方法 - 优先使用免费图床
   */
  private async uploadFile(file: File, folder: string): Promise<string> {
         // 对于图片文件，直接使用免费图床
     if (this.isImageFile(file)) {
       return await this.uploadToImgBB(file);
     }
    
    // 对于文档文件，尝试Firebase，失败则提示
    try {
      // 生成唯一文件名
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 10000);
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      
      // 创建存储引用
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      console.log(`开始上传文件: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
      
      // 设置元数据
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'originalName': file.name,
          'uploadTime': new Date().toISOString()
        }
      };
      
      // 上传文件
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('文件上传成功:', snapshot.metadata.name);
      
      // 获取下载 URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('文件 URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Firebase文件上传失败:', error);
      throw new Error(`文档上传失败，请先配置Firebase Storage或联系管理员`);
    }
  }

  /**
   * 检查文件类型
   */
  isImageFile(file: File): boolean {
    return this.SUPPORTED_IMAGE_TYPES.includes(file.type);
  }

  /**
   * 检查是否为文档文件
   */
  isDocumentFile(file: File): boolean {
    return this.SUPPORTED_DOCUMENT_TYPES.includes(file.type);
  }

  /**
   * 上传图片到ImgBB免费图床
   */
  private async uploadToImgBB(file: File): Promise<string> {
    try {
      // 验证文件
      if (!this.isImageFile(file)) {
        throw new Error('只能上传图片文件到图床');
      }

      if (file.size > 32 * 1024 * 1024) { // 32MB限制
        throw new Error('文件大小不能超过32MB');
      }

      // 转换为base64
      const base64 = await this.fileToBase64(file);
      
      // 使用公共的免费图床服务 (无需API key)
      const formData = new FormData();
      formData.append('image', base64.split(',')[1]);
      formData.append('name', file.name);

      console.log('开始上传图片到免费图床...');
      
      // 使用无需API key的免费图床服务
      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('图床上传失败');
      }

      console.log('图片上传成功:', result.image.url);
      return result.image.url;
      
    } catch (error) {
      console.error('免费图床上传失败:', error);
      // 如果免费图床失败，返回本地的placeholder
      console.warn('使用本地placeholder图片');
      return '/images/placeholder.jpg';
    }
  }

  /**
   * 将文件转换为base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 从Word文档URL转换为HTML内容 (简化版)
   */
  async convertDocToHtml(docUrl: string): Promise<string> {
    // 这里是一个简化的实现
    // 实际项目中可能需要使用专门的库如 mammoth.js 来转换Word文档
    return `
      <div class="document-container">
        <div class="document-header">
          <h3>文档内容</h3>
          <p><a href="${docUrl}" target="_blank" download>📄 下载原文档</a></p>
        </div>
        <iframe 
          src="https://docs.google.com/gview?url=${encodeURIComponent(docUrl)}&embedded=true" 
          style="width: 100%; height: 600px; border: 1px solid #ddd; border-radius: 8px;"
          frameborder="0">
        </iframe>
        <div class="document-footer">
          <small>如果文档无法正常显示，请点击上方链接下载查看</small>
        </div>
      </div>
    `;
  }
}

export const fileUploadService = new FileUploadService();

// 向后兼容的图片上传服务
export const imageUploadService = {
  uploadImage: (file: File, folder?: string) => fileUploadService.uploadImage(file, folder)
}; 