import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio nav and hero call to action', () => {
  render(<App />);
  expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '#/projects');
});

test('section links are routes, not bare anchors that the hash router would 404', () => {
  render(<App />);
  ['about', 'projects', 'arcade', 'techzone', 'contact'].forEach((id) => {
    const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toContain(`#/${id}`);
  });
});
