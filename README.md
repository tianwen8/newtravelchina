# 中国旅游网站 (Travel China)

一个全功能的旅游信息网站，提供中国旅游资讯、免签政策、景点介绍、旅行攻略以及旅行者社区。

## 项目概述

这个项目是一个使用 React、TypeScript 和 Firebase 构建的现代旅游信息网站。它提供了丰富的功能，旨在帮助游客了解中国旅游相关信息并分享旅行经验。

## 主要功能

- **多语言支持**: 中文和英文的完整国际化
- **用户认证系统**: 
  - 基于Firebase的邮箱/密码登录
  - 社交媒体登录 (Google, GitHub, Facebook等)
  - 用户资料管理
- **文章管理系统**:
  - 分类文章展示
  - 详细的文章内容页
  - 阅读量统计
- **旅行社区**:
  - 评论系统，用户可发表旅行体验
  - 瀑布流评论展示
  - 评论点赞功能
- **管理员面板**:
  - 文章发布和管理
  - 数据库初始化工具
  - 评论管理
- **动态内容**:
  - 首页精选内容轮播
  - 分类文章自动更新
  - 评论流自动刷新
- **图片上传功能**:
  - 支持拖放上传
  - 图片URL粘贴
  - Firebase存储集成

## 技术栈

- **前端框架**: React 18
- **编程语言**: TypeScript
- **状态管理**: Redux Toolkit
- **路由**: React Router 6
- **样式**: 自定义CSS
- **后端服务**: Firebase
  - Authentication (认证)
  - Firestore Database (数据库)
  - Storage (存储)
- **国际化**: i18next
- **构建工具**: Vite
- **包管理**: npm

## 安装和设置

### 前提条件

- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- Firebase账户和项目

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/tianwen8/newtravelchina.git
cd newtravelchina
```

2. 安装依赖
```bash
npm install
```

3. Firebase设置
   - 在Firebase控制台创建一个新项目
   - 启用Authentication (邮箱/密码和Google登录)
   - 创建Firestore数据库
   - 启用Storage存储
   - 复制Firebase配置到 `src/firebase/config.ts`
   - 设置Firestore安全规则 (参见 `firebase-rules.txt`)

4. 运行开发服务器
```bash
npm run dev
```

5. 初始化应用
   - 访问 `/complete-init` 路由初始化数据库
   - 使用默认管理员账户登录 (邮箱: `x253400489@gmail.com`, 密码: `admin123456`)

## 项目结构

```
src/
├── assets/          # 图片和静态资源
├── components/      # 可复用组件
├── contexts/        # React上下文(Context)
├── firebase/        # Firebase配置和初始化脚本
├── i18n/            # 国际化文件
│   └── locales/     # 翻译文件
├── pages/           # 页面组件
├── services/        # 服务层(API交互)
├── store/           # Redux状态管理
│   └── slices/      # Redux切片
├── styles/          # 全局样式
├── App.tsx          # 主应用组件
├── router.tsx       # 路由配置
└── main.tsx         # 应用入口
```

## 部署

项目可以部署到Firebase Hosting或其他静态网站托管服务:

```bash
# 构建生产版本
npm run build

# 部署到Firebase Hosting (需要Firebase CLI)
firebase deploy
```

## 贡献

欢迎贡献代码、报告问题或提出新功能建议!

## 许可

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情
