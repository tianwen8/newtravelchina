import { supabase } from '../config/supabase';

/**
 * Supabase文件上传服务
 * 作为Firebase Storage的免费替代方案
 */
class SupabaseUploadService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Supabase免费版限制)
  
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

  /**
   * 上传文件到Supabase Storage
   */
  async uploadFile(file: File, bucket: string = 'uploads', folder: string = ''): Promise<string> {
    try {
      // 验证文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`文件大小不能超过 ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 10000);
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log(`开始上传文件到Supabase: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

      // 上传文件
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            originalName: file.name,
            uploadTime: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Supabase上传错误:', error);
        throw new Error(`上传失败: ${error.message}`);
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('文件上传成功:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Supabase文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片
   */
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    // 验证文件类型
    if (!this.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`不支持的图片格式。支持的格式: ${this.SUPPORTED_IMAGE_TYPES.map(type => type.split('/')[1]).join(', ')}`);
    }

    return await this.uploadFile(file, 'images', folder);
  }

  /**
   * 上传Word文档
   */
  async uploadDocument(file: File, folder: string = 'documents'): Promise<string> {
    // 验证文件类型
    if (!this.SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
      throw new Error(`不支持的文档格式。支持的格式: docx, doc, pdf, txt, html, rtf`);
    }

    return await this.uploadFile(file, 'documents', folder);
  }

  /**
   * 删除文件
   */
  async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('文件删除失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除文件时出错:', error);
      return false;
    }
  }

  /**
   * 列出bucket中的文件
   */
  async listFiles(bucket: string, folder: string = ''): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('获取文件列表失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('列出文件时出错:', error);
      return [];
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(bucket: string, filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list('', {
          search: filePath
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }

  /**
   * 创建存储bucket（如果不存在）
   */
  async createBucketIfNotExists(bucketName: string): Promise<boolean> {
    try {
      // 检查bucket是否存在
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

      if (!bucketExists) {
        // 创建新bucket
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: [...this.SUPPORTED_IMAGE_TYPES, ...this.SUPPORTED_DOCUMENT_TYPES],
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (error) {
          console.error('创建bucket失败:', error);
          return false;
        }

        console.log(`Bucket "${bucketName}" 创建成功`);
      }

      return true;
    } catch (error) {
      console.error('检查/创建bucket时出错:', error);
      return false;
    }
  }

  /**
   * 批量上传文件
   */
  async uploadMultipleFiles(files: File[], bucket: string = 'uploads', folder: string = ''): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, bucket, folder));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads: string[] = [];
      const failedUploads: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value);
        } else {
          failedUploads.push(files[index].name);
          console.error(`文件 ${files[index].name} 上传失败:`, result.reason);
        }
      });

      if (failedUploads.length > 0) {
        console.warn(`${failedUploads.length} 个文件上传失败:`, failedUploads);
      }

      return successfulUploads;
    } catch (error) {
      console.error('批量上传失败:', error);
      throw error;
    }
  }

  /**
   * 检查文件类型
   */
  isImageFile(file: File): boolean {
    return this.SUPPORTED_IMAGE_TYPES.includes(file.type);
  }

  isDocumentFile(file: File): boolean {
    return this.SUPPORTED_DOCUMENT_TYPES.includes(file.type);
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
}

// 导出单例实例
export const supabaseUploadService = new SupabaseUploadService();
export default supabaseUploadService; 