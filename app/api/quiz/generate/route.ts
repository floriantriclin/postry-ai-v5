import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini, sanitizeTopic } from '@/lib/gemini';
import { ICE_VECTOR_ORDER } from '@/lib/ice-constants';

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

export async function POST(req: NextRequest) {
  const timeoutMs = 15000;
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
    const cleanTopic = sanitizeTopic(topic);

    // 2. Phase 1 Logic
    if (phase === 1) {
      const systemInstruction = `Tu es le moteur de calibration de postry.ai. Ta mission est de générer 6 questions binaires A/B pour identifier l'identité scripturale d'un utilisateur. Tu dois impérativement respecter les dimensions stylistiques du protocole ICE.`;
      
      const userPrompt = `ACTION : Génère 6 questions A/B de polarisation pour le thème : ${cleanTopic}.

### RÉFÉRENTIEL DES DIMENSIONS (PHASE 1)

Q1 : POSTURE (Hiérarchie)
- Borne 0 (Humble/Pair) : Partage d'expérience, doute, 'Je', vulnérabilité. Ex: 'J'ai fait cette erreur au début.'
- Borne 100 (Guru/Vertical) : Affirmation, vérité générale, 'Vous', autorité. Ex: 'Voici la seule méthode qui fonctionne.'

Q2 : TEMPÉRATURE (Émotion)
- Borne 0 (Froid/Clinique) : Constat objectif, neutre, sans adjectif émotionnel. Ex: 'Le résultat est de 12%.'
- Borne 100 (Chaud/Viscéral) : Passion, exclamation, ressenti fort, tripes. Ex: 'C'est une victoire incroyable !'

Q3 : DENSITÉ (Complexité)
- Borne 0 (Simple/Vulgarisé) : Mots courants, analogies accessibles, zéro jargon. Ex: 'C'est comme un moteur de vélo.'
- Borne 100 (Expert/Technique) : Jargon précis, acronymes, niveau professionnel. Ex: 'L'architecture micro-services permet la scalabilité.'

Q4 : PRISME (Vision)
- Borne 0 (Optimiste/Opportunité) : Focus sur le positif, l'avenir, la solution. Ex: 'L'IA est une chance pour nous.'
- Borne 100 (Critique/Sceptique) : Focus sur le risque, le danger, la mise en garde. Ex: 'L'IA est une menace pour l'emploi.'

Q5 : CADENCE (Rythme)
- Borne 0 (Haché/Percutant) : Phrases très courtes. Sujet-Verbe-Point. Impact. Ex: 'C'est fait. On avance.'
- Borne 100 (Fluide/Lié) : Phrases longues, virgules, connecteurs, musicalité. Ex: 'Une fois la tâche finie, nous progressons sereinement.'

Q6 : REGISTRE (Couleur)
- Borne 0 (Sérieux/Pro) : Gravité, sobriété, premier degré, respect des codes. Ex: 'Il faut respecter les délais.'
- Borne 100 (Ludique/Décalé) : Humour, second degré, emojis, décalage. Ex: 'Houston, on a un (petit) problème 🚀.'

### CONSIGNES DE GÉNÉRATION
1. Reste strictement dans le thème : ${cleanTopic}.
2. Chaque paire A/B doit traiter du MÊME sujet thématique (ex: Q1 sur l'apprentissage, Q2 sur un résultat, etc.).
3. Les options doivent être claires, contrastées mais crédibles (pas de caricature grossière).
4. Longueur maximale par option : 15 mots.

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q1", "dimension": "POSTURE", "option_A": "...", "option_B": "..."}, ...]`;

      const questions = await generateWithGemini(systemInstruction, userPrompt, 2, controller.signal);
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

      const systemInstruction = `Tu es le moteur de nuance de postry.ai. Ta mission est de générer 5 questions binaires d'affinage pour un utilisateur dont le profil de base est : ${context.archetypeName}.`;
      
      const userPrompt = `ACTION : Génère 5 questions A/B d'affinage pour le thème : ${cleanTopic}.

### RÉFÉRENTIEL COMPLET DES 9 DIMENSIONS (ICE PROTOCOL)

1. CADENCE (CAD) : 0 (Haché, impactant) vs 100 (Fluide, musical). Ex: 'C'est fait. On avance.' vs 'Une fois terminé, nous progressons.'
2. DENSITÉ (DEN) : 0 (Simple, vulgarisé) vs 100 (Expert, jargon). Ex: 'On change la roue.' vs 'On remplace l'unité pneumatique.'
3. STRUCTURE (STR) : 0 (Organique, flux libre) vs 100 (Logique, carré). Ex: 'Je pensais à ça...' vs 'Voici les 3 points :'
4. POSTURE (POS) : 0 (Humble, partage) vs 100 (Guru, autorité). Ex: 'J'apprends encore.' vs 'Faites comme ceci.'
5. TEMPÉRATURE (TEM) : 0 (Froid, clinique) vs 100 (Chaud, viscéral). Ex: 'Le CA monte de 5%.' vs 'Quelle fierté de voir ce résultat !'
6. REGISTRE (REG) : 0 (Sérieux, solennel) vs 100 (Ludique, décalé). Ex: 'C'est crucial.' vs 'Houston, petit souci 🚀.'
7. INFLEXION (INF) : 0 (Factuel, chiffres) vs 100 (Narratif, histoire). Ex: '50 inscrits hier.' vs 'Quand j'ai ouvert la liste, j'ai vu...'
8. PRISME (PRI) : 0 (Optimiste, opportunité) vs 100 (Critique, sceptique). Ex: 'L'IA est une chance.' vs 'Attention aux dérives de l'IA.'
9. ANCRAGE (ANC) : 0 (Abstrait, vision) vs 100 (Concret, pragmatique). Ex: 'Le futur est digital.' vs 'Installez cet outil.'

### CONTEXTE UTILISATEUR
- Archétype détecté : ${context.archetypeName}
- Vecteur actuel (V6) : ${JSON.stringify(vectorObj)}
- Dimensions à tester impérativement : ${context.targetDimensions.join(', ')}

### CONSIGNES DE GÉNÉRATION
1. Pour chaque dimension listée, génère une paire A/B. 
2. L'option A doit correspondre à la borne 0, l'option B à la borne 100.
3. **Nuance cruciale** : Ne sois pas caricatural. Les phrases doivent refléter le style de l'archétype ${context.archetypeName}. 
4. Chaque paire doit traiter d'un sujet différent lié au thème ${cleanTopic} pour éviter la répétition.
5. Longueur maximale par option : 15 mots.

FORMAT DE RÉPONSE ATTENDU :
Un tableau JSON d'objets : [{"id": "Q7", "dimension": "...", "option_A": "...", "option_B": "..."}, ...]`;

      const questions = await generateWithGemini(systemInstruction, userPrompt, 2, controller.signal);
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
