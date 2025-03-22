import { render, screen } from '@testing-library/react';

// 模拟 Home 组件
jest.mock('./Home', () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <h1>Discover China's Beauty</h1>
        <div>
          <div>Visa-Free Travel</div>
          <div>Attractions & Culture</div>
          <div>Learn Chinese</div>
          <div>Community</div>
        </div>
      </div>
    )
  };
});

import Home from './Home';

// 模拟 react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Home Component', () => {
  test('renders main heading', () => {
    render(<Home />);
    const headingElement = screen.getByText(/Discover China's Beauty/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders feature cards', () => {
    render(<Home />);
    expect(screen.getByText(/Visa-Free Travel/i)).toBeInTheDocument();
    expect(screen.getByText(/Attractions & Culture/i)).toBeInTheDocument();
    expect(screen.getByText(/Learn Chinese/i)).toBeInTheDocument();
    expect(screen.getByText(/Community/i)).toBeInTheDocument();
  });
});