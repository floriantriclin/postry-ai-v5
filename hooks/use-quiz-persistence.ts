'use client';

import { useEffect, useState, useCallback } from 'react';
import { QuizState } from '@/components/feature/quiz-engine.logic';

const STORAGE_KEY = 'ice_quiz_state_v1';

export function useQuizPersistence() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [persistedState, setPersistedState] = useState<QuizState | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: QuizState = JSON.parse(stored);
        
        if (parsed && parsed.step) {
          // Reset loading status
          if (parsed.status === 'loading') {
            parsed.status = 'idle';
          }
          setPersistedState(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load quiz state', e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const saveState = useCallback((state: QuizState) => {
    if (!isHydrated) return;

    // Don't save empty state (just started)
    if (state.step === 'THEMES' && !state.themeId) {
       localStorage.removeItem(STORAGE_KEY);
       return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save quiz state', e);
    }
  }, [isHydrated]);

  return { isHydrated, persistedState, saveState };
}
