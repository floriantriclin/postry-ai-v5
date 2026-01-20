import { NextRequest } from 'next/server';
import { POST as archetypePOST } from './archetype/route';
import { POST as refinePOST } from './refine/route';
import { POST as generatePOST } from './generate/route';
import { POST as profilePOST } from './profile/route';
import { ICE_PHASE1_DIMENSIONS_ORDER } from '@/lib/ice-constants';
import { vi } from 'vitest';

// Mock Gemini to avoid real API calls
vi.mock('@/lib/gemini', () => ({
  generateWithGemini: vi.fn().mockResolvedValue([
    { id: 'Q7', dimension: 'STR', option_A: 'A', option_B: 'B' },
    { id: 'Q8', dimension: 'INF', option_A: 'A', option_B: 'B' },
    { id: 'Q9', dimension: 'ANC', option_A: 'A', option_B: 'B' },
    { id: 'Q10', dimension: 'DEN', option_A: 'A', option_B: 'B' },
    { id: 'Q11', dimension: 'PRI', option_A: 'A', option_B: 'B' },
  ]),
  sanitizeTopic: (t: string) => t,
  getGeminiModel: vi.fn().mockReturnValue({
    generateContent: vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          label_final: "Le Stratège Lumineux",
          definition_longue: "Une définition de plus de quarante-cinq mots pour valider la règle de longueur minimale imposée par le schéma Zod dans la route profile. Il faut que ce texte soit assez long pour passer le test sans erreur. Voici donc quelques mots supplémentaires pour être absolument certain que nous dépassons la limite requise de quarante-cinq mots et ainsi valider le test avec succès."
        })
      }
    })
  }),
  cleanJsonResponse: (t: string) => t
}));

describe('Quiz Logic API Integration Tests', () => {
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

    it('should fail if context is missing for phase 2', async () => {
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
    it('should generate profile with valid payload', async () => {
      const req = new NextRequest('http://localhost/api/quiz/profile', {
        method: 'POST',
        body: JSON.stringify({
          baseArchetype: 'Le Stratège',
          finalVector: [30, 60, 80, 80, 35, 20, 25, 65, 65]
        }),
      });

      const res = await profilePOST(req);
      if (res.status !== 200) {
        const errorData = await res.json();
        console.error('Profile API Error:', errorData);
      }
      expect(res.status).toBe(200);
      const data = await res.json();
      
      expect(data.label_final).toBe("Le Stratège Lumineux");
      expect(data.definition_longue).toBeDefined();
    });

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
