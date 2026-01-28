"use client";

import React, { useState, useRef, useEffect } from "react";
import { signInWithOtp } from "@/lib/auth";
import { z } from "zod";
import { X } from "lucide-react";

interface PostData {
  theme: string;
  content: string;
  quiz_answers: {
    acquisition_theme?: string;
    p1: any;
    p2: any;
  };
  equalizer_settings: {
    vector: number[];
    profile: any;
    archetype: string;
    components: {
      hook: string;
      content_body: string;
      cta: string;
      style_analysis: string;
    };
  };
}

interface AuthModalProps {
  postData?: PostData;
}

export function AuthModal({ postData }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect is kept to maintain the structure, but the Escape keydown listener is removed.
  }, [success]);

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const modal = modalRef.current;
    modal?.addEventListener('keydown', handleTabKey);
    return () => modal?.removeEventListener('keydown', handleTabKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const emailSchema = z.string().email({ message: "Adresse email invalide" });
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    // Story 2.11b: Persist-First Architecture with Feature Flag
    const enablePersistFirst = process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST === 'true';

    if (enablePersistFirst && postData) {
      // NEW FLOW: Persist → Clear localStorage → Send magic link
      try {
        // Step 1: Persist post anonymously BEFORE auth
        setIsPersisting(true);
        const persistResponse = await fetch('/api/posts/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        });

        if (!persistResponse.ok) {
          if (persistResponse.status === 429) {
            setError('Limite atteinte. Réessayez dans 1 heure.');
            setLoading(false);
            setIsPersisting(false);
            return;
          }
          throw new Error('Failed to persist post');
        }

        const { postId } = await persistResponse.json();
        setIsPersisting(false);

        // Step 2: Clear localStorage IMMEDIATELY after 200 response
        localStorage.removeItem('ice_quiz_state_v1');

        // Step 3: Send magic link with postId in URL
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const result = await signInWithOtp(email, `/auth/confirm?postId=${postId}`);
        setLoading(false);

        if (result.success) {
          setSuccess(true);
          
          // Block back navigation to prevent abusive regeneration
          window.history.pushState(null, "", window.location.href);
          window.onpopstate = function () {
            window.history.pushState(null, "", window.location.href);
          };
        } else {
          setError(result.error?.message || "Une erreur est survenue.");
        }
      } catch (err) {
        console.error('Persist-first flow error:', err);
        setError('Erreur lors de la sauvegarde. Réessayez.');
        setLoading(false);
        setIsPersisting(false);
      }
    } else {
      // OLD FLOW: Direct auth (for rollback or no postData)
      const result = await signInWithOtp(email);
      setLoading(false);

      if (result.success) {
        setSuccess(true);
        
        // Block back navigation
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = function () {
          window.history.pushState(null, "", window.location.href);
        };
      } else {
        setError(result.error?.message || "Une erreur est survenue.");
      }
    }
  };

  if (success) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className=""
      >
        <div className="bg-white p-6 rounded-none w-full max-w-xs text-center border border-black">
          <h2 id="auth-modal-title" className="text-xl font-bold mb-4">
            Lien envoyé !
          </h2>
          <p className="text-sm">
            Un lien de connexion a été envoyé à votre adresse email. Veuillez consulter votre boîte de réception.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className=""
    >
      <div ref={modalRef} className="bg-white p-6 rounded-none w-full max-w-xs relative border border-black">
        {!success && (
           null
        )}
        <h2 id="auth-modal-title" className="text-xl font-bold mb-4 text-center">
          Sauvegardez votre post
        </h2>
        <p className="mb-4 text-sm">
          Entrez votre email. Vous recevrez un lien qui vous permettra de conserver votre post et de le modifier.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="moi@exemple.com"
              className="w-full min-h-[44px] font-mono px-3 py-2 border-b-2 border-black focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
             {error && <p role="alert" className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full min-h-[44px] bg-black text-white py-3 px-4 rounded-none hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            disabled={loading}
          >
            {isPersisting ? "Sauvegarde en cours..." : loading ? "Envoi..." : "Envoyez-moi un lien"}
          </button>
        </form>
      </div>
    </div>
  );
}
