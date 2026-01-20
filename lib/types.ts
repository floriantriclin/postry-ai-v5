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
