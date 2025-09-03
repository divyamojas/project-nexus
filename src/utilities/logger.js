// src/utilities/logger.js

/**
 * Lightweight logging utility. Centralizes error logging so we can
 * evolve it later (e.g., send to a remote collector) without touching callers.
 */
export function logError(message, error, context = {}) {
  // Normalize error object
  const err = error instanceof Error ? error : new Error(String(error ?? 'Unknown error'));

  console.error(`[Error] ${message}`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    context,
  });
}

export function logWarn(message, context = {}) {
  console.warn(`[Warn] ${message}`, context);
}

export function logInfo(message, context = {}) {
  console.info(`[Info] ${message}`, context);
}

/**
 * Wrap an async function to catch and log errors, optionally returning a default value.
 */
export function withErrorLogging(asyncFn, { message, defaultValue } = {}) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      logError(message || asyncFn.name || 'asyncFn', error, { args });
      if (typeof defaultValue !== 'undefined') return defaultValue;
      throw error; // rethrow so callers can handle if needed
    }
  };
}
