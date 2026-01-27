/**
 * Alerting System for Production Monitoring
 * 
 * This module provides structured error logging and alerting capabilities.
 * It includes rate limiting to prevent alert spam and supports multiple severity levels.
 * 
 * Future enhancements can include:
 * - Sentry integration
 * - Email notifications
 * - Slack webhooks
 * - PagerDuty integration
 */

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Alert types for categorization
 */
export enum AlertType {
  DATABASE_ERROR = 'database_error',
  AUTH_FAILURE = 'auth_failure',
  VALIDATION_ERROR = 'validation_error',
  UNHANDLED_EXCEPTION = 'unhandled_exception',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  API_ERROR = 'api_error'
}

/**
 * Alert context for additional information
 */
export interface AlertContext {
  userId?: string;
  postId?: string;
  email?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  [key: string]: any;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  /** Minimum time between alerts of the same type (in milliseconds) */
  rateLimitWindowMs?: number;
  /** Whether to log to console */
  logToConsole?: boolean;
  /** Whether to send to external service (Sentry, etc.) */
  sendToExternal?: boolean;
}

/**
 * Alert entry for tracking
 */
interface AlertEntry {
  lastAlertTime: number;
  count: number;
}

/**
 * In-memory store for alert rate limiting
 */
const alertStore = new Map<string, AlertEntry>();

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<AlertConfig> = {
  rateLimitWindowMs: 5 * 60 * 1000, // 5 minutes
  logToConsole: true,
  sendToExternal: false // Set to true when Sentry/etc is configured
};

/**
 * Cleanup interval for expired alert entries
 */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start automatic cleanup of expired alert entries
 */
function startCleanup() {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    alertStore.forEach((entry, key) => {
      if (now - entry.lastAlertTime > DEFAULT_CONFIG.rateLimitWindowMs) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => alertStore.delete(key));
  }, CLEANUP_INTERVAL_MS);
  
  // Ensure cleanup stops when process exits
  if (typeof process !== 'undefined') {
    process.on('exit', () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    });
  }
}

/**
 * Check if an alert should be sent based on rate limiting
 */
function shouldSendAlert(type: AlertType, config: Required<AlertConfig>): boolean {
  startCleanup();
  
  const now = Date.now();
  const entry = alertStore.get(type);
  
  if (!entry || now - entry.lastAlertTime > config.rateLimitWindowMs) {
    // First alert or window expired
    alertStore.set(type, {
      lastAlertTime: now,
      count: 1
    });
    return true;
  }
  
  // Within rate limit window - increment count but don't send
  entry.count++;
  return false;
}

/**
 * Format alert message for logging
 */
function formatAlertMessage(
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  error?: Error,
  context?: AlertContext
): string {
  const timestamp = new Date().toISOString();
  const parts = [
    `[${timestamp}]`,
    `[${severity.toUpperCase()}]`,
    `[${type}]`,
    message
  ];
  
  if (error) {
    parts.push(`\nError: ${error.message}`);
    if (error.stack) {
      parts.push(`\nStack: ${error.stack}`);
    }
  }
  
  if (context && Object.keys(context).length > 0) {
    parts.push(`\nContext: ${JSON.stringify(context, null, 2)}`);
  }
  
  return parts.join(' ');
}

/**
 * Create structured log object
 */
function createStructuredLog(
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  error?: Error,
  context?: AlertContext
) {
  return {
    timestamp: new Date().toISOString(),
    severity,
    type,
    message,
    error: error ? {
      message: error.message,
      name: error.name,
      stack: error.stack
    } : undefined,
    context: context || {}
  };
}

/**
 * Send alert to external service (Sentry, etc.)
 * This is a placeholder for future integration
 */
function sendToExternalService(
  type: AlertType,
  severity: AlertSeverity,
  message: string,
  error?: Error,
  context?: AlertContext
): void {
  // TODO: Integrate with Sentry or other monitoring service
  // Example Sentry integration:
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error || new Error(message), {
  //     level: severity,
  //     tags: { type },
  //     extra: context
  //   });
  // }
  
  // For now, just log that we would send to external service
  if (process.env.NODE_ENV === 'development') {
    console.log('[ALERT] Would send to external service:', { type, severity, message });
  }
}

/**
 * Send an alert
 * 
 * @param type - Type of alert
 * @param message - Alert message
 * @param options - Additional options
 * @returns Whether the alert was sent (not rate limited)
 */
export function sendAlert(
  type: AlertType,
  message: string,
  options: {
    severity?: AlertSeverity;
    error?: Error;
    context?: AlertContext;
    config?: AlertConfig;
  } = {}
): boolean {
  const {
    severity = AlertSeverity.ERROR,
    error,
    context,
    config = {}
  } = options;
  
  const finalConfig: Required<AlertConfig> = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  // Check rate limiting
  if (!shouldSendAlert(type, finalConfig)) {
    return false;
  }
  
  // Create structured log
  const structuredLog = createStructuredLog(type, severity, message, error, context);
  
  // Log to console if enabled
  if (finalConfig.logToConsole) {
    const formattedMessage = formatAlertMessage(type, severity, message, error, context);
    
    switch (severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.ERROR:
        console.error(formattedMessage);
        break;
      case AlertSeverity.WARNING:
        console.warn(formattedMessage);
        break;
      case AlertSeverity.INFO:
      default:
        console.log(formattedMessage);
        break;
    }
    
    // Also log structured JSON for log aggregation tools
    console.log('[STRUCTURED_LOG]', JSON.stringify(structuredLog));
  }
  
  // Send to external service if enabled
  if (finalConfig.sendToExternal) {
    sendToExternalService(type, severity, message, error, context);
  }
  
  return true;
}

/**
 * Send a database error alert
 */
export function alertDatabaseError(
  message: string,
  error: Error,
  context?: AlertContext
): boolean {
  return sendAlert(AlertType.DATABASE_ERROR, message, {
    severity: AlertSeverity.CRITICAL,
    error,
    context
  });
}

/**
 * Send an authentication failure alert
 */
export function alertAuthFailure(
  message: string,
  context?: AlertContext
): boolean {
  return sendAlert(AlertType.AUTH_FAILURE, message, {
    severity: AlertSeverity.WARNING,
    context
  });
}

/**
 * Send a validation error alert
 */
export function alertValidationError(
  message: string,
  error?: Error,
  context?: AlertContext
): boolean {
  return sendAlert(AlertType.VALIDATION_ERROR, message, {
    severity: AlertSeverity.WARNING,
    error,
    context
  });
}

/**
 * Send an unhandled exception alert
 */
export function alertUnhandledException(
  message: string,
  error: Error,
  context?: AlertContext
): boolean {
  return sendAlert(AlertType.UNHANDLED_EXCEPTION, message, {
    severity: AlertSeverity.CRITICAL,
    error,
    context
  });
}

/**
 * Clear all alert entries (useful for testing)
 */
export function clearAlertStore(): void {
  alertStore.clear();
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopAlertCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Get alert statistics (useful for monitoring)
 */
export function getAlertStats(): Record<string, { count: number; lastAlertTime: number }> {
  const stats: Record<string, { count: number; lastAlertTime: number }> = {};
  
  alertStore.forEach((entry, key) => {
    stats[key] = {
      count: entry.count,
      lastAlertTime: entry.lastAlertTime
    };
  });
  
  return stats;
}
