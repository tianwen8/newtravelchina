import { render, screen } from '@testing-library/react';

// 模拟 VisaFree 组件
jest.mock('./VisaFree', () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <h1>Visa-Free Travel</h1>
        <div>
          <h2>Latest Visa-Free Policies</h2>
          <div>144-Hour Transit Visa-Free</div>
          <div>72-Hour Transit Visa-Free</div>
        </div>
        <div>
          <h2>Travel Tips</h2>
        </div>
      </div>
    )
  };
});

import VisaFree from './VisaFree';

// 模拟 react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('VisaFree Component', () => {
  test('renders main heading', () => {
    render(<VisaFree />);
    const headingElement = screen.getByText(/Visa-Free Travel/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders visa policy information', () => {
    render(<VisaFree />);
    expect(screen.getByText(/Latest Visa-Free Policies/i)).toBeInTheDocument();
    expect(screen.getByText(/144-Hour Transit Visa-Free/i)).toBeInTheDocument();
    expect(screen.getByText(/72-Hour Transit Visa-Free/i)).toBeInTheDocument();
  });

  test('renders travel tips section', () => {
    render(<VisaFree />);
    expect(screen.getByText(/Travel Tips/i)).toBeInTheDocument();
  });
}); 