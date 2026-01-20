import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  ICE_PHASE1_DIMENSIONS_ORDER, 
  ICE_DIMENSIONS 
} from '@/lib/ice-constants';
import { getClosestArchetype, getTargetDimensions } from '@/lib/ice-logic';
import { DimensionCode } from '@/lib/types';

// Schéma de validation pour les réponses de la Phase 1
// On attend un objet dont les clés sont les codes de dimension et les valeurs 'A' ou 'B'
const archetypeRequestSchema = z.object({
  answers: z.record(
    z.enum(Object.keys(ICE_DIMENSIONS) as [DimensionCode, ...DimensionCode[]]),
    z.enum(['A', 'B'])
  ).refine((record) => {
    // Vérifier que toutes les dimensions de la Phase 1 sont présentes
    return ICE_PHASE1_DIMENSIONS_ORDER.every(dim => dim in record);
  }, {
    message: "Toutes les dimensions de la Phase 1 doivent être présentes."
  })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validation Zod
    const validation = archetypeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { answers } = validation.data;

    // 2. Conversion en signature binaire (A='0', B='1')
    // Suivant l'ordre strict de ICE_PHASE1_DIMENSIONS_ORDER
    const binarySignature = ICE_PHASE1_DIMENSIONS_ORDER.map(dim => {
      return answers[dim] === 'A' ? '0' : '1';
    }).join('');

    // 3. Calcul de l'archétype
    const archetype = getClosestArchetype(binarySignature);

    // 4. Détermination des dimensions cibles pour la Phase 2
    const targetDimensions = getTargetDimensions(archetype.baseVector as number[]);

    // 5. Réponse
    return NextResponse.json({
      archetype,
      targetDimensions
    });

  } catch (error) {
    console.error('[API_QUIZ_ARCHETYPE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
