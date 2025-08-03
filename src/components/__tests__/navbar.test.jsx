import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar.jsx';

vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

describe('Navbar', () => {
  it('does not render profile link when logged out', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    );

    expect(html).not.toContain('/profil');
    expect(html).not.toContain('Profil bearbeiten');
  });
});

