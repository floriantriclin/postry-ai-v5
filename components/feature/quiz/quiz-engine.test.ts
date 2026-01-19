import { quizReducer, initialState } from './quiz-engine';

describe('Quiz Reducer State Machine', () => {
  it('should start in THEMES state', () => {
    expect(initialState.step).toBe('THEMES');
  });

  it('should transition to INSTRUCTIONS when a theme is selected', () => {
    const newState = quizReducer(initialState, { type: 'SELECT_THEME', payload: 't1' });
    expect(newState).toEqual({ step: 'INSTRUCTIONS', themeId: 't1' });
  });

  it('should start PHASE1 when START_QUIZ is dispatched', () => {
    // @ts-ignore - Mocking state for test
    const startState = { step: 'INSTRUCTIONS', themeId: 't1' };
    const newState = quizReducer(startState as any, { type: 'START_QUIZ' });
    expect(newState).toEqual({ step: 'PHASE1', themeId: 't1', questionIndex: 0, answers: [] });
  });

  it('should increment question index in PHASE1', () => {
    // @ts-ignore
    const state = { step: 'PHASE1', themeId: 't1', questionIndex: 0, answers: [] };
    const newState = quizReducer(state as any, { type: 'ANSWER_PHASE1', payload: 'A' });
    // @ts-ignore
    expect(newState.questionIndex).toBe(1);
    // @ts-ignore
    expect(newState.answers).toEqual(['A']);
  });

  it('should transition to TRANSITION_ARCHETYPE after last question of PHASE1', () => {
    // @ts-ignore
    const state = { step: 'PHASE1', themeId: 't1', questionIndex: 5, answers: ['A','A','A','A','A'] };
    const newState = quizReducer(state as any, { type: 'ANSWER_PHASE1', payload: 'B' });
    expect(newState.step).toBe('TRANSITION_ARCHETYPE');
    // @ts-ignore
    expect(newState.answersP1).toHaveLength(6);
  });

  it('should handle PREVIOUS_PHASE1 correctly', () => {
     // @ts-ignore
     const state = { step: 'PHASE1', themeId: 't1', questionIndex: 1, answers: ['A'] };
     const newState = quizReducer(state as any, { type: 'PREVIOUS_PHASE1' });
     // @ts-ignore
     expect(newState.questionIndex).toBe(0);
     // @ts-ignore
     expect(newState.answers).toEqual([]);
  });
});
