/// <reference types="vitest/globals" />
import {
  sendAlert,
  alertDatabaseError,
  alertAuthFailure,
  alertValidationError,
  alertUnhandledException,
  clearAlertStore,
  stopAlertCleanup,
  getAlertStats,
  AlertType,
  AlertSeverity
} from './alerting';

describe('alerting', () => {
  beforeEach(() => {
    clearAlertStore();
    vi.useFakeTimers();
    // Spy on console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    clearAlertStore();
    stopAlertCleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('sendAlert', () => {
    it('should send alert and return true on first call', () => {
      const result = sendAlert(AlertType.DATABASE_ERROR, 'Test error');

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });

    it('should log error messages with console.error', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Database connection failed', {
        severity: AlertSeverity.ERROR
      });

      expect(console.error).toHaveBeenCalled();
      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('Database connection failed');
      expect(errorCall).toContain('[ERROR]');
      expect(errorCall).toContain('[database_error]');
    });

    it('should log warning messages with console.warn', () => {
      sendAlert(AlertType.AUTH_FAILURE, 'Invalid credentials', {
        severity: AlertSeverity.WARNING
      });

      expect(console.warn).toHaveBeenCalled();
      const warnCall = (console.warn as any).mock.calls[0][0];
      expect(warnCall).toContain('Invalid credentials');
      expect(warnCall).toContain('[WARNING]');
    });

    it('should log info messages with console.log', () => {
      sendAlert(AlertType.API_ERROR, 'API call succeeded', {
        severity: AlertSeverity.INFO
      });

      expect(console.log).toHaveBeenCalled();
    });

    it('should include error details in log', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      sendAlert(AlertType.UNHANDLED_EXCEPTION, 'Exception occurred', {
        error
      });

      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('Test error');
      expect(errorCall).toContain('Error stack trace');
    });

    it('should include context in log', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Query failed', {
        context: {
          userId: 'user-123',
          query: 'SELECT * FROM posts'
        }
      });

      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('user-123');
      expect(errorCall).toContain('SELECT * FROM posts');
    });

    it('should log structured JSON', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Test message', {
        context: { userId: 'test-user' }
      });

      const logCalls = (console.log as any).mock.calls;
      const structuredLog = logCalls.find((call: any[]) => 
        call[0] === '[STRUCTURED_LOG]'
      );

      expect(structuredLog).toBeDefined();
      const logData = JSON.parse(structuredLog[1]);
      expect(logData.type).toBe('database_error');
      expect(logData.message).toBe('Test message');
      expect(logData.context.userId).toBe('test-user');
    });
  });

  describe('rate limiting', () => {
    it('should rate limit alerts of the same type', () => {
      // First alert should be sent
      const result1 = sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      expect(result1).toBe(true);

      // Second alert within window should be rate limited
      const result2 = sendAlert(AlertType.DATABASE_ERROR, 'Error 2');
      expect(result2).toBe(false);
    });

    it('should allow alerts of different types', () => {
      const result1 = sendAlert(AlertType.DATABASE_ERROR, 'Database error');
      const result2 = sendAlert(AlertType.AUTH_FAILURE, 'Auth error');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should allow alert after rate limit window expires', () => {
      // First alert
      const result1 = sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      expect(result1).toBe(true);

      // Second alert within window - rate limited
      const result2 = sendAlert(AlertType.DATABASE_ERROR, 'Error 2');
      expect(result2).toBe(false);

      // Advance time past rate limit window (5 minutes)
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

      // Third alert should be sent
      const result3 = sendAlert(AlertType.DATABASE_ERROR, 'Error 3');
      expect(result3).toBe(true);
    });

    it('should track alert count during rate limit window', () => {
      // Send multiple alerts
      sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      sendAlert(AlertType.DATABASE_ERROR, 'Error 2');
      sendAlert(AlertType.DATABASE_ERROR, 'Error 3');

      const stats = getAlertStats();
      expect(stats[AlertType.DATABASE_ERROR].count).toBe(3);
    });
  });

  describe('helper functions', () => {
    it('alertDatabaseError should send critical alert', () => {
      const error = new Error('Connection failed');
      const result = alertDatabaseError('Database error', error, {
        userId: 'user-123'
      });

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('[CRITICAL]');
      expect(errorCall).toContain('Connection failed');
    });

    it('alertAuthFailure should send warning alert', () => {
      const result = alertAuthFailure('Invalid token', {
        userId: 'user-123'
      });

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalled();
      const warnCall = (console.warn as any).mock.calls[0][0];
      expect(warnCall).toContain('[WARNING]');
      expect(warnCall).toContain('Invalid token');
    });

    it('alertValidationError should send warning alert', () => {
      const error = new Error('Invalid email format');
      const result = alertValidationError('Validation failed', error, {
        field: 'email'
      });

      expect(result).toBe(true);
      expect(console.warn).toHaveBeenCalled();
    });

    it('alertUnhandledException should send critical alert', () => {
      const error = new Error('Unexpected error');
      const result = alertUnhandledException('Unhandled exception', error, {
        endpoint: '/api/test'
      });

      expect(result).toBe(true);
      expect(console.error).toHaveBeenCalled();
      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('[CRITICAL]');
    });
  });

  describe('getAlertStats', () => {
    it('should return empty stats when no alerts sent', () => {
      const stats = getAlertStats();
      expect(Object.keys(stats).length).toBe(0);
    });

    it('should return stats for sent alerts', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      sendAlert(AlertType.AUTH_FAILURE, 'Error 2');

      const stats = getAlertStats();
      expect(stats[AlertType.DATABASE_ERROR]).toBeDefined();
      expect(stats[AlertType.DATABASE_ERROR].count).toBe(1);
      expect(stats[AlertType.AUTH_FAILURE]).toBeDefined();
      expect(stats[AlertType.AUTH_FAILURE].count).toBe(1);
    });

    it('should include lastAlertTime in stats', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      sendAlert(AlertType.DATABASE_ERROR, 'Error');

      const stats = getAlertStats();
      expect(stats[AlertType.DATABASE_ERROR].lastAlertTime).toBe(now);
    });
  });

  describe('clearAlertStore', () => {
    it('should clear all alert entries', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      sendAlert(AlertType.AUTH_FAILURE, 'Error 2');

      let stats = getAlertStats();
      expect(Object.keys(stats).length).toBe(2);

      clearAlertStore();

      stats = getAlertStats();
      expect(Object.keys(stats).length).toBe(0);
    });

    it('should allow alerts after clearing', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      const result1 = sendAlert(AlertType.DATABASE_ERROR, 'Error 2');
      expect(result1).toBe(false); // Rate limited

      clearAlertStore();

      const result2 = sendAlert(AlertType.DATABASE_ERROR, 'Error 3');
      expect(result2).toBe(true); // Should be sent
    });
  });

  describe('cleanup functionality', () => {
    it('should clean up expired entries', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Error 1');
      sendAlert(AlertType.AUTH_FAILURE, 'Error 2');

      // Advance time past rate limit window
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

      // Trigger cleanup (runs every 10 minutes)
      vi.advanceTimersByTime(10 * 60 * 1000);

      // New alerts should start fresh
      const result1 = sendAlert(AlertType.DATABASE_ERROR, 'Error 3');
      const result2 = sendAlert(AlertType.AUTH_FAILURE, 'Error 4');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });

  describe('custom configuration', () => {
    it('should respect custom rate limit window', () => {
      const customConfig = {
        rateLimitWindowMs: 1000 // 1 second
      };

      sendAlert(AlertType.DATABASE_ERROR, 'Error 1', { config: customConfig });
      let result = sendAlert(AlertType.DATABASE_ERROR, 'Error 2', { config: customConfig });
      expect(result).toBe(false); // Rate limited

      // Advance time past custom window
      vi.advanceTimersByTime(1500);

      result = sendAlert(AlertType.DATABASE_ERROR, 'Error 3', { config: customConfig });
      expect(result).toBe(true); // Should be sent
    });

    it('should respect logToConsole config', () => {
      sendAlert(AlertType.DATABASE_ERROR, 'Error', {
        config: { logToConsole: false }
      });

      expect(console.error).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle alerts with no context', () => {
      const result = sendAlert(AlertType.DATABASE_ERROR, 'Simple error');
      expect(result).toBe(true);
    });

    it('should handle alerts with empty context', () => {
      const result = sendAlert(AlertType.DATABASE_ERROR, 'Error', {
        context: {}
      });
      expect(result).toBe(true);
    });

    it('should handle errors without stack trace', () => {
      const error = new Error('Test error');
      delete error.stack;

      sendAlert(AlertType.DATABASE_ERROR, 'Error', { error });

      const errorCall = (console.error as any).mock.calls[0][0];
      expect(errorCall).toContain('Test error');
    });

    it('should handle complex context objects', () => {
      const result = sendAlert(AlertType.DATABASE_ERROR, 'Error', {
        context: {
          user: { id: '123', email: 'test@example.com' },
          metadata: { timestamp: Date.now(), source: 'api' }
        }
      });

      expect(result).toBe(true);
    });
  });
});
