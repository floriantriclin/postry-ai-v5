'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoaderMachine } from '@/components/ui/loader-machine';
import { QuizState } from '@/components/feature/quiz-engine.logic';

export default function RevealPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/');
          return;
        }

        // Fetch the user's revealed post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', session.user.id)
          // We look for the most recent post
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (postError || !post) {
            console.error('No post found', postError);
            setError('Post introuvable. Veuillez réessayer de générer un post.');
            return;
        }

        const meta = post.equalizer_settings as any;
        
        if (!meta || !meta.profile || !meta.archetype) {
            setError('Données du post corrompues.');
            return;
        }

        // Reconstruct State
        // Note: Since we only persisted the 'content' string, we reconstruct the object best-effort.
        const restoredState: QuizState = {
            step: 'FINAL_REVEAL',
            status: 'idle',
            themeId: post.theme,
            questionsP1: [],
            questionIndex: 0,
            answersP1: {},
            archetypeData: {
                archetype: meta.archetype,
                targetDimensions: []
            },
            questionsP2: [],
            answersP2: {},
            currentVector: meta.vector,
            profileData: meta.profile,
            generatedPost: {
                hook: post.content.split('\n')[0].substring(0, 50) + "...", // Approximate hook
                content: post.content,
                cta: "En savoir plus", // Default CTA
                style_analysis: "Analyse retrouvée depuis votre sauvegarde."
            },
            error: null
        };
        
        localStorage.setItem('ice_quiz_state_v1', JSON.stringify(restoredState));
        
        // Redirect to Quiz Engine which will pick up the state
        router.push('/quiz');

      } catch (e) {
        console.error('Error restoring session', e);
        setError('Une erreur est survenue lors de la récupération de votre post.');
      }
    };

    restoreSession();
  }, [router]);

  if (error) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-white">
              <div className="p-6 text-center max-w-md border border-black">
                  <h1 className="text-xl font-bold mb-4 font-mono uppercase">Erreur</h1>
                  <p className="text-red-600 mb-6">{error}</p>
                  <button 
                    onClick={() => router.push('/quiz')} 
                    className="bg-black text-white px-4 py-2 font-mono uppercase text-sm hover:bg-zinc-800"
                  >
                    Retour au Quiz
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <LoaderMachine message="RECUPERATION DE VOTRE PROFIL..." />
    </div>
  );
}
