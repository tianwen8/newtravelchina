import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// 验证环境变量
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('Supabase环境变量缺失，使用占位符配置');
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          author_name: string;
          author_email: string;
          category: string | null;
          tags: string[] | null;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          content: string;
          author_name: string;
          author_email: string;
          category?: string | null;
          tags?: string[] | null;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          author_name?: string;
          author_email?: string;
          category?: string | null;
          tags?: string[] | null;
          likes_count?: number;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          featured_image: string | null;
          category: string;
          tags: string[] | null;
          author_id: string;
          view_count: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category: string;
          tags?: string[] | null;
          author_id: string;
          view_count?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          featured_image?: string | null;
          category?: string;
          tags?: string[] | null;
          author_id?: string;
          view_count?: number;
          is_published?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

// 启用Supabase作为Firebase Storage的免费替代方案
export const USE_SUPABASE = true;

// Supabase服务函数
export const supabaseServices = {
  // 用户相关
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 评论相关
  async getComments(limit = 10, offset = 0) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { data, error };
  },

  async addComment(comment: Database['public']['Tables']['comments']['Insert']) {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();
    
    return { data, error };
  },

  // 文章相关
  async getArticles(category?: string) {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // 图片上传
  async uploadImage(file: File, bucket = 'images') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { data: { publicUrl, path: filePath }, error: null };
  }
};

export default supabase; 