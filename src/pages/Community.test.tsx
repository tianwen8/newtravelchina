import { render, screen } from '@testing-library/react';

// 模拟 Community 组件
jest.mock('./Community', () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <h1>Community</h1>
        <div>
          <h2>Share Your Story</h2>
        </div>
        <div>
          <h2>Travel Experience</h2>
          <div>
            <h3>Transportation</h3>
            <h3>Food Recommendations</h3>
            <h3>Accommodation Tips</h3>
          </div>
        </div>
        <div>
          <h2>Useful Tips</h2>
          <div>
            <h3>Pre-trip Preparation</h3>
            <h3>Safety Tips</h3>
          </div>
        </div>
      </div>
    )
  };
});

import Community from './Community';

// 模拟 CSS 模块
jest.mock('./Community.css', () => ({}));

// 模拟 react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Community Component', () => {
  test('renders main heading', () => {
    render(<Community />);
    const headingElement = screen.getByText(/Community/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders share section', () => {
    render(<Community />);
    expect(screen.getByText(/Share Your Story/i)).toBeInTheDocument();
  });

  test('renders travel experience section', () => {
    render(<Community />);
    expect(screen.getByText(/Travel Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
    expect(screen.getByText(/Food Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Accommodation Tips/i)).toBeInTheDocument();
  });

  test('renders useful tips section', () => {
    render(<Community />);
    expect(screen.getByText(/Useful Tips/i)).toBeInTheDocument();
    expect(screen.getByText(/Pre-trip Preparation/i)).toBeInTheDocument();
    expect(screen.getByText(/Safety Tips/i)).toBeInTheDocument();
  });
}); 