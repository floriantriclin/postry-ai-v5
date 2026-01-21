import { NextRequest, NextResponse } from 'next/server';
import { PostGenerationRequestSchema } from '@/lib/types';
import { generatePostWithGemini, sanitizeTopic } from '@/lib/gemini';
import { ICE_DIMENSIONS, ICE_VECTOR_ORDER } from '@/lib/ice-constants';

export const maxDuration = 30; // Allow 30 seconds for Gemini generation

export async function POST(req: NextRequest) {
  const correlationId = crypto.randomUUID();
  console.log(`[${correlationId}] Starting Post Generation`);

  try {
    const body = await req.json();
    const result = PostGenerationRequestSchema.safeParse(body);

    if (!result.success) {
      console.warn(`[${correlationId}] Invalid request body`, result.error);
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.errors },
        { status: 400 }
      );
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
You are a professional LinkedIn ghostwriter mimicking a specific user style defined by the "ICE Model".
Your goal is to write a high-impact LinkedIn post in FRENCH.

USER IDENTITY:
- Archetype: ${archetype} ${profileLabel ? `(${profileLabel})` : ''}
- Style Vector Analysis:
${styleContext}

STRICT GUIDELINES:
1. LANGUAGE: MUST BE FRENCH.
2. TONE/STYLE: You MUST strictly adhere to the Style Vector values above. 
   - If Density is high (>70), use technical jargon. If low (<30), be very simple.
   - If Cadence is low (<30), use short, punchy sentences.
   - If Posture is high (>70), be authoritative.
   - Apply the specific nuances of the archetype.
3. STRUCTURE:
   - HOOK: 1 impactful sentence to grab attention.
   - CONTENT: The main body, formatted with line breaks for readability.
   - CTA: A clear Call to Action or engaging question at the end.
4. FEEDBACK: Provide a short analysis (1 sentence) on how you applied the style in "style_analysis".

Respond ONLY with the JSON object matching this structure:
{
  "hook": "...",
  "content": "...",
  "cta": "...",
  "style_analysis": "..."
}
`;

    const userPrompt = `Subject: "${sanitizedTopic}"\nWrite the post now following the style constraints.`;

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
