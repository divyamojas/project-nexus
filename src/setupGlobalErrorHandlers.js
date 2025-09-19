// src/setupGlobalErrorHandlers.js

import { logError } from './utilities/logger';

export default function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Avoid registering multiple times
  if (window.__GLOBAL_ERROR_HANDLERS_INSTALLED__) return;
  window.__GLOBAL_ERROR_HANDLERS_INSTALLED__ = true;

  window.addEventListener('error', (event) => {
    try {
      const { message, filename, lineno, colno, error } = event;
      logError('Uncaught error', error || message, { filename, lineno, colno });
    } catch {
      /* logging should never throw, but swallow just in case */
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      logError('Unhandled promise rejection', event.reason, {});
    } catch {
      /* ignored */
    }
  });
}
