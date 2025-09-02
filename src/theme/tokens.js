// src/theme/tokens.js

export const brandTokens = {
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  secondary: '#81c784',
  accent: '#1976d2',
  error: '#d32f2f',
  warning: '#f57c00',
  info: '#0288d1',
  success: '#2e7d32',
};

export const designTokens = {
  spacing: 8,
  radii: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16 },
  sizes: {
    cardPadding: 24,
    dialogPadding: 24,
    inputRadius: 8,
    cardRadius: 12,
    avatar: 96,
  },
  space(multiplier = 1) {
    return this.spacing * multiplier;
  },
};
