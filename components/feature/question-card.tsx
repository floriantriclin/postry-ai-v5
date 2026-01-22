'use client';

import { ProgressBar } from '../ui/progress-bar';

interface QuestionCardProps {
  question: {
    id: string;
    option_A: string;
    option_B: string;
  };
  progressValue: number; // 0-100
  onAnswer: (choice: 'A' | 'B') => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function QuestionCard({ question, progressValue, onAnswer, onBack, canGoBack }: QuestionCardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 min-h-[60vh] justify-center">
      <div className="w-full mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`font-mono text-sm underline ${!canGoBack ? 'opacity-0 pointer-events-none' : ''}`}
          >
            ← Retour
          </button>
        </div>
        <ProgressBar value={progressValue} />
      </div>

      <h3 className="text-xl md:text-2xl font-bold mb-8 text-center">
        Choisissez la version que vous auriez pu écrire
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <button
          onClick={() => onAnswer('A')}
          className="raw-card hover:bg-zinc-50 transition-all active:scale-95 text-left min-h-52 flex items-center justify-center p-8 group"
          data-testid="option-a"
        >
           <span className="text-lg md:text-xl font-medium group-hover:text-signal-orange transition-colors">
             {question.option_A}
           </span>
        </button>
        <button
          onClick={() => onAnswer('B')}
          className="raw-card hover:bg-zinc-50 transition-all active:scale-95 text-left min-h-52 flex items-center justify-center p-8 group"
          data-testid="option-b"
        >
           <span className="text-lg md:text-xl font-medium group-hover:text-signal-orange transition-colors">
             {question.option_B}
           </span>
        </button>
      </div>
    </div>
  );
}
