# Firebase 设置指南

本指南将帮助您为中国旅游网站项目设置 Firebase。

## 步骤 1: 创建 Firebase 项目

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如 "travel-china"）
4. 选择是否启用 Google Analytics（推荐启用）
5. 点击"创建项目"

## 步骤 2: 添加网页应用

1. 在项目概览页面，点击"网页"图标 (</>) 以添加网页应用
2. 输入应用昵称（例如 "travel-china-web"）
3. 勾选"同时设置 Firebase Hosting"（可选）
4. 点击"注册应用"
5. 复制显示的 Firebase 配置代码

## 步骤 3: 更新项目配置

1. 打开项目中的 `src/firebase/config.ts` 文件
2. 将 Firebase 配置替换为您自己的配置：

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // 如果您启用了 Analytics
};
```

## 步骤 4: 设置 Authentication 认证

1. 在 Firebase 控制台左侧菜单，点击"构建" > "Authentication"
2. 点击"开始使用"按钮
3. 启用以下登录方式：
   - **邮箱/密码** - 必需
   - **Google** - 推荐
   - 其他登录方式（如 GitHub, Facebook, 等）- 可选

### 邮箱/密码设置
1. 点击"邮箱/密码"
2. 切换"启用"开关
3. 可选：启用"邮箱链接"（无密码登录）
4. 点击"保存"

### Google 登录设置
1. 点击"Google"
2. 切换"启用"开关
3. 添加支持邮箱（项目管理员的邮箱）
4. 点击"保存"

## 步骤 5: 设置 Firestore 数据库

1. 在左侧菜单，点击"构建" > "Firestore Database"
2. 点击"创建数据库"
3. 选择初始安全规则模式（建议选择"测试模式"开始）
4. 选择数据库位置（建议选择接近目标用户的区域）
5. 点击"启用"

## 步骤 6: 设置 Storage 存储

1. 在左侧菜单，点击"构建" > "Storage"
2. 点击"开始使用"
3. 选择安全规则设置（建议开始时选择"测试模式"）
4. 点击"下一步"
5. 选择存储位置（与 Firestore 选择相同的区域）
6. 点击"完成"

## 步骤 7: 设置安全规则

### Firestore 规则

在 Firestore Database > 规则 标签页，将以下规则复制粘贴进去：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许所有读操作
    match /{document=**} {
      allow read: if true;
    }
    
    // 允许所有写操作，但仅在开发阶段
    // 注意：这在生产中是不安全的，仅用于初始化数据库
    match /{document=**} {
      allow write: if true;
    }
  }
}
```

初始化后，可以使用更严格的规则（见 `firebase-rules.txt`）。

### Storage 规则

在 Storage > 规则 标签页，将以下规则复制粘贴进去：

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 允许公共读取，仅认证用户可写入
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 步骤 8: 初始化应用

1. 启动应用（`npm run dev`）
2. 在浏览器中访问 `http://localhost:5173/complete-init`
3. 点击"一键初始化数据库"按钮
4. 初始化过程会在页面和控制台中显示管理员账户信息
5. **重要安全提示**：请记录初始管理员凭据，并在首次登录后立即修改密码

## 管理员账户

为了安全起见，请执行以下操作：

1. 首次初始化后立即登录管理员账户
2. 访问 `/admin` 路径进入管理员面板
3. 使用管理面板提供的功能修改默认密码
4. 不要在公共场合或代码仓库中分享管理员凭据

## 故障排除

### Authentication 认证问题

**问题**: 登录时显示 "Firebase: Error (auth/operation-not-allowed)"
**解决方案**: 确保在 Firebase 控制台中启用了相应的登录方式。

### 权限问题

**问题**: 写入数据库或存储时出现 "permission-denied" 错误
**解决方案**: 检查 Firestore 和 Storage 的安全规则，确保为用户提供了适当的权限。

### 初始化问题

**问题**: 数据库初始化失败
**解决方案**: 
- 确保 Firebase 项目配置正确
- 检查网络连接
- 查看浏览器控制台中的错误消息

## 生产环境注意事项

在将应用部署到生产环境之前：

1. 更新安全规则，使用更严格的访问控制
2. 设置 Firebase Authentication 域名（如果使用自定义域名）
3. 考虑启用 Firebase App Check 提高安全性
4. 监控流量和使用情况，以避免超出免费配额
5. 定期审核管理员账户和权限设置 