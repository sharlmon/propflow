import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('JengaBora foundation', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            service: 'propflow-ecosystem-api',
            products: ['ecosystem', 'propflow', 'keja', 'stay', 'jengabora'],
          },
        }),
      }),
    );
  });

  it('renders the focused construction application and shared API status', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Milestones before money moves.' })).toBeVisible();
    expect(await screen.findByText('API connected')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects');
  });
});
