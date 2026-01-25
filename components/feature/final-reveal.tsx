'use client';

import { useState, useEffect } from 'react';
import { Archetype, Vstyle, PostGenerationResponse } from '@/lib/types';
import { Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { LoaderMachine } from '../ui/loader-machine';
import { AuthModal } from './auth-modal';
import { supabase } from '@/lib/supabase';

interface FinalRevealProps {
  profile: {
    label_final: string;
    definition_longue: string;
  };
  archetype: Archetype;
  vector: Vstyle;
  initialPost?: PostGenerationResponse | null;
  onPostGenerated?: (post: PostGenerationResponse, topic: string) => void;
  topic?: string;
  acquisitionTheme?: string;
  quizAnswers?: any;
}

export function FinalReveal({
  profile,
  archetype,
  vector,
  initialPost,
  onPostGenerated,
  topic: initialTopic,
  acquisitionTheme,
  quizAnswers
}: FinalRevealProps) {
  const [topic, setTopic] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<PostGenerationResponse | null>(initialPost || null);
  const [isPostGenerated, setIsPostGenerated] = useState(!!initialPost);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setGeneratedPost(initialPost);
      setIsPostGenerated(true);
    }
  }, [initialPost]);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Lock navigation when post is generated to prevent back button usage
  useEffect(() => {
    if (isPostGenerated) {
      // Push current state to stack
      window.history.pushState(null, "", window.location.href);
      
      const handlePopState = () => {
        // If user tries to go back, push state again to stay here
        window.history.pushState(null, "", window.location.href);
      };

      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isPostGenerated]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowAuthModal(true);
      }
      setIsAuthLoading(false);
    };

    checkSession();
  }, []);

  const handleGenerate = async () => {
    if (!topic || topic.length < 3) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          archetype: archetype.name,
          vector,
          profileLabel: profile.label_final
        })
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setGeneratedPost(data);
      setIsPostGenerated(true);
      if (onPostGenerated) onPostGenerated(data, topic);
    } catch (err) {
      setError('Impossible de générer le post. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <LoaderMachine message="GENERATION DU POST..." />
      </div>
    );
  }

  if (generatedPost) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col overflow-y-auto animate-in fade-in duration-500">

        <div className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-12 flex flex-col items-center pt-20">
            
           {/* Meta Info Section */}
           <div className="w-full text-center mb-8 space-y-4">
              {/* Profile & Analysis Toggle */}
              <div className="flex flex-col items-center gap-2">
                 <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                    ÉCRIT PAR VOTRE BINÔME NUMÉRIQUE
                 </span>
                 
                 <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-xs font-mono text-zinc-400 hover:text-black flex items-center gap-1 transition-colors border-b border-dashed border-zinc-300 pb-0.5"
                 >
                    {showAnalysis ? 'Masquer l\'analyse' : 'Voir l\'analyse de style'}
                    {showAnalysis ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                 </button>

                 {/* Collapsible Analysis Drawer */}
                 {showAnalysis && (
                    <div className="mt-4 w-full bg-zinc-100 border-l-2 border-zinc-300 p-4 text-left animate-in slide-in-from-top-2 duration-200">
                       <p className="text-sm text-zinc-600 italic leading-relaxed">
                          "{generatedPost.style_analysis}"
                       </p>
                    </div>
                 )}
              </div>

              {/* Theme Display - Highly Visible */}
              <h2 className="text-3xl md:text-4xl font-black text-black mt-6 mb-2 leading-tight">
                 {topic}
              </h2>
           </div>

           {/* Post Container with Draft Badge */}
           <div className="w-full relative">
              
              {/* Prominent Draft Badge */}
              <div className="absolute -top-3 right-4 z-20 bg-signal-orange border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
                 <span className="font-mono font-bold text-xs uppercase tracking-wider text-black">
                    Draft Mode
                 </span>
              </div>

              {/* Post Preview Card */}
              <div className="bg-white p-8 md:p-10 shadow-xl border border-zinc-200 relative overflow-hidden">
                 <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-zinc-900">
                    <p className="font-bold mb-6 text-xl">{generatedPost.hook}</p>
                    
                    <div className="relative">
                       {/* Content Masking Logic */}
                       <div
                         className={`relative z-0 transition-all duration-1000 ease-out ${(showAuthModal || isAuthLoading) ? 'select-none' : ''}`}
                         data-testid="post-content"
                       >
                          {generatedPost.content}
                       </div>
                        
                       {/* Blur/Gate Logic (Story 2.3/2.4) */}
                       {(showAuthModal || isAuthLoading) && (
                         <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_40%,rgba(255,255,255,1)_60%)] z-10 pointer-events-none" />
                       )}
                        
                       {/* Auth Modal Integration Point (Story 2.3) */}
                       {showAuthModal && !isAuthLoading && (
                         <div className="absolute inset-0 z-20 flex items-center justify-center">
                          <AuthModal onPreAuth={async (email) => {
                            if (!generatedPost) return false;
                            try {
                              const res = await fetch('/api/quiz/pre-persist', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  email,
                                  stylistic_vector: vector,
                                  profile: profile,
                                  archetype: archetype,
                                  theme: topic, // Post Subject
                                  post_content: `${generatedPost.hook}\n\n${generatedPost.content}\n\n${generatedPost.cta}`,
                                  hook: generatedPost.hook,
                                  cta: generatedPost.cta,
                                  style_analysis: generatedPost.style_analysis,
                                  content_body: generatedPost.content,
                                  quiz_answers: {
                                    acquisition_theme: acquisitionTheme,
                                    ...quizAnswers
                                  }
                                })
                              });
                              if (!res.ok) {
                                console.error('Failed to pre-persist');
                                return false;
                              }

                              // Clean up local storage on success
                              localStorage.removeItem('ice_quiz_state_v1');
                              return true;
                            } catch (e) {
                              console.error('Pre-persist error:', e);
                              return false;
                            }
                          }} />
                        </div>
                      )}
                   </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    );
  }

  return (
    <div data-testid="final-reveal-container" className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 min-h-[80vh] animate-in slide-in-from-bottom-8 duration-700">
      <div className="w-full text-center mb-8 md:mb-12">
        <span className="font-mono bg-black text-white px-4 py-1 text-sm uppercase tracking-widest">
          Votre profil augmenté
        </span>
      </div>

      <h1 className="text-4xl md:text-7xl font-black mb-8 text-center uppercase tracking-tighter leading-none">
        <span className="block text-xl md:text-3xl font-bold mb-2 tracking-normal text-zinc-500">
          Vous êtes...
        </span>
        {profile.label_final}
      </h1>

      <div className="raw-card w-full p-8 md:p-12 mb-12 bg-white relative">
         <div className="absolute -top-3 -left-3 bg-signal-orange w-6 h-6 border-2 border-black" />
         <p className="text-xl md:text-2xl font-medium leading-relaxed font-serif italic text-zinc-800">
           "{profile.definition_longue}"
         </p>
      </div>

      <div className="w-full max-w-xl border-t-2 border-dashed border-zinc-300 pt-12">
        <h3 className="text-xl font-bold mb-4 uppercase">Testez votre style</h3>
        <div className="flex flex-col md:flex-row gap-4 relative">
          <input
            type="text"
            placeholder="De quoi voulez-vous parler ?"
            className="raw-input flex-1 text-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            className="raw-button raw-button-primary whitespace-nowrap min-w-[140px] flex justify-center items-center py-4 md:py-0"
            onClick={handleGenerate}
            disabled={isLoading || topic.length < 3 || isPostGenerated}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Générer un post'}
          </button>
        </div>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
