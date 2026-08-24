import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App, { router } from '../App';

const unauthorized = () =>
  Promise.resolve(
    new Response(
      JSON.stringify({ error: { code: 'authentication_required', message: 'Sign in', request_id: 'test' } }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    ),
  );

describe('authentication routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(unauthorized));
  });

  it('renders the login form at a real URL', async () => {
    await router.navigate('/login');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('redirects a protected route to login when signed out', async () => {
    await router.navigate('/propflow/dashboard');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('renders the canonical FindYourKeja marketplace route', async () => {
    await router.navigate('/keja/listings');
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: /Find a place that fits real life/i }),
    ).toBeInTheDocument();
  });
});
