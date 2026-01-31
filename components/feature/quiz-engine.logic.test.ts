import { quizReducer, initialState, type QuizState } from './quiz-engine.logic';
import mockData from '@/lib/data/mock-quiz.json';

describe('Quiz Engine Logic (Reducer)', () => {
  it('should start in THEMES step with idle status', () => {
    expect(initialState.step).toBe('THEMES');
    expect(initialState.status).toBe('idle');
  });

  it('should transition to INSTRUCTIONS when a theme is selected', () => {
    const newState = quizReducer(initialState, { type: 'SELECT_THEME', payload: 'copywriting' });
    expect(newState.step).toBe('INSTRUCTIONS');
    expect(newState.themeId).toBe('copywriting');
  });

  it('should handle API_LOAD_P1_START', () => {
    const newState = quizReducer(initialState, { type: 'API_LOAD_P1_START' });
    expect(newState.status).toBe('loading');
    expect(newState.error).toBeNull();
  });

  it('should handle API_LOAD_P1_SUCCESS', () => {
    const questions = mockData.phase1 as any;
    const state = quizReducer(initialState, { type: 'API_LOAD_P1_START' });
    const newState = quizReducer(state, { type: 'API_LOAD_P1_SUCCESS', payload: questions });
    
    expect(newState.status).toBe('success');
    expect(newState.questionsP1).toEqual(questions);
  });

  it('should handle API_LOAD_P1_ERROR with fallback', () => {
    const fallback = mockData.phase1 as any;
    const newState = quizReducer(initialState, { type: 'API_LOAD_P1_ERROR', payload: { error: 'Timeout', fallback } });
    
    expect(newState.status).toBe('error');
    expect(newState.error).toBe('Timeout');
    expect(newState.questionsP1).toEqual(fallback);
  });

  it('should transition to PHASE1 when START_QUIZ is dispatched', () => {
    const startState: QuizState = { ...initialState, step: 'INSTRUCTIONS', themeId: 't1', questionsP1: mockData.phase1 as any };
    const newState = quizReducer(startState, { type: 'START_QUIZ' });
    
    expect(newState.step).toBe('PHASE1');
    expect(newState.questionIndex).toBe(0);
    expect(newState.answersP1).toEqual({});
  });

  it('should increment question index in PHASE1', () => {
    const state: QuizState = { 
      ...initialState, 
      step: 'PHASE1', 
      questionsP1: mockData.phase1 as any, 
      questionIndex: 0 
    };
    const newState = quizReducer(state, { 
      type: 'ANSWER_PHASE1', 
      payload: { dimension: 'POS', choice: 'A' } 
    });
    
    expect(newState.questionIndex).toBe(1);
    expect(newState.answersP1).toEqual({ POS: 'A' });
  });

  it('should handle API_ARCHETYPE_START', () => {
    const newState = quizReducer(initialState, { type: 'API_ARCHETYPE_START' });
    expect(newState.status).toBe('loading');
  });

  it('should transition to TRANSITION_ARCHETYPE on API_ARCHETYPE_SUCCESS', () => {
    const archetypeData = { 
      archetype: mockData.archetype as any, 
      targetDimensions: ['STR', 'INF', 'ANC'] as any 
    };
    const newState = quizReducer(initialState, { type: 'API_ARCHETYPE_SUCCESS', payload: archetypeData });
    
    expect(newState.step).toBe('TRANSITION_ARCHETYPE');
    expect(newState.archetypeData).toEqual(archetypeData);
    expect(newState.status).toBe('success');
  });

  it('should handle PREVIOUS_PHASE1 and remove last answer', () => {
     const state: QuizState = {
       ...initialState,
       step: 'PHASE1',
       questionsP1: mockData.phase1 as any,
       questionIndex: 1,
       answersP1: { POS: 'A' }
     };
     const newState = quizReducer(state, { type: 'PREVIOUS_PHASE1' });

     expect(newState.questionIndex).toBe(0);
     expect(newState.answersP1).toEqual({});
  });

  it('should handle API_ARCHETYPE_ERROR with fallback (mock-only / no API key)', () => {
    const fallback = {
      archetype: mockData.archetype as any,
      targetDimensions: ['STR', 'INF', 'ANC'] as any,
    };
    const state = quizReducer(initialState, { type: 'API_ARCHETYPE_START' });
    const newState = quizReducer(state, { type: 'API_ARCHETYPE_ERROR', payload: { error: 'Mock-only mode (no API key)', fallback } });

    expect(newState.status).toBe('error');
    expect(newState.step).toBe('TRANSITION_ARCHETYPE');
    expect(newState.archetypeData).toEqual(fallback);
  });

  it('should handle API_LOAD_P2_ERROR with fallback (mock-only / no API key)', () => {
    const fallback = mockData.phase2 as any;
    const newState = quizReducer(initialState, { type: 'API_LOAD_P2_ERROR', payload: { error: 'Mock-only mode (no API key)', fallback } });

    expect(newState.questionsP2).toEqual(fallback);
  });

  it('should handle API_PROFILE_ERROR with fallback (mock-only / no API key)', () => {
    const fallback = mockData.augmentedProfile as any;
    const state = quizReducer(initialState, { type: 'API_PROFILE_START' });
    const newState = quizReducer(state, { type: 'API_PROFILE_ERROR', payload: { error: 'Mock-only mode (no API key)', fallback } });

    expect(newState.status).toBe('error');
    expect(newState.step).toBe('FINAL_REVEAL');
    expect(newState.profileData).toEqual(fallback);
  });
});
