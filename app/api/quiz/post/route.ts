import { NextRequest, NextResponse } from 'next/server';
import { PostGenerationRequestSchema } from '@/lib/types';
import { generatePostWithGemini, sanitizeTopic } from '@/lib/gemini';
import { ICE_DIMENSIONS, ICE_VECTOR_ORDER } from '@/lib/ice-constants';

export const maxDuration = 30; // Allow 30 seconds for Gemini generation

/** Mock post returned when NEXT_PUBLIC_QUIZ_USE_MOCK=true (E2E / CI, no Gemini call). */
const MOCK_POST_RESPONSE = {
  hook: 'Et si la qualité de vos contenus devenait votre meilleur atout ?',
  content:
    'Dans un monde saturé d’informations, se démarquer passe par la clarté et la cohérence.\n\n' +
    'Ce post a été généré en mode mock pour les tests E2E. Aucun appel à l’API Gemini n’a été effectué.\n\n' +
    'Vous pouvez personnaliser le sujet et lancer une vraie génération depuis l’application.',
  cta: 'Partagez votre expérience en commentaire.',
  style_analysis: 'Style mock appliqué pour les tests automatisés.',
} as const;

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  console.log(`[${correlationId}] Starting Post Generation`);

  try {
    const body = await req.json();
    const result = PostGenerationRequestSchema.safeParse(body);

    if (!result.success) {
      console.warn(`[${correlationId}] Invalid request body`, result.error);
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.issues },
        { status: 400 }
      );
    }

    // E2E / CI: return mock immediately (no Gemini, no GEMINI_API_KEY required)
    if (process.env.NEXT_PUBLIC_QUIZ_USE_MOCK === 'true') {
      console.log(`[${correlationId}] Mock mode: returning static post`);
      return NextResponse.json(MOCK_POST_RESPONSE);
    }

    const { topic, archetype, vector, profileLabel } = result.data;
    const sanitizedTopic = sanitizeTopic(topic);

    // Build Style Context from Vector
    const styleContext = vector.map((val, index) => {
        const dimKey = ICE_VECTOR_ORDER[index];
        const dim = ICE_DIMENSIONS[dimKey];
        return `- ${dim.name} (${val}/100): ${val < 50 ? dim.bounds[0].label : dim.bounds[100].label}. ${val < 50 ? dim.bounds[0].definition : dim.bounds[100].definition}`;
    }).join('\n');


    const systemInstruction = `
Tu es un ghostwriter professionnel LinkedIn qui imite le style spécifique d'un utilisateur défini par le "Modèle ICE".
Ton objectif est d'écrire un post LinkedIn à fort impact en FRANÇAIS.

IDENTITÉ DE L'UTILISATEUR :
- Archétype : ${archetype} ${profileLabel ? `(${profileLabel})` : ''}
- Analyse du Vecteur de Style :
${styleContext}

DIRECTIVES STRICTES :
1. LANGUE : DOIT ÊTRE EN FRANÇAIS.
2. TON/STYLE : Tu DOIS strictement adhérer aux valeurs du Vecteur de Style ci-dessus.
   - Si la Densité est élevée (>70), utilise un jargon technique. Si elle est basse (<30), sois très simple.
   - Si la Cadence est basse (<30), utilise des phrases courtes et percutantes.
   - Si la Posture est élevée (>70), sois autoritaire.
   - Applique les nuances spécifiques de l'archétype.
3. STRUCTURE :
   - HOOK : 1 phrase impactante pour capter l'attention.
   - CONTENT : Le corps principal, formaté avec des sauts de ligne pour la lisibilité. Le contenu doit faire au minimum 250 mots.
   - CTA : Un appel à l'action clair ou une question engageante à la fin.
4. FEEDBACK : Fournis une courte analyse (1 phrase) sur la façon dont tu as appliqué le style dans "style_analysis". Ne mentionne PAS les valeurs numériques brutes (ex: "85/100") ni les noms techniques des dimensions. Explique plutôt l'effet stylistique (ex: "J'ai utilisé un vocabulaire très technique pour marquer l'expertise").

Réponds UNIQUEMENT avec l'objet JSON correspondant à cette structure :
{
  "hook": "...",
  "content": "...",
  "cta": "...",
  "style_analysis": "..."
}
`;

    const userPrompt = `Sujet : "${sanitizedTopic}"\nÉcris le post maintenant en respectant les contraintes de style.`;

    console.log(`[${correlationId}] Calling Gemini`);
    const generationResult = await generatePostWithGemini(systemInstruction, userPrompt);
    console.log(`[${correlationId}] Success`);

    return NextResponse.json(generationResult);

  } catch (error) {
    console.error(`[${correlationId}] Error generating post:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
