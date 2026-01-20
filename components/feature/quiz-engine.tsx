'use client';

import { useReducer, useEffect } from 'react';
import { ThemeSelector } from './theme-selector';
import { QuizInterstitial } from './quiz-interstitial';
import { QuestionCard } from './question-card';
import { ArchetypeTransition } from './archetype-transition';
import { FinalReveal } from './final-reveal';
import { quizReducer, initialState } from './quiz-engine.logic';
import { quizApiClient } from '@/lib/quiz-api-client';
import mockData from '@/lib/data/mock-quiz.json';
import { DimensionCode } from '@/lib/types';

export function QuizEngine() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // 1. Pre-load Phase 1 questions (Early Trigger)
  useEffect(() => {
    if (state.step === 'INSTRUCTIONS' && state.themeId && state.questionsP1.length === 0 && state.status !== 'loading') {
      const loadP1 = async () => {
        dispatch({ type: 'API_LOAD_P1_START' });
        try {
          const questions = await quizApiClient.generateQuestions({ 
            phase: 1, 
            topic: state.themeId! 
          });
          dispatch({ type: 'API_LOAD_P1_SUCCESS', payload: questions });
        } catch (error) {
          console.error('P1 Loading failed, falling back to mock.', error);
          dispatch({ 
            type: 'API_LOAD_P1_ERROR', 
            payload: { 
              error: error instanceof Error ? error.message : 'Unknown error', 
              fallback: mockData.phase1 as any 
            } 
          });
        }
      };
      loadP1();
    }
  }, [state.step, state.themeId, state.questionsP1.length, state.status]);

  // 2. Identify Archetype after Phase 1 completion
  useEffect(() => {
    const isP1Complete = state.questionsP1.length > 0 && 
                        Object.keys(state.answersP1).length === state.questionsP1.length;
    
    if (state.step === 'PHASE1' && isP1Complete && state.status !== 'loading' && !state.archetypeData) {
      const identify = async () => {
        dispatch({ type: 'API_ARCHETYPE_START' });
        try {
          const result = await quizApiClient.identifyArchetype({ 
            answers: state.answersP1 
          });
          dispatch({ type: 'API_ARCHETYPE_SUCCESS', payload: result });
        } catch (error) {
          console.error('Archetype identification failed, falling back to mock.', error);
          dispatch({ 
            type: 'API_ARCHETYPE_ERROR', 
            payload: { 
              error: error instanceof Error ? error.message : 'Unknown error', 
              fallback: { 
                archetype: mockData.archetype as any, 
                targetDimensions: ['STR', 'INF', 'ANC'] 
              } 
            } 
          });
        }
      };
      identify();
    }
  }, [state.step, state.answersP1, state.questionsP1.length, state.status, state.archetypeData]);

  // 3. Simulate Phase 2 Loading (Temporary until story 1.8.2)
  useEffect(() => {
    if (state.step === 'LOADING_RESULTS') {
      const timer = setTimeout(() => {
        dispatch({ type: 'FINISH_LOADING' });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.step]);

  const renderStep = () => {
    switch (state.step) {
      case 'THEMES':
        return <ThemeSelector onSelect={(id) => dispatch({ type: 'SELECT_THEME', payload: id })} />;
      
      case 'INSTRUCTIONS':
        return (
          <QuizInterstitial 
            onStart={() => dispatch({ type: 'START_QUIZ' })} 
            isLoading={state.status === 'loading'}
          />
        );
      
      case 'PHASE1':
        if (state.status === 'loading') {
          return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-black animate-spin rounded-full mb-4"></div>
              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
                {state.questionsP1.length === 0 ? "Initialisation du calibrage..." : "Analyse de votre archétype..."}
              </p>
            </div>
          );
        }

        const currentQuestion = state.questionsP1[state.questionIndex];
        if (!currentQuestion) return null;

        return (
          <QuestionCard
            question={currentQuestion}
            progressLabel={`${state.questionIndex + 1}/${state.questionsP1.length}`}
            onAnswer={(choice) => dispatch({ 
              type: 'ANSWER_PHASE1', 
              payload: { dimension: currentQuestion.dimension as DimensionCode, choice } 
            })}
            onBack={() => dispatch({ type: 'PREVIOUS_PHASE1' })}
            canGoBack={true}
          />
        );
      
      case 'TRANSITION_ARCHETYPE':
        if (!state.archetypeData) return null;
        return (
          <ArchetypeTransition
            archetype={state.archetypeData.archetype}
            onContinue={() => dispatch({ type: 'CONTINUE_TO_PHASE2' })}
          />
        );
      
      case 'PHASE2':
        // Note: For Phase 1 story, Phase 2 still uses mock data for questions
        // but it will be updated in story 1.8.2
        return (
          <QuestionCard
            question={mockData.phase2[state.questionIndex]}
            progressLabel={`Précision: ${50 + (state.questionIndex * 10)}%`}
            onAnswer={(choice) => dispatch({ 
              type: 'ANSWER_PHASE2', 
              payload: { dimension: mockData.phase2[state.questionIndex].dimension as DimensionCode, choice } 
            })}
            onBack={() => dispatch({ type: 'PREVIOUS_PHASE2' })}
            canGoBack={true}
          />
        );
      
      case 'LOADING_RESULTS':
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-16 h-16 border-4 border-black border-t-signal-orange animate-spin rounded-full mb-8"></div>
            <h2 className="text-2xl font-black uppercase">Génération de votre identité...</h2>
            <p className="font-mono text-zinc-500 mt-2">Calibration des 9 dimensions</p>
          </div>
        );
      
      case 'FINAL_REVEAL':
        return <FinalReveal profile={mockData.augmentedProfile as any} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
      
      {/* Debug Error Toast (Simple implementation) */}
      {state.error && state.status === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-lg z-50">
          <p className="font-bold">API Notice</p>
          <p className="text-sm">Mode dégradé activé : {state.error}</p>
        </div>
      )}
    </div>
  );
}
