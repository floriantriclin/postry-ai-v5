import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

export const emailSchema = z.string().email({ message: "Adresse email invalide" });

export type AuthErrorType = 'RATE_LIMIT' | 'INVALID_EMAIL' | 'UNKNOWN';

export interface AuthResult {
  success: boolean;
  error?: {
    code: AuthErrorType;
    message: string;
  };
}

/**
 * Initiates the Magic Link login flow.
 * @param email User's email address
 * @param redirectTo Path to redirect to after successful login (default: /quiz/reveal)
 */
export async function signInWithOtp(email: string, redirectTo: string = '/quiz/reveal'): Promise<AuthResult> {
  // 1. Validate Email
  const validation = emailSchema.safeParse(email);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: validation.error.errors[0].message,
      },
    };
  }

  // 2. Call Supabase Auth
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      console.error('Supabase Auth Error:', error);

      let code: AuthErrorType = 'UNKNOWN';
      // Supabase 429 = Rate Limit
      if (error.status === 429) {
        code = 'RATE_LIMIT';
      }

      return {
        success: false,
        error: {
          code,
          message: error.message,
        },
      };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected Auth Error:', err);
    return {
        success: false,
        error: {
            code: 'UNKNOWN',
            message: 'Une erreur inattendue est survenue.',
        }
    }
  }
}
