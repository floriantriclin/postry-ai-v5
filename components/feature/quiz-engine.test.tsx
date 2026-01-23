import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QuizEngine } from './quiz-engine';
import { quizApiClient } from '@/lib/quiz-api-client';
import mockData from '@/lib/data/mock-quiz.json';

// Mock the API client
vi.mock('@/lib/quiz-api-client', () => ({
  quizApiClient: {
    generateQuestions: vi.fn(),
    identifyArchetype: vi.fn(),
  },
}));

// Mock child components to simplify testing orchestration logic
vi.mock('./theme-selector', () => ({
  ThemeSelector: ({ onSelect }: any) => <button onClick={() => onSelect('t1')}>Select Theme</button>,
}));

vi.mock('./quiz-interstitial', () => ({
  QuizInterstitial: ({ onStart, isLoading }: any) => (
    <div>
      {isLoading ? 'Loading...' : <button onClick={onStart} data-testid="start-btn">Start</button>}
    </div>
  ),
}));

vi.mock('./question-card', () => ({
  QuestionCard: ({ onAnswer, progressValue }: any) => (
    <div>
      <span data-testid="progress-val">{progressValue}</span>
      <button onClick={() => onAnswer('A')} data-testid="answer-a">Answer A</button>
    </div>
  ),
}));

describe('QuizEngine Integration (Orchestration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('1.8.1-INT-001: should call /generate when entering INSTRUCTIONS step', async () => {
    (quizApiClient.generateQuestions as any).mockResolvedValue(mockData.phase1);
    
    render(<QuizEngine />);
    
    // Select theme
    fireEvent.click(screen.getByText('Select Theme'));
    
    // Should call API
    await waitFor(() => {
      expect(quizApiClient.generateQuestions).toHaveBeenCalledWith({
        phase: 1,
        topic: 't1',
      });
    });
  });

  it('1.8.1-INT-002: should call /archetype after 6th question', async () => {
    (quizApiClient.generateQuestions as any).mockResolvedValue(mockData.phase1);
    (quizApiClient.identifyArchetype as any).mockResolvedValue({
      archetype: mockData.archetype,
      targetDimensions: ['STR', 'INF', 'ANC'],
    });

    render(<QuizEngine />);
    
    // Go to Phase 1
    fireEvent.click(screen.getByText('Select Theme'));
    await waitFor(() => expect(screen.getByTestId('start-btn')).toBeTruthy());
    fireEvent.click(screen.getByTestId('start-btn'));

    // Answer 6 questions
    for (let i = 0; i < 6; i++) {
      const expectedProgress = ((i + 1) / 6) * 100;
      expect(screen.getByTestId('progress-val').textContent).toBe(expectedProgress.toString());
      fireEvent.click(screen.getByTestId('answer-a'));
    }

    // Should call identifyArchetype
    await waitFor(() => {
      expect(quizApiClient.identifyArchetype).toHaveBeenCalled();
    });
  });

  it('1.8.1-INT-003: should fallback to mock-quiz.json on API error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (quizApiClient.generateQuestions as any).mockRejectedValue(new Error('API Down'));
    
    render(<QuizEngine />);
    
    fireEvent.click(screen.getByText('Select Theme'));
    
    await waitFor(() => {
      expect(quizApiClient.generateQuestions).toHaveBeenCalled();
    });

    // Check if we can still start the quiz (fallback succeeded)
    await waitFor(() => {
      expect(screen.getByTestId('start-btn')).toBeTruthy();
    });
    
    // Error notification should be visible
    expect(screen.getByText(/MODE DEGRADE ACTIVE/i)).toBeTruthy();
    
    consoleSpy.mockRestore();
  });
});
