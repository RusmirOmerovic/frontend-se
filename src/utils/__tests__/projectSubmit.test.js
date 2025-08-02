import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitProject } from '../projectSubmit.js';
import { supabase } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('submitProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates existing project and calls onProjectSaved', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 1 }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ update });

    const onProjectSaved = vi.fn();
    await submitProject({
      user: { id: 1 },
      project: { id: 1 },
      name: 'Test',
      status: 'in Arbeit',
      startdatum: '2024-01-01',
      onProjectSaved,
    });

    expect(supabase.from).toHaveBeenCalledWith('projects');
    expect(update).toHaveBeenCalledWith({
      name: 'Test',
      status: 'in Arbeit',
      startdatum: '2024-01-01',
    });
    expect(eq).toHaveBeenCalledWith('id', 1);
    expect(select).toHaveBeenCalled();
    expect(single).toHaveBeenCalled();
    expect(onProjectSaved).toHaveBeenCalled();
  });
});
