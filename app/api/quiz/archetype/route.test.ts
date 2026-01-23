import { NextRequest } from 'next/server';
import { POST } from './route';

/**
 * @file route.test.ts
 * @description Tests unitaires pour la route d'API de calcul d'archétype.
 * Suit les standards définis dans docs/architecture/testing-standards.md
 */

describe('POST /api/quiz/archetype', () => {
  it('should return 400 when payload is invalid (missing dimensions)', async () => {
    // Arrange
    const body = { 
      answers: { 
        POS: 'A' 
      } 
    };
    const req = new NextRequest('http://localhost/api/quiz/archetype', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid payload');
  });

  it('should return archetype and target dimensions for a valid set of answers', async () => {
    // Arrange
    // Signature attendue pour l'Ingénieur : 001000
    // Ordre : [POS, TEM, DEN, PRI, CAD, REG]
    const body = {
      answers: {
        POS: 'A', // 0
        TEM: 'A', // 0
        DEN: 'B', // 1
        PRI: 'A', // 0
        CAD: 'A', // 0
        REG: 'A', // 0
      },
    };
    const req = new NextRequest('http://localhost/api/quiz/archetype', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('archetype');
    expect(data).toHaveProperty('targetDimensions');
    expect(data.archetype.name).toBe("L'Ingénieur");
  });

  it('should handle internal server errors gracefully', async () => {
    // Arrange
    const req = new NextRequest('http://localhost/api/quiz/archetype', {
      method: 'POST',
      body: 'invalid json content',
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal Server Error');
  });
});
