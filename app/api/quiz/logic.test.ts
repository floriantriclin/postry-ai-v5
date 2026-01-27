import { NextRequest } from 'next/server';
import { POST as archetypePOST } from './archetype/route';
import { POST as refinePOST } from './refine/route';
import { POST as generatePOST } from './generate/route';
import { POST as profilePOST } from './profile/route';
import { ICE_PHASE1_DIMENSIONS_ORDER } from '@/lib/ice-constants';
import { vi } from 'vitest';
import { getGeminiModel, generateWithGemini } from '@/lib/gemini';

vi.mock('@/lib/gemini');

const mockedGetGeminiModel = vi.mocked(getGeminiModel);
const mockedGenerateWithGemini = vi.mocked(generateWithGemini);

describe('Quiz Logic API Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();


    mockedGenerateWithGemini.mockResolvedValue([
      { id: 'Q7', dimension: 'STR', option_A: 'A', option_B: 'B' },
      { id: 'Q8', dimension: 'INF', option_A: 'A', option_B: 'B' },
      { id: 'Q9', dimension: 'ANC', option_A: 'A', option_B: 'B' },
      { id: 'Q10', dimension: 'DEN', option_A: 'A', option_B: 'B' },
      { id: 'Q11', dimension: 'PRI', option_A: 'A', option_B: 'B' },
    ]);

    const mockOutput = {
      label_final: "Le Stratège Lumineux",
      definition_longue: "Ceci est une définition de test qui a une longueur de mots très précisément calibrée pour être absolument et sans aucun doute possible dans la bonne fourchette. Nous avons besoin de quarante-cinq mots au minimum. Nous avons aussi besoin de soixante-quinze mots au maximum. Cette phrase est parfaite."
    };
    
    mockedGetGeminiModel.mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: Promise.resolve({
          text: () => JSON.stringify(mockOutput),
        }),
      }),
    } as any);
  });

  describe('POST /api/quiz/archetype', () => {
    it('should return 400 if dimensions are missing', async () => {
      const req = new NextRequest('http://localhost/api/quiz/archetype', {
        method: 'POST',
        body: JSON.stringify({
          answers: { POS: 'A' } // Missing 5 dimensions
        }),
      });

      const res = await archetypePOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Invalid payload');
    });

    it('should return 400 if values are not A or B', async () => {
      const answers: any = {};
      ICE_PHASE1_DIMENSIONS_ORDER.forEach(dim => answers[dim] = 'C');

      const req = new NextRequest('http://localhost/api/quiz/archetype', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      const res = await archetypePOST(req);
      expect(res.status).toBe(400);
    });

    it('should calculate archetype and target dimensions for a valid payload', async () => {
      // Signature 101100 -> Stratège
      const answers = {
        POS: 'B', // 1
        TEM: 'A', // 0
        DEN: 'B', // 1
        PRI: 'B', // 1
        CAD: 'A', // 0
        REG: 'A', // 0
      };

      const req = new NextRequest('http://localhost/api/quiz/archetype', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      const res = await archetypePOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      
      expect(data.archetype).toBeDefined();
      expect(data.archetype.name).toBe('Le Stratège');
      expect(data.targetDimensions).toHaveLength(5);
      // Mandatory dims for Phase 2: STR, INF, ANC
      expect(data.targetDimensions).toContain('STR');
      expect(data.targetDimensions).toContain('INF');
      expect(data.targetDimensions).toContain('ANC');
    });

    it('should select dimensions closest to 50 for Phase 2 (1.6-INT-009)', async () => {
      // We need to craft answers that result in a base vector where some Phase 1 dims are closer to 50 than others
      // Strategist base vector is: [25, 65, 85, 85, 30, 15, 20, 60, 60]
      // Order: [CAD, DEN, STR, POS, TEM, REG, INF, PRI, ANC]
      // P1 Dims: CAD(25), DEN(65), POS(85), TEM(85), REG(15), PRI(60)
      // Dist from 50: CAD(25), DEN(15), POS(35), TEM(35), REG(35), PRI(10)
      // Closest to 50: PRI(10) and DEN(15)
      
      const answers = {
        POS: 'B', TEM: 'A', DEN: 'B', PRI: 'B', CAD: 'A', REG: 'A',
      };

      const req = new NextRequest('http://localhost/api/quiz/archetype', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });

      const res = await archetypePOST(req);
      const data = await res.json();
      
      expect(data.targetDimensions).toContain('STR');
      expect(data.targetDimensions).toContain('INF');
      expect(data.targetDimensions).toContain('ANC');
      expect(data.targetDimensions).toContain('PRI');
      expect(data.targetDimensions).toContain('DEN');
      expect(data.targetDimensions).toHaveLength(5);
    });
  });

  describe('POST /api/quiz/refine', () => {
    const initialVector = [50, 50, 50, 50, 50, 50, 50, 50, 50];

    it('should return 400 for invalid vector length', async () => {
      const req = new NextRequest('http://localhost/api/quiz/refine', {
        method: 'POST',
        body: JSON.stringify({
          currentVector: [50, 50],
          dimension: 'CAD',
          answer: 'A'
        }),
      });

      const res = await refinePOST(req);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid dimension code (1.6-INT-007)', async () => {
      const req = new NextRequest('http://localhost/api/quiz/refine', {
        method: 'POST',
        body: JSON.stringify({
          currentVector: initialVector,
          dimension: 'INVALID',
          answer: 'A'
        }),
      });

      const res = await refinePOST(req);
      expect(res.status).toBe(400);
    });

    it('should update vector correctly for answer A (target 0)', async () => {
      // 50 + (0 - 50) * 0.3 = 50 - 15 = 35
      const req = new NextRequest('http://localhost/api/quiz/refine', {
        method: 'POST',
        body: JSON.stringify({
          currentVector: initialVector,
          dimension: 'CAD',
          answer: 'A'
        }),
      });

      const res = await refinePOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      
      expect(data.newVector[0]).toBe(35); // CAD is first in ICE_VECTOR_ORDER
      // Other dimensions should remain 50
      expect(data.newVector[1]).toBe(50);
    });

    it('should update vector correctly for answer B (target 100)', async () => {
      // 50 + (100 - 50) * 0.3 = 50 + 15 = 65
      const req = new NextRequest('http://localhost/api/quiz/refine', {
        method: 'POST',
        body: JSON.stringify({
          currentVector: initialVector,
          dimension: 'CAD',
          answer: 'B'
        }),
      });

      const res = await refinePOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      
      expect(data.newVector[0]).toBe(65);
    });
  });

  describe('POST /api/quiz/generate (Phase 2)', () => {
    it('should generate Phase 2 questions with valid context', async () => {
      const req = new NextRequest('http://localhost/api/quiz/generate', {
        method: 'POST',
        body: JSON.stringify({
          phase: 2,
          topic: 'Test Topic',
          context: {
            archetypeName: 'Le Stratège',
            archetypeVector: [25, 65, 85, 85, 30, 15, 20, 60, 60],
            targetDimensions: ['STR', 'INF', 'ANC', 'DEN', 'PRI']
          }
        }),
      });

      const res = await generatePOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      
      expect(data).toHaveLength(5);
      expect(data[0].id).toBe('Q7');
      expect(data[0].dimension).toBe('STR');
    });

    it('should fail if context is inssing for phase 2', async () => {
      const req = new NextRequest('http://localhost/api/quiz/generate', {
        method: 'POST',
        body: JSON.stringify({
          phase: 2,
          topic: 'Test Topic'
          // context missing
        }),
      });

      const res = await generatePOST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/quiz/profile', () => {

    it('should fail with invalid vector', async () => {
      const req = new NextRequest('http://localhost/api/quiz/profile', {
        method: 'POST',
        body: JSON.stringify({
          baseArchetype: 'Le Stratège',
          finalVector: [30, 60] // Invalid length
        }),
      });

      const res = await profilePOST(req);
      expect(res.status).toBe(400);
    });
  });
});
