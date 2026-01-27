'use client';

interface ArchetypeTransitionProps {
  archetype: {
    name: string;
    description: string;
  };
  onContinue: () => void;
}

export function ArchetypeTransition({ archetype, onContinue }: ArchetypeTransitionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-4xl mx-auto p-6 text-center animate-in fade-in duration-500">
      <span className="font-mono text-sm uppercase tracking-widest text-zinc-500 mb-4">
        Votre ADN Rédactionnel
      </span>
      <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
        {archetype.name}
      </h2>
      
      <div className="raw-card w-full p-8 md:p-12 mb-12 bg-white relative text-left">
        <div className="absolute -top-3 -left-3 bg-signal-orange w-6 h-6 border-2 border-black" />
        <p className="text-xl md:text-2xl font-medium leading-relaxed font-serif italic text-zinc-800">
          "{archetype.description}"
        </p>
      </div>
      
      <div className="bg-zinc-100 border-l-4 border-signal-orange p-6 text-left mb-12 w-full max-w-2xl">
         <p className="font-bold mb-2 uppercase tracking-wide">Prochaine étape : L'Affinage</p>
         <p className="text-base text-zinc-700">Nous allons maintenant nuancer ce profil avec quelques questions de précision pour générer votre identité unique.</p>
      </div>

      <button
        onClick={onContinue}
        className="raw-button raw-button-primary w-full md:w-auto text-xl py-6"
        data-testid="continue-refining-btn"
      >
        Continuer pour affiner
      </button>
    </div>
  );
}
