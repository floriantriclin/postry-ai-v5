import { supabase } from '@/lib/supabase-client';
import { env } from '@/lib/env';
import { emailSchema } from './auth-schema';

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
 * @param redirectTo Path to redirect to after successful login (default: /dashboard)
 */
export async function signInWithOtp(email: string, redirectTo: string = '/dashboard'): Promise<AuthResult> {
  // 1. Validate Email
  const validation = emailSchema.safeParse(email);

  if (!validation.success) {
    return {
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: validation.error.issues[0]?.message || "Adresse email invalide",
      },
    };
  }

  // 2. Call Supabase Auth
  try {
    // Use window.location.origin if available (browser), fallback to env var
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : env.NEXT_PUBLIC_BASE_URL;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent(redirectTo)}`,
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
          message: "Trop de demandes. Veuillez réessayer plus tard.",
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
