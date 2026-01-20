import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ICE_DIMENSIONS,
  ICE_VECTOR_ORDER,
  ICE_ARCHETYPES,
  vstyleSchema
} from '@/lib/ice-constants';
import { getGeminiModel, cleanJsonResponse } from '@/lib/gemini';

// --- SCHEMAS ---

const profileRequestSchema = z.object({
  baseArchetype: z.string(),
  finalVector: vstyleSchema,
  correlationId: z.string().optional(),
});

const geminiResponseSchema = z.object({
  label_final: z.string(),
  definition_longue: z.string().min(1).refine(
    (val) => {
      const wordCount = val.split(/\s+/).filter(Boolean).length;
      return wordCount >= 45 && wordCount <= 75;
    },
    { message: "La définition doit faire entre 45 et 75 mots." }
  ),
});

// --- LOGIC ---

export function calculateDriftHint(baseArchetype: string, finalVector: number[]): string {
  const archetype = Object.values(ICE_ARCHETYPES).find(a => a.name === baseArchetype);
  if (!archetype) return "N/A";

  let maxDrift = -1;
  let driftDim: keyof typeof ICE_DIMENSIONS = 'CAD';
  let driftDirection = "";

  ICE_VECTOR_ORDER.forEach((dimCode, index) => {
    const baseVal = archetype.baseVector[index];
    const finalVal = finalVector[index];
    const drift = Math.abs(finalVal - baseVal);

    if (drift > maxDrift) {
      maxDrift = drift;
      driftDim = dimCode;
      const dimInfo = ICE_DIMENSIONS[dimCode];
      driftDirection = finalVal > baseVal
        ? dimInfo.bounds[100].label
        : dimInfo.bounds[0].label;
    }
  });

  return `${ICE_DIMENSIONS[driftDim].name} (${driftDirection})`;
}

export function formatVectorForPrompt(vector: number[]): string {
  const formatted: Record<string, number> = {};
  ICE_VECTOR_ORDER.forEach((code, index) => {
    formatted[ICE_DIMENSIONS[code].name] = vector[index];
  });
  return JSON.stringify(formatted, null, 2);
}

// Factorize model creation for easier mocking
export const geminiInternal = {
  getGeminiModel: () => {
    return getGeminiModel({
      systemInstruction: `Tu es un expert en psychométrie et en personal branding. Ton rôle est de traduire un vecteur de données stylistiques en une identité rédactionnelle prestigieuse et inspirante. Tu parles impérativement en Français.`,
      responseMimeType: 'application/json',
    });
  }
};

// --- ROUTE HANDLER ---

export async function POST(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || `profile-${Math.random().toString(36).substring(7)}`;
  
  try {
    const body = await req.json();
    
    // 1. Validation Input
    const validation = profileRequestSchema.safeParse({ ...body, correlationId });
    if (!validation.success) {
      console.error(`[API_QUIZ_PROFILE][${correlationId}] Validation Error:`, validation.error.format());
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { baseArchetype, finalVector } = validation.data;
    
    // 2. Préparation du Prompt
    const driftHint = calculateDriftHint(baseArchetype, finalVector);
    const vectorJson = formatVectorForPrompt(finalVector);

    const userPrompt = `
ACTION : Génère le Profil Augmenté de l'utilisateur.

### RÉFÉRENTIEL DES 9 DIMENSIONS (POUR ANALYSE)
1. CADENCE (CAD) : 0 (Haché, percutant) vs 100 (Fluide, musical).
2. DENSITÉ (DEN) : 0 (Simple, vulgarisé) vs 100 (Expert, jargon).
3. STRUCTURE (STR) : 0 (Organique, flux libre) vs 100 (Logique, carré).
4. POSTURE (POS) : 0 (Humble, partage) vs 100 (Guru, autorité).
5. TEMPÉRATURE (TEM) : 0 (Froid, clinique) vs 100 (Chaud, viscéral).
6. REGISTRE (REG) : 0 (Sérieux, solennel) vs 100 (Ludique, décalé).
7. INFLEXION (INF) : 0 (Factuel, chiffres) vs 100 (Narratif, histoire).
8. PRISME (PRI) : 0 (Optimiste, opportunité) vs 100 (Critique, sceptique).
9. ANCRAGE (ANC) : 0 (Abstrait, vision) vs 100 (Concret, pragmatique).

### DONNÉES UTILISATEUR
- Archétype de base détecté : ${baseArchetype}
- Vecteur Final V11 : ${vectorJson}
- Drift Hint (Dérive la plus marquée) : ${driftHint}

### MISSIONS DE GÉNÉRATION
1. **Le Label Final** : Crée un titre composé : [${baseArchetype}] + [Adjectif Qualificatif Flatteur]. L'adjectif doit refléter la dérive la plus marquée du vecteur par rapport à l'archétype standard (Drift Hint). Ex: 'Le Stratège Lumineux', 'L'Ingénieur Intuitif', 'Le Mentor Radical'.
2. **La Définition** : Rédige une définition de 50 à 60 mots exactement (en Français). Elle doit expliquer la force unique de ce mélange stylistique. Valorise la manière dont l'utilisateur équilibre sa technicité et son humanité pour impacter son audience.

### DIRECTIVES DE NUANCE
- Si une dimension est à l'extrême (<15 or >85), elle doit devenir le cœur de la définition.
- Le ton doit être prestigieux, profond et révélateur. Évite les platitudes.
- RÉPONDS EXCLUSIVEMENT EN FRANÇAIS.

### FORMAT DE SORTIE ATTENDU
{
  "label_final": "...",
  "definition_longue": "..."
}
    `.trim();

    // 3. Appel Gemini avec Retry Strategy
    const model = geminiInternal.getGeminiModel();

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[API_QUIZ_PROFILE][${correlationId}] Gemini Attempt ${attempt}/3`);
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonString = cleanJsonResponse(text);
        const parsed = JSON.parse(jsonString);
        
        // Validation Output
        const outputValidation = geminiResponseSchema.safeParse(parsed);
        if (!outputValidation.success) {
          throw new Error(`Output validation failed: ${JSON.stringify(outputValidation.error.format())}`);
        }

        console.log(`[API_QUIZ_PROFILE][${correlationId}] Success on attempt ${attempt}`);
        if (process.env.NODE_ENV !== 'production') {
           console.log(`[API_QUIZ_PROFILE][${correlationId}] Input Vector:`, finalVector);
           console.log(`[API_QUIZ_PROFILE][${correlationId}] Output:`, outputValidation.data);
        }

        return NextResponse.json(outputValidation.data);

      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        console.warn(`[API_QUIZ_PROFILE][${correlationId}] Attempt ${attempt} failed:`, err.message);
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    console.error(`[API_QUIZ_PROFILE][${correlationId}] All attempts failed:`, lastError);
    return NextResponse.json(
      { error: 'Failed to generate profile synthesis', message: lastError?.message },
      { status: 502 }
    );

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`[API_QUIZ_PROFILE][${correlationId}] Fatal Error:`, err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
