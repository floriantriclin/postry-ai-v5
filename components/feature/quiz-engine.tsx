'use client';

import { useReducer, useEffect } from 'react';
import { ThemeSelector } from './theme-selector';
import { QuizInterstitial } from './quiz-interstitial';
import { QuestionCard } from './question-card';
import { ArchetypeTransition } from './archetype-transition';
import { FinalReveal } from './final-reveal';
import { quizReducer, initialState } from './quiz-engine.logic';
import { quizApiClient } from '@/lib/quiz-api-client';
import { getTargetDimensions } from '@/lib/ice-logic';
import mockData from '@/lib/data/mock-quiz.json';
import { DimensionCode, Vstyle } from '@/lib/types';

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

  // 3. Pre-load Phase 2 Questions (AC 1.1)
  useEffect(() => {
    // We trigger this as soon as we have archetype data (during Transition screen)
    if (state.archetypeData && state.questionsP2.length === 0) {
      const loadP2 = async () => {
        dispatch({ type: 'API_LOAD_P2_START' });
        try {
          const targetDims = getTargetDimensions(state.archetypeData!.archetype.baseVector as Vstyle);
          
          const questions = await quizApiClient.generateQuestions({
            phase: 2,
            topic: state.themeId!,
            context: {
              archetypeName: state.archetypeData!.archetype.name,
              archetypeVector: [...state.archetypeData!.archetype.baseVector],
              targetDimensions: targetDims
            }
          });
          dispatch({ type: 'API_LOAD_P2_SUCCESS', payload: questions });
        } catch (error) {
          console.error('P2 Loading failed, falling back to mock.', error);
          dispatch({
            type: 'API_LOAD_P2_ERROR',
            payload: {
              error: error instanceof Error ? error.message : 'Unknown error',
              fallback: mockData.phase2 as any
            }
          });
        }
      };
      loadP2();
    }
  }, [state.archetypeData, state.questionsP2.length, state.themeId]);

  // 4. Generate Final Profile (AC 2.1)
  useEffect(() => {
    if (state.step === 'LOADING_RESULTS' && state.status !== 'loading' && state.currentVector && state.archetypeData) {
      const generateProfile = async () => {
        dispatch({ type: 'API_PROFILE_START' });
        try {
          const profile = await quizApiClient.generateProfile({
            baseArchetype: state.archetypeData!.archetype.name,
            finalVector: state.currentVector!
          });
          dispatch({ type: 'API_PROFILE_SUCCESS', payload: profile });
        } catch (error) {
          console.error('Profile generation failed, falling back to mock.', error);
          dispatch({
            type: 'API_PROFILE_ERROR',
            payload: {
              error: error instanceof Error ? error.message : 'Unknown error',
              fallback: mockData.augmentedProfile as any
            }
          });
        }
      };
      generateProfile();
    }
  }, [state.step, state.status, state.currentVector, state.archetypeData]);

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
        // AC 1.3: Handle latency if P2 questions aren't ready yet
        if (state.questionsP2.length === 0) {
           return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-black animate-spin rounded-full mb-4"></div>
              <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
                Préparation de l'affinage...
              </p>
            </div>
          );
        }

        const currentQuestionP2 = state.questionsP2[state.questionIndex];
        if (!currentQuestionP2) return null;

        return (
          <QuestionCard
            question={currentQuestionP2}
            progressLabel={`Précision: ${50 + (state.questionIndex * 10)}%`}
            onAnswer={(choice) => dispatch({
              type: 'ANSWER_PHASE2',
              payload: { dimension: currentQuestionP2.dimension as DimensionCode, choice }
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
        // We use state.profileData if available, otherwise fallback is handled in logic
        return <FinalReveal profile={state.profileData || mockData.augmentedProfile as any} />;
      
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
