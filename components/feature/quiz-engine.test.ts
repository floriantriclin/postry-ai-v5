import { quizReducer, initialState, type QuizState } from './quiz-engine';

describe('Quiz Reducer State Machine', () => {
  it('should start in THEMES state', () => {
    expect(initialState.step).toBe('THEMES');
  });

  it('should transition to INSTRUCTIONS when a theme is selected', () => {
    const newState = quizReducer(initialState, { type: 'SELECT_THEME', payload: 't1' });
    expect(newState).toEqual({ step: 'INSTRUCTIONS', themeId: 't1' });
  });

  it('should start PHASE1 when START_QUIZ is dispatched', () => {
    const startState: QuizState = { step: 'INSTRUCTIONS', themeId: 't1' };
    const newState = quizReducer(startState, { type: 'START_QUIZ' });
    expect(newState).toEqual({ step: 'PHASE1', themeId: 't1', questionIndex: 0, answers: [] });
  });

  it('should increment question index in PHASE1', () => {
    const state: QuizState = { step: 'PHASE1', themeId: 't1', questionIndex: 0, answers: [] };
    const newState = quizReducer(state, { type: 'ANSWER_PHASE1', payload: 'A' });
    
    if (newState.step === 'PHASE1') {
      expect(newState.questionIndex).toBe(1);
      expect(newState.answers).toEqual(['A']);
    } else {
      throw new Error('State should be PHASE1');
    }
  });

  it('should transition to TRANSITION_ARCHETYPE after last question of PHASE1', () => {
    const state: QuizState = { step: 'PHASE1', themeId: 't1', questionIndex: 5, answers: ['A','A','A','A','A'] };
    const newState = quizReducer(state, { type: 'ANSWER_PHASE1', payload: 'B' });
    expect(newState.step).toBe('TRANSITION_ARCHETYPE');
    
    if (newState.step === 'TRANSITION_ARCHETYPE') {
      expect(newState.answersP1).toHaveLength(6);
    }
  });

  it('should handle PREVIOUS_PHASE1 correctly', () => {
     const state: QuizState = { step: 'PHASE1', themeId: 't1', questionIndex: 1, answers: ['A'] };
     const newState = quizReducer(state, { type: 'PREVIOUS_PHASE1' });
     
     if (newState.step === 'PHASE1') {
       expect(newState.questionIndex).toBe(0);
       expect(newState.answers).toEqual([]);
     } else {
       throw new Error('State should be PHASE1');
     }
  });
});
