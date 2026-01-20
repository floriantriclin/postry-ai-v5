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
      <p className="text-lg md:text-xl font-medium mb-8 leading-relaxed">
        Nous allons commencer par une série rapide de questions binaires (A/B) pour déterminer votre archétype rédactionnel fondamental.
      </p>
      <div className="raw-card bg-zinc-50 mb-8 w-full">
         <p className="font-mono text-sm text-zinc-600">
            ⚠️ Répondez spontanément. Il n'y a pas de mauvaise réponse, seulement votre style.
         </p>
      </div>
      {isLoading ? (
        <LoaderMachine message="INITIALISATION..." className="mt-8" />
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
