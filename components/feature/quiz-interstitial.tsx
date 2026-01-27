'use client';

import { LoaderMachine } from '../ui/loader-machine';

interface QuizInterstitialProps {
  onStart: () => void;
  isLoading?: boolean;
}

export function QuizInterstitial({ onStart, isLoading = false }: QuizInterstitialProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto p-6 text-center">
      <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">
        Phase 1 : <span className="text-signal-orange">Calibration</span>
      </h2>
      <div className="text-left text-lg md:text-xl font-medium mb-8 leading-relaxed space-y-4">
        <p>Nous allons commencer par une phase de calibration rapide pour identifier votre ADN rédactionnel.</p>
        <p>Le principe est simple : pour chaque étape, deux options d'écriture vous seront présentées. Votre mission est de choisir celle qui résonne le plus avec votre propre voix — celle que vous auriez pu signer de votre main.</p>
        <p>Il ne s'agit pas de juger la qualité du texte, mais de saisir la nuance, le rythme et le ton qui vous sont naturels.</p>
      </div>
      <div className="raw-card bg-zinc-50 mb-8 w-full">
         <p className="font-mono text-sm text-zinc-600">
            ⚠️ Répondez spontanément. Il n’y a pas de bonne ou de mauvaise réponse, seulement le reflet de votre style unique.
         </p>
      </div>
      {isLoading ? (
        <LoaderMachine className="mt-8" />
      ) : (
        <button
          onClick={onStart}
          className="raw-button raw-button-primary w-full md:w-auto text-xl py-8 flex items-center justify-center gap-3"
          data-testid="start-quiz-btn"
        >
          Lancer la calibration
        </button>
      )}
    </div>
  );
}
