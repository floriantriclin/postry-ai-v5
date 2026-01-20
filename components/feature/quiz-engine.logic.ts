import { QuizQuestion, DimensionCode, Vstyle } from '@/lib/types';
import { ArchetypeResponse, ProfileResponse } from '@/lib/quiz-api-client';
import { updateVector } from '@/lib/ice-logic';
import mockData from '@/lib/data/mock-quiz.json';

export type QuizStatus = 'idle' | 'loading' | 'success' | 'error';

export type QuizStep = 
  | 'THEMES' 
  | 'INSTRUCTIONS' 
  | 'PHASE1' 
  | 'TRANSITION_ARCHETYPE' 
  | 'PHASE2' 
  | 'LOADING_RESULTS' 
  | 'FINAL_REVEAL';

export interface QuizState {
  step: QuizStep;
  status: QuizStatus;
  themeId: string | null;
  questionsP1: QuizQuestion[];
  questionIndex: number;
  answersP1: Record<string, 'A' | 'B'>;
  archetypeData: ArchetypeResponse | null;
  
  // Phase 2 State
  questionsP2: QuizQuestion[];
  answersP2: Record<string, 'A' | 'B'>;
  currentVector: Vstyle | null;
  
  // Profile State
  profileData: ProfileResponse | null;
  
  error: string | null;
}

export type QuizAction =
  | { type: 'SELECT_THEME'; payload: string }
  | { type: 'START_QUIZ' }
  | { type: 'API_LOAD_P1_START' }
  | { type: 'API_LOAD_P1_SUCCESS'; payload: QuizQuestion[] }
  | { type: 'API_LOAD_P1_ERROR'; payload: { error: string; fallback: QuizQuestion[] } }
  | { type: 'ANSWER_PHASE1'; payload: { dimension: DimensionCode; choice: 'A' | 'B' } }
  | { type: 'PREVIOUS_PHASE1' }
  | { type: 'API_ARCHETYPE_START' }
  | { type: 'API_ARCHETYPE_SUCCESS'; payload: ArchetypeResponse }
  | { type: 'API_ARCHETYPE_ERROR'; payload: { error: string; fallback: ArchetypeResponse } }
  | { type: 'API_LOAD_P2_START' }
  | { type: 'API_LOAD_P2_SUCCESS'; payload: QuizQuestion[] }
  | { type: 'API_LOAD_P2_ERROR'; payload: { error: string; fallback: QuizQuestion[] } }
  | { type: 'CONTINUE_TO_PHASE2' }
  | { type: 'ANSWER_PHASE2'; payload: { dimension: DimensionCode; choice: 'A' | 'B' } }
  | { type: 'PREVIOUS_PHASE2' }
  | { type: 'API_PROFILE_START' }
  | { type: 'API_PROFILE_SUCCESS'; payload: ProfileResponse }
  | { type: 'API_PROFILE_ERROR'; payload: { error: string; fallback: ProfileResponse } }
  | { type: 'FINISH_LOADING' }
  | { type: 'HYDRATE'; payload: QuizState };

export const initialState: QuizState = {
  step: 'THEMES',
  status: 'idle',
  themeId: null,
  questionsP1: [],
  questionIndex: 0,
  answersP1: {},
  archetypeData: null,
  questionsP2: [],
  answersP2: {},
  currentVector: null,
  profileData: null,
  error: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_THEME':
      return { 
        ...initialState,
        step: 'INSTRUCTIONS', 
        themeId: action.payload 
      };
    
    case 'API_LOAD_P1_START':
      return { ...state, status: 'loading', error: null };

    case 'API_LOAD_P1_SUCCESS':
      return { ...state, status: 'success', questionsP1: action.payload };

    case 'API_LOAD_P1_ERROR':
      return { 
        ...state, 
        status: 'error', 
        error: action.payload.error, 
        questionsP1: action.payload.fallback 
      };

    case 'START_QUIZ':
      if (state.step !== 'INSTRUCTIONS') return state;
      return { 
        ...state, 
        step: 'PHASE1', 
        questionIndex: 0, 
        answersP1: {} 
      };

    case 'ANSWER_PHASE1':
      if (state.step !== 'PHASE1') return state;
      const newAnswersP1 = { 
        ...state.answersP1, 
        [action.payload.dimension]: action.payload.choice 
      };
      
      if (state.questionIndex < state.questionsP1.length - 1) {
        return { 
          ...state, 
          questionIndex: state.questionIndex + 1, 
          answersP1: newAnswersP1 
        };
      } else {
        // Last question answered, but we need to call API before transition
        // The component will handle the API call based on status or another action
        return { 
          ...state, 
          answersP1: newAnswersP1 
        };
      }

    case 'PREVIOUS_PHASE1':
      if (state.step !== 'PHASE1') return state;
      if (state.questionIndex > 0) {
        const prevQuestion = state.questionsP1[state.questionIndex - 1];
        const updatedAnswersP1 = { ...state.answersP1 };
        delete updatedAnswersP1[prevQuestion.dimension];
        
        return { 
          ...state, 
          questionIndex: state.questionIndex - 1, 
          answersP1: updatedAnswersP1 
        };
      }
      return { ...state, step: 'INSTRUCTIONS' };

    case 'API_ARCHETYPE_START':
      return { ...state, status: 'loading', error: null };

    case 'API_ARCHETYPE_SUCCESS':
      return {
        ...state,
        status: 'success',
        step: 'TRANSITION_ARCHETYPE',
        archetypeData: action.payload,
        // Initialize currentVector with the base vector of the archetype
        currentVector: action.payload.archetype.baseVector as Vstyle
      };

    case 'API_ARCHETYPE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        step: 'TRANSITION_ARCHETYPE',
        archetypeData: action.payload.fallback,
        currentVector: action.payload.fallback.archetype.baseVector as Vstyle
      };

    case 'API_LOAD_P2_START':
      // Background loading, don't change main status to loading if we are in transition
      // We might want to track a separate loading state for P2 questions if needed
      return { ...state };

    case 'API_LOAD_P2_SUCCESS':
      return { ...state, questionsP2: action.payload };

    case 'API_LOAD_P2_ERROR':
      return {
        ...state,
        // We log error but don't stop the flow yet, fallback is used
        questionsP2: action.payload.fallback
      };

    case 'CONTINUE_TO_PHASE2':
      if (state.step !== 'TRANSITION_ARCHETYPE') return state;
      
      // If P2 questions are not loaded yet, we might have an issue
      // But typically prefetch should be done or we show loader in UI
      return {
        ...state,
        step: 'PHASE2',
        questionIndex: 0,
        answersP2: {}
      };

    case 'ANSWER_PHASE2':
      if (state.step !== 'PHASE2' || !state.currentVector) return state;
      
      const newAnswersP2 = {
        ...state.answersP2,
        [action.payload.dimension]: action.payload.choice
      };

      // Calculate new vector locally (Zero Latence)
      const updatedVector = updateVector(
        state.currentVector,
        action.payload.dimension,
        action.payload.choice
      );

      if (state.questionIndex < state.questionsP2.length - 1) {
        return {
          ...state,
          questionIndex: state.questionIndex + 1,
          answersP2: newAnswersP2,
          currentVector: updatedVector
        };
      } else {
        return {
          ...state,
          step: 'LOADING_RESULTS',
          answersP2: newAnswersP2,
          currentVector: updatedVector
        };
      }

    case 'API_PROFILE_START':
      return { ...state, status: 'loading', error: null };

    case 'API_PROFILE_SUCCESS':
      return {
        ...state,
        status: 'success',
        step: 'FINAL_REVEAL',
        profileData: action.payload
      };

    case 'API_PROFILE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        step: 'FINAL_REVEAL', // Show reveal with fallback
        profileData: action.payload.fallback
      };

    case 'PREVIOUS_PHASE2':
      if (state.step !== 'PHASE2') return state;
      if (state.questionIndex > 0) {
        return { 
          ...state, 
          questionIndex: state.questionIndex - 1,
          // We don't easily know which dimension was removed without questionsP2
          // This part will need refinement when Phase 2 API is integrated
        };
      }
      return { ...state, step: 'TRANSITION_ARCHETYPE' };

    case 'FINISH_LOADING':
      if (state.step !== 'LOADING_RESULTS') return state;
      return { ...state, step: 'FINAL_REVEAL' };

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}
