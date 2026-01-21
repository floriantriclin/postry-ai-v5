'use client';

import { useState } from 'react';

interface FinalRevealProps {
  profile: {
    label_final: string;
    definition_longue: string;
  };
}

export function FinalReveal({ profile }: FinalRevealProps) {
  const [topic, setTopic] = useState('');

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
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="De quoi voulez-vous parler ?" 
            className="raw-input flex-1 text-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button className="raw-button raw-button-primary whitespace-nowrap">
            Générer un post
          </button>
        </div>
      </div>
    </div>
  );
}
