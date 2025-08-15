import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { router } from './router'
import { store } from './store'
import './i18n'
import { initGA, pageview } from './services/analytics'
import { AuthProvider } from './contexts/AuthContext'

// 初始化Google Analytics
initGA();

// 由于react-router v6的架构，我们不能直接将AnalyticsWrapper放入路由中
// 我们将在应用启动后监听路由变化
// 当用户导航时，我们将使用useEffect手动触发pageview

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
)

// 监听路由变化并跟踪页面访问
// 在实际应用中，这需要在适当的组件（如App.tsx）中实现
// 这里我们只是确保GA代码已初始化
window.addEventListener('load', () => {
  // 初始页面加载时跟踪
  pageview(window.location.pathname + window.location.search);
});

// 当路由变化时（比如使用Link组件导航），使用自定义事件跟踪
const originalPushState = history.pushState;
history.pushState = function(...args) {
  const result = originalPushState.apply(this, args);
  
  // 延迟执行以确保URL已更新
  setTimeout(() => {
    pageview(window.location.pathname + window.location.search);
  }, 0);
  
  return result;
};
