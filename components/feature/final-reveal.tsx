'use client';

import { useState } from 'react';
import { Archetype, Vstyle, PostGenerationResponse } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface FinalRevealProps {
  profile: {
    label_final: string;
    definition_longue: string;
  };
  archetype: Archetype;
  vector: Vstyle;
}

export function FinalReveal({ profile, archetype, vector }: FinalRevealProps) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<PostGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError('Impossible de générer le post. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedPost) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-50 flex flex-col overflow-y-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase block">Thème: {topic}</span>
            <span className="text-sm font-bold uppercase tracking-tight">Généré par {profile.label_final}</span>
          </div>
          <div className="bg-signal-orange text-black font-mono text-xs px-2 py-1 uppercase font-bold">
            Draft Mode
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-12">
           {/* Feedback */}
           <div className="mb-8 p-4 bg-zinc-100 border-l-4 border-black text-sm italic text-zinc-600">
              <span className="font-bold not-italic mr-2">💡 Analyse Style :</span>
              {generatedPost.style_analysis}
           </div>

           {/* Post Preview */}
           <div className="bg-white p-8 shadow-lg border border-zinc-200 relative overflow-hidden">
              <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap text-zinc-900">
                 <p className="font-bold mb-4">{generatedPost.hook}</p>
                 
                 <div className="relative">
                    {/* Content Masking Logic */}
                    <div className="relative z-0">
                       {generatedPost.content}
                    </div>
                    
                    {/* Blur Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-10 pointer-events-none" 
                         style={{ background: 'linear-gradient(to bottom, transparent 15%, rgba(255,255,255,0.6) 25%, #ffffff 50%)' }} />
                    
                    {/* Call To Action Conversion Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-32">
                       <div className="bg-white p-8 border-2 border-dashed border-zinc-300 text-center max-w-sm mx-auto shadow-2xl">
                          <h3 className="font-bold text-xl mb-2 uppercase tracking-tight">Post Complet</h3>
                          <p className="text-zinc-600 mb-6">Pour voir la suite et copier ce post, finalisez votre compte.</p>
                          <button 
                            className="raw-button raw-button-primary w-full"
                            onClick={() => window.location.href = '#signup'} // Placeholder for Story 2.4
                          >
                             Débloquer mon post
                          </button>
                       </div>
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
      <div className="w-full text-center mb-12">
        <span className="font-mono bg-black text-white px-4 py-1 text-sm uppercase tracking-widest">
          Profil Augmenté
        </span>
      </div>

      <h1 className="text-4xl md:text-7xl font-black mb-8 text-center uppercase tracking-tighter leading-none">
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
        <div className="flex gap-2 relative">
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
            className="raw-button raw-button-primary whitespace-nowrap min-w-[140px] flex justify-center items-center"
            onClick={handleGenerate}
            disabled={isLoading || topic.length < 3}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Générer un post'}
          </button>
        </div>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
