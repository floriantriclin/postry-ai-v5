import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  ICE_DIMENSIONS,
  vstyleSchema
} from '@/lib/ice-constants';
import { updateVector } from '@/lib/ice-logic';
import { DimensionCode, Vstyle } from '@/lib/types';

// Schéma de validation pour l'affinage
const refineRequestSchema = z.object({
  currentVector: vstyleSchema,
  dimension: z.enum(Object.keys(ICE_DIMENSIONS) as [DimensionCode, ...DimensionCode[]]),
  answer: z.enum(['A', 'B'])
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validation Zod
    const validation = refineRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { currentVector, dimension, answer } = validation.data;

    // 2. Calcul de l'affinage
    const newVector = updateVector(currentVector as Vstyle, dimension, answer);

    // 3. Réponse
    return NextResponse.json({
      newVector
    });

  } catch (error) {
    console.error('[API_QUIZ_REFINE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
