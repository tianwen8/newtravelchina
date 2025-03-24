# 配置 Firebase 社交账号登录的指南

要启用社交媒体登录功能，您需要在 Firebase 控制台中进行以下配置：

## 1. 登录 Firebase 控制台

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择您的项目

## 2. 配置身份验证方法

1. 在左侧导航栏中，点击 "Build" -> "Authentication"
2. 点击 "Sign-in method" 选项卡
3. 启用您想要使用的登录方式：

### Google 登录
1. 点击 "Google" 行
2. 将开关切换到 "启用" 位置
3. 输入您的支持电子邮件地址
4. 点击 "保存"

### Facebook 登录
1. 点击 "Facebook" 行
2. 将开关切换到 "启用" 位置
3. 您需要创建一个 Facebook 应用，请访问 [Facebook 开发者控制台](https://developers.facebook.com/)
4. 创建应用后，复制应用 ID 和应用密钥到 Firebase 控制台相应字段
5. 在 Facebook 开发者控制台中，添加 OAuth 重定向 URI（可从 Firebase 控制台获取）
6. 点击 "保存"

### GitHub 登录
1. 点击 "GitHub" 行
2. 将开关切换到 "启用" 位置
3. 您需要创建一个 GitHub OAuth 应用，请访问 [GitHub 开发者设置](https://github.com/settings/developers)
4. 创建应用后，复制客户端 ID 和客户端密钥到 Firebase 控制台相应字段
5. 在 GitHub 开发者设置中，添加授权回调 URL（可从 Firebase 控制台获取）
6. 点击 "保存"

### Apple 登录
1. 点击 "Apple" 行
2. 将开关切换到 "启用" 位置
3. 您需要使用 Apple Developer 帐户，设置 Sign in with Apple
4. 配置服务 ID 和密钥
5. 详细步骤可参考 [Firebase 文档](https://firebase.google.com/docs/auth/web/apple)
6. 点击 "保存"

### 微信登录（需要特殊配置）
微信登录需要特殊配置，不能直接通过 Firebase 控制台启用。您需要：

1. 创建微信开发者账户并注册应用
2. 使用 Firebase 自定义身份验证
3. 创建后端服务，处理微信授权流程
4. 生成自定义令牌，供前端使用

详细步骤可参考 [Custom Authentication System](https://firebase.google.com/docs/auth/web/custom-auth)

## 3. 更新应用配置

完成身份验证提供商配置后，请确保您的应用配置也已更新：

1. 在 Firebase 控制台的项目设置中，确认您的应用 ID 和域名设置正确
2. 确保已将应用域名添加到授权域中
3. 如果部署到生产环境，请将生产域名也添加到授权域列表

## 4. 测试登录流程

1. 使用各种社交媒体账号测试登录流程
2. 检查用户数据是否正确存储在 Firebase Authentication 中
3. 确保登录后可以正确获取用户信息

## 注意事项

- 不同的社交媒体平台可能有不同的审批流程，特别是 Facebook 和 Apple
- 在开发环境中，某些提供商可能需要特殊配置才能正常工作
- 确保您的应用遵循各平台的品牌使用指南 