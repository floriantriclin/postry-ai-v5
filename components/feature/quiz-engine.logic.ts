import { QuizQuestion, DimensionCode } from '@/lib/types';
import { ArchetypeResponse } from '@/lib/quiz-api-client';
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
  questionsP2: QuizQuestion[];
  answersP2: Record<string, 'A' | 'B'>;
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
  | { type: 'CONTINUE_TO_PHASE2' }
  | { type: 'ANSWER_PHASE2'; payload: { dimension: DimensionCode; choice: 'A' | 'B' } }
  | { type: 'PREVIOUS_PHASE2' }
  | { type: 'FINISH_LOADING' };

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
        archetypeData: action.payload 
      };

    case 'API_ARCHETYPE_ERROR':
      return { 
        ...state, 
        status: 'error', 
        error: action.payload.error, 
        step: 'TRANSITION_ARCHETYPE',
        archetypeData: action.payload.fallback 
      };

    case 'CONTINUE_TO_PHASE2':
      if (state.step !== 'TRANSITION_ARCHETYPE') return state;
      return { 
        ...state, 
        step: 'PHASE2', 
        questionIndex: 0, 
        answersP2: {} 
      };

    case 'ANSWER_PHASE2':
      if (state.step !== 'PHASE2') return state;
      const newAnswersP2 = { 
        ...state.answersP2, 
        [action.payload.dimension]: action.payload.choice 
      };
      // For now, P2 still uses mock length or we could handle it dynamically
      if (state.questionIndex < mockData.phase2.length - 1) {
        return { 
          ...state, 
          questionIndex: state.questionIndex + 1, 
          answersP2: newAnswersP2 
        };
      } else {
        return { 
          ...state, 
          step: 'LOADING_RESULTS', 
          answersP2: newAnswersP2 
        };
      }

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

    default:
      return state;
  }
}
