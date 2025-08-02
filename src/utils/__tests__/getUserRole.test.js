import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserRole } from '../getUserRole.js';
import { supabase } from '../../supabaseClient.js';

// Tests für getUserRole: prüft Erfolgs- und Fehlerpfad
vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('getUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns role when query succeeds', async () => {
    const single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single,
    });

    const role = await getUserRole(1);
    expect(role).toBe('admin');
  });

  it('returns null when query fails', async () => {
    const error = new Error('db error');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const single = vi.fn().mockResolvedValue({ data: null, error });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single,
    });

    const role = await getUserRole(1);
    expect(role).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Fehler beim Abrufen der Rolle:', error);
    console.error.mockRestore();
  });
});
