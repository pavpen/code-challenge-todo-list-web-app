import { render, screen } from '@testing-library/react';
import App from './App';
import { createRoot } from 'react-dom/client'

test('renders to-do list header', () => {
  const root = createRoot(document.createElement('div'));
  render(<App />);
  const headerElement = screen.getByText(/todos/i);
  expect(headerElement).toBeInTheDocument();
});
