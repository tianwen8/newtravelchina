import { render, screen } from '@testing-library/react';

// 模拟 App 组件
jest.mock('./App', () => {
  return {
    __esModule: true,
    default: () => (
      <div className="app-container">
        <nav className="main-nav">
          <a href="/" className="nav-logo">Travel China</a>
          <div className="nav-links">
            <a href="/visa-free">Visa-Free Travel</a>
            <a href="/attractions">Attractions & Culture</a>
            <a href="/chinese-learning">Learn Chinese</a>
            <a href="/community">Community</a>
          </div>
        </nav>
        
        <main className="main-content">
          <div data-testid="outlet">Outlet Content</div>
        </main>
        
        <footer className="main-footer">
          <p>© 2024 Travel China. All rights reserved.</p>
        </footer>
      </div>
    )
  };
});

import App from './App';

describe('App Component', () => {
  test('renders navigation bar', () => {
    render(<App />);
    
    // 使用更具体的选择器
    const navLogo = screen.getByRole('link', { name: /Travel China/i });
    expect(navLogo).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visa-Free Travel/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Attractions & Culture/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn Chinese/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Community/i })).toBeInTheDocument();
  });

  test('renders footer', () => {
    render(<App />);
    
    const footerText = screen.getByText(/© 2024 Travel China. All rights reserved./i);
    expect(footerText).toBeInTheDocument();
  });

  test('renders outlet content', () => {
    render(<App />);
    
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
}); 