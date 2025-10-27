/**
 * Client-side error logger to help debug production issues
 */

export interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string | null;
  timestamp: string;
  url: string;
  userAgent: string;
  errorType: 'runtime' | 'promise' | 'react';
  additionalInfo?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorType: 'runtime',
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || event.reason || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorType: 'promise',
      });
    });
  }

  logError(error: ErrorLog) {
    this.logs.push(error);
    
    // Keep only the last maxLogs errors
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in a formatted way
    console.group(`🚨 ${error.errorType.toUpperCase()} ERROR - ${error.timestamp}`);
    console.error('Message:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    if (error.componentStack) {
      console.error('Component Stack:', error.componentStack);
    }
    if (error.additionalInfo) {
      console.error('Additional Info:', error.additionalInfo);
    }
    console.error('URL:', error.url);
    console.groupEnd();

    // Store in localStorage for persistence
    try {
      localStorage.setItem('error-logs', JSON.stringify(this.logs));
    } catch (e) {
      // Ignore if localStorage is not available
    }
  }

  getLogs(): ErrorLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('error-logs');
    } catch (e) {
      // Ignore
    }
  }

  // Get logs from localStorage (persisted across page reloads)
  getPersistedLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem('error-logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

export const errorLogger = new ErrorLogger();

// Helper function to manually log errors
export function logError(error: any, context?: string) {
  errorLogger.logError({
    message: error?.message ? String(error.message) : String(error) || 'Unknown error',
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    errorType: 'runtime',
    additionalInfo: context ? { context } : undefined,
  });
}

