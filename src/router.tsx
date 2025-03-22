import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import VisaFree from './pages/VisaFree';
import Attractions from './pages/Attractions';
import ChineseLearning from './pages/ChineseLearning';
import Community from './pages/Community';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'visa-free',
        element: <VisaFree />,
      },
      {
        path: 'attractions',
        element: <Attractions />,
      },
      {
        path: 'chinese-learning',
        element: <ChineseLearning />,
      },
      {
        path: 'community',
        element: <Community />,
      },
    ],
  },
]);