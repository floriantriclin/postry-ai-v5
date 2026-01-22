import { signInWithOtp } from './auth';
import { supabase } from '@/lib/supabase';

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
    },
  },
}));

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  },
}));

describe('signInWithOtp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success for valid email', async () => {
    // Setup mock success
    // Cast to any because the mock definition is partial
    (supabase.auth.signInWithOtp as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null });

    const result = await signInWithOtp('test@example.com');

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.stringContaining('/auth/callback'),
      },
    });
  });

  it('should return invalid email error for bad format', async () => {
    const result = await signInWithOtp('not-an-email');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INVALID_EMAIL');
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('should handle rate limit error from Supabase', async () => {
    // Setup mock error
    (supabase.auth.signInWithOtp as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: {
        status: 429,
        message: 'Too many requests',
      },
    });

    const result = await signInWithOtp('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('RATE_LIMIT');
  });

  it('should handle generic error from Supabase', async () => {
    // Setup mock error
    (supabase.auth.signInWithOtp as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: {
        status: 500,
        message: 'Server error',
      },
    });

    const result = await signInWithOtp('test@example.com');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('UNKNOWN');
  });
});
