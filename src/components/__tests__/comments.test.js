import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addComment } from '../CommentsSection.jsx';
import { supabase } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('comment creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a comment', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    supabase.from.mockReturnValue({ insert });

    await addComment(1, 2, 'Hallo Welt');

    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(insert).toHaveBeenCalledWith([
      { project_id: 1, user_id: 2, content: 'Hallo Welt' },
    ]);
  });

  it('throws on error', async () => {
    const insert = vi.fn().mockResolvedValue({ error: 'fail' });
    supabase.from.mockReturnValue({ insert });

    await expect(addComment(3, 4, 'Text')).rejects.toBe('fail');
  });
});

