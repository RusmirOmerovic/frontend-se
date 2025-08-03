import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePassword } from '../updatePassword.js';
import { supabase } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('updatePassword', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful password change', async () => {
    supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });
    globalThis.alert = vi.fn();

    await updatePassword('geheim', navigate);

    expect(globalThis.alert).toHaveBeenCalledWith(
      'Passwort erfolgreich geändert. Bitte melde dich erneut an.'
    );
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('handles password change error', async () => {
    const error = { message: 'oops' };
    supabase.auth.updateUser.mockResolvedValue({ data: null, error });
    globalThis.alert = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await updatePassword('geheim', navigate);

    expect(globalThis.alert).toHaveBeenCalledWith(
      `Fehler beim Ändern des Passworts: ${error.message}`
    );
    expect(console.error).toHaveBeenCalledWith(
      'Fehler beim Ändern des Passworts:',
      error.message
    );
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    console.error.mockRestore();
  });
});
