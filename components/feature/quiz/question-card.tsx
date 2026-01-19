'use client';

interface QuestionCardProps {
  question: {
    id: string;
    option_A: string;
    option_B: string;
  };
  progressLabel: string; // "1/6" or "Précision: 80%"
  onAnswer: (choice: 'A' | 'B') => void;
  onBack: () => void;
  canGoBack: boolean;
}

export function QuestionCard({ question, progressLabel, onAnswer, onBack, canGoBack }: QuestionCardProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 min-h-[60vh] justify-center">
      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`font-mono text-sm underline ${!canGoBack ? 'opacity-0 pointer-events-none' : ''}`}
        >
          ← Retour
        </button>
        <span className="font-mono font-bold bg-signal-orange text-white px-2 py-1">
          {progressLabel}
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold mb-8 text-center">
        Que préférez-vous ?
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <button
          onClick={() => onAnswer('A')}
          className="raw-card hover:bg-zinc-50 transition-all active:scale-[0.98] text-left min-h-[200px] flex items-center justify-center p-8 group"
          data-testid="option-a"
        >
           <span className="text-lg md:text-xl font-medium group-hover:text-signal-orange transition-colors">
             {question.option_A}
           </span>
        </button>
        <button
          onClick={() => onAnswer('B')}
          className="raw-card hover:bg-zinc-50 transition-all active:scale-[0.98] text-left min-h-[200px] flex items-center justify-center p-8 group"
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
