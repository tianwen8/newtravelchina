import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * 图片上传服务
 * 负责处理图片上传到 Firebase Storage 并返回下载 URL
 */
class ImageUploadService {
  /**
   * 上传图片到 Firebase Storage
   * @param file 要上传的图片文件
   * @param folder 存储路径/文件夹名
   * @returns 上传后的图片 URL
   */
  async uploadImage(file: File, folder: string = 'article-images'): Promise<string> {
    try {
      // 验证文件是否为图片
      if (!file.type.match('image.*')) {
        throw new Error('只能上传图片文件');
      }

      // 生成唯一文件名 - 使用时间戳和随机数
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const fileName = `${uniqueId}-${file.name}`;
      
      // 创建存储引用
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // 上传文件
      console.log('开始上传图片...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('图片上传成功:', snapshot.metadata.name);
      
      // 获取下载 URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('图片 URL:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }
}

export const imageUploadService = new ImageUploadService(); 