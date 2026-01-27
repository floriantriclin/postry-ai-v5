import { POST } from './route';
import { NextRequest } from 'next/server';
import { generatePostWithGemini } from '@/lib/gemini';
import { vi } from 'vitest';

vi.mock('@/lib/gemini', () => ({
  generatePostWithGemini: vi.fn(),
  sanitizeTopic: vi.fn((t) => t.trim()),
}));

describe('POST /api/quiz/post', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should generate a post successfully', async () => {
    const mockResponse = {
      hook: 'This is a hook',
      content: 'This is the content',
      cta: 'Call to action',
      style_analysis: 'Style analysis',
    };
    (generatePostWithGemini as any).mockResolvedValue(mockResponse);

    const body = {
      topic: 'Test Topic',
      archetype: 'The Strategist',
      vector: [10, 20, 30, 40, 50, 60, 70, 80, 90],
      profileLabel: 'The Strategist',
    };

    const req = new NextRequest('http://localhost/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(mockResponse);
  });

  it('should return 400 for invalid body', async () => {
    const body = {
      topic: 'Test Topic',
       // Missing vector, etc.
    };

    const req = new NextRequest('http://localhost/api/quiz/post', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
