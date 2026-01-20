import { quizApiClient } from './quiz-api-client';

describe('QuizApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('1.8.1-UNIT-001: should return typed data on 200 OK (generateQuestions)', async () => {
    const mockQuestions = [{ id: 'q1', text: 'Question 1', dimension: 'POS', options: [] }];
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockQuestions,
    });

    const result = await quizApiClient.generateQuestions({ phase: 1, topic: 'copywriting' });
    
    expect(result).toEqual(mockQuestions);
    expect(global.fetch).toHaveBeenCalledWith('/api/quiz/generate', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ phase: 1, topic: 'copywriting' }),
    }));
  });

  it('1.8.1-UNIT-001: should return typed data on 200 OK (identifyArchetype)', async () => {
    const mockResponse = { archetype: { name: 'Le Stratège' }, targetDimensions: ['STR'] };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await quizApiClient.identifyArchetype({ answers: { POS: 'A' } });
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/quiz/archetype', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ answers: { POS: 'A' } }),
    }));
  });

  it('1.8.1-UNIT-002: should throw specific errors on 4xx/5xx', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    await expect(quizApiClient.generateQuestions({ phase: 1, topic: 'test' }))
      .rejects.toThrow('Internal Server Error');
  });

  it('1.8.1-UNIT-002: should throw generic error if no error message in JSON', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    await expect(quizApiClient.generateQuestions({ phase: 1, topic: 'test' }))
      .rejects.toThrow('HTTP error! status: 404');
  });
});
