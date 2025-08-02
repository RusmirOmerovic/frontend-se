import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addOrUpdateMilestone } from '../../pages/ProjectDetail.jsx';
import { removeMilestone } from '../MilestoneList.jsx';
import { supabase } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('milestone CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a milestone when no id is provided', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 1 }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    supabase.from.mockReturnValue({ insert });

    const res = await addOrUpdateMilestone(5, {
      title: 'A',
      description: 'B',
      due_date: '2024-01-01',
      status: 'offen',
    });

    expect(supabase.from).toHaveBeenCalledWith('milestones');
    expect(insert).toHaveBeenCalledWith({
      title: 'A',
      description: 'B',
      due_date: '2024-01-01',
      status: 'offen',
      project_id: 5,
    });
    expect(res).toEqual({ id: 1 });
  });

  it('updates a milestone when id is provided', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 2 }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ update });

    const res = await addOrUpdateMilestone(3, {
      id: 2,
      title: 'X',
      description: 'Y',
      due_date: '2024-02-02',
      status: 'done',
    });

    expect(supabase.from).toHaveBeenCalledWith('milestones');
    expect(update).toHaveBeenCalledWith({
      title: 'X',
      description: 'Y',
      due_date: '2024-02-02',
      status: 'done',
      project_id: 3,
    });
    expect(eq).toHaveBeenCalledWith('id', 2);
    expect(res).toEqual({ id: 2 });
  });

  it('deletes a milestone', async () => {
    const eq = vi.fn().mockReturnValue({});
    const del = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ delete: del });

    const success = await removeMilestone(9);
    expect(supabase.from).toHaveBeenCalledWith('milestones');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 9);
    expect(success).toBe(true);
  });
});

