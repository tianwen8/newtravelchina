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
      
      // 404页面
      { path: '*', element: <NotFound /> }
    ]
  }
]);