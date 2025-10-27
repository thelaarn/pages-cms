"use client";

// Enhanced error tracking with detailed context capture
export interface DetailedErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string | null;
  url: string;
  userAgent: string;
  errorType: 'runtime' | 'promise' | 'react' | 'manual';
  
  // Additional debugging context
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  
  // Capture variables and context at error time
  localContext?: Record<string, any>;
  
  // For tracking toast-related errors specifically
  toastContext?: {
    method: string;
    arguments: any[];
    result?: any;
  };
}

class EnhancedErrorTracker {
  private logs: DetailedErrorLog[] = [];
  private maxLogs = 100;
  private storageKey = 'enhanced-error-logs';
  private listeners: Array<() => void> = [];
  private seenCount = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers() {
    // Intercept all console.error calls
    const originalError = console.error;
    console.error = (...args: any[]) => {
      this.logFromConsole('error', args);
      originalError.apply(console, args);
    };

    // Intercept all console.warn calls
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      this.logFromConsole('warn', args);
      originalWarn.apply(console, args);
    };
  }

  private logFromConsole(level: string, args: any[]) {
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    // Only log if it seems error-related
    if (message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('substring') ||
        message.toLowerCase().includes('undefined') ||
        message.toLowerCase().includes('null') ||
        level === 'error') {
      
      const error = new Error(message);
      this.logError({
        message: `[Console ${level.toUpperCase()}] ${message}`,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        errorType: 'manual',
        localContext: {
          consoleLevel: level,
          originalArgs: args.map(arg => {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch {
              return String(arg);
            }
          })
        }
      });
    }
  }

  logError(errorLog: DetailedErrorLog) {
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    this.seenCount = this.logs.length;
    this.saveToStorage();
    this.notifyListeners();

    // Always log to console for debugging
    console.group('🔴 Enhanced Error Logged');
    console.log('Message:', errorLog.message);
    console.log('Type:', errorLog.errorType);
    console.log('Stack:', errorLog.stack);
    if (errorLog.localContext) {
      console.log('Context:', errorLog.localContext);
    }
    if (errorLog.toastContext) {
      console.log('Toast Context:', errorLog.toastContext);
    }
    console.groupEnd();
  }

  trackToastCall(method: string, args: any[], result?: any) {
    const error = new Error(`Toast ${method} called`);
    this.logError({
      message: `Toast.${method} called with arguments`,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorType: 'manual',
      toastContext: {
        method,
        arguments: args.map(arg => {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch {
            return String(arg);
          }
        }),
        result: result !== undefined ? String(result) : undefined
      }
    });
  }

  getErrors(): DetailedErrorLog[] {
    return [...this.logs];
  }

  clearErrors() {
    this.logs = [];
    this.seenCount = 0;
    this.saveToStorage();
    this.notifyListeners();
  }

  getNewErrorsCount(): number {
    return this.seenCount;
  }

  markAllAsSeen() {
    this.seenCount = 0;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: () => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save error logs to localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
        this.seenCount = this.logs.length;
      }
    } catch (error) {
      console.error('Failed to load error logs from localStorage:', error);
    }
  }

  // Export all logs as JSON for sharing/debugging
  exportLogs(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      logs: this.logs
    }, null, 2);
  }
}

export const enhancedErrorTracker = new EnhancedErrorTracker();

