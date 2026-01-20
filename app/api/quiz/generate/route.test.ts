import { POST } from './route';
import { NextRequest } from 'next/server';
import * as gemini from '@/lib/gemini';
import { QuizQuestion } from '@/lib/types';

vi.mock('@/lib/gemini', () => ({
  generateWithGemini: vi.fn(),
  sanitizeTopic: vi.fn((t) => t),
}));

describe('API /api/quiz/generate', () => {
  it('should return 400 for invalid request body', async () => {
    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 3 }), // Invalid phase
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('should call generateWithGemini for Phase 1', async () => {
    const mockQuestions: QuizQuestion[] = [{ id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' }];
    vi.mocked(gemini.generateWithGemini).mockResolvedValue(mockQuestions);

    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 1, topic: 'AI' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockQuestions);
    expect(gemini.generateWithGemini).toHaveBeenCalled();
  });

  it('should call generateWithGemini for Phase 2', async () => {
    const mockQuestions: QuizQuestion[] = [{ id: 'Q7', dimension: 'STR', option_A: 'A', option_B: 'B' }];
    vi.mocked(gemini.generateWithGemini).mockResolvedValue(mockQuestions);

    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({
        phase: 2,
        topic: 'AI',
        context: {
          archetypeName: 'Engineer',
          archetypeVector: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          targetDimensions: ['STR', 'INF', 'ANC', 'POS', 'TEM'],
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockQuestions);
    expect(gemini.generateWithGemini).toHaveBeenCalled();
  });

  it('should return 400 for Phase 2 without context', async () => {
    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 2, topic: 'AI' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('should return 502 if generateWithGemini fails', async () => {
    vi.mocked(gemini.generateWithGemini).mockRejectedValue(new Error('Gemini Error'));

    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 1, topic: 'AI' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe('Failed to generate quiz questions');
  });

  it('should sanitize the topic', async () => {
    const mockQuestions: QuizQuestion[] = [{ id: 'Q1', dimension: 'POS', option_A: 'A', option_B: 'B' }];
    vi.mocked(gemini.generateWithGemini).mockResolvedValue(mockQuestions);

    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 1, topic: '<script>alert("XSS")</script> topic' }),
    });

    await POST(req);
    expect(gemini.sanitizeTopic).toHaveBeenCalled();
  });

  it('should return 504 on timeout', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    vi.mocked(gemini.generateWithGemini).mockRejectedValue(abortError);

    const req = new NextRequest('http://localhost/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ phase: 1, topic: 'AI' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(504);
    const data = await res.json();
    expect(data.error).toBe('Generation timeout');
  });
});
