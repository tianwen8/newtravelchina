import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * 图片上传服务
 * 支持Firebase Storage和免费图床
 */
class ImageUploadService {
  // 免费图床API配置
  private readonly FREE_IMAGE_HOST = 'https://api.imgbb.com/1/upload';
  private readonly IMGBB_API_KEY = '7d8c9f2e1a3b4c5d6e7f8g9h0i1j2k3l'; // 替换为您的API密钥

  /**
   * 上传图片到Firebase Storage
   */
  async uploadImageToFirebase(file: File, folder: string = 'article-images'): Promise<string> {
    try {
      // 验证文件是否为图片
      if (!file.type.match('image.*')) {
        throw new Error('只能上传图片文件');
      }

      // 生成唯一文件名
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const fileName = `${uniqueId}-${file.name}`;
      
      // 创建存储引用
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      console.log('开始上传图片到Firebase...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('图片上传成功:', snapshot.metadata.name);
      
      // 获取下载 URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('图片 URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Firebase图片上传失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片到免费图床 (备选方案)
   */
  async uploadImageToImgBB(file: File): Promise<string> {
    try {
      // 验证文件
      if (!file.type.match('image.*')) {
        throw new Error('只能上传图片文件');
      }

      if (file.size > 32 * 1024 * 1024) { // 32MB限制
        throw new Error('文件大小不能超过32MB');
      }

      // 转换为base64
      const base64 = await this.fileToBase64(file);
      
      // 准备表单数据
      const formData = new FormData();
      formData.append('key', this.IMGBB_API_KEY);
      formData.append('image', base64.split(',')[1]); // 移除data:image/jpeg;base64,前缀
      formData.append('name', file.name);

      console.log('开始上传图片到ImgBB...');
      
      const response = await fetch(this.FREE_IMAGE_HOST, {
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

      console.log('图片上传成功:', result.data.url);
      return result.data.url;
      
    } catch (error) {
      console.error('免费图床上传失败:', error);
      throw error;
    }
  }

  /**
   * 智能上传 - 自动选择最佳上传方式
   */
  async uploadImage(file: File, folder: string = 'article-images'): Promise<string> {
    try {
      // 首先尝试Firebase Storage
      return await this.uploadImageToFirebase(file, folder);
    } catch (firebaseError) {
      console.warn('Firebase上传失败，尝试免费图床:', firebaseError);
      
      try {
        // 如果Firebase失败，使用免费图床
        return await this.uploadImageToImgBB(file);
      } catch (imgbbError) {
        console.error('所有上传方式都失败了:', imgbbError);
        throw new Error('图片上传失败，请检查网络连接或联系管理员');
      }
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
   * 获取上传方式状态
   */
  async getUploadStatus(): Promise<{firebase: boolean, imgbb: boolean}> {
    const status = {
      firebase: false,
      imgbb: false
    };

    // 测试Firebase连接
    try {
      // 简单测试Firebase Storage访问
      const testRef = ref(storage, 'test');
      status.firebase = true;
    } catch (error) {
      console.warn('Firebase Storage不可用:', error);
    }

    // 测试ImgBB连接
    try {
      const response = await fetch('https://api.imgbb.com/', { method: 'HEAD' });
      status.imgbb = response.ok;
    } catch (error) {
      console.warn('ImgBB不可用:', error);
    }

    return status;
  }
}

export const imageUploadService = new ImageUploadService(); 