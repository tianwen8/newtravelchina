import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomeModern from './pages/HomeModern';
import VisaFree from './pages/VisaFree';
// import Community from './pages/Community'; // 暂时禁用社区功能
import CommunityComingSoon from './pages/CommunityComingSoon';
import Article from './pages/Article';
import ArticlesList from './pages/ArticlesList';
import TravelGuidesList from './pages/TravelGuidesList';
import TravelGuideDetail from './pages/TravelGuideDetail';
import TripBuddiesList from './pages/TripBuddiesList';
import TripBuddyDetail from './pages/TripBuddyDetail';
import ChineseLearning from './pages/ChineseLearning';
import Attractions from './pages/Attractions';
import NotFound from './pages/NotFound';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminInit from './pages/AdminInit';
import EnhancedAdminDashboard from './pages/EnhancedAdminDashboard';
// import SimpleSupabaseAdmin from './pages/SimpleSupabaseAdmin'; // 暂时禁用
// import DirectAdminInit from './pages/DirectAdminInit'; // 暂时禁用Firebase依赖
// import CompleteDbInit from './pages/CompleteDbInit'; // 暂时禁用Firebase依赖
import ImageUploadTest from './pages/ImageUploadTest';
import FileUploadTest from './pages/FileUploadTest';
import ArticleManager from './pages/ArticleManager';
import SimpleUploadTest from './pages/SimpleUploadTest';
import ComingSoon from './pages/ComingSoon';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <HomeModern /> },
      { path: '/travel-guides', element: <VisaFree /> },
      { path: '/visa-free', element: <VisaFree /> }, // 保留旧链接兼容性
      { path: '/attractions', element: <Attractions /> },
              { path: '/chinese-learning', element: <ChineseLearning /> },
        { path: '/community', element: <CommunityComingSoon /> }, // 显示即将推出页面
      
      // 文章相关路由
      { path: '/articles', element: <ArticlesList /> },
      { path: '/articles/:articleId', element: <Article /> },
      
      // Guide pages - temporary coming soon pages
      { path: '/guides/:guide', element: <ComingSoon /> },
      
      // 攻略相关路由
      { path: '/community/guides', element: <TravelGuidesList /> },
      { path: '/community/guides/:guideId', element: <TravelGuideDetail /> },
      
      // 结伴同行相关路由
      { path: '/community/trip-buddies', element: <TripBuddiesList /> },
      { path: '/community/trip-buddies/:buddyId', element: <TripBuddyDetail /> },
      
      // 认证相关路由
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { 
        path: '/profile', 
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) 
      },
      
      // 管理员初始化页面 - 公开访问
      { path: '/admin-init', element: <AdminInit /> },
      // { path: '/direct-admin-init', element: <DirectAdminInit /> }, // 暂时禁用
      // { path: '/complete-init', element: <CompleteDbInit /> }, // 暂时禁用
      
      // 管理员仪表盘
      { 
        path: '/admin', 
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      
      // 增强版管理员仪表盘
      { 
        path: '/admin-enhanced', 
        element: (
          <ProtectedRoute>
            <EnhancedAdminDashboard />
          </ProtectedRoute>
        ) 
      },
      
      // 纯Supabase简化版后台 - 暂时禁用
      // { 
      //   path: '/admin-supabase', 
      //   element: (
      //     <ProtectedRoute>
      //       <SimpleSupabaseAdmin />
      //     </ProtectedRoute>
      //   ) 
      // },
      
      // 图片上传测试页面
      { path: '/image-upload-test', element: <ImageUploadTest /> },
      
      // 文件上传测试页面
      { path: '/file-upload-test', element: <FileUploadTest /> },
      
      // 文章管理工具
      { path: '/article-manager', element: <ArticleManager /> },
      
      // 简单上传测试页面
      { path: '/simple-upload-test', element: <SimpleUploadTest /> },
      
      // 404页面
      { path: '*', element: <NotFound /> }
    ]
  }
]);