# 🚀 Supabase 设置指南

## 为什么选择 Supabase？

从您的Firebase控制台截图看，Firebase Storage需要升级到付费版本。**Supabase是一个优秀的免费替代方案**：

### ✅ **Supabase 优势**
- 🆓 **免费额度更大**：1GB存储空间，每月50万请求
- 💾 **PostgreSQL数据库**：比Firestore更强大的SQL查询能力
- 📁 **文件存储免费**：不像Firebase Storage需要付费
- 🔒 **内置认证**：支持多种登录方式
- 🌍 **CDN加速**：全球分发网络
- 🔧 **API自动生成**：基于数据库schema自动生成RESTful API

## 📋 **快速设置步骤**

### 第一步：创建Supabase项目

1. 访问 [Supabase控制台](https://app.supabase.com/)
2. 点击"New Project"
3. 选择组织（或创建新组织）
4. 填写项目信息：
   - **Name**: `travel-china`
   - **Database Password**: 设置一个强密码
   - **Region**: 选择 `Southeast Asia (Singapore)` （最接近中国）
5. 点击"Create new project"

### 第二步：获取项目凭据

项目创建完成后，在**Settings → API**页面找到：

```bash
# 项目URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# 公开密钥（anon key）
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 第三步：设置数据库表

在**SQL Editor**中执行以下SQL创建表结构：

```sql
-- 用户表
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文章表
CREATE TABLE public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    word_doc_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器到表
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 第四步：设置存储桶

在**Storage**页面：

1. 点击"Create a new bucket"
2. 创建以下桶：
   - **images**: 存储图片文件
   - **documents**: 存储Word文档等
   - **uploads**: 通用文件存储

3. 设置存储策略（在每个桶的Policies标签页）：

```sql
-- 允许所有人查看文件
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (true);

-- 允许认证用户上传文件
CREATE POLICY "Allow authenticated users to upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许用户删除自己上传的文件
CREATE POLICY "Allow users to delete own files" ON storage.objects FOR DELETE USING (auth.uid()::text = metadata ->> 'uploadedBy');
```

### 第五步：设置行级安全策略（RLS）

在**SQL Editor**中执行：

```sql
-- 启用行级安全
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 文章表策略
CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
);

-- 评论表策略
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (user_id = auth.uid());
```

### 第六步：配置认证

在**Authentication → Settings**中：

1. **Site URL**: 设置为您的域名，如 `http://localhost:5173`（开发环境）
2. **Redirect URLs**: 添加 `http://localhost:5173/auth/callback`
3. 启用需要的登录方式：
   - Email/Password ✅
   - Google OAuth（可选）
   - GitHub OAuth（可选）

## 🔄 **从Firebase迁移到Supabase**

### 更新项目配置

1. 复制 `env.example` 到 `.env`：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，填入Supabase凭据：
```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# 选择上传服务
VITE_UPLOAD_SERVICE=supabase
```

3. 更新 `src/config/supabase.ts` 中的配置：
```typescript
// 启用Supabase
export const USE_SUPABASE = true;
```

### 数据迁移（可选）

如果您在Firebase中已有数据，可以使用迁移脚本：

```bash
# 安装依赖
npm install firebase-admin @supabase/supabase-js

# 运行迁移脚本（需要先创建）
npm run migrate:firebase-to-supabase
```

## 🧪 **测试新后台**

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问增强版管理面板：
```
http://localhost:5173/admin-enhanced
```

3. 测试功能：
   - ✅ 切换到Supabase存储
   - ✅ 上传Word文档和图片
   - ✅ 自动提取文档内容
   - ✅ SEO关键词优化

## 📊 **功能对比**

| 功能 | Firebase | Supabase | 状态 |
|------|----------|----------|------|
| 数据库 | Firestore (NoSQL) | PostgreSQL (SQL) | ✅ 已支持 |
| 文件存储 | 需要付费 | 1GB免费 | ✅ 已支持 |
| 认证 | 完整支持 | 完整支持 | ✅ 已支持 |
| 实时更新 | 优秀 | 良好 | ✅ 已支持 |
| API | 自动生成 | RESTful + GraphQL | ✅ 已支持 |
| 监控 | 完整 | 基础 | ⚠️ 基础 |

## 💡 **最佳实践建议**

### 1. 生产环境配置
```bash
# 生产环境变量
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_UPLOAD_SERVICE=supabase
VITE_DEBUG_MODE=false
```

### 2. 图片优化策略
- 使用Supabase Storage的图片变换功能
- 配置CDN缓存策略
- 实现图片懒加载

### 3. 内容管理优化
- 利用PostgreSQL的全文搜索功能
- 实现内容版本控制
- 设置自动备份策略

## 🔧 **故障排除**

### 常见问题

**Q1: 上传文件时提示权限错误**
```bash
# 检查存储策略是否正确设置
# 确保用户已正确认证
```

**Q2: 数据库连接失败**
```bash
# 检查.env文件中的URL和密钥
# 确保网络连接正常
```

**Q3: 认证登录失败**
```bash
# 检查Site URL设置
# 确保Redirect URLs正确配置
```

## 📞 **技术支持**

如有问题，请检查：
1. [Supabase官方文档](https://supabase.com/docs)
2. [Supabase Discord社区](https://discord.supabase.com/)
3. 项目的GitHub Issues

---

## 🎯 **下一步计划**

1. **✅ 立即可用**: Supabase基础配置
2. **🚧 本周完成**: 数据迁移和测试
3. **📈 下周目标**: 性能优化和监控

切换到Supabase后，您将拥有：
- 🆓 **免费的文件存储**
- 💪 **更强大的数据库查询**
- 🚀 **更好的开发体验**
- 📊 **完整的后台管理**

现在就开始体验Supabase吧！ 