import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './auth-modal';
import * as authLib from '@/lib/auth';

// Mock auth library
vi.mock('@/lib/auth', () => ({
  signInWithOtp: vi.fn(),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.history
const mockPushState = vi.fn();
Object.defineProperty(window, 'history', {
  value: { pushState: mockPushState },
  writable: true,
});

describe('AuthModal - Story 2.11b Persist-First Architecture', () => {
  const mockPostData = {
    theme: 'Test Theme',
    content: 'Hook\n\nBody content\n\nCTA',
    quiz_answers: {
      acquisition_theme: 'theme-1',
      p1: { q1: 'a1' },
      p2: { q2: 'a2' },
    },
    equalizer_settings: {
      vector: [0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0.8, 0.6],
      profile: { label_final: 'Le Pragmatique' },
      archetype: 'Le Pragmatique',
      components: {
        hook: 'Test Hook',
        content_body: 'Test Body',
        cta: 'Test CTA',
        style_analysis: 'Test Analysis',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockPushState.mockClear();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST;
  });

  describe('Feature Flag OFF (Old Flow)', () => {
    it('should call signInWithOtp directly without persist API', async () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'false';
      vi.mocked(authLib.signInWithOtp).mockResolvedValue({ success: true });

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authLib.signInWithOtp).toHaveBeenCalledWith('test@example.com');
      });

      // Should NOT call persist API
      expect(mockFetch).not.toHaveBeenCalledWith(
        '/api/posts/anonymous',
        expect.any(Object)
      );

      // Should NOT clear localStorage
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Feature Flag ON (New Persist-First Flow)', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
    });

    it('should call /api/posts/anonymous BEFORE signInWithOtp', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ postId: 'test-post-id-123' }),
      });
      vi.mocked(authLib.signInWithOtp).mockResolvedValue({ success: true });

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      // Wait for persist API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/posts/anonymous',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockPostData),
          })
        );
      });

      // Then signInWithOtp should be called with postId in URL
      await waitFor(() => {
        expect(authLib.signInWithOtp).toHaveBeenCalledWith(
          'test@example.com',
          '/auth/confirm?postId=test-post-id-123'
        );
      });
    });

    it('should clear localStorage IMMEDIATELY after 200 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ postId: 'test-post-id-456' }),
      });
      vi.mocked(authLib.signInWithOtp).mockResolvedValue({ success: true });

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'clear@test.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ice_quiz_state_v1');
      });

      // Verify localStorage.removeItem was called BEFORE magic link success
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should handle 429 rate limit error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'ratelimit@test.com' } });
      fireEvent.click(submitButton);

      // Should show user-friendly rate limit message
      await waitFor(() => {
        expect(screen.getByText(/limite atteinte/i)).toBeInTheDocument();
      });

      // Should NOT call signInWithOtp
      expect(authLib.signInWithOtp).not.toHaveBeenCalled();

      // Should NOT clear localStorage (persist failed)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should show "Sauvegarde en cours..." during persist', async () => {
      let resolvePersist: any;
      const persistPromise = new Promise((resolve) => {
        resolvePersist = resolve;
      });

      mockFetch.mockReturnValueOnce(
        persistPromise.then(() => ({
          ok: true,
          json: async () => ({ postId: 'test-id' }),
        }))
      );

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'loading@test.com' } });
      fireEvent.click(submitButton);

      // Should show "Sauvegarde en cours..." immediately
      await waitFor(() => {
        expect(screen.getByText(/sauvegarde en cours/i)).toBeInTheDocument();
      });

      // Resolve persist
      resolvePersist();
      await waitFor(() => {
        expect(screen.queryByText(/sauvegarde en cours/i)).not.toBeInTheDocument();
      });
    });

    it('should handle persist error and show retry message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'error@test.com' } });
      fireEvent.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/erreur lors de la sauvegarde/i)).toBeInTheDocument();
      });

      // Should NOT clear localStorage (persist failed)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();

      // Should NOT call signInWithOtp (persist failed)
      expect(authLib.signInWithOtp).not.toHaveBeenCalled();
    });

    it('should validate email before persist', async () => {
      render(<AuthModal postData={mockPostData} />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/adresse email invalide/i)).toBeInTheDocument();
      });

      // Should NOT call persist API
      expect(mockFetch).not.toHaveBeenCalled();

      // Should NOT call signInWithOtp
      expect(authLib.signInWithOtp).not.toHaveBeenCalled();
    });
  });

  describe('Without postData (Fallback)', () => {
    it('should use old flow even with feature flag ON', async () => {
      process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST = 'true';
      vi.mocked(authLib.signInWithOtp).mockResolvedValue({ success: true });

      // Render without postData
      render(<AuthModal />);

      const emailInput = screen.getByPlaceholderText('moi@exemple.com');
      const submitButton = screen.getByRole('button', { name: /envoyez-moi un lien/i });

      fireEvent.change(emailInput, { target: { value: 'fallback@test.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authLib.signInWithOtp).toHaveBeenCalledWith('fallback@test.com');
      });

      // Should NOT call persist API (no postData)
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
