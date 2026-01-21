import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini, sanitizeTopic } from '@/lib/gemini';
import { ICE_VECTOR_ORDER, ICE_PHASE1_DIMENSIONS_ORDER } from '@/lib/ice-constants';
import themes from '@/lib/data/themes.json';

// Zod schemas for request validation
const Phase1RequestSchema = z.object({
  phase: z.literal(1),
  topic: z.string().min(1).max(100),
});

const Phase2RequestSchema = z.object({
  phase: z.literal(2),
  topic: z.string().min(1).max(100),
  context: z.object({
    archetypeName: z.string(),
    archetypeVector: z.array(z.number()).length(9),
    targetDimensions: z.array(z.string()).min(5).max(5),
  }),
});

const GenerateRequestSchema = z.discriminatedUnion('phase', [
  Phase1RequestSchema,
  Phase2RequestSchema,
]);

// Helper to normalize dimensions from potential LLM variations to codes
function normalizeDimension(dim: string): string {
  const map: Record<string, string> = {
    'POSTURE': 'POS',
    'TEMPÉRATURE': 'TEM', 'TEMPERATURE': 'TEM',
    'DENSITÉ': 'DEN', 'DENSITE': 'DEN',
    'STRUCTURE': 'STR',
    'PRISME': 'PRI',
    'CADENCE': 'CAD',
    'REGISTRE': 'REG',
    'INFLEXION': 'INF',
    'ANCRAGE': 'ANC'
  };
  return map[dim.toUpperCase()] || dim;
}

const ICE_FULL_REFERENTIAL = `
### RÉFÉRENTIEL DES DIMENSIONS (ICE PROTOCOL)

1. CADENCE (Code: CAD)
- Borne 0 (Haché/Percutant) : Phrases très courtes. Sujet-Verbe-Point. Impact. Ex: 'C'est fait. On avance.'
- Borne 100 (Fluide/Lié) : Phrases longues, virgules, connecteurs, musicalité. Ex: 'Une fois la tâche finie, nous progressons sereinement.'

2. DENSITÉ (Code: DEN)
- Borne 0 (Simple/Vulgarisé) : Mots courants, analogies accessibles, zéro jargon. Ex: 'C'est comme un moteur de vélo.'
- Borne 100 (Expert/Technique) : Jargon précis, acronymes, niveau professionnel. Ex: 'L'architecture micro-services permet la scalabilité.'

3. STRUCTURE (Code: STR)
- Borne 0 (Organique/Libre) : Flux de pensée, moins structuré, spontané. Ex: 'Je pensais à ça, et puis...'
- Borne 100 (Logique/Carré) : Points clés, listes, structure apparente. Ex: 'Voici les 3 points essentiels :'

4. POSTURE (Code: POS)
- Borne 0 (Humble/Pair) : Partage d'expérience, doute, 'Je', vulnérabilité. Ex: 'J'ai découvert cette approche par l'expérience et je vous la partage.'
- Borne 100 (Guru/Vertical) : Affirmation, vérité générale, 'Vous', autorité. Ex: 'Pour réussir, il est essentiel d'appliquer cette méthode éprouvée.'

5. TEMPÉRATURE (Code: TEM)
- Borne 0 (Froid/Clinique) : Constat objectif, neutre, sans adjectif émotionnel. Ex: 'Les données confirment une tendance stable et analysée.'
- Borne 100 (Chaud/Viscéral) : Passion, exclamation, ressenti fort, tripes. Ex: 'C'est un résultat passionnant qui nous motive énormément.'

6. REGISTRE (Code: REG)
- Borne 0 (Sérieux/Pro) : Gravité, sobriété, premier degré, respect des codes. Ex: 'Il faut respecter les délais.'
- Borne 100 (Ludique/Décalé) : Humour, second degré, emojis, décalage. Ex: 'Houston, on a un (petit) problème 🚀.'

7. INFLEXION (Code: INF)
- Borne 0 (Factuel/Chiffres) : Données brutes, précision chirurgicale. Ex: '50 nouveaux inscrits hier.'
- Borne 100 (Narratif/Histoire) : Storytelling, mise en situation. Ex: 'Quand j'ai ouvert la liste hier matin, j'ai vu...'

8. PRISME (Code: PRI)
- Borne 0 (Optimiste/Opportunité) : Focus sur le positif, l'avenir, la solution. Ex: 'L'IA est une chance pour nous.'
- Borne 100 (Critique/Sceptique) : Focus sur le risque, le danger, la mise en garde. Ex: 'L'IA est une menace pour l'emploi.'

9. ANCRAGE (Code: ANC)
- Borne 0 (Abstrait/Vision) : Concepts, vision long terme, idées. Ex: 'Le futur sera digital.'
- Borne 100 (Concret/Pragmatique) : Actions immédiates, outils, réel. Ex: 'Installez cet outil dès maintenant.'
`;

export async function POST(req: NextRequest) {
  const timeoutMs = 45000; // Increased to 45s to handle potential model latencies/retries
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = await req.json();
    
    // 1. Validation of request
    const validationResult = GenerateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { phase, topic } = validationResult.data;
    
    // Resolve theme ID to label if necessary
    const matchedTheme = themes.find((t: { id: string; label: string }) => t.id === topic);
    const resolvedTopic = matchedTheme ? matchedTheme.label : topic;
    
    const cleanTopic = sanitizeTopic(resolvedTopic);

    // 2. Phase 1 Logic
    if (phase === 1) {
      const systemInstruction = `Tu es le moteur de calibration de postry.ai. Ta mission est de générer 6 questions binaires A/B pour identifier l'identité scripturale d'un utilisateur. Tu dois impérativement respecter les dimensions stylistiques du protocole ICE.
      
${ICE_FULL_REFERENTIAL}`;
      
      const userPrompt = `ACTION : Génère 6 questions A/B de polarisation pour le thème : ${cleanTopic}.

### CONSIGNES DE GÉNÉRATION
1. Reste strictement dans le thème : ${cleanTopic}.
2. Chaque paire A/B doit traiter du MÊME sujet thématique (ex: Q1 sur l'apprentissage, Q2 sur un résultat, etc.).
3. Les options doivent être claires, contrastées mais crédibles (pas de caricature grossière).
4. L'option A doit correspondre à la borne 15 de la dimension, l'option B à la borne 85 (pour éviter les extrêmes caricaturaux 0/100).
5. Longueur maximale par option : 15 mots.
6. IMPORTANT : Utilise les codes à 3 lettres (POS, TEM, DEN, PRI, CAD, REG) pour le champ "dimension".

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q1", "dimension": "POS", "option_A": "...", "option_B": "..."}, ...]`;

      const questions = await generateWithGemini(systemInstruction, userPrompt, 2, controller.signal);

      // Normalize dimensions
      questions.forEach(q => {
        q.dimension = normalizeDimension(q.dimension) as any;
      });

      // Validate Phase 1 dimensions
      const generatedDims = questions.map(q => q.dimension);
      const missingDims = ICE_PHASE1_DIMENSIONS_ORDER.filter(dim => !generatedDims.includes(dim));
      
      if (missingDims.length > 0) {
        throw new Error(`Generated quiz missing dimensions: ${missingDims.join(', ')}`);
      }

      return NextResponse.json(questions);
    }

    // 3. Phase 2 Logic
    if (phase === 2) {
      const { context } = validationResult.data as z.infer<typeof Phase2RequestSchema>;
      
      // Map archetypeVector to object for prompt
      const vectorObj = ICE_VECTOR_ORDER.reduce((acc, code, idx) => {
        acc[code] = context.archetypeVector[idx];
        return acc;
      }, {} as Record<string, number>);

      const systemInstruction = `Tu es le moteur de nuance de postry.ai. Ta mission est de générer 5 questions binaires d'affinage pour un utilisateur dont le profil de base est : ${context.archetypeName}.
      
${ICE_FULL_REFERENTIAL}`;
      
      const userPrompt = `ACTION : Génère 5 questions A/B d'affinage pour le thème : ${cleanTopic}.

### CONTEXTE UTILISATEUR
- Archétype détecté : ${context.archetypeName}
- Vecteur actuel (V6) : ${JSON.stringify(vectorObj)}
- Dimensions à tester impérativement : ${context.targetDimensions.join(', ')}

### CONSIGNES DE GÉNÉRATION
1. Pour chaque dimension listée, génère une paire A/B.
2. L'option A doit correspondre à la borne 15 de la dimension, l'option B à la borne 85.
3. **Nuance cruciale** : Ne sois pas caricatural. Les phrases doivent refléter le style de l'archétype ${context.archetypeName}.
4. Chaque paire doit traiter d'un sujet différent lié au thème ${cleanTopic} pour éviter la répétition.
5. Longueur maximale par option : 15 mots.
6. IMPORTANT : Utilise les codes à 3 lettres indiqués (ex: CAD, DEN) pour le champ "dimension".

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q7", "dimension": "CAD", "option_A": "...", "option_B": "..."}, ...]`;

      const questions = await generateWithGemini(systemInstruction, userPrompt, 2, controller.signal);

      // Normalize dimensions
      questions.forEach(q => {
        q.dimension = normalizeDimension(q.dimension) as any;
      });

      // Validate Phase 2 dimensions
      const generatedDims = questions.map(q => q.dimension);
      const missingDims = context.targetDimensions.filter(dim => !generatedDims.includes(dim as any));
      
      if (missingDims.length > 0) {
         throw new Error(`Generated quiz missing dimensions: ${missingDims.join(', ')}`);
      }

      return NextResponse.json(questions);
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

  } catch (error: unknown) {
    console.error('API Error:', error);
    
    const err = error as Error & { status?: number };

    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Generation timeout', message: 'The request took too long to complete' },
        { status: 504 }
      );
    }

    // Handle Gemini errors specifically if needed
    if (err.message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ error: 'AI Service Configuration Error' }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to generate quiz questions', message: err.message },
      { status: err.status || 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
