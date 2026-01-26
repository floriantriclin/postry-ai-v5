import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { QuizResponseSchema, QuizQuestion, PostGenerationResponseSchema, PostGenerationResponse } from './types';
import { env } from './env';

/**
 * Utility to clean LLM response and extract JSON content.
 * Handles markdown blocks and potential surrounding text.
 */
export function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
  }
  
  // Find the first '[' or '{' and the last ']' or '}'
  const startBracket = cleaned.indexOf('[');
  const startBrace = cleaned.indexOf('{');
  const start = (startBracket !== -1 && (startBrace === -1 || startBracket < startBrace)) ? startBracket : startBrace;
  
  const endBracket = cleaned.lastIndexOf(']');
  const endBrace = cleaned.lastIndexOf('}');
  const end = (endBracket !== -1 && (endBrace === -1 || endBracket > endBrace)) ? endBracket : endBrace;

  if (start === -1 || end === -1 || end < start) {
    throw new Error('No valid JSON structure found in response');
  }

  return cleaned.substring(start, end + 1);
}

/**
 * Basic sanitization for topics to prevent prompt injection.
 */
export function sanitizeTopic(topic: string): string {
  // Remove common LLM instruction keywords and control characters
  return topic
    .replace(/[<>]/g, '') // Remove tags
    .replace(/ignore previous instructions/gi, '')
    .replace(/system instruction/gi, '')
    .replace(/you are a/gi, '')
    .substring(0, 100) // Limit length
    .trim();
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

// Default models for different tasks - can be easily overridden here
export const GEMINI_MODELS = {
  QUIZ: 'gemini-2.5-flash',
  PROFILE: 'gemini-2.5-flash',
  POST: 'gemini-2.5-flash',
};

/**
 * Returns a configured Gemini model instance.
 */
export function getGeminiModel(config: {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
} = {}) {
  return genAI.getGenerativeModel({
    model: config.model || GEMINI_MODELS.QUIZ,
    systemInstruction: config.systemInstruction,
    generationConfig: {
      responseMimeType: config.responseMimeType || 'application/json',
      temperature: config.temperature,
    },
  });
}

/**
 * Calls Gemini API with retry logic and robust parsing.
 */
export async function generateWithGemini(
  systemInstruction: string,
  userPrompt: string,
  retries = 2,
  signal?: AbortSignal
): Promise<QuizQuestion[]> {
  const model = getGeminiModel({
    model: GEMINI_MODELS.QUIZ,
    systemInstruction
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(userPrompt, { signal });
      const response = await result.response;
      const text = response.text();
      
      const jsonString = cleanJsonResponse(text);
      const parsed = JSON.parse(jsonString);
      
      return QuizResponseSchema.parse(parsed);
    } catch (error: unknown) {
      const err = error as Error;
      lastError = err;
      console.error(`Gemini call attempt ${attempt + 1} failed:`, error instanceof z.ZodError ? JSON.stringify(error.issues, null, 2) : error instanceof Error ? error.message : String(error));
      if (attempt < retries) {
        // Wait before retry (exponential backoff could be added here)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to generate content after retries');
}

/**
 * Generates a LinkedIn post based on topic and style vector.
 */
export async function generatePostWithGemini(
  systemInstruction: string,
  userPrompt: string,
  retries = 2,
  signal?: AbortSignal
): Promise<PostGenerationResponse> {
  const model = getGeminiModel({
    model: GEMINI_MODELS.POST,
    systemInstruction
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(userPrompt, { signal });
      const response = await result.response;
      const text = response.text();
      
      const jsonString = cleanJsonResponse(text);
      const parsed = JSON.parse(jsonString);
      
      return PostGenerationResponseSchema.parse(parsed);
    } catch (error: unknown) {
      const err = error as Error;
      lastError = err;
      console.error(`Gemini Post Generation call attempt ${attempt + 1} failed:`, error instanceof z.ZodError ? JSON.stringify(error.issues, null, 2) : error instanceof Error ? error.message : String(error));
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to generate post after retries');
}
