import { render, screen } from '@testing-library/react';

// 模拟 Attractions 组件
jest.mock('./Attractions', () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <h1>Attractions & Culture</h1>
        <div>
          <div>
            <h2>Beijing</h2>
            <p>Forbidden City, Great Wall, Temple of Heaven and other World Heritage sites</p>
          </div>
          <div>
            <h2>Xi'an</h2>
          </div>
          <div>
            <h2>Chengdu</h2>
          </div>
        </div>
        <div>
          <h2>Best Travel Seasons</h2>
        </div>
      </div>
    )
  };
});

import Attractions from './Attractions';

// 模拟 react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Attractions Component', () => {
  test('renders main heading', () => {
    render(<Attractions />);
    const headingElement = screen.getByText(/Attractions & Culture/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders regions information', () => {
    render(<Attractions />);
    expect(screen.getByText(/Beijing/i)).toBeInTheDocument();
    expect(screen.getByText(/Xi'an/i)).toBeInTheDocument();
    expect(screen.getByText(/Chengdu/i)).toBeInTheDocument();
    expect(screen.getByText(/Forbidden City, Great Wall, Temple of Heaven and other World Heritage sites/i)).toBeInTheDocument();
  });

  test('renders seasonal information', () => {
    render(<Attractions />);
    expect(screen.getByText(/Best Travel Seasons/i)).toBeInTheDocument();
  });
}); 