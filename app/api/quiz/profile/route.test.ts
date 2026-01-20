import { POST, geminiInternal, calculateDriftHint, formatVectorForPrompt } from './route';
import { NextRequest } from 'next/server';

describe('API /api/quiz/profile', () => {
  const validPayload = {
    baseArchetype: "L'Ingénieur",
    finalVector: [30, 85, 80, 40, 20, 20, 20, 50, 90],
  };

  const mockModel = {
    generateContent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(geminiInternal, 'getGeminiModel').mockReturnValue(mockModel as any);
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
      definition_longue: "Votre style allie la précision technique de l'ingénieur à une intuition remarquable qui donne vie à vos concepts les plus complexes. Cette dualité permet de créer des récits techniques captivants, transformant des données brutes en expériences humaines mémorables et accessibles pour votre audience exigeante et connectée aujourd'hui."
    };
    
    mockModel.generateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockOutput),
      },
    });

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockOutput);
  });

  it('should retry if Gemini returns malformed JSON', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Votre style allie la précision technique de l'ingénieur à une intuition remarquable qui donne vie à vos concepts les plus complexes. Cette dualité permet de créer des récits techniques captivants, transformant des données brutes en expériences humaines mémorables et accessibles pour votre audience exigeante et connectée aujourd'hui."
    };

    mockModel.generateContent
      .mockResolvedValueOnce({
        response: { text: () => "Not a JSON" },
      })
      .mockResolvedValueOnce({
        response: { text: () => JSON.stringify(mockOutput) },
      });

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.label_final).toBe(mockOutput.label_final);
    expect(mockModel.generateContent).toHaveBeenCalledTimes(2);
  });

  it('should return 502 if Gemini fails after 3 retries', async () => {
    mockModel.generateContent.mockResolvedValue({
      response: { text: () => "Invalid" },
    });

    const req = new NextRequest('http://localhost/api/quiz/profile', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe('Failed to generate profile synthesis');
    expect(mockModel.generateContent).toHaveBeenCalledTimes(3);
  });

  it('should fail if word count is too low', async () => {
    const mockOutput = {
      label_final: "L'Ingénieur Intuitif",
      definition_longue: "Trop court."
    };
    
    mockModel.generateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockOutput),
      },
    });

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
    
    mockModel.generateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockOutput),
      },
    });

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
      // "L'Ingénieur" base vector is [50, 50, 50, 50, 50, 50, 50, 50, 50] (approx for testing if not known, but let's assume one)
      // Actually let's use a real one from ice-constants if possible or just check the logic
      const baseArchetype = "L'Ingénieur";
      // We'll mock a large drift on CADENCE (index 0)
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

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            label_final: "L'Ingénieur Extrême",
            definition_longue: "Cette définition est très longue car elle doit valider le test de word count qui est assez strict entre quarante-cinq et soixante-quinze mots pour satisfaire les critères de qualité imposés par Quinn lors de la revue de la story sept. Nous ajoutons donc quelques mots supplémentaires pour atteindre le seuil minimal requis de quarante-cinq mots."
          }),
        },
      });

      const req = new NextRequest('http://localhost/api/quiz/profile', {
        method: 'POST',
        body: JSON.stringify(extremePayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      
      // Verification that drift hint was calculated for one of the extremes
      const hint = calculateDriftHint(extremePayload.baseArchetype, extremePayload.finalVector);
      expect(hint).toMatch(/CADENCE/);
    });
  });
});
