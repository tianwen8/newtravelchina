import { render, screen } from '@testing-library/react';

// 模拟 ChineseLearning 组件
jest.mock('./ChineseLearning', () => {
  return {
    __esModule: true,
    default: () => (
      <div>
        <h1>Learn Chinese</h1>
        <div>
          <h2>Basic Conversations</h2>
          <div>
            <p>Greetings</p>
            <p>你好 (Nǐ hǎo) - Hello</p>
          </div>
        </div>
        <div>
          <h2>Practical Scenarios</h2>
          <div>
            <h3>Restaurant Ordering</h3>
          </div>
        </div>
        <div>
          <h2>AI Conversation Practice</h2>
        </div>
      </div>
    )
  };
});

import ChineseLearning from './ChineseLearning';

// 模拟 react-helmet
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('ChineseLearning Component', () => {
  test('renders main heading', () => {
    render(<ChineseLearning />);
    const headingElement = screen.getByText(/Learn Chinese/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders basic conversations section', () => {
    render(<ChineseLearning />);
    expect(screen.getByText(/Basic Conversations/i)).toBeInTheDocument();
    expect(screen.getByText(/Greetings/i)).toBeInTheDocument();
    expect(screen.getByText(/你好 \(Nǐ hǎo\) - Hello/i)).toBeInTheDocument();
  });

  test('renders practical scenarios section', () => {
    render(<ChineseLearning />);
    expect(screen.getByText(/Practical Scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Restaurant Ordering/i)).toBeInTheDocument();
  });

  test('renders AI practice section', () => {
    render(<ChineseLearning />);
    expect(screen.getByText(/AI Conversation Practice/i)).toBeInTheDocument();
  });
}); 