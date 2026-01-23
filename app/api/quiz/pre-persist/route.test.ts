import { POST } from './route';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Helper to create a chainable mock
const createChainableMock = () => {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };
  return chain;
};

// Mock the module
vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(), 
  }
}));

describe('API /api/quiz/pre-persist', () => {
  const validPayload = {
    email: 'test@example.com',
    stylistic_vector: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    profile: { label: 'Test' },
    archetype: { name: 'Arch' },
    theme: 'Tech',
    post_content: 'Test content',
    quiz_answers: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid payload', async () => {
    const req = new NextRequest('http://localhost/api/quiz/pre-persist', {
      method: 'POST',
      body: JSON.stringify({ email: 'bad' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should insert new post if none pending', async () => {
     const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
     const mockInsert = vi.fn().mockResolvedValue({ error: null });
     
     // Setup the chain
     const chain = {
         select: vi.fn().mockReturnThis(),
         eq: vi.fn().mockReturnThis(),
         maybeSingle: mockMaybeSingle,
         insert: mockInsert,
         update: vi.fn().mockReturnThis(),
     };
     
     vi.mocked(supabaseAdmin.from).mockReturnValue(chain as any);

     const req = new NextRequest('http://localhost/api/quiz/pre-persist', {
        method: 'POST',
        body: JSON.stringify(validPayload)
     });
     
     const res = await POST(req);
     expect(res.status).toBe(200);
     const body = await res.json();
     expect(body.success).toBe(true);
     expect(mockInsert).toHaveBeenCalled();
  });

   it('should update existing pending post', async () => {
     const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null });
     const mockUpdate = vi.fn().mockReturnThis();
     const mockEq = vi.fn().mockResolvedValue({ error: null }); // Result of .update().eq()
     
     const chain = {
         select: vi.fn().mockReturnThis(),
         eq: vi.fn().mockImplementation((col, val) => {
             if (col === 'id') return mockEq(); // For the update path
             return chain; // For the select path
         }),
         maybeSingle: mockMaybeSingle,
         insert: vi.fn().mockReturnThis(),
         update: mockUpdate,
     };
     
     vi.mocked(supabaseAdmin.from).mockReturnValue(chain as any);

     const req = new NextRequest('http://localhost/api/quiz/pre-persist', {
        method: 'POST',
        body: JSON.stringify(validPayload)
     });
     
     const res = await POST(req);
     expect(res.status).toBe(200);
     expect(mockUpdate).toHaveBeenCalled();
  });
});
