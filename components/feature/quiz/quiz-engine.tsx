'use client';

import { useReducer, useEffect } from 'react';
import { ThemeSelector } from './theme-selector';
import { QuizInterstitial } from './quiz-interstitial';
import { QuestionCard } from './question-card';
import { ArchetypeTransition } from './archetype-transition';
import { FinalReveal } from './final-reveal';
import mockData from '@/lib/data/mock-quiz.json';

// --- State Machine Types ---

type QuizState = 
  | { step: 'THEMES' }
  | { step: 'INSTRUCTIONS'; themeId: string }
  | { step: 'PHASE1'; themeId: string; questionIndex: number; answers: string[] }
  | { step: 'TRANSITION_ARCHETYPE'; themeId: string; answersP1: string[] }
  | { step: 'PHASE2'; themeId: string; answersP1: string[]; questionIndex: number; answersP2: string[] }
  | { step: 'LOADING'; themeId: string; answersP1: string[]; answersP2: string[] }
  | { step: 'FINAL_REVEAL'; themeId: string; answersP1: string[]; answersP2: string[] };

type QuizAction =
  | { type: 'SELECT_THEME'; payload: string }
  | { type: 'START_QUIZ' }
  | { type: 'ANSWER_PHASE1'; payload: 'A' | 'B' }
  | { type: 'PREVIOUS_PHASE1' }
  | { type: 'CONTINUE_TO_PHASE2' }
  | { type: 'ANSWER_PHASE2'; payload: 'A' | 'B' }
  | { type: 'PREVIOUS_PHASE2' }
  | { type: 'FINISH_LOADING' };

export const initialState: QuizState = { step: 'THEMES' };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_THEME':
      return { step: 'INSTRUCTIONS', themeId: action.payload };
    
    case 'START_QUIZ':
      if (state.step !== 'INSTRUCTIONS') return state;
      return { step: 'PHASE1', themeId: state.themeId, questionIndex: 0, answers: [] };

    case 'ANSWER_PHASE1':
      if (state.step !== 'PHASE1') return state;
      const newAnswersP1 = [...state.answers, action.payload];
      if (state.questionIndex < mockData.phase1.length - 1) {
        return { ...state, questionIndex: state.questionIndex + 1, answers: newAnswersP1 };
      } else {
        return { step: 'TRANSITION_ARCHETYPE', themeId: state.themeId, answersP1: newAnswersP1 };
      }

    case 'PREVIOUS_PHASE1':
      if (state.step !== 'PHASE1') return state;
      if (state.questionIndex > 0) {
        return { ...state, questionIndex: state.questionIndex - 1, answers: state.answers.slice(0, -1) };
      }
      return { step: 'INSTRUCTIONS', themeId: state.themeId }; 

    case 'CONTINUE_TO_PHASE2':
      if (state.step !== 'TRANSITION_ARCHETYPE') return state;
      return { step: 'PHASE2', themeId: state.themeId, answersP1: state.answersP1, questionIndex: 0, answersP2: [] };

    case 'ANSWER_PHASE2':
       if (state.step !== 'PHASE2') return state;
       const newAnswersP2 = [...state.answersP2, action.payload];
       if (state.questionIndex < mockData.phase2.length - 1) {
         return { ...state, questionIndex: state.questionIndex + 1, answersP2: newAnswersP2 };
       } else {
         return { step: 'LOADING', themeId: state.themeId, answersP1: state.answersP1, answersP2: newAnswersP2 };
       }

    case 'PREVIOUS_PHASE2':
      if (state.step !== 'PHASE2') return state;
      if (state.questionIndex > 0) {
        return { ...state, questionIndex: state.questionIndex - 1, answersP2: state.answersP2.slice(0, -1) };
      }
      return { step: 'TRANSITION_ARCHETYPE', themeId: state.themeId, answersP1: state.answersP1 };

    case 'FINISH_LOADING':
      if (state.step !== 'LOADING') return state;
      return { step: 'FINAL_REVEAL', themeId: state.themeId, answersP1: state.answersP1, answersP2: state.answersP2 };

    default:
      return state;
  }
}

export function QuizEngine() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Simulate loading
  useEffect(() => {
    if (state.step === 'LOADING') {
      const timer = setTimeout(() => {
        dispatch({ type: 'FINISH_LOADING' });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.step]);

  return (
    <div className="w-full">
      {state.step === 'THEMES' && (
        <ThemeSelector onSelect={(id) => dispatch({ type: 'SELECT_THEME', payload: id })} />
      )}

      {state.step === 'INSTRUCTIONS' && (
        <QuizInterstitial onStart={() => dispatch({ type: 'START_QUIZ' })} />
      )}

      {state.step === 'PHASE1' && (
        <QuestionCard 
          question={mockData.phase1[state.questionIndex]}
          progressLabel={`${state.questionIndex + 1}/${mockData.phase1.length}`}
          onAnswer={(choice) => dispatch({ type: 'ANSWER_PHASE1', payload: choice })}
          onBack={() => dispatch({ type: 'PREVIOUS_PHASE1' })}
          canGoBack={true}
        />
      )}

      {state.step === 'TRANSITION_ARCHETYPE' && (
        <ArchetypeTransition 
          archetype={mockData.archetype}
          onContinue={() => dispatch({ type: 'CONTINUE_TO_PHASE2' })}
        />
      )}

      {state.step === 'PHASE2' && (
        <QuestionCard 
           question={mockData.phase2[state.questionIndex]}
           progressLabel={`Précision: ${50 + (state.questionIndex * 10)}%`} 
           onAnswer={(choice) => dispatch({ type: 'ANSWER_PHASE2', payload: choice })}
           onBack={() => dispatch({ type: 'PREVIOUS_PHASE2' })}
           canGoBack={true}
        />
      )}

      {state.step === 'LOADING' && (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-16 h-16 border-4 border-black border-t-signal-orange animate-spin rounded-full mb-8"></div>
          <h2 className="text-2xl font-black uppercase">Génération de votre identité...</h2>
          <p className="font-mono text-zinc-500 mt-2">Calibration des 9 dimensions</p>
        </div>
      )}

      {state.step === 'FINAL_REVEAL' && (
        <FinalReveal profile={mockData.augmentedProfile} />
      )}
    </div>
  );
}
