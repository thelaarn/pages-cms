"use client";

import { useEffect } from "react";

export function ErrorLoggerScript() {
  useEffect(() => {
    // Global error handler - catches all runtime errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('🔴 GLOBAL ERROR CAUGHT:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
    };

    // Catch unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('🔴 UNHANDLED PROMISE REJECTION:', {
        reason: event.reason,
        promise: event.promise
      });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  return null;
}

