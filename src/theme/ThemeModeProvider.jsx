// src/theme/ThemeModeProvider.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useLocation } from 'react-router-dom';
import { brandTokens, designTokens } from './tokens';
import { colorModeContext } from './colorModeContext';

const STORAGE_KEY = 'leaflet-color-mode';

function getDesignTokens(mode) {
  const isDark = mode === 'dark';
  return {
    palette: {
      mode,
      primary: { main: brandTokens.primary },
      secondary: { main: brandTokens.secondary },
      error: { main: brandTokens.error },
      warning: { main: brandTokens.warning },
      info: { main: brandTokens.info },
      success: { main: brandTokens.success },
      background: {
        default: isDark ? '#0b0f14' : '#fafafa',
        paper: isDark ? '#12181d' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e0e3e7' : '#1f1f1f',
        secondary: isDark ? '#b2bac2' : '#5f6368',
      },
    },
    shape: { borderRadius: designTokens.radii.md },
    spacing: designTokens.spacing,
    typography: {
      fontFamily: 'Inter, Roboto, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
      htmlFontSize: 16,
      fontSize: 14,
      h1: { fontSize: '2.125rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
      h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.45 },
      body1: { fontSize: '0.95rem' },
      body2: { fontSize: '0.875rem', color: isDark ? '#b2bac2' : '#5f6368' },
      button: { textTransform: 'none', fontWeight: 600 },
      caption: { fontSize: '0.75rem' },
    },
    components: {
      MuiButton: {
        defaultProps: { size: 'medium', disableElevation: true },
        styleOverrides: {
          root: { borderRadius: designTokens.radii.md, paddingInline: designTokens.space(2) },
        },
      },
      MuiPaper: { styleOverrides: { root: { borderRadius: designTokens.radii.lg } } },
      MuiCard: { styleOverrides: { root: { borderRadius: designTokens.radii.lg } } },
      MuiChip: { defaultProps: { size: 'small' } },
      MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: designTokens.radii.lg } } },
      MuiMenu: { styleOverrides: { paper: { borderRadius: designTokens.radii.md } } },
      MuiTooltip: { styleOverrides: { tooltip: { fontSize: '0.75rem' } } },
    },
    custom: designTokens,
  };
}

// colorModeContext is defined in its own module to keep this file's export surface
// limited to a React component for more reliable Fast Refresh boundaries.

// Sizing tokens moved to ./tokens for stable export surface

export function ThemeModeProvider({ children }) {
  const location = useLocation();
  const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password']);
  const isAuthRoute = AUTH_ROUTES.has(location.pathname);

  const getInitialMode = () => {
    try {
      // On auth pages, always follow device theme
      if (isAuthRoute) {
        if (typeof window !== 'undefined' && window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    } catch {
      return 'light';
    }
  };

  const [mode, setMode] = useState(getInitialMode);

  // Follow device preference on auth routes; otherwise only when no manual override exists
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!isAuthRoute && (stored === 'light' || stored === 'dark')) return; // respect manual override on app routes
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setMode(e.matches ? 'dark' : 'light');
      mql.addEventListener?.('change', handler);
      return () => mql.removeEventListener?.('change', handler);
    } catch {
      /* noop */
    }
  }, [isAuthRoute, location.pathname]);

  // When route changes, ensure mode aligns with policy
  useEffect(() => {
    try {
      if (isAuthRoute) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setMode(prefersDark ? 'dark' : 'light');
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setMode(stored);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setMode(prefersDark ? 'dark' : 'light');
        }
      }
    } catch {
      /* noop */
    }
  }, [isAuthRoute, location.pathname]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          // Do not persist override on auth pages; keep following device there
          if (!isAuthRoute) localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode, isAuthRoute],
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <colorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </colorModeContext.Provider>
  );
}

// Export of tokens moved to ./tokens to keep this module HMR-friendly
