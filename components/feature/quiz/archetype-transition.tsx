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
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto p-6 text-center animate-in fade-in duration-500">
      <span className="font-mono text-sm uppercase tracking-widest text-zinc-500 mb-4">
        Résultat Intermédiaire
      </span>
      <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
        {archetype.name}
      </h2>
      <p className="text-xl md:text-2xl font-medium mb-12 leading-relaxed">
        {archetype.description}
      </p>
      
      <div className="bg-zinc-100 border-l-4 border-signal-orange p-4 text-left mb-12 w-full">
         <p className="font-bold mb-2">Prochaine étape : L'Affinage</p>
         <p className="text-sm">Nous allons maintenant nuancer ce profil avec 5 questions de précision pour générer votre identité unique.</p>
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
