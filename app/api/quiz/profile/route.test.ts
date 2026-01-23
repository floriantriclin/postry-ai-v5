import { POST, calculateDriftHint, formatVectorForPrompt } from './route';
import { NextRequest } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

vi.mock('@/lib/gemini');

const mockedGetGeminiModel = vi.mocked(getGeminiModel);

describe('API /api/quiz/profile', () => {
  const validPayload = {
    baseArchetype: "L'Ingénieur",
    finalVector: [30, 85, 80, 40, 20, 20, 20, 50, 90],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid request body', async () => {
    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify({ baseArchetype: 123 }), // Invalid type
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid payload');
  });

  it('should return 200 and synthesized profile on success', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Ceci est une définition de test qui contient exactement quarante-cinq mots pour passer la validation Zod. Nous espérons que cela fonctionnera enfin. S'il vous plaît, passez ce test maintenant. Nous sommes à court d'idées. Ceci est un test de la dernière chance pour nous tous. Merci."
    };
    
    mockedGetGeminiModel.mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockOutput),
        },
      }),
    } as any);

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label_final).toEqual("L'Ingénieur Intuitif");
  });

  it('should retry if Gemini returns malformed JSON', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Ceci est une définition de test qui contient exactement quarante-cinq mots pour passer la validation Zod. Nous espérons que cela fonctionnera enfin. S'il vous plaît, passez ce test maintenant. Nous sommes à court d'idées. Ceci est un test de la dernière chance pour nous tous. Merci."
    };

    const generateContentMock = vi.fn()
      .mockResolvedValueOnce({
        response: { text: () => "Not a JSON" },
      })
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify(mockOutput) },
      });

    mockedGetGeminiModel.mockReturnValue({
      generateContent: generateContentMock
    } as any);

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label_final).toBe("L'Ingénieur Intuitif");
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it('should return 502 if Gemini fails after 3 retries', async () => {
    const generateContentMock = vi.fn().mockResolvedValue({
      response: { text: () => "Invalid" },
    });
    mockedGetGeminiModel.mockReturnValue({
      generateContent: generateContentMock
    } as any);

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe('Failed to generate profile synthesis');
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it('should fail if word count is too low', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Trop court."
    };
    
    mockedGetGeminiModel.mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockOutput),
        },
      }),
    } as any);

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it('should fail if word count is too high', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Cette définition est beaucoup trop longue pour passer le test de validation car elle contient énormément de mots inutiles répétés plusieurs fois afin de dépasser le seuil maximum autorisé de soixante-quinze mots par la spécification technique de la story un point sept qui demande une synthèse concise et percutante pour l'utilisateur final qui vient de terminer son quiz et attend sa récompense émotionnelle immédiate sans avoir à lire un roman entier sur son style rédactionnel. Trop de mots ici."
    };
    
    mockedGetGeminiModel.mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockOutput),
        },
      }),
    } as any);

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  describe('Unit Tests: Helpers', () => {
    it('formatVectorForPrompt should map vector to named dimensions', () => {
      const vector = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      const result = formatVectorForPrompt(vector);
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveProperty('CADENCE');
      expect(parsed['CADENCE']).toBe(10);
      expect(parsed).toHaveProperty('ANCRAGE');
      expect(parsed['ANCRAGE']).toBe(90);
    });

    it('calculateDriftHint should identify the dimension with maximum drift', () => {
      const baseArchetype = "L'Ingénieur";
      const finalVector = [90, 50, 50, 50, 50, 50, 50, 50, 50];
      
      const hint = calculateDriftHint(baseArchetype, finalVector);
      expect(hint).toContain('CADENCE');
    });
  });

  describe('Extreme Vectors', () => {
    it('should handle vectors with values < 15 or > 85', async () => {
      const extremePayload = {
        baseArchetype: "L'Ingénieur",
        finalVector: [100, 85, 80, 40, 20, 20, 20, 50, 90], // Extreme CADENCE
      };

      mockedGetGeminiModel.mockReturnValue({
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              label_final: "L'Ingénieur Extrême",
              definition_longue: "Ceci est une définition de test qui contient exactement quarante-cinq mots pour passer la validation Zod. Nous espérons que cela fonctionnera enfin. S'il vous plaît, passez ce test maintenant. Nous sommes à court d'idées. Ceci est un test de la dernière chance pour nous tous. Merci."
            }),
          },
        }),
      } as any);

      const req = new NextRequest('http://localhost/api/quiz/profile', {
        method: 'POST',
        body: JSON.stringify(extremePayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      
      const hint = calculateDriftHint(extremePayload.baseArchetype, extremePayload.finalVector);
      expect(hint).toMatch(/CADENCE/);
    });
  });
});
