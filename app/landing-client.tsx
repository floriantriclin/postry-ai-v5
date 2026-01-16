'use client';

import { useState } from 'react';

const THEMES = [
  "Management", "Vente", "Tech", "Entrepreneuriat", 
  "Échec", "Productivité", "Leadership", "Marketing",
  "Innovation", "Soft Skills"
];

interface LandingClientProps {
  onStart: (topic: string) => void;
}

export default function LandingClient({ onStart }: LandingClientProps) {
  const [step, setStep] = useState<'hero' | 'theme'>('hero');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  if (step === 'hero') {
    return (
      <section className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Trouvez votre Voix.<br />
            <span className="text-zinc-500">Pas celle d'un Robot.</span>
          </h1>
          <p className="text-lg md:text-xl font-medium max-w-lg mx-auto">
            Découvrez votre Archétype d'écriture LinkedIn en 2 minutes.
          </p>
        </div>

        <button 
          onClick={() => setStep('theme')}
          className="raw-button raw-button-primary text-xl md:text-2xl px-12 h-16"
        >
          [ DÉTERMINER MON STYLE ]
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center space-y-8 animate-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-none">
          Sur quel sujet êtes-vous le plus à l'aise ?
        </h2>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
          Sélectionnez un thème pour commencer
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl px-4">
        {THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => setSelectedTheme(theme)}
            className={`raw-button ${
              selectedTheme === theme
                ? 'bg-carbon text-white'
                : 'raw-button-secondary'
            } text-sm py-4 h-auto break-words whitespace-normal min-w-0 overflow-hidden`}
          >
            <span className="truncate md:overflow-visible md:whitespace-normal">
              {theme}
            </span>
          </button>
        ))}
      </div>

      <button
        disabled={!selectedTheme}
        onClick={() => selectedTheme && onStart(selectedTheme)}
        className={`raw-button raw-button-primary px-12 h-14 text-lg transition-opacity ${
          !selectedTheme ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
        }`}
      >
        DÉMARRER
      </button>
    </section>
  );
}
