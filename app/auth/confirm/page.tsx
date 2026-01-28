'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { type Session } from '@supabase/supabase-js';
import { LoaderMachine } from '@/components/ui/loader-machine';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!sessionResolved) {
        console.warn('Auth confirmation timed out. Redirecting to home.');
        const redirectUrl = new URL('/', window.location.href);
        redirectUrl.searchParams.set('error', 'auth_timeout');
        redirectUrl.searchParams.set('message', 'La vérification a expiré. Veuillez réessayer.');
        router.replace(redirectUrl.toString());
      }
    }, 20000); // 20 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [sessionResolved, router]);

  useEffect(() => {
    const handleAuthSession = async (session: Session | null) => {
      if (session) {
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session }),
        });

        if (!response.ok) {
          console.error('Failed to set server session');
          setErrorMsg('Erreur serveur lors de la synchronisation de la session.');
          setSessionResolved(true);
          return;
        }

        // Story 2.11b: Persist-First Architecture with Feature Flag
        const enablePersistFirst = process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST === 'true';

        if (enablePersistFirst) {
          // NEW FLOW: Link pending post to user
          const postId = searchParams.get('postId');
          
          if (postId) {
            try {
              const linkResponse = await fetch('/api/posts/link-to-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId })
              });

              if (!linkResponse.ok) {
                console.error('Failed to link post to user:', await linkResponse.text());
                // Still redirect to dashboard (graceful degradation - post remains pending)
              } else {
                console.log('Post linked successfully to user');
              }
            } catch (e) {
              console.error('Error linking post:', e);
              // Graceful degradation - continue to dashboard
            }
          } else {
            console.warn('No postId in URL - skipping post linking');
          }

          // Redirect directly to dashboard (no localStorage check needed)
          router.replace('/dashboard');
          setSessionResolved(true);
        } else {
          // OLD FLOW: Persist quiz data from localStorage if it exists
          const quizStateRaw = localStorage.getItem('ice_quiz_state_v1');
          if (quizStateRaw) {
            try {
              const quizState = JSON.parse(quizStateRaw);
              
              // Only persist if we have a generated post
              if (quizState.generatedPost && quizState.profileData && quizState.currentVector) {
                const persistResponse = await fetch('/api/auth/persist-on-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: session.user.email,
                    stylistic_vector: quizState.currentVector,
                    profile: quizState.profileData,
                    archetype: quizState.archetypeData?.archetype,
                    theme: quizState.postTopic || 'Sujet non disponible',
                    post_content: `${quizState.generatedPost.hook}\n\n${quizState.generatedPost.content}\n\n${quizState.generatedPost.cta}`,
                    hook: quizState.generatedPost.hook,
                    cta: quizState.generatedPost.cta,
                    style_analysis: quizState.generatedPost.style_analysis,
                    content_body: quizState.generatedPost.content,
                    quiz_answers: {
                      acquisition_theme: quizState.themeId,
                      p1: quizState.answersP1,
                      p2: quizState.answersP2
                    }
                  })
                });

                if (persistResponse.ok) {
                  console.log('Quiz data persisted successfully');
                  // Clean up localStorage after successful persist
                  localStorage.removeItem('ice_quiz_state_v1');
                } else {
                  console.error('Failed to persist quiz data');
                }
              }
            } catch (e) {
              console.error('Error persisting quiz data:', e);
            }
          }

          // Redirect directly to dashboard (no intermediate /quiz/reveal)
          router.replace('/dashboard');
          setSessionResolved(true);
        }
      }
    };

    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      
      // Check for error in hash
      if (hash && hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        console.warn('Auth Error from Hash:', params.get('error_code'), errorDescription);
        
        const redirectUrl = new URL('/', window.location.href);
        redirectUrl.searchParams.set('error', 'auth_failed');
        redirectUrl.searchParams.set('message', errorDescription || 'Authentication failed');
        router.replace(redirectUrl.toString());
        setSessionResolved(true);
        return;
      }

      // Check for access_token in hash (Implicit Flow support)
      // This is required because @supabase/ssr defaults to PKCE and might ignore the hash
      if (hash && hash.includes('access_token=')) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
              supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
              }).then(({ data, error }) => {
                  if (error) {
                       console.error('Error setting session from hash:', error);
                       setErrorMsg("Erreur lors de la validation du lien.");
                       setSessionResolved(true);
                  } else if (data.session) {
                      // handleAuthSession will be called directly here to ensure progress
                      handleAuthSession(data.session);
                  }
              });
              return;
          }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleAuthSession(session);
      }
      if(event === 'SIGNED_OUT') {
        setSessionResolved(true);
        router.replace('/');
      }
    });

    // Initial check in case the user is already logged in
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Error in initial getUser:", error);
        setErrorMsg("Erreur lors de la récupération de l'utilisateur.");
        setSessionResolved(true);
        return;
      }
      if(user) {
        // Get the session for handleAuthSession
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            handleAuthSession(session);
          }
        });
      }
      // If no user, we wait for onAuthStateChange
    }).catch(err => {
        console.error("Error in initial getUser:", err);
        setErrorMsg("Erreur lors de la récupération de l'utilisateur.");
        setSessionResolved(true);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase, searchParams]);
  
  if (errorMsg) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <div className="text-red-500 font-bold">Erreur d'authentification</div>
        <div>{errorMsg}</div>
        <button onClick={() => router.push('/')} className="bg-black text-white px-4 py-2">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderMachine />
    </div>
  );
}

export default function AuthConfirm() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderMachine />
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  );
}
