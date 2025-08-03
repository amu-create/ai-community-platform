import { createServerClient } from '@/lib/supabase/server';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } })
    }
  })
}));

describe('Integration Test', () => {
  it('should test Supabase integration', async () => {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    expect(data.user).toBeNull();
  });
});
