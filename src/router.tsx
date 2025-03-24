import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import VisaFree from './pages/VisaFree';
import Community from './pages/Community';
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
import DirectAdminInit from './pages/DirectAdminInit';
import CompleteDbInit from './pages/CompleteDbInit';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/visa-free', element: <VisaFree /> },
      { path: '/attractions', element: <Attractions /> },
      { path: '/chinese-learning', element: <ChineseLearning /> },
      { path: '/community', element: <Community /> },
      
      // 文章相关路由
      { path: '/articles', element: <ArticlesList /> },
      { path: '/articles/:articleId', element: <Article /> },
      
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
      { path: '/direct-admin-init', element: <DirectAdminInit /> },
      { path: '/complete-init', element: <CompleteDbInit /> },
      
      // 管理员仪表盘
      { 
        path: '/admin', 
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      
      // 404页面
      { path: '*', element: <NotFound /> }
    ]
  }
]);