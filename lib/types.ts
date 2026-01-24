import { z } from 'zod';
import { ICE_DIMENSIONS } from './ice-constants';

// --- Common Types ---

/**
 * Codes des 9 dimensions stylistiques du modèle ICE.
 */
export type DimensionCode = keyof typeof ICE_DIMENSIONS;

/**
 * Le vecteur Vstyle : 9 nombres de 0 à 100.
 */
export type Vstyle = number[];

/**
 * Signature binaire de 6 bits pour la Phase 1.
 */
export type BinarySignature = string;

// --- Quiz Types ---

export const QuizQuestionSchema = z.object({
  id: z.string().regex(/^Q\d+$/),
  dimension: z.string() as z.ZodType<DimensionCode>,
  option_A: z.string().max(250),
  option_B: z.string().max(250),
});

export const QuizResponseSchema = z.array(QuizQuestionSchema);

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// --- ICE Protocol Types ---

export interface Archetype {
  id: number;
  name: string;
  family: string;
  binarySignature: BinarySignature;
  signature: string;
  description: string;
  baseVector: readonly number[] | number[];
}

/**
 * Profil enrichi avec l'archétype et les nuances détectées.
 */
export interface AugmentedProfile {
  archetype: Archetype;
  refinedVector: Vstyle;
  confidence: number;
}

// --- Post Generation Types ---

export const PostGenerationRequestSchema = z.object({
  topic: z.string().min(3),
  archetype: z.string(),
  vector: z.array(z.number().min(0).max(100)).length(9),
  profileLabel: z.string().optional(),
});

export const PostGenerationResponseSchema = z.object({
  hook: z.string(),
  content: z.string(),
  cta: z.string(),
  style_analysis: z.string(),
});

export type PostGenerationRequest = z.infer<typeof PostGenerationRequestSchema>;
export type PostGenerationResponse = z.infer<typeof PostGenerationResponseSchema>;

// --- Database Models ---

export interface User {
  id: string; // uuid
  email: string | null;
  credits_count: number;
  is_premium: boolean;
  profile_context: string | null;
  archetype: string | null;
  vstyle_vector: number[] | null; // jsonb
  created_at: string;
}

export interface Post {
  id: string; // uuid
  user_id: string; // uuid
  theme: string;
  archetype: string | null;
  content: string;
  quiz_answers: z.infer<typeof QuizResponseSchema> | null; // jsonb
  equalizer_settings: unknown | null; // jsonb
  is_revealed: boolean;
  created_at: string;
}
